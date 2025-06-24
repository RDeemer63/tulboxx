import { EventEmitter } from "events";
import db, { type SyncOperation, type SyncEntity } from "./db";
import { captureException } from "./sentry";

// --- Constants ---
const MAX_SYNC_ATTEMPTS = 5;
const INITIAL_RETRY_DELAY_MS = 1000; // 1 second
const SYNC_INTERVAL_MS = 30 * 1000; // 30 seconds

// --- Type Definitions ---
export type SyncStatus = "offline" | "online" | "syncing" | "error";

// --- Event Emitter for Global Status Updates ---
class SyncEventEmitter extends EventEmitter {}
export const syncEvents = new SyncEventEmitter();

// --- SyncService Class (Singleton) ---

/**
 * Manages the synchronization of offline data with the server.
 * This service is designed as a singleton to ensure only one sync process runs at a time.
 */
class SyncService {
  private static instance: SyncService;
  private isOnline: boolean = navigator.onLine;
  private isProcessing: boolean = false;
  private syncIntervalId: NodeJS.Timeout | null = null;

  private constructor() {
    this.updateNetworkStatus();
    window.addEventListener("online", this.updateNetworkStatus);
    window.addEventListener("offline", this.updateNetworkStatus);
  }

  /**
   * Gets the singleton instance of the SyncService.
   */
  public static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  /**
   * Starts the synchronization service.
   * Listens for network changes and periodically attempts to sync.
   */
  public start(): void {
    if (this.syncIntervalId) {
      console.log("[SyncService] Service already running.");
      return;
    }
    console.log("[SyncService] Starting service...");
    this.syncIntervalId = setInterval(
      () => this.triggerSync(),
      SYNC_INTERVAL_MS
    );
    this.triggerSync(); // Initial sync attempt
  }

  /**
   * Stops the synchronization service and cleans up listeners.
   */
  public stop(): void {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
    }
    window.removeEventListener("online", this.updateNetworkStatus);
    window.removeEventListener("offline", this.updateNetworkStatus);
    console.log("[SyncService] Service stopped.");
  }

  /**
   * Manually triggers a sync attempt if not already processing.
   */
  public triggerSync = (): void => {
    if (this.isOnline && !this.isProcessing) {
      this._processQueue();
    }
  };

  private updateNetworkStatus = (): void => {
    this.isOnline = navigator.onLine;
    console.log(`[SyncService] Network status changed: ${this.isOnline ? "Online" : "Offline"}`);
    syncEvents.emit("statusChange", this.isOnline ? "online" : "offline");
    if (this.isOnline) {
      this.triggerSync();
    }
  };

  private async _processQueue(): Promise<void> {
    this.isProcessing = true;
    syncEvents.emit("statusChange", "syncing");

    try {
      const pendingOperations = await db.syncQueue
        .where("attempts")
        .below(MAX_SYNC_ATTEMPTS)
        .toArray();

      if (pendingOperations.length === 0) {
        syncEvents.emit("statusChange", "online"); // Synced
        return;
      }

      console.log(`[SyncService] Found ${pendingOperations.length} pending operations.`);

      for (const op of pendingOperations) {
        if (!this.isOnline) break; // Stop if we go offline during processing
        await this._handleOperation(op);
      }

    } catch (error) {
      console.error("[SyncService] Error processing sync queue:", error);
      captureException(error as Error, "SyncService._processQueue");
      syncEvents.emit("statusChange", "error");
    } finally {
      this.isProcessing = false;
      if (this.isOnline) {
        syncEvents.emit("statusChange", "online");
      }
    }
  }

  private async _handleOperation(op: SyncOperation): Promise<void> {
    try {
      const { entityName, entityId, operation, payload } = op;
      let response;

      switch (operation) {
        case "create":
          response = await this._performApiCall(`/api/${entityName}`, "POST", payload);
          break;
        case "update":
          response = await this._performApiCall(`/api/${entityName}/${entityId}`, "PUT", payload);
          break;
        case "delete":
          response = await this._performApiCall(`/api/${entityName}/${entityId}`, "DELETE");
          break;
      }
      
      // On success, remove from queue and update local record status
      await db.syncQueue.delete(op.id!);
      // @ts-ignore - Dexie table access by variable
      await db[entityName].update(entityId, { syncStatus: "synced" });

    } catch (error: any) {
      console.error(`[SyncService] Failed to handle operation ${op.id}:`, error);
      captureException(error, `SyncService._handleOperation:${op.entityName}`);

      const newAttempts = op.attempts + 1;
      const updatePayload: Partial<SyncOperation> = {
        attempts: newAttempts,
        lastAttempt: new Date(),
        error: error.message,
      };

      if (error.status === 409) { // Conflict
        await this._handleConflict(op);
      } else if (newAttempts >= MAX_SYNC_ATTEMPTS) {
        console.warn(`[SyncService] Operation ${op.id} reached max retry attempts.`);
        // Keep it in the queue but marked as failed for manual intervention
      }
      
      await db.syncQueue.update(op.id!, updatePayload);
    }
  }
  
  private async _performApiCall(endpoint: string, method: "POST" | "PUT" | "DELETE", body?: any): Promise<any> {
    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
        // Assuming JWT token is handled by a global fetch wrapper or context
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      const error = new Error(errorData.message || "API request failed") as any;
      error.status = response.status;
      throw error;
    }
    
    return response.status === 204 ? {} : response.json();
  }

  private async _handleConflict(op: SyncOperation): Promise<void> {
    console.warn(`[SyncService] Conflict detected for ${op.entityName}:${op.entityId}.`);
    
    // Fetch server version of the entity
    try {
      const serverVersion = await this._performApiCall(`/api/${op.entityName}/${op.entityId}`, "GET");
      
      // "Last Write Wins" strategy based on lastModified timestamp
      // @ts-ignore
      const localRecord = await db[op.entityName].get(op.entityId);
      
      if (localRecord && new Date(serverVersion.updatedAt) > localRecord.lastModified) {
        // Server is newer, discard local changes and update local DB
        console.log("[SyncService] Server version is newer. Overwriting local data.");
        // @ts-ignore
        await db[op.entityName].put({ ...serverVersion, syncStatus: "synced" });
        await db.syncQueue.delete(op.id!); // Remove the failed operation
      } else {
        // Local is newer or same, force update (not implemented in this simple version)
        // In a real app, you might add a `force=true` query param to the API call.
        console.log("[SyncService] Local version is newer. Retrying will likely fail without force flag.");
      }
    } catch (error) {
      console.error("[SyncService] Failed to resolve conflict:", error);
      captureException(error as Error, "SyncService._handleConflict");
    }
  }
}

// --- Export Singleton Instance ---
const syncService = SyncService.getInstance();
export default syncService;

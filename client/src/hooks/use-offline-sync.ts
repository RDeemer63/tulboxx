import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLiveQuery } from "dexie-react-hooks";
import db, {
  type BusinessProfile,
  type Lead,
  type Estimate,
  type SyncOperation,
  type OfflineEntity,
} from "./db";
import syncService, {
  syncEvents,
  type SyncStatus,
} from "./sync-service";
import { captureException } from "./sentry";
import { apiRequestJson } from "../queryClient"; // Assuming an API helper exists

// --- Type Definitions ---

export type SyncEntityName = keyof typeof db;

interface EntityTypeMap {
  businessProfile: BusinessProfile;
  customers: Customer;
  leads: Lead;
  estimates: Estimate;
  jobs: Job;
  invoices: Invoice;
}

export type EntityDataType<T extends SyncEntityName> = T extends keyof EntityTypeMap
  ? EntityTypeMap[T]
  : never;

export interface UseOfflineSyncResult<T extends OfflineEntity> {
  // Data from local IndexedDB, always available
  data: T | null;
  // True only during the initial load from IndexedDB
  isLoading: boolean;
  // True if there's a sync error
  isError: boolean;
  // The current status of the network/sync service
  syncStatus: SyncStatus;
  // A convenience boolean for syncStatus === 'syncing'
  isSyncing: boolean;
  // Timestamp of the last successful sync operation
  lastSynced?: Date;
  // Any pending operations for this specific entity
  pendingOperations: SyncOperation[];
  // Function to update the entity locally and queue for sync
  update: (data: Partial<Omit<T, "id">>) => Promise<void>;
  // Function to delete the entity locally and queue for sync
  remove: () => Promise<void>;
  // Manually trigger a sync attempt
  forceSync: () => void;
}

/**
 * `useOfflineSync`
 *
 * A comprehensive hook for managing offline-first data synchronization for a single entity.
 * It seamlessly integrates IndexedDB (via Dexie) and React Query to provide a robust
 * offline experience.
 *
 * @param entityName The name of the table in the offline database (e.g., 'leads').
 * @param entityId The unique ID of the entity to manage.
 * @returns An object with the entity's data, sync status, and mutation functions.
 */
export function useOfflineSync<
  T extends SyncEntityName,
  U extends OfflineEntity = EntityDataType<T>
>(entityName: T, entityId: string): UseOfflineSyncResult<U> {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(
    navigator.onLine ? "online" : "offline"
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | undefined>();

  // 1. Get local data reactively from IndexedDB using useLiveQuery.
  // The UI is always bound to this data, providing an instant, offline-first experience.
  const localData = useLiveQuery(
    () => (db[entityName] as Dexie.Table<U, string>).get(entityId),
    [entityId],
    null
  );

  // 2. Fetch canonical data from the server when online.
  // This runs in the background and reconciles the local data.
  useQuery<U>({
    queryKey: [entityName, entityId, "server-sync"],
    queryFn: async () => {
      const serverData = await apiRequestJson<U>(
        "GET",
        `/api/${entityName}/${entityId}`
      );
      // When server data is fetched, update the local IndexedDB.
      // This reconciliation is the key to keeping offline data fresh.
      await (db[entityName] as Dexie.Table<U, string>).put({
        ...serverData,
        syncStatus: "synced",
      });
      setLastSynced(new Date());
      return serverData;
    },
    enabled: syncStatus === "online", // Only fetch when online.
  });

  // 3. Subscribe to global sync service events.
  useEffect(() => {
    const handleStatusChange = (status: SyncStatus) => {
      setSyncStatus(status);
      setIsSyncing(status === "syncing");
    };
    syncEvents.on("statusChange", handleStatusChange);
    syncService.start(); // Ensure the service is running

    return () => {
      syncEvents.off("statusChange", handleStatusChange);
    };
  }, []);

  // 4. Get pending operations for this specific entity.
  const pendingOperations = useLiveQuery(
    () =>
      db.syncQueue
        .where({ entityName, entityId })
        .filter((op) => op.attempts < 5) // Show operations that are still retryable
        .toArray(),
    [entityName, entityId],
    []
  );

  // 5. Create mutation functions that operate on the local DB first.

  const update = useCallback(
    async (data: Partial<Omit<U, "id">>) => {
      try {
        const payload = {
          ...data,
          syncStatus: "pending" as const,
          lastModified: new Date(),
        };
        await (db[entityName] as Dexie.Table<U, string>).update(
          entityId,
          payload
        );
        await db.queueSyncOperation(entityName, entityId, "update", payload);
        syncService.triggerSync(); // Attempt to sync immediately if online
      } catch (error) {
        console.error(`[useOfflineSync] Failed to update ${entityName}:`, error);
        captureException(error as Error, `useOfflineSync:update`);
      }
    },
    [entityName, entityId]
  );

  const remove = useCallback(async () => {
    try {
      // First, remove from the local database for an instant UI update.
      await (db[entityName] as Dexie.Table<U, string>).delete(entityId);
      // Then, queue the delete operation for the server.
      await db.queueSyncOperation(entityName, entityId, "delete", { id: entityId });
      syncService.triggerSync();
    } catch (error) {
      console.error(`[useOfflineSync] Failed to remove ${entityName}:`, error);
      captureException(error as Error, `useOfflineSync:remove`);
    }
  }, [entityName, entityId]);

  return {
    data: localData,
    isLoading: localData === undefined, // Loading is true only until Dexie provides initial data.
    isError: syncStatus === "error",
    syncStatus,
    isSyncing,
    lastSynced,
    pendingOperations,
    update,
    remove,
    forceSync: syncService.triggerSync,
  };
}

export default useOfflineSync;

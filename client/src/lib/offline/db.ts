import Dexie, { type Table } from "dexie";
import { generateRandomId } from "@/lib/utils";

// =================================================================
// TypeScript Interfaces for IndexedDB Tables
// =================================================================

type SyncStatus = "synced" | "pending" | "error";

interface OfflineEntity {
  id: string; // Using string UUIDs for all entities for better sync management
  syncStatus: SyncStatus;
  lastModified: Date;
}

export interface BusinessProfile extends OfflineEntity {
  // id will be a fixed value, e.g., 'singleton-profile'
  businessName?: string;
  ownerName?: string;
  email?: string;
  phone?: string;
  address?: string;
  logoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  defaultEstimateTerms?: string;
  defaultInvoiceTerms?: string;
  brandVoice?: "professional" | "friendly" | "technical";
  // Add other profile fields as needed
}

export interface Customer extends OfflineEntity {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export interface Lead extends OfflineEntity {
  customerId?: string; // Link to a customer
  leadName: string;
  status: "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";
  source?: string;
  estimatedValue?: number;
  notes?: string;
}

export interface Estimate extends OfflineEntity {
  customerId?: string;
  leadId?: string;
  jobId?: string;
  estimateNumber: string;
  title: string;
  status: "draft" | "sent" | "approved" | "declined" | "archived";
  totalAmount: number;
  items: string; // JSON string of line items
  validUntil?: Date;
}

export interface Job extends OfflineEntity {
  customerId: string;
  estimateId?: string;
  title: string;
  status: "scheduled" | "in_progress" | "on_hold" | "completed" | "canceled";
  scheduledDate?: Date;
  notes?: string;
}

export interface Invoice extends OfflineEntity {
  customerId: string;
  jobId?: string;
  invoiceNumber: string;
  status: "draft" | "sent" | "paid" | "overdue" | "void";
  totalAmount: number;
  dueDate?: Date;
}

export interface SyncOperation {
  id?: number; // Auto-incrementing primary key for the queue
  entityName: keyof TulboxxOfflineDB;
  entityId: string;
  operation: "create" | "update" | "delete";
  payload: any; // The data to be sent to the server
  attempts: number;
  lastAttempt?: Date;
  error?: string;
  createdAt: Date;
}

// =================================================================
// Dexie Database Definition
// =================================================================

export class TulboxxOfflineDB extends Dexie {
  // Define tables
  businessProfile!: Table<BusinessProfile, string>;
  customers!: Table<Customer, string>;
  leads!: Table<Lead, string>;
  estimates!: Table<Estimate, string>;
  jobs!: Table<Job, string>;
  invoices!: Table<Invoice, string>;
  syncQueue!: Table<SyncOperation, number>;

  constructor() {
    super("TulboxxOfflineDB");

    // --- Schema Version 1 ---
    this.version(1).stores({
      // The first field is the primary key. Subsequent fields are indexes.
      // 'id' is our string UUID primary key.
      businessProfile: "id, syncStatus, lastModified",
      customers: "id, email, syncStatus, lastModified",
      leads: "id, customerId, status, syncStatus, lastModified",
      estimates: "id, customerId, leadId, jobId, status, syncStatus, lastModified",
      jobs: "id, customerId, estimateId, status, scheduledDate, syncStatus, lastModified",
      invoices: "id, customerId, jobId, status, dueDate, syncStatus, lastModified",
      // '++id' creates an auto-incrementing primary key for the queue.
      syncQueue: "++id, entityName, entityId, status, createdAt",
    });
  }

  /**
   * Queues a database operation for later synchronization with the server.
   * This is a core utility for the offline-first architecture.
   *
   * @param entityName - The name of the table (e.g., 'leads', 'estimates').
   * @param entityId - The UUID of the record being changed.
   * @param operation - The type of operation ('create', 'update', 'delete').
   * @param payload - The data associated with the operation.
   */
  async queueSyncOperation(
    entityName: keyof TulboxxOfflineDB,
    entityId: string,
    operation: "create" | "update" | "delete",
    payload: any
  ): Promise<void> {
    try {
      await this.syncQueue.add({
        entityName,
        entityId,
        operation,
        payload,
        attempts: 0,
        createdAt: new Date(),
      });
      console.log(`[OfflineDB] Queued ${operation} for ${entityName}:${entityId}`);
    } catch (error) {
      console.error("[OfflineDB] Failed to queue sync operation:", error);
      // Optionally, send this failure to Sentry if it's a critical issue
    }
  }

  /**
   * A utility to wrap a create operation with offline-first logic.
   * It adds the record locally and queues the sync operation.
   *
   * @param table - The Dexie table to operate on.
   * @param data - The data for the new record.
   * @returns The newly created record with local metadata.
   */
  async createWithOfflineSync<T extends OfflineEntity>(
    table: Table<T, string>,
    data: Omit<T, "id" | "syncStatus" | "lastModified">
  ): Promise<T> {
    const newRecord: T = {
      ...data,
      id: generateRandomId(table.name), // Generate a client-side UUID
      syncStatus: "pending",
      lastModified: new Date(),
    } as T;

    try {
      await table.add(newRecord);
      await this.queueSyncOperation(
        table.name as keyof TulboxxOfflineDB,
        newRecord.id,
        "create",
        newRecord
      );
      return newRecord;
    } catch (error) {
      console.error(`[OfflineDB] Failed to create record in ${table.name}:`, error);
      throw error; // Re-throw to be handled by the caller
    }
  }
}

// --- Singleton Instance ---
// This ensures that only one instance of the database is used throughout the application.
const db = new TulboxxOfflineDB();

export default db;

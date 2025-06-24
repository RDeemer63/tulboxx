// shared/feature-flags-schema.ts

import {
  pgTable,
  varchar,
  boolean,
  timestamp,
  text,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./schema"; // Assuming users.id is varchar as per typical auth setup

/**
 * Enum for all centrally managed feature flag keys.
 * This serves as the single source of truth for flag names stored in the database
 * and used throughout the application (client and server).
 */
export enum FeatureFlagKey {
  NEW_LEADS_MODULE = 'NEW_LEADS_MODULE',
  NEW_ESTIMATES_MODULE = 'NEW_ESTIMATES_MODULE',
  JOBS_MODULE = 'JOBS_MODULE',
  BILLING_MODULE = 'BILLING_MODULE',
  ADVANCED_LINE_ITEMS = 'ADVANCED_LINE_ITEMS',
  PDF_GENERATION = 'PDF_GENERATION',
  AI_ASSISTED_ESTIMATES = 'AI_ASSISTED_ESTIMATES',
  CUSTOMER_PORTAL = 'CUSTOMER_PORTAL',
  MOBILE_OPTIMIZATIONS = 'MOBILE_OPTIMIZATIONS',
  OFFLINE_MODE = 'OFFLINE_MODE',
  NEW_REPORTS_DASHBOARD = 'NEW_REPORTS_DASHBOARD',
  
  // Server-specific flags that client might be aware of or need to reference
  SERVER_SIDE_AI_PROCESSING = 'SERVER_SIDE_AI_PROCESSING',
  ENABLE_DETAILED_REQUEST_LOGGING = 'ENABLE_DETAILED_REQUEST_LOGGING',

  // Add new feature flags here as needed
  // Example: NEW_SCHEDULING_INTERFACE = 'NEW_SCHEDULING_INTERFACE',
}

/**
 * Status values used to communicate rollout phase of each flag.
 *
 *  - development  → internal use, unstable
 *  - beta         → opt-in public testing
 *  - stable       → on-by-default for all users
 *  - deprecated   → flag is always treated as **enabled**; toggle code should
 *                   be removed and the flag deleted in a future cleanup pass
 */
export enum FeatureFlagStatus {
  development = 'development',
  beta = 'beta',
  stable = 'stable',
  deprecated = 'deprecated',
}

/**
 * Mapping of every FeatureFlagKey to its current lifecycle status.
 * NOTE: Deprecated flags are considered **always enabled** and will be removed
 *       in a future major version once all guard conditions are eliminated.
 */
export const FEATURE_FLAG_STATUS: Record<FeatureFlagKey, FeatureFlagStatus> = {
  [FeatureFlagKey.NEW_LEADS_MODULE]: FeatureFlagStatus.deprecated,
  [FeatureFlagKey.MOBILE_OPTIMIZATIONS]: FeatureFlagStatus.deprecated,

  [FeatureFlagKey.NEW_ESTIMATES_MODULE]: FeatureFlagStatus.development,
  [FeatureFlagKey.JOBS_MODULE]: FeatureFlagStatus.development,
  [FeatureFlagKey.BILLING_MODULE]: FeatureFlagStatus.development,
  [FeatureFlagKey.ADVANCED_LINE_ITEMS]: FeatureFlagStatus.development,
  [FeatureFlagKey.PDF_GENERATION]: FeatureFlagStatus.development,
  [FeatureFlagKey.AI_ASSISTED_ESTIMATES]: FeatureFlagStatus.development,
  [FeatureFlagKey.CUSTOMER_PORTAL]: FeatureFlagStatus.development,
  [FeatureFlagKey.OFFLINE_MODE]: FeatureFlagStatus.development,
  [FeatureFlagKey.NEW_REPORTS_DASHBOARD]: FeatureFlagStatus.development,

  // Server-only flags (client may still query them for awareness)
  [FeatureFlagKey.SERVER_SIDE_AI_PROCESSING]: FeatureFlagStatus.development,
  [FeatureFlagKey.ENABLE_DETAILED_REQUEST_LOGGING]: FeatureFlagStatus.development,
};

/**
 * Database table schema for storing dynamic feature flag states.
 * This table allows overriding default/environment-set flag states,
 * typically managed by an admin interface.
 */
export const featureFlagsTable = pgTable("feature_flags", {
  flagKey: varchar("flag_key", { length: 255 }).$type<FeatureFlagKey>().primaryKey().notNull(),
  enabled: boolean("enabled").notNull().default(false),
  description: text("description").nullable(), // Optional: A brief description of the flag for DB context
  updatedBy: varchar("updated_by", { length: 255 }).references(() => users.id, { onDelete: 'set null' }).nullable(), // User ID or system identifier, nullable
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull().$onUpdate(() => new Date()),
});

// --- Relations for Feature Flags ---
export const featureFlagsRelations = relations(featureFlagsTable, ({ one }) => ({
  updatedByUser: one(users, {
    fields: [featureFlagsTable.updatedBy],
    references: [users.id],
    relationName: 'featureFlagLastUpdater' // Unique relation name
  }),
}));


// --- Zod Schemas for Validation ---

/**
 * Zod schema for selecting a feature flag (e.g., for API responses).
 */
export const selectFeatureFlagSchema = createSelectSchema(featureFlagsTable, {
  flagKey: z.nativeEnum(FeatureFlagKey),
  enabled: z.boolean(),
  description: z.string().nullable().optional(),
  updatedBy: z.string().uuid().nullable().optional(), // Assuming updatedBy is a UUID string if it's a user ID
  updatedAt: z.date(), 
});

/**
 * Zod schema for inserting a new feature flag record.
 * Used when seeding initial flags or if flags are created dynamically (less common).
 */
export const insertFeatureFlagSchema = createInsertSchema(featureFlagsTable, {
  flagKey: z.nativeEnum(FeatureFlagKey, {
    required_error: "Feature flag key is required.",
    invalid_type_error: "Invalid feature flag key.",
  }),
  enabled: z.boolean({
    required_error: "Enabled state is required.",
    invalid_type_error: "Enabled state must be a boolean.",
  }),
  description: z.string({
    invalid_type_error: "Description must be a string.",
  }).optional().nullable(),
  updatedBy: z.string().uuid({ message: "Invalid UUID format for updatedBy field."}).optional().nullable(),
}).omit({
  updatedAt: true, // Handled by DB default/onUpdate
});

/**
 * Zod schema for updating an existing feature flag's state (e.g., via admin toggle).
 * This is typically used for the request body of a PUT request.
 */
export const updateFeatureFlagStateSchema = z.object({
  enabled: z.boolean({
    required_error: "The 'enabled' field (boolean) is required in the request body.",
    invalid_type_error: "The 'enabled' field must be a boolean (true or false).",
  }),
  // Description could also be updatable if desired via a different schema/endpoint:
  // description: z.string().optional().nullable(), 
});


// --- TypeScript Types ---

/**
 * TypeScript type for a feature flag record selected from the database.
 */
export type FeatureFlagRecord = typeof featureFlagsTable.$inferSelect;

/**
 * TypeScript type for inserting a new feature flag record.
 */
export type InsertFeatureFlagRecord = typeof featureFlagsTable.$inferInsert;

/**
 * TypeScript type for the payload when updating a feature flag's enabled state.
 */
export type UpdateFeatureFlagStatePayload = z.infer<typeof updateFeatureFlagStateSchema>;

/*
  Example of how this schema might be used in a service layer (conceptual):

  import { db } from './db'; // Assuming db instance
  import { eq } from 'drizzle-orm';

  async function getFeatureFlag(key: FeatureFlagKey): Promise<FeatureFlagRecord | undefined> {
    return db.query.featureFlagsTable.findFirst({
      where: eq(featureFlagsTable.flagKey, key)
    });
  }

  async function setFeatureFlagState(
    key: FeatureFlagKey, 
    payload: UpdateFeatureFlagStatePayload, 
    adminUserId: string | null // Assuming adminUserId is a string (e.g., UUID) or null for system
  ): Promise<FeatureFlagRecord> {
    const validatedPayload = updateFeatureFlagStateSchema.parse(payload);
    
    // Upsert logic: Insert if not exists, update if exists
    const [updatedOrInsertedFlag] = await db.insert(featureFlagsTable)
      .values({
        flagKey: key,
        enabled: validatedPayload.enabled,
        description: `Description for ${key}`, // Fetch from a registry or provide
        updatedBy: adminUserId,
        updatedAt: new Date(), // Though DB handles onUpdate, good to set explicitly
      })
      .onConflictDoUpdate({
        target: featureFlagsTable.flagKey,
        set: {
          enabled: validatedPayload.enabled,
          updatedBy: adminUserId,
          updatedAt: new Date(),
          // Optionally update description if it can change:
          // description: newDescription || sql`${featureFlagsTable.description}`, 
        }
      })
      .returning();
      
    if (!updatedOrInsertedFlag) {
      // This should ideally not happen with upsert logic if key is valid
      throw new Error(`Failed to set feature flag ${key}.`);
    }
    return updatedOrInsertedFlag;
  }

  async function seedInitialFlagsIfNecessary() {
    const flagsToSeed: InsertFeatureFlagRecord[] = [
      { flagKey: FeatureFlagKey.NEW_ESTIMATES_MODULE, enabled: false, description: 'New V2 Estimates Module', updatedBy: null },
      { flagKey: FeatureFlagKey.JOBS_MODULE, enabled: true, description: 'Core Jobs Module', updatedBy: null },
      // ... other flags with their initial states and descriptions
    ];

    try {
      // Using onConflictDoNothing to only insert if the flagKey is not already present.
      // This preserves any existing states that might have been set manually or by previous operations.
      const result = await db.insert(featureFlagsTable)
        .values(flagsToSeed)
        .onConflictDoNothing({ target: featureFlagsTable.flagKey })
        .returning();
      
      console.log(`Seeded ${result.length} new feature flags. ${flagsToSeed.length - result.length} flags already existed.`);
    } catch (error) {
      console.error('Error seeding feature flags:', error);
    }
  }
*/

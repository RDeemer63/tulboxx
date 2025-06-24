// server/db/apply-feature-flags-migration.ts

import dotenv from 'dotenv';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import postgres from 'postgres';

// ESM-compatible way to get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from project root. This should be at the very top.
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Import main Drizzle 'db' instance for seeding (assumes app_schema context)
import { db } from '../db';
import {
  featureFlagsTable,
  FeatureFlagKey as SharedFeatureFlagKey, // Enum from shared schema for DB consistency
  type InsertFeatureFlagRecord,
} from '../../shared/feature-flags-schema';

// Import server-specific flag definitions and the resolution function
import {
  serverFeatureFlagsRegistry,
  ServerFeatureFlagKey, // Enum specific to server-side registry keys
  isServerFeatureEnabled, // Used to determine initial 'enabled' state for seeding
} from '../routes/feature-flags';

// --- Database Client for Direct Migration Execution ---
const DATABASE_URL_ENV = process.env.DATABASE_URL;
if (!DATABASE_URL_ENV) {
  console.error("❌ FATAL: DATABASE_URL is not defined in environment variables. Cannot proceed with migration.");
  process.exit(1);
}
// Strip query parameters like ?schema= from the connection string for the raw postgres-js client.
// This client is used for applying raw SQL from migration files and should operate
// without the schema parameter that might be intended for the main Drizzle ORM client.
// Drizzle Kit's migrations often create tables in the default search_path or 'public'
// if not explicitly namespaced within the SQL itself.
const baseConnectionString = DATABASE_URL_ENV.split('?')[0];
const directMigrationClient = postgres(baseConnectionString, {
  max: 1, // Only need one connection for sequential script execution
  onnotice: (notice) => { console.log(`🐘 PostgreSQL Notice: ${notice.message}`); },
  // Add SSL config if needed for production, e.g.,
  // ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

const MIGRATIONS_FOLDER = path.resolve(__dirname, '../../feature-flags-migrations');
// This script currently applies a specific baseline migration.
// For a full migration system, you'd list all .sql files and apply them in order,
// potentially tracking applied migrations in a custom table or using Drizzle's built-in migrate function.
const BASELINE_MIGRATION_FILENAME = '0000_smiling_mad_thinker.sql'; // Drizzle Kit's typical first migration file

/**
 * Seeds initial feature flag records into the database.
 * It iterates through the server-side flag registry and inserts flags
 * if they do not already exist in the database, preserving existing states.
 */
async function seedInitialFeatureFlags() {
  console.log('🌱 Starting to seed feature flags into the database...');

  const flagsToSeed: InsertFeatureFlagRecord[] = [];

  for (const keyInServerRegistry in serverFeatureFlagsRegistry) {
    // Ensure the key is a valid member of ServerFeatureFlagKey enum
    const serverFlagKey = keyInServerRegistry as ServerFeatureFlagKey;
    const config = serverFeatureFlagsRegistry[serverFlagKey];

    // Ensure the string value of the server key is also a valid SharedFeatureFlagKey for DB
    if (Object.values(SharedFeatureFlagKey).includes(config.key as unknown as SharedFeatureFlagKey)) {
      const initialEnabledState = await isServerFeatureEnabled(config.key); // Respects env/defaults
      
      flagsToSeed.push({
        flagKey: config.key as unknown as SharedFeatureFlagKey, // Cast to shared enum type for DB
        enabled: initialEnabledState,
        description: config.description,
        updatedBy: null, // Seeding is a system action, no specific user yet.
        // 'updatedAt' will be set by DB default/onUpdate trigger
      });
    } else {
      console.warn(`⚠️ Skipping seed for server flag key "${serverFlagKey}" as its string value "${config.key}" is not a valid SharedFeatureFlagKey.`);
    }
  }

  if (flagsToSeed.length === 0) {
    console.log('🌱 No feature flags configured in the server registry to seed, or all are invalid for shared schema.');
    return;
  }

  try {
    console.log(`🌱 Attempting to seed/update ${flagsToSeed.length} flags (onConflictDoNothing)...`);
    // Using onConflictDoNothing: only inserts if the flagKey is not already present.
    // This preserves any existing states that might have been set manually or by previous operations.
    const result = await db.insert(featureFlagsTable)
      .values(flagsToSeed)
      .onConflictDoNothing({ target: featureFlagsTable.flagKey }) // Target the primary key
      .returning(); // Get back the rows that were actually inserted

    console.log(`✅ Seeded ${result.length} new feature flags.`);
    if (result.length < flagsToSeed.length) {
      console.log(`ℹ️  ${flagsToSeed.length - result.length} flags already existed in the database and were not overwritten by seeding.`);
    }
  } catch (error) {
    console.error('❌ Error during feature flag seeding:', error);
    // Depending on requirements, you might want to throw this error to stop the script.
    // For now, we log it and let the script potentially finish if migrations were successful.
  }
}

/**
 * Main function to apply migrations and seed data.
 */
async function applyMigrationsAndSeed() {
  console.log('🚀 Starting feature flags database migration and seeding process...');

  try {
    // --- Step 1: Apply Database Migrations ---
    const baselineMigrationPath = path.join(MIGRATIONS_FOLDER, BASELINE_MIGRATION_FILENAME);
    console.log(`📄 Checking for baseline migration file: ${baselineMigrationPath}`);

    try {
      const sqlContent = await fs.readFile(baselineMigrationPath, 'utf-8');
      if (!sqlContent.trim()) {
        console.log('ℹ️ Baseline migration file is empty. No SQL to execute for baseline.');
      } else {
        console.log(`🚀 Applying baseline SQL migration from ${BASELINE_MIGRATION_FILENAME} using direct client...`);
        // Execute the SQL content using the direct client
        await directMigrationClient.unsafe(sqlContent);
        console.log(`✅ Baseline SQL migration (${BASELINE_MIGRATION_FILENAME}) applied successfully.`);
      }
    } catch (error: any) {
      if (error.code === 'ENOENT') { // File not found
        console.warn(`⚠️ Baseline migration file not found: ${baselineMigrationPath}.`);
        console.log('   This might be normal if the table already exists or migrations are managed differently.');
        // Proceed to seeding, as table might already exist from a previous run or manual setup.
      } else if (error.code === '42P07') { // PostgreSQL error: relation "..." already exists
        console.log(`ℹ️ Table 'feature_flags' (or other object in baseline migration) already exists.`);
        console.log('   Baseline migration step likely applied previously.');
      } else {
        // For other errors during SQL file reading or execution
        console.error(`❌ Error reading or applying baseline migration file ${baselineMigrationPath}:`, error);
        throw error; // Re-throw to be caught by the main try-catch and exit, as migration is critical.
      }
    }

    // --- Step 2: Seed Initial Feature Flags ---
    // This runs after attempting migrations. If migrations failed critically, this won't run.
    // If migrations were skipped (e.g., file not found, table exists), seeding will still attempt.
    await seedInitialFeatureFlags();

  } catch (error) {
    console.error('❌ Failed to complete the feature flags migration and/or seeding process:', error);
    process.exitCode = 1; // Indicate failure
  } finally {
    console.log('🔌 Closing direct migration client connection...');
    await directMigrationClient.end();
    console.log('🚪 Direct migration client connection closed.');
    // Note: The main 'db' pool used for seeding is managed globally and not closed here.
  }
}

// --- Script Execution ---
applyMigrationsAndSeed()
  .then(() => {
    if (process.exitCode !== 1) {
      console.log('🏁 Feature flags migration and seeding process finished.');
    } else {
      console.error('🏁 Feature flags migration and seeding process finished with errors.');
    }
    // process.exit(process.exitCode || 0) // Optionally exit explicitly
  })
  .catch((e) => {
    // This catch is for unhandled promise rejections from main itself, though applyMigrationsAndSeed handles its own errors.
    console.error('💥 Critical unhandled error in the migration script:', e);
    process.exitCode = 1;
    // process.exit(1); // Optionally exit explicitly
  });

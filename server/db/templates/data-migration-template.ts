import dotenv from 'dotenv';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { db as drizzleDb, pool as drizzlePool } from '../../db'; // Drizzle ORM instance and pool
import * as s from '../../../shared/schema'; // All schema objects
import { eq, sql, inArray, isNull, not } from 'drizzle-orm';
import crypto from 'crypto'; // For generating UUIDs if needed

// --- Configuration ---
const __filename = fileURLToPath(import.meta.url);
// Assuming this template is in server/db/templates, and actual migrations will be in server/db/data-migrations
const projectRoot = path.resolve(path.dirname(__filename), '..', '..', '..');

// Load environment variables from .env file at the project root
dotenv.config({ path: path.join(projectRoot, '.env') });

// --- Data Migration Configuration ---
// !! IMPORTANT !!
// 1. RENAME THIS FILE: Copy this template to `server/db/data-migrations/` and rename it.
//    Use a timestamp prefix for ordering: `YYYYMMDDHHMMSS_your_migration_name.ts`
//    Example: `20250616103000_backfill_lead_uuids.ts`
//
// 2. UPDATE MIGRATION_NAME & MIGRATION_DESCRIPTION.
//
// 3. IMPLEMENT `up()`: Define your data transformation logic.
//
// 4. IMPLEMENT `down()` (Optional but Recommended): Define logic to revert the `up()` changes.
//    Not all data migrations are easily reversible. If a rollback is complex or risky,
//    it might be safer to restore from a backup. Clearly document this.
//
// 5. TEST THOROUGHLY: Run against a staging/development database first.
//
// 6. RUN MANUALLY: Execute this script using:
//    `npx tsx server/db/data-migrations/YYYYMMDDHHMMSS_your_migration_name.ts up`
//    `npx tsx server/db/data-migrations/YYYYMMDDHHMMSS_your_migration_name.ts down` (if implemented)
//
//    These scripts are typically run manually, often after structural (Drizzle Kit generated) migrations,
//    or as part of a carefully orchestrated deployment process.

const MIGRATION_NAME = 'Your_Data_Migration_Name_Here';
const MIGRATION_DESCRIPTION = 'Briefly describe what this data migration does.';

const BATCH_SIZE = 100; // Adjust based on data size, memory constraints, and operation complexity.

/**
 * =========================================================================================
 * UP MIGRATION - Apply changes
 * =========================================================================================
 * Implement your data transformation logic within this function.
 * All database operations MUST be performed using the `tx` (transaction) object.
 *
 * @param tx - The Drizzle transaction instance.
 */
async function up(tx: typeof drizzleDb): Promise<void> {
  console.log(`🚀 Applying UP migration: ${MIGRATION_NAME}`);
  console.log(`   Description: ${MIGRATION_DESCRIPTION}`);

  let totalRecordsProcessed = 0;
  let totalRecordsAffected = 0;

  // --- EXAMPLE PATTERNS ---
  // Uncomment and adapt the examples relevant to your migration.
  // Ensure you replace placeholder table/column names with actual schema objects (e.g., s.contacts).

  // Example 1: Backfilling a new column with a default or derived value
  // Scenario: Added `fullName` to `s.users` table, want to populate it from `firstName` and `lastName`.
  /*
  console.log('\n  Example 1: Backfilling `users.fullName`...');
  let backfillOffset = 0;
  let backfillProcessed = 0;
  let backfillAffected = 0;
  let hasMoreToBackfill = true;

  while (hasMoreToBackfill) {
    const usersToUpdate = await tx
      .select({
        id: s.users.id,
        firstName: s.users.firstName,
        lastName: s.users.lastName,
      })
      .from(s.users)
      .where(isNull(s.users.fullName)) // Process only records that need backfilling
      .limit(BATCH_SIZE)
      .offset(backfillOffset);

    if (usersToUpdate.length === 0) {
      hasMoreToBackfill = false;
      break;
    }
    
    console.log(`    Processing batch for backfill (offset ${backfillOffset}, found ${usersToUpdate.length})...`);
    for (const user of usersToUpdate) {
      backfillProcessed++;
      const newFullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      if (newFullName) {
        await tx.update(s.users).set({ fullName: newFullName }).where(eq(s.users.id, user.id));
        backfillAffected++;
      }
    }
    backfillOffset += usersToUpdate.length;
  }
  console.log(`  Backfill complete. Processed: ${backfillProcessed}, Affected: ${backfillAffected}`);
  totalRecordsProcessed += backfillProcessed;
  totalRecordsAffected += backfillAffected;
  */

  // Example 2: Adding UUIDs to existing records that have serial IDs
  // Scenario: `s.legacyEstimates` table has `id (serial)`, want to add `uuid (uuid)`.
  /*
  console.log('\n  Example 2: Adding UUIDs to `legacyEstimates`...');
  // First, ensure the `uuid` column exists (added via a structural migration)
  // ALTER TABLE legacy_estimates ADD COLUMN uuid UUID;
  
  let uuidOffset = 0;
  let uuidProcessed = 0;
  let uuidAffected = 0;
  let hasMoreForUuid = true;

  while (hasMoreForUuid) {
    const recordsWithoutUuid = await tx
      .select({ id: s.legacyEstimates.id }) // Assuming s.legacyEstimates exists
      .from(s.legacyEstimates)
      .where(isNull(s.legacyEstimates.uuid)) // Assuming s.legacyEstimates.uuid exists
      .limit(BATCH_SIZE)
      .offset(uuidOffset);

    if (recordsWithoutUuid.length === 0) {
      hasMoreForUuid = false;
      break;
    }

    console.log(`    Processing batch for UUID generation (offset ${uuidOffset}, found ${recordsWithoutUuid.length})...`);
    for (const record of recordsWithoutUuid) {
      uuidProcessed++;
      await tx
        .update(s.legacyEstimates)
        .set({ uuid: crypto.randomUUID() })
        .where(eq(s.legacyEstimates.id, record.id));
      uuidAffected++;
    }
    uuidOffset += recordsWithoutUuid.length;
  }
  console.log(`  UUID generation complete. Processed: ${uuidProcessed}, Affected: ${uuidAffected}`);
  totalRecordsProcessed += uuidProcessed;
  totalRecordsAffected += uuidAffected;
  */

  // Example 3: Converting data from one format to another
  // Scenario: `s.jobs.estimatedDuration` was stored in hours (numeric), now needs to be in minutes (integer).
  /*
  console.log('\n  Example 3: Converting `jobs.estimatedDuration` from hours to minutes...');
  // Assume structural migration already changed type or added a new column `estimatedDurationMinutes`.
  // For this example, let's assume we are updating the existing column after its type was changed.
  // This is risky; better to use a new column, transform, then swap.
  // ALTER TABLE jobs ALTER COLUMN estimated_duration TYPE INTEGER; (Example of pre-req structural change)

  let durationOffset = 0;
  let durationProcessed = 0;
  let durationAffected = 0;
  let hasMoreDuration = true;

  while (hasMoreDuration) {
    // This query assumes estimated_duration might still hold decimal hour values
    // and needs to be robust against NULLs or already converted values.
    const jobsToConvert = await tx
      .select({ id: s.jobs.id, currentDuration: s.jobs.estimatedDuration })
      .from(s.jobs)
      // Add a condition to select only unconverted rows if possible, e.g., a flag column or checking if it's a decimal
      // .where(sql`${s.jobs.estimatedDuration} IS NOT NULL AND floor(${s.jobs.estimatedDuration}) != ${s.jobs.estimatedDuration}`) // Example: if it has decimals
      .limit(BATCH_SIZE)
      .offset(durationOffset);

    if (jobsToConvert.length === 0) {
      hasMoreDuration = false;
      break;
    }
    
    console.log(`    Processing batch for duration conversion (offset ${durationOffset}, found ${jobsToConvert.length})...`);
    for (const job of jobsToConvert) {
      durationProcessed++;
      if (job.currentDuration !== null && job.currentDuration !== undefined) {
        const durationInHours = parseFloat(String(job.currentDuration));
        if (!isNaN(durationInHours)) {
          const durationInMinutes = Math.round(durationInHours * 60);
          await tx
            .update(s.jobs)
            .set({ estimatedDuration: durationInMinutes })
            .where(eq(s.jobs.id, job.id));
          durationAffected++;
        }
      }
    }
    durationOffset += jobsToConvert.length;
  }
  console.log(`  Duration conversion complete. Processed: ${durationProcessed}, Affected: ${durationAffected}`);
  totalRecordsProcessed += durationProcessed;
  totalRecordsAffected += durationAffected;
  */

  // Example 4: Moving data from one table/column to another (e.g., denormalization or refactoring)
  // Scenario: Moving `address` from `s.contacts` to a new `s.contactAddresses` table.
  /*
  console.log('\n  Example 4: Moving addresses from `contacts` to `contactAddresses`...');
  // Assume `contactAddresses` table (contactId, addressType, street, city, etc.) was created by a structural migration.
  // Assume `contacts.addressProcessed (boolean)` was added to track progress.
  
  let addressOffset = 0;
  let addressProcessed = 0;
  let addressAffected = 0; // Count of new rows in contactAddresses
  let hasMoreAddresses = true;

  while (hasMoreAddresses) {
    const contactsWithAddresses = await tx
      .select({ id: s.contacts.id, address: s.contacts.address })
      .from(s.contacts)
      .where(and(
        not(isNull(s.contacts.address)), 
        // eq(s.contacts.addressProcessed, false) // If using a flag
      ))
      .limit(BATCH_SIZE)
      .offset(addressOffset);

    if (contactsWithAddresses.length === 0) {
      hasMoreAddresses = false;
      break;
    }

    console.log(`    Processing batch for address migration (offset ${addressOffset}, found ${contactsWithAddresses.length})...`);
    const newAddresses = [];
    for (const contact of contactsWithAddresses) {
      addressProcessed++;
      if (contact.address && contact.address.trim() !== '') {
        // Simple split; real parsing would be more complex
        const parts = contact.address.split(',');
        newAddresses.push({
          contactId: contact.id,
          addressType: 'primary', // Or derive
          street: parts[0]?.trim(),
          city: parts[1]?.trim(),
          // ... other fields
        });
      }
    }

    if (newAddresses.length > 0) {
      // await tx.insert(s.contactAddresses).values(newAddresses); // Assuming s.contactAddresses schema
      addressAffected += newAddresses.length;
      
      // Mark as processed
      // const contactIdsProcessed = contactsWithAddresses.map(c => c.id);
      // await tx.update(s.contacts).set({ addressProcessed: true }).where(inArray(s.contacts.id, contactIdsProcessed));
    }
    addressOffset += contactsWithAddresses.length;
  }
  console.log(`  Address migration complete. Contacts Processed: ${addressProcessed}, New Addresses Created: ${addressAffected}`);
  totalRecordsProcessed += addressProcessed;
  totalRecordsAffected += addressAffected;
  */

  // --- Your specific migration logic goes here ---
  // Remember to:
  // 1. Work in batches for large datasets.
  // 2. Log progress.
  // 3. Handle potential errors gracefully within the loop if appropriate, or let them bubble up to rollback the transaction.

  console.log('\n  [Implement your data migration steps here]');
  // totalRecordsProcessed += ...
  // totalRecordsAffected += ...


  // --- End of specific migration logic ---

  console.log(`\n🏁 UP migration ${MIGRATION_NAME} finished.`);
  console.log(`   Total records scanned/processed: ${totalRecordsProcessed}`);
  console.log(`   Total records affected/updated: ${totalRecordsAffected}`);
}

/**
 * =========================================================================================
 * DOWN MIGRATION - Revert changes
 * =========================================================================================
 * Implement logic to revert the changes made by the `up()` migration.
 * This is crucial for rollbacks. Not all data migrations are easily or safely reversible.
 * If a down migration is too complex, risky, or impossible, document that clearly
 * and rely on database backups for rollbacks.
 *
 * @param tx - The Drizzle transaction instance.
 */
async function down(tx: typeof drizzleDb): Promise<void> {
  console.log(`🚀 Applying DOWN migration: ${MIGRATION_NAME}`);
  console.warn('   ⚠️ IMPORTANT: Review this down migration carefully before running!');
  console.warn('      Data loss or corruption can occur if not implemented correctly.');

  // --- Your specific rollback logic goes here ---
  // This will be highly dependent on what `up()` does.
  // Examples:
  // - If `up()` backfilled `users.fullName`, `down()` might set it back to NULL.
  // - If `up()` added UUIDs, `down()` might set the `uuid` column to NULL (data is not lost, just the UUID).
  // - If `up()` converted hours to minutes, `down()` would convert minutes back to hours (potential precision loss).
  // - If `up()` moved data to a new table, `down()` might try to move it back or simply delete from the new table.

  console.log('\n  [Implement your data rollback steps here]');
  // Example: Reverting a simple backfill where `fullName` was populated
  /*
  console.log('  Reverting `users.fullName` backfill (setting to NULL for affected records)...');
  // This is a simplified example. A real rollback might need to identify only rows affected by THIS migration.
  await tx.update(s.users).set({ fullName: null }).where(not(isNull(s.users.fullName))); 
  console.log('  `users.fullName` potentially reverted.');
  */

  console.log(`\n🏁 DOWN migration ${MIGRATION_NAME} finished.`);
  console.log('   Verify data carefully after running a down migration.');
}

/**
 * =========================================================================================
 * SCRIPT EXECUTION LOGIC
 * =========================================================================================
 */
async function run() {
  console.log(`\n========= Executing Data Migration Script: ${MIGRATION_NAME} =========`);
  console.log(`Timestamp: ${new Date().toISOString()}`);

  const args = process.argv.slice(2);
  const operation = args[0]?.toLowerCase(); // 'up' or 'down'

  if (operation !== 'up' && operation !== 'down') {
    console.error('❌ Error: Invalid operation. Must be "up" or "down".');
    console.error('   Usage: npx tsx path/to/your-migration-script.ts <up|down>');
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set.');
    process.exit(1);
  }

  // Safety check for production
  if (process.env.NODE_ENV === 'production' && !process.argv.includes('--confirm-production-data-migration')) {
    console.error('\n❌ PRODUCTION SAFETY CHECK: Attempting to run data migration in production without confirmation flag.');
    console.error('   This script can modify large amounts of data and should be run with extreme caution in production.');
    console.error('   If you are absolutely sure, re-run with the "--confirm-production-data-migration" flag.');
    console.error('   Example: `npx tsx your-script.ts up --confirm-production-data-migration`');
    process.exit(1);
  }
  if (process.argv.includes('--confirm-production-data-migration')) {
     const confirmProd = await askForConfirmation(
      `⚠️ You are about to run a DATA MIGRATION in PRODUCTION. This is risky.
         Type 'yes' to confirm you understand and have a rollback plan/backup: `
    );
    if (!confirmProd) {
      console.log('🚫 Production data migration cancelled by user.');
      process.exit(0);
    }
  }


  // Using the main Drizzle ORM instance for the transaction
  const db = drizzleDb;
  const mainPool = drizzlePool; // For closing at the end

  try {
    console.log(`\n⏳ Starting transaction for ${operation.toUpperCase()} migration...`);
    await db.transaction(async (tx) => {
      console.log(`✅ Transaction started for ${operation.toUpperCase()}.`);
      if (operation === 'up') {
        await up(tx);
      } else {
        await down(tx);
      }
      console.log(`\n✅ All operations within ${operation.toUpperCase()} transaction completed successfully.`);
    }); // Transaction block ends

    console.log(`\n🎉 Transaction committed. ${operation.toUpperCase()} migration successful!`);
    process.exitCode = 0;
  } catch (error) {
    console.error(`\n🚨 An error occurred during the ${operation.toUpperCase()} data migration process:`);
    console.error(error);
    console.error(`🔴 Transaction was rolled back. No changes from this script were applied to the database for the ${operation.toUpperCase()} operation.`);
    process.exitCode = 1;
  } finally {
    console.log('\n🔌 Closing database connection pool (if applicable)...');
    try {
      // The main pool is managed globally by db.ts, typically not closed by individual scripts.
      // However, if this script were to use its own direct postgres.js client, it would be closed here.
      // For now, assuming the global pool remains open.
      // await mainPool.end(); 
      console.log('🚪 Database connection pool management is handled by the global Drizzle instance.');
    } catch (closeError) {
      console.error('❌ Error closing database connection pool:', closeError);
    }
    console.log('---------------------------------------------------------------------');
    console.log(`🏁 Data Migration Script Finished: ${MIGRATION_NAME} (${operation.toUpperCase()})`);
    console.log('=====================================================================\n');
  }
}

// --- Script Execution ---
// This allows the script to be run directly from the command line.
// The check `require.main === module` is for CommonJS. For ESM, a more robust check or direct call is typical.
// We'll assume direct execution if not imported.
run().catch(err => {
  console.error("Unhandled error in script execution:", err);
  process.exit(1);
});

// Exporting for potential programmatic use, though primarily designed for CLI.
export { up, down };

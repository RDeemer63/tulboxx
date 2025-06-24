// server/__tests__/utils/testHelper.ts

import { db, pool as dbPoolInstance } from '../../db'; // Main Drizzle instance and underlying pool
import { featureFlagsTable } from '../../../shared/feature-flags-schema';
import { users } from '../../../shared/schema'; // For potential user cleanup if added later
import { businessProfiles } from '../../../shared/schema'; // For potential business profile cleanup

/**
 * @function disconnectDb
 * @description Gracefully closes all connections in the database pool.
 * This is crucial for allowing Jest to exit cleanly after tests that use the database.
 * Should be called in `afterAll()` in your Jest test suites.
 */
export async function disconnectDb(): Promise<void> {
  try {
    await dbPoolInstance.end();
    if (process.env.NODE_ENV === 'test') { // Log only in test environment
      // console.log('🔌 Test database connection pool closed successfully.');
    }
  } catch (error) {
    console.error('❌ Error closing test database connection pool:', error);
    // Depending on the CI/test setup, you might want to throw the error
    // or simply log it and allow the process to attempt to exit.
    // For now, we log and don't re-throw to avoid masking other potential teardown issues.
  }
}

/**
 * @function resetFeatureFlagsTable
 * @description Deletes all records from the `feature_flags` table.
 * Useful for ensuring a clean state before tests that interact with feature flags.
 * Should typically be called in `beforeEach()` or `beforeAll()` depending on test isolation needs.
 */
export async function resetFeatureFlagsTable(): Promise<void> {
  try {
    await db.delete(featureFlagsTable);
    // if (process.env.NODE_ENV === 'test') {
    //   console.log('🚩 Feature flags table reset successfully.');
    // }
  } catch (error) {
    console.error('❌ Failed to reset feature_flags table:', error);
    // This is likely a critical failure for tests relying on a clean slate.
    throw error;
  }
}

/**
 * @function clearTestUsersAndProfiles
 * @description Deletes specific test users and their associated business profiles.
 * This is more targeted than a full DB reset and should be used if tests create specific entities.
 *
 * @param {string[]} userIds - An array of user IDs to delete.
 * @param {number[]} businessProfileIds - An array of business profile IDs to delete.
 */
export async function clearTestUsersAndProfiles(userIds: string[], businessProfileIds: number[]): Promise<void> {
  try {
    if (userIds.length > 0) {
      // Delete from users table where id is in userIds array
      // This might require a more complex query if using Drizzle's `inArray` with many IDs,
      // or multiple delete statements in a transaction.
      // For simplicity, let's assume a few users or handle this with direct SQL if needed.
      // For now, we'll iterate, which is not ideal for many users but fine for typical test setup.
      for (const userId of userIds) {
        await db.delete(users).where(db.users.id.eq(userId));
      }
    }
    if (businessProfileIds.length > 0) {
      for (const profileId of businessProfileIds) {
        await db.delete(businessProfiles).where(db.businessProfiles.id.eq(profileId));
      }
    }
    // if (process.env.NODE_ENV === 'test' && (userIds.length > 0 || businessProfileIds.length > 0)) {
    //   console.log('🧹 Test users and business profiles cleared successfully.');
    // }
  } catch (error) {
    console.error('❌ Failed to clear test users and/or business profiles:', error);
    throw error;
  }
}


/**
 * @function ensureTestDatabaseConnection
 * @description Performs a simple query to ensure the database connection pool is active and working.
 * Can be called in a global Jest setup file or at the beginning of a test suite.
 */
export async function ensureTestDatabaseConnection(): Promise<void> {
    try {
        await db.execute(db.sql`SELECT 1`);
        if (process.env.NODE_ENV === 'test') {
            // console.log('🔗 Test database connection verified successfully.');
        }
    } catch (error) {
        console.error('❌ Failed to verify test database connection:', error);
        // This is a critical failure for any DB-dependent tests.
        throw new Error(`Database connection failed: ${(error as Error).message}`);
    }
}

// Example usage in a Jest test file (e.g., in a global setup or beforeAll/afterAll):
//
// import { disconnectDb, resetFeatureFlagsTable, ensureTestDatabaseConnection } from './utils/testHelper';
//
// beforeAll(async () => {
//   await ensureTestDatabaseConnection();
// });
//
// beforeEach(async () => {
//   await resetFeatureFlagsTable();
//   // Potentially reset other tables or seed specific data for the test
// });
//
// afterAll(async () => {
//   await disconnectDb();
// });

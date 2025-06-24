import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db, migrationClient } from '../db'; // Assumes db.ts exports 'db' (Drizzle instance) and 'migrationClient' (postgres client)
import { fileURLToPath } from 'url';

// Load environment variables from .env file at the project root
// __dirname is not available in ESM; recreate it from import.meta.url
const __filename = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(__filename), '..', '..'); // up two levels from server/db to project root

dotenv.config({ path: path.join(projectRoot, '.env') });

const migrationsFolder = path.join(projectRoot, 'migrations');

/**
 * ------------------------------------------------------------------
 * Runtime flags
 * ------------------------------------------------------------------
 * --skip-existing     → ignore “relation already exists” errors
 * SKIP_EXISTING_MIGRATIONS=true (env) has the same effect.
 */
const skipExisting =
  process.argv.includes('--skip-existing') ||
  process.env.SKIP_EXISTING_MIGRATIONS === 'true';

async function runMigrations() {
  console.log('🚀 Starting database migration process...');
  console.log(`📂 Looking for migrations in: ${migrationsFolder}`);

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set.');
    console.error('Ensure it is defined in your .env file or environment.');
    throw new Error('DATABASE_URL is not set');
  }

  try {
    // Check if migrations folder exists
    if (!fs.existsSync(migrationsFolder)) {
      console.log(`✅ Migrations folder not found at ${migrationsFolder}. Assuming no migrations to apply.`);
      console.log('Migration process complete.');
      return;
    }

    const migrationFiles = fs.readdirSync(migrationsFolder);
    if (migrationFiles.length === 0) {
      console.log('✅ No migration files found in the migrations folder. Database is likely up to date or no migrations generated yet.');
      console.log('Migration process complete.');
      return;
    }
    console.log(`🔍 Found ${migrationFiles.length} potential migration file(s)/folder(s):`);
    migrationFiles.forEach(file => console.log(`  - ${file}`));

    // Perform the migration
    await migrate(db, { migrationsFolder });
    console.log('✅ Database migration successful!');
    console.log('🎉 All pending migrations have been applied.');
  } catch (error) {
    // Handle “relation already exists” (duplicate table) gracefully if flag is set
    if (skipExisting && (error?.code === '42P07' || /already exists/i.test(error?.message))) {
      console.warn('⚠️  Relation already exists. Skipping migration as per --skip-existing flag.');
      return;
    }

    console.error('❌ Error during database migration:');
    console.error(error);
    throw error; // Re-throw to be caught by the main execution block for process.exit(1)
  }
}

async function main() {
  try {
    await runMigrations();
    console.log('🏁 Migration script finished successfully.');
    process.exitCode = 0; // Indicate success
  } catch (error) {
    console.error('🚨 Migration script failed.');
    process.exitCode = 1; // Indicate failure
  } finally {
    // Ensure the client connection is closed
    if (migrationClient) {
      console.log('🔌 Closing database connection...');
      try {
        await migrationClient.end();
        console.log('🚪 Database connection closed.');
      } catch (closeError) {
        console.error('❌ Error closing database connection:', closeError);
      }
    }
  }
}

main();

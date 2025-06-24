import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import postgres from 'postgres';
import { fileURLToPath } from 'url';

// --- Configuration ---
const __filename = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(__filename), '..', '..'); // server/db -> server -> project root

// Load environment variables from .env file at the project root
dotenv.config({ path: path.join(projectRoot, '.env') });

// Define the specific migration file to apply
// This was generated into 'migrations-estimates' by our temporary config
const MIGRATION_FILE_NAME = '0000_omniscient_archangel.sql'; // This should be the estimate-specific migration
const MIGRATION_FILE_PATH = path.join(projectRoot, 'migrations-estimates', MIGRATION_FILE_NAME);
const STATEMENT_BREAKPOINT = '--> statement-breakpoint';

/**
 * Parse DATABASE_URL, return a version without the `schema=` query param.
 * Postgres.js client can error if `schema=` is present in the connection string,
 * as it tries to set it as a GUC.
 */
function sanitizeDatabaseUrl(rawUrl: string | undefined): string {
  if (!rawUrl) {
    return '';
  }
  try {
    const parsed = new URL(rawUrl);
    if (parsed.searchParams.has('schema')) {
      parsed.searchParams.delete('schema');
    }
    return parsed.toString();
  } catch (err) {
    // If URL parsing fails, fall back to raw string (best-effort).
    return rawUrl;
  }
}


async function applySpecificMigration() {
  console.log(`🚀 Attempting to apply specific SQL migration: ${MIGRATION_FILE_NAME}`);
  console.log(`   File path: ${MIGRATION_FILE_PATH}`);
  console.log('---------------------------------------------------------------------');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set.');
    console.error('   Ensure it is defined in your .env file or environment.');
    process.exit(1);
  }

  if (!fs.existsSync(MIGRATION_FILE_PATH)) {
    console.error(`❌ Migration file not found at: ${MIGRATION_FILE_PATH}`);
    console.error('   Please ensure the file exists and the path is correct.');
    process.exit(1);
  }

  const dbUrlForPostgresJs = sanitizeDatabaseUrl(process.env.DATABASE_URL);
  const sql = postgres(dbUrlForPostgresJs, { max: 1 });

  let overallSuccess = true;
  let statementsApplied = 0;
  let statementsSkipped = 0;
  let statementsFailed = 0;

  try {
    console.log('\n🔗 Connecting to the database...');
    await sql`SELECT 1`; // Test connection
    console.log('✅ Database connection successful.');

    console.log(`\n📖 Reading SQL content from ${MIGRATION_FILE_NAME}...`);
    const sqlContent = fs.readFileSync(MIGRATION_FILE_PATH, 'utf-8');
    if (!sqlContent.trim()) {
      console.error('❌ Migration file is empty.');
      throw new Error('Migration file is empty.');
    }
    console.log('✅ SQL content read successfully.');

    const statements = sqlContent.split(STATEMENT_BREAKPOINT);
    console.log(`\nℹ️ Found ${statements.length} SQL statements to process.`);

    console.log('\n⏳ Executing SQL statements individually...');
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (!statement) {
        continue; // Skip empty statements (e.g., from trailing breakpoint)
      }

      console.log(`\n  Executing statement ${i + 1}/${statements.length}:`);
      console.log(`  SQL: ${statement.substring(0, 100)}${statement.length > 100 ? '...' : ''}`);

      try {
        await sql.unsafe(statement);
        console.log('  ✅ Statement applied successfully.');
        statementsApplied++;
      } catch (error: any) {
        if (error.code === '42P07' || (error.message && error.message.toLowerCase().includes('already exists'))) {
          console.warn(`  ⚠️ Statement skipped: Object likely already exists (Error: ${error.message.split('\n')[0]})`);
          statementsSkipped++;
        } else {
          console.error(`  ❌ Error applying statement: ${error.message.split('\n')[0]}`);
          console.error('     Full error:', error);
          statementsFailed++;
          overallSuccess = false; // Mark overall process as failed if any critical error occurs
          // Optionally, re-throw to stop immediately: throw error;
        }
      }
    }
    
    console.log('\n---------------------------------------------------------------------');
    if (overallSuccess && statementsFailed === 0) {
      console.log(`\n🎉 SQL migration processing complete for: ${MIGRATION_FILE_NAME}`);
      console.log(`   Statements applied: ${statementsApplied}`);
      console.log(`   Statements skipped (already exists): ${statementsSkipped}`);
      console.log('   The tables and structures defined in this file should now exist or were confirmed to exist.');
    } else {
      console.error(`\n🚨 SQL migration processing encountered errors for: ${MIGRATION_FILE_NAME}`);
      console.log(`   Statements applied: ${statementsApplied}`);
      console.log(`   Statements skipped (already exists): ${statementsSkipped}`);
      console.log(`   Statements FAILED: ${statementsFailed}`);
      console.error('   Please review the logs above for details on failed statements.');
    }
    console.log('   NOTE: This script does NOT update Drizzle\'s migration tracking table (`__drizzle_migrations`).');

    process.exitCode = (overallSuccess && statementsFailed === 0) ? 0 : 1;

  } catch (error) {
    console.error('\n🚨 An critical error occurred during the SQL migration application script:');
    console.error(error);
    process.exitCode = 1; // Failure
  } finally {
    if (sql) {
      console.log('\n🔌 Closing database connection...');
      try {
        await sql.end();
        console.log('🚪 Database connection closed.');
      } catch (closeError) {
        console.error('❌ Error closing database connection:', closeError);
      }
    }
    console.log('---------------------------------------------------------------------');
    console.log('🏁 Script finished.');
  }
}

// --- Script Execution ---
applySpecificMigration().catch(err => {
  console.error("Unhandled error in script execution:", err);
  process.exit(1);
});

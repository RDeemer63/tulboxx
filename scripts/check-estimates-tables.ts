import dotenv from 'dotenv';
import path from 'path';
import postgres from 'postgres';
import { fileURLToPath } from 'url';

// --- Configuration ---
const __filename = fileURLToPath(import.meta.url);
// Assuming this script is in project_root/scripts/
const projectRoot = path.resolve(path.dirname(__filename), '..');

// Load environment variables from .env file at the project root
dotenv.config({ path: path.join(projectRoot, '.env') });

const DEFAULT_SCHEMA_TO_CHECK = 'app_schema';

/**
 * Parse DATABASE_URL, return a version without the `schema=` query param.
 * Postgres.js client can error if `schema=` is present in the connection string,
 * as it tries to set it as a GUC.
 */
function sanitizeDatabaseUrl(rawUrl: string | undefined): {
  cleanUrl: string;
  requestedSchema: string | null;
} {
  if (!rawUrl) {
    console.error('❌ DATABASE_URL is not defined in .env file.');
    process.exit(1);
  }
  try {
    const parsed = new URL(rawUrl);
    const schemaParam = parsed.searchParams.get('schema');
    if (schemaParam) {
      parsed.searchParams.delete('schema');
    }
    return {
      cleanUrl: parsed.toString(),
      requestedSchema: schemaParam,
    };
  } catch (err) {
    // If URL parsing fails, fall back to raw string (best-effort).
    // This might happen if the URL is not a standard URL format but a simpler connection string.
    console.warn('⚠️  Could not parse DATABASE_URL as a standard URL. Using raw value. Schema parameter might not be handled correctly by postgres.js client if present.');
    return { cleanUrl: rawUrl, requestedSchema: null };
  }
}

async function checkEstimateTables() {
  console.log('🚀 Checking for tables related to "estimate" in the database...');
  console.log('---------------------------------------------------------------------');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set.');
    console.error('   Ensure it is defined in your .env file or environment.');
    process.exit(1);
  }

  const { cleanUrl: dbUrlForPostgresJs, requestedSchema: schemaFromUrl } = sanitizeDatabaseUrl(process.env.DATABASE_URL);
  const schemaToQuery = schemaFromUrl || DEFAULT_SCHEMA_TO_CHECK;

  console.log(`ℹ️  Connecting to database and querying schema: "${schemaToQuery}"`);

  const sql = postgres(dbUrlForPostgresJs, { max: 1 });

  try {
    await sql`SELECT 1`; // Test connection
    console.log('✅ Database connection successful.');

    const tables = await sql<Array<{ table_name: string }>>`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = ${schemaToQuery}
        AND table_name ILIKE '%estimate%'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;

    if (tables.length > 0) {
      console.log(`\n✅ Found the following tables in schema "${schemaToQuery}" containing "estimate":`);
      tables.forEach(table => {
        console.log(`   - ${table.table_name}`);
      });
    } else {
      console.log(`\nℹ️ No tables containing "estimate" found in schema "${schemaToQuery}".`);
    }

    // Additionally, check public schema if different from schemaToQuery and schemaFromUrl was not 'public'
    if (schemaToQuery !== 'public' && schemaFromUrl !== 'public') {
      console.log(`\nℹ️  Additionally checking schema: "public"`);
      const publicTables = await sql<Array<{ table_name: string }>>`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name ILIKE '%estimate%'
          AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `;
      if (publicTables.length > 0) {
        console.log(`✅ Found the following tables in schema "public" containing "estimate":`);
        publicTables.forEach(table => {
          console.log(`   - ${table.table_name}`);
        });
      } else {
        console.log(`ℹ️ No tables containing "estimate" found in schema "public".`);
      }
    }


    process.exitCode = 0; // Success
  } catch (error) {
    console.error('\n🚨 An error occurred while checking estimate tables:');
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
checkEstimateTables().catch(err => {
  console.error("Unhandled error in script execution:", err);
  process.exit(1);
});

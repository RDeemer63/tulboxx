import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs-extra';
import { execSync, ExecSyncOptionsWithStringEncoding } from 'child_process';
import postgres from 'postgres';
import { fileURLToPath } from 'url';
import readline from 'readline';

// --- Configuration ---
const __filename = fileURLToPath(import.meta.url);
// Assuming this script is in server/db/, projectRoot is server/../.. -> project root
const projectRoot = path.resolve(path.dirname(__filename), '..', '..');

// Load environment variables from .env file at the project root
dotenv.config({ path: path.join(projectRoot, '.env') });

const MIGRATIONS_DIR_RELATIVE_TO_ROOT = 'migrations'; // As per drizzle.config.ts
const MIGRATIONS_DIR_ABSOLUTE = path.join(projectRoot, MIGRATIONS_DIR_RELATIVE_TO_ROOT);
const DRIZZLE_MIGRATIONS_TABLE = '__drizzle_migrations'; // Default Drizzle migrations table

/**
 * Parse DATABASE_URL, return a version without the `schema=` query param.
 * Postgres.js client can error if `schema=` is present in the connection string,
 * as it tries to set it as a GUC. Drizzle Kit uses it correctly.
 */
function sanitizeDatabaseUrl(rawUrl: string | undefined): {
  cleanUrl: string;
  requestedSchema: string | null;
} {
  if (!rawUrl) {
    return { cleanUrl: '', requestedSchema: null };
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
    return { cleanUrl: rawUrl, requestedSchema: null };
  }
}

function runCommand(command: string, errorMessage: string) {
  console.log(`\n🔌 Executing: ${command}`);
  try {
    const options: ExecSyncOptionsWithStringEncoding = {
      stdio: 'inherit',
      encoding: 'utf-8',
      cwd: projectRoot, // Run command from project root
    };
    execSync(command, options);
    console.log(`✅ Command executed successfully.`);
  } catch (error) {
    console.error(`❌ ${errorMessage}`);
    throw error; // Propagate the error to stop the script
  }
}

async function ensureMigrationsTable(sql: postgres.Sql, schema: string | null) {
  const tableName = DRIZZLE_MIGRATIONS_TABLE;
  const qualifiedTableName = schema ? sql`${sql(schema)}.${sql(tableName)}` : sql`${sql(tableName)}`;
  
  console.log(`\n🔍 Ensuring Drizzle migrations table (${qualifiedTableName}) exists...`);
  try {
    // Drizzle ORM's migrator creates this table structure:
    // id SERIAL PRIMARY KEY, hash VARCHAR(255) NOT NULL, created_at BIGINT NOT NULL
    // We use text for hash and bigint for created_at as per Drizzle's actual table.
    await sql`
      CREATE TABLE IF NOT EXISTS ${qualifiedTableName} (
        id SERIAL PRIMARY KEY,
        hash TEXT NOT NULL,
        created_at BIGINT NOT NULL
      );
    `;
    console.log(`✅ Drizzle migrations table (${qualifiedTableName}) ensured.`);
  } catch (error) {
    console.error(`❌ Failed to ensure Drizzle migrations table (${qualifiedTableName}):`, error);
    throw error;
  }
}

async function markBaselineAsApplied(
  sql: postgres.Sql,
  migrationFileName: string,
  schema: string | null
) {
  const tableName = DRIZZLE_MIGRATIONS_TABLE;
  const qualifiedTableName = schema ? sql`${sql(schema)}.${sql(tableName)}` : sql`${sql(tableName)}`;
  const hash = `baseline_hash_for_${migrationFileName}_${Date.now()}`; // Placeholder hash
  const createdAt = Date.now();

  console.log(`\n📝 Marking baseline migration "${migrationFileName}" as applied in ${qualifiedTableName}...`);
  try {
    // Check if it's already marked (e.g., if script is re-run partially)
    const existing = await sql`
      SELECT id FROM ${qualifiedTableName} WHERE hash = ${hash} OR id = 0 OR id = 1 LIMIT 1;
    `; // Drizzle often uses ID 0 or 1 for baselines if manually done or first.
       // Using hash for more specific check if we were to calculate it.

    if (existing.length > 0) {
      console.log(`ℹ️ Baseline migration seems to be already marked as applied (ID: ${existing[0].id}). Skipping insertion.`);
      return;
    }

    await sql`
      INSERT INTO ${qualifiedTableName} (hash, created_at)
      VALUES (${hash}, ${createdAt});
    `;
    console.log(`✅ Baseline migration "${migrationFileName}" marked as applied with hash "${hash}".`);
  } catch (error) {
    console.error(`❌ Failed to mark baseline migration as applied:`, error);
    throw error;
  }
}

function askForConfirmation(query: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === 'yes');
    });
  });
}


async function createBaselineMigration() {
  console.log('🚀 Starting Baseline Migration Generation Script...');
  console.log('---------------------------------------------------------------------');
  console.log('⚠️  IMPORTANT PRE-REQUISITES:');
  console.log('   1. Backup your database before running this script.');
  console.log('   2. Ensure `shared/schema.ts` accurately reflects the DESIRED CURRENT STATE of your database.');
  console.log('      This script generates SQL FROM `shared/schema.ts`. It does NOT introspect the live DB.');
  console.log('   3. This script will DELETE all existing files in the `migrations` directory.');
  console.log('---------------------------------------------------------------------\n');

  /* ------------------------------------------------------------------ */
  /*  Safety Gate – require explicit opt-in via .env                     */
  /* ------------------------------------------------------------------ */
  if (process.env.ALLOW_MIGRATION_SYSTEM_RESET !== 'true') {
    console.error('🚫  Migration-system reset is DISABLED.');
    console.error('     Set ALLOW_MIGRATION_SYSTEM_RESET=\"true\" in your .env file and');
    console.error('     re-run this script **only during a planned destructive reset**.');
    console.error('     This guard prevents accidental schema drops in normal dev flow.');
    process.exit(1);
  }

  const proceed = await askForConfirmation('Are you sure you want to proceed? (yes/no): ');
  if (!proceed) {
    console.log('🚫 Operation cancelled by user.');
    return;
  }
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set.');
    throw new Error('DATABASE_URL is not set. Check your .env file.');
  }

  const { cleanUrl: dbUrlForPostgresJs, requestedSchema } = sanitizeDatabaseUrl(process.env.DATABASE_URL);
  const sql = postgres(dbUrlForPostgresJs, { max: 1 });

  try {
    // Step 1: Clean the migrations directory
    console.log(`\n🧹 Cleaning migrations directory: ${MIGRATIONS_DIR_ABSOLUTE}`);
    if (fs.existsSync(MIGRATIONS_DIR_ABSOLUTE)) {
      const files = fs.readdirSync(MIGRATIONS_DIR_ABSOLUTE);
      for (const file of files) {
        // Keep .gitkeep or similar if present
        if (file !== '.gitkeep' && file !== '.gitignore') {
          fs.removeSync(path.join(MIGRATIONS_DIR_ABSOLUTE, file));
        }
      }
      console.log('✅ Migrations directory cleaned (except .gitkeep/.gitignore).');
    } else {
      fs.mkdirSync(MIGRATIONS_DIR_ABSOLUTE, { recursive: true });
      console.log('✅ Migrations directory created.');
    }

    // Step 2: Generate the baseline SQL from schema.ts using Drizzle Kit
    // Drizzle Kit `generate` command will create `0000_<name>.sql` and `meta/` folder.
    // It uses `drizzle.config.ts` which should have the correct `DATABASE_URL` with `?schema=app_schema`.
    runCommand(
      'npx drizzle-kit generate',
      'Failed to generate baseline SQL using Drizzle Kit.'
    );

    const migrationFiles = fs.readdirSync(MIGRATIONS_DIR_ABSOLUTE);
    const baselineSqlFile = migrationFiles.find(file => file.startsWith('0000_') && file.endsWith('.sql'));

    if (!baselineSqlFile) {
      console.error('❌ No baseline SQL file (e.g., 0000_....sql) found after running `drizzle-kit generate`.');
      throw new Error('Baseline SQL file generation failed.');
    }
    console.log(`📄 Baseline SQL file generated: ${baselineSqlFile}`);

    // Optional: Add SET search_path to the generated baseline SQL if needed
    // This depends on how Drizzle Kit and your DB user handle schemas.
    // If `drizzle.config.ts` has `?schema=app_schema` in DATABASE_URL, Drizzle Kit
    // should generate schema-qualified table names (e.g., "app_schema"."my_table").
    // If not, and tables are created in 'public' by default by the migration SQL,
    // you might need to prepend `SET search_path = app_schema, public;` to the SQL file.
    // For now, we assume Drizzle Kit handles this based on DATABASE_URL.
    console.log(`ℹ️  Review the generated SQL file "${baselineSqlFile}" to ensure it targets the correct schema (e.g., "${requestedSchema || 'public'}").`);


    // Step 3: Ensure the Drizzle migrations table exists
    // The schema for the migrations table itself depends on where Drizzle's `migrate` function would create it.
    // If DATABASE_URL has ?schema=app_schema, it might try to create it in app_schema.
    // If not, it usually defaults to public. We use `requestedSchema` if available, else `public`.
    const schemaForMigrationsTable = requestedSchema || 'public';
    await ensureMigrationsTable(sql, schemaForMigrationsTable);

    // Step 4: Mark the generated baseline migration as applied in the Drizzle migrations table
    // This prevents Drizzle from trying to run this baseline SQL against an already-existing schema.
    await markBaselineAsApplied(sql, baselineSqlFile, schemaForMigrationsTable);

    console.log('\n🎉 Baseline Migration Generation and Setup Complete!');
    console.log('---------------------------------------------------------------------');
    console.log('👉 Next Steps:');
    console.log(`   1. Thoroughly review the generated SQL file: "${path.join(MIGRATIONS_DIR_RELATIVE_TO_ROOT, baselineSqlFile)}"`);
    console.log('      Ensure it accurately reflects your desired database schema.');
    console.log('   2. Commit the `migrations` folder (including the new baseline SQL and meta folder) to version control.');
    console.log('   3. For subsequent schema changes:');
    console.log('      a. Modify `shared/schema.ts`.');
    console.log('      b. Run `npx drizzle-kit generate` (or `npm run db:generate`).');
    console.log('      c. Run `npm run db:migrate` to apply the new migration.');
    console.log('      d. Commit the changes.');
    console.log('---------------------------------------------------------------------\n');

  } catch (error) {
    console.error('\n🚨 Baseline migration script failed catastrophically.');
    // Error should have been logged by the failing function
    throw error; // Re-throw to ensure script exits with error
  } finally {
    await sql.end();
    console.log('🚪 Database connection (for script operations) closed.');
  }
}

async function main() {
  try {
    await createBaselineMigration();
    process.exitCode = 0; // Indicate success
  } catch (error) {
    // Error messages are already logged by createBaselineMigration or its helpers
    process.exitCode = 1; // Indicate failure
  }
}

main();

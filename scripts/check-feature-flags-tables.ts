// scripts/check-feature-flags-tables.ts

import dotenv from 'dotenv';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

// ESM-compatible way to get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') }); // Load .env from project root

import { sql, count, Column } from 'drizzle-orm';
import { db } from '../server/db';
import { featureFlagsTable } from '../../shared/feature-flags-schema';
import { getTableConfig, PgColumn } from 'drizzle-orm/pg-core';

const SCHEMA_NAME_APP = 'app_schema';
const SCHEMA_NAME_PUBLIC = 'public';

interface ColumnCheckResult {
  exists: boolean;
  typeMatch?: boolean;
  actualType?: string;
  nullableMatch?: boolean;
  isNullable?: string; // 'YES' or 'NO'
  defaultMatch?: boolean;
  actualDefault?: string | null;
}

/**
 * Checks if a specific table exists in the given schema using the main Drizzle 'db' client.
 */
async function checkTableExists(tableName: string, schemaName: string): Promise<boolean> {
  try {
    const result = await db.execute(
      sql`SELECT EXISTS (
          SELECT 1
          FROM information_schema.tables
          WHERE table_schema = ${schemaName}
          AND table_name = ${tableName}
      );`
    );
    const rows = (result as any).rows;
    return rows && rows.length > 0 && rows[0] && rows[0].exists === true;
  } catch (error) {
    console.error(`Error checking if table ${schemaName}.${tableName} exists:`, error);
    return false;
  }
}

/**
 * Verifies a specific column's existence, data type, nullability, and default value.
 */
async function checkColumn(
  tableName: string,
  schemaName: string,
  columnName: string,
  expectedType: string, // e.g., 'character varying', 'boolean', 'timestamp with time zone', 'text'
  expectedNullable: 'YES' | 'NO',
  expectedDefault?: string | null | ((actualDefault: string | null) => boolean) // string for exact match, null if no default, function for complex check
): Promise<ColumnCheckResult> {
  try {
    const result = await db.execute(
      sql`SELECT data_type, character_maximum_length, is_nullable, column_default
          FROM information_schema.columns
          WHERE table_schema = ${schemaName}
          AND table_name = ${tableName}
          AND column_name = ${columnName};`
    );
    const rows = (result as any).rows;
    if (!rows || rows.length === 0) {
      return { exists: false };
    }

    const colInfo = rows[0];
    let actualType = colInfo.data_type;
    if (actualType === 'character varying' && colInfo.character_maximum_length) {
      actualType = `character varying(${colInfo.character_maximum_length})`;
    }
    
    const typeMatch = actualType.toLowerCase().startsWith(expectedType.toLowerCase()); // StartsWith for varchar(len)
    const nullableMatch = colInfo.is_nullable === expectedNullable;
    
    let defaultMatch = false;
    if (typeof expectedDefault === 'function') {
        defaultMatch = expectedDefault(colInfo.column_default);
    } else if (expectedDefault === undefined && colInfo.column_default === null) { // Expecting no default (e.g. for primary key)
        defaultMatch = true;
    } else if (colInfo.column_default !== null && expectedDefault !== undefined && expectedDefault !== null && colInfo.column_default.includes(expectedDefault)) {
        // Simple check if expected string is part of the actual default (e.g. for 'false' or 'now()')
        // This is a heuristic; for exact match, ensure expectedDefault is precise (e.g., "'false'::boolean").
        defaultMatch = true;
    } else {
        defaultMatch = colInfo.column_default === expectedDefault;
    }


    return {
      exists: true,
      typeMatch,
      actualType,
      nullableMatch,
      isNullable: colInfo.is_nullable,
      defaultMatch,
      actualDefault: colInfo.column_default,
    };
  } catch (error) {
    console.error(`Error checking column ${schemaName}.${tableName}.${columnName}:`, error);
    return { exists: false }; // Assume error means column check failed
  }
}


/**
 * Checks the status of feature flag related database tables.
 */
async function checkFeatureFlagsTablesStatus() {
  console.log('🔍 Checking status of Feature Flags database tables...');

  const featureFlagsDrizzleTableName = getTableConfig(featureFlagsTable).name;
  let tableFoundInSchema: string | null = null;
  let featureFlagsTableExists = false;

  if (await checkTableExists(featureFlagsDrizzleTableName, SCHEMA_NAME_APP)) {
    featureFlagsTableExists = true;
    tableFoundInSchema = SCHEMA_NAME_APP;
    console.log(`✅ Table "${SCHEMA_NAME_APP}.${featureFlagsDrizzleTableName}" exists.`);
  } else {
    console.log(`ℹ️ Table "${SCHEMA_NAME_APP}.${featureFlagsDrizzleTableName}" not found. Checking 'public' schema...`);
    if (await checkTableExists(featureFlagsDrizzleTableName, SCHEMA_NAME_PUBLIC)) {
      featureFlagsTableExists = true;
      tableFoundInSchema = SCHEMA_NAME_PUBLIC;
      console.log(`✅ Table "${SCHEMA_NAME_PUBLIC}.${featureFlagsDrizzleTableName}" exists (in 'public' schema).`);
      console.warn(`   ⚠️  Warning: Feature flags table found in 'public' schema. Expected 'app_schema'. This might cause issues if Drizzle ORM is not configured to look in 'public' for this table or if search_path is not set correctly for the application user.`);
    } else {
      console.log(`❌ Table "${featureFlagsDrizzleTableName}" not found in '${SCHEMA_NAME_APP}' or '${SCHEMA_NAME_PUBLIC}' schemas.`);
    }
  }

  let allChecksPass = featureFlagsTableExists;

  if (featureFlagsTableExists && tableFoundInSchema) {
    console.log(`\n🔎 Verifying schema for "${tableFoundInSchema}.${featureFlagsDrizzleTableName}":`);
    
    // Define expected columns based on shared/feature-flags-schema.ts
    const columnsToVerify = [
      { name: 'flag_key', type: 'character varying(255)', nullable: 'NO' as const, default: undefined }, // Primary key usually has no explicit default
      { name: 'enabled', type: 'boolean', nullable: 'NO' as const, default: "'false'::boolean" }, // Default in schema is false
      { name: 'description', type: 'text', nullable: 'YES' as const, default: null }, // Nullable, no default
      { name: 'updated_by', type: 'character varying(255)', nullable: 'YES' as const, default: null }, // Nullable, references users.id
      { name: 'updated_at', type: 'timestamp with time zone', nullable: 'NO' as const, default: (actual: string | null) => actual?.toLowerCase().startsWith('now()') || actual?.toLowerCase().startsWith('current_timestamp') }, // Default is now()
    ];

    for (const col of columnsToVerify) {
      const result = await checkColumn(featureFlagsDrizzleTableName, tableFoundInSchema, col.name, col.type, col.nullable, col.default);
      if (result.exists) {
        let columnStatus = `  ✅ Column "${col.name}" exists.`;
        if (!result.typeMatch) {
          columnStatus += ` ❌ Type mismatch (Expected: ${col.type}, Actual: ${result.actualType}).`;
          allChecksPass = false;
        } else {
          columnStatus += ` ✅ Type: ${result.actualType}.`;
        }
        if (!result.nullableMatch) {
          columnStatus += ` ❌ Nullable mismatch (Expected: ${col.nullable}, Actual: ${result.isNullable}).`;
          allChecksPass = false;
        } else {
          columnStatus += ` ✅ Nullable: ${result.isNullable}.`;
        }
        if (!result.defaultMatch) {
            const expectedDefaultDisplay = typeof col.default === 'function' ? '[custom check, e.g. now()]' : (col.default === undefined ? 'NONE (PK)' : col.default);
            columnStatus += ` ❌ Default mismatch (Expected: ${expectedDefaultDisplay}, Actual: ${result.actualDefault}).`;
            allChecksPass = false;
        } else {
            columnStatus += ` ✅ Default: ${result.actualDefault === null ? 'NULL' : result.actualDefault}.`;
        }
        console.log(columnStatus);
      } else {
        console.log(`  ❌ Column "${col.name}" is MISSING.`);
        allChecksPass = false;
      }
    }

    try {
      let recordCount = 0;
      if (tableFoundInSchema === SCHEMA_NAME_APP) {
        // Drizzle 'db' instance is configured for 'app_schema' by default via DATABASE_URL
        const records = await db.select({ value: count() }).from(featureFlagsTable);
        recordCount = records[0].value;
      } else if (tableFoundInSchema === SCHEMA_NAME_PUBLIC) {
        // If table is in public, Drizzle's default schema 'app_schema' won't find it with featureFlagsTable.
        // Use a raw query specifying the public schema.
        const result = await db.execute(sql`SELECT COUNT(*) as value FROM public.${sql.raw(featureFlagsDrizzleTableName)};`);
        recordCount = Number((result as any).rows[0].value);
      }
      console.log(`\n  ℹ️  Found ${recordCount} records in "${tableFoundInSchema}.${featureFlagsDrizzleTableName}".`);
    } catch (e: any) {
      console.error(`  ❌ Error counting records in "${tableFoundInSchema}.${featureFlagsDrizzleTableName}":`, e.message);
      console.log(`     This might indicate the table exists but is not queryable or schema is out of sync with Drizzle's expectations.`);
      allChecksPass = false;
    }
  } else {
    allChecksPass = false;
  }

  console.log('\n--- Summary ---');
  if (allChecksPass) {
    console.log('✅ All Feature Flags table checks passed and table structure appears correct.');
    if (tableFoundInSchema === SCHEMA_NAME_PUBLIC) {
        console.warn("   ⚠️  However, the 'feature_flags' table is in the 'public' schema. Please ensure this is intended and your application is configured accordingly for Drizzle ORM and user permissions.");
    }
  } else {
    console.warn('⚠️ Some Feature Flags table checks failed or the table is missing/misconfigured.');
    console.log('\n--- Action Required ---');
    if (!featureFlagsTableExists) {
        console.log('The "feature_flags" table appears to be missing from both app_schema and public schema.');
    }
    console.log('Please ensure your database schema is up-to-date. You may need to run migrations:');
    console.log('  ➡️  If schema definition in `shared/feature-flags-schema.ts` changed: `npm run db:generate-feature-flags-migration`');
    console.log('  ➡️  To apply pending migrations: `npm run db:migrate-feature-flags` (uses `server/db/apply-feature-flags-migration.ts`)');
    console.log('\nIf migrations have been run, check for manual database alterations, connection issues, or incorrect `search_path` for the database user.');
  }
}

async function main() {
  try {
    await checkFeatureFlagsTablesStatus();
  } catch (error) {
    console.error('💥 An unexpected error occurred during the check:', error);
  } finally {
    // The main `db` instance uses a connection pool.
    // For a short-lived script, explicitly ending the pool is good practice
    // if the script might be run frequently or in automated contexts.
    // However, Node.js typically handles process exit and connection cleanup.
    // If you had a dedicated client for this script (like in apply-migrations), you'd end it here.
    // For now, we'll assume the global pool management is sufficient.
    // To explicitly end the pool if needed:
    // import { pool as dbPoolInstance } from '../server/db'; // if pool is exported
    // await dbPoolInstance.end();
    console.log('\n🔌 Database check script finished. Main DB pool connections are managed globally.');
  }
}

main();

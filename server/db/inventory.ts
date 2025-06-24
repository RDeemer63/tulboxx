import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import postgres from 'postgres';
import { fileURLToPath } from 'url';

// --- Configuration ---
const __filename = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(__filename), '..', '..'); // up two levels from server/db to project root

// Load environment variables from .env file at the project root
dotenv.config({ path: path.join(projectRoot, '.env') });

const OUTPUT_DIR = path.join(projectRoot, 'db');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'INVENTORY.md');
const DRIZZLE_MIGRATIONS_TABLE = '__drizzle_migrations'; // Common name for Drizzle's migration table
/**
 * Parse DATABASE_URL, return a version without the `schema=` query param.
 * Postgres.js treats unknown query params as GUCs which can break the
 * connection when it encounters `schema=app_schema`. Drizzle needs the
 * query param, but this inventory script does not. We strip it to ensure
 * the connection succeeds while still capturing the requested schema
 * so we can reference it later if needed.
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
    // If URL parsing fails, fall back to raw string (best-effort).
    return { cleanUrl: rawUrl, requestedSchema: null };
  }
}

interface TableInfo {
  schema: string;
  name: string;
  columns: ColumnInfo[];
  primaryKeys: PrimaryKeyInfo[];
  foreignKeys: ForeignKeyInfo[];
  indexes: IndexInfo[];
}

interface ColumnInfo {
  name: string;
  type: string;
  isNullable: string;
  defaultValue: string | null;
}

interface PrimaryKeyInfo {
  columnName: string;
  dataType: string; // To check for UUID vs Serial (integer/bigint)
}

interface ForeignKeyInfo {
  constraintName: string;
  columnName: string;
  foreignTableSchema: string;
  foreignTableName: string;
  foreignColumnName: string;
}

interface IndexInfo {
  indexName: string;
  indexDefinition: string;
}

interface AppliedMigration {
  id: number;
  hash: string;
  created_at: number | string; // Drizzle uses bigint for timestamp
}

/**
 * Fetch list of tables (schema + name).  
 * If `requestedSchema` is provided, the result is limited to that schema.
 */
async function getTablesAndSchemas(
  sql: postgres.Sql,
  requestedSchema?: string | null,
): Promise<Array<{ schema_name: string; table_name: string }>> {
  if (requestedSchema) {
    // Focus on the single application schema we care about
    return sql`
      SELECT table_schema as schema_name, table_name
      FROM information_schema.tables
      WHERE table_schema = ${requestedSchema}
        AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
  }

  // Fallback: all non-system schemas
  return sql`
    SELECT table_schema as schema_name, table_name
    FROM information_schema.tables
    WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
      AND table_type = 'BASE TABLE'
    ORDER BY table_schema, table_name;
  `;
}

async function getTableColumns(sql: postgres.Sql, schemaName: string, tableName: string): Promise<ColumnInfo[]> {
  return sql<ColumnInfo[]>`
    SELECT column_name as name, data_type as type, is_nullable as isNullable, column_default as defaultValue
    FROM information_schema.columns
    WHERE table_schema = ${schemaName} AND table_name = ${tableName}
    ORDER BY ordinal_position;
  `;
}

async function getTablePrimaryKeys(sql: postgres.Sql, schemaName: string, tableName: string): Promise<PrimaryKeyInfo[]> {
  return sql<PrimaryKeyInfo[]>`
    SELECT kcu.column_name as "columnName", c.data_type as "dataType"
    FROM information_schema.key_column_usage AS kcu
    JOIN information_schema.table_constraints AS tc
      ON kcu.constraint_name = tc.constraint_name
      AND kcu.table_schema = tc.table_schema
      AND kcu.table_name = tc.table_name
    JOIN information_schema.columns AS c
      ON c.table_schema = kcu.table_schema
      AND c.table_name = kcu.table_name
      AND c.column_name = kcu.column_name
    WHERE tc.constraint_type = 'PRIMARY KEY'
      AND tc.table_schema = ${schemaName}
      AND tc.table_name = ${tableName};
  `;
}

async function getTableForeignKeys(sql: postgres.Sql, schemaName: string, tableName: string): Promise<ForeignKeyInfo[]> {
  return sql<ForeignKeyInfo[]>`
    SELECT
        tc.constraint_name as "constraintName",
        kcu.column_name as "columnName",
        ccu.table_schema AS "foreignTableSchema",
        ccu.table_name AS "foreignTableName",
        ccu.column_name AS "foreignColumnName"
    FROM
        information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = ${schemaName}
      AND tc.table_name = ${tableName};
  `;
}

async function getTableIndexes(sql: postgres.Sql, schemaName: string, tableName: string): Promise<IndexInfo[]> {
  return sql<IndexInfo[]>`
    SELECT
        indexname as "indexName",
        indexdef as "indexDefinition"
    FROM
        pg_indexes
    WHERE
        schemaname = ${schemaName} AND tablename = ${tableName};
  `;
}

async function getAppliedMigrations(sql: postgres.Sql): Promise<AppliedMigration[]> {
  try {
    // Drizzle typically creates this table in the default search path schema, often 'public'
    // If it's in app_schema, the query needs to be adjusted or search_path set.
    // For now, assume it might be in public or the first schema in search_path.
    const result = await sql<AppliedMigration[]>`
      SELECT id, hash, created_at FROM ${sql(DRIZZLE_MIGRATIONS_TABLE)} ORDER BY created_at DESC;
    `;
    return result.map(row => ({
      ...row,
      created_at: row.created_at ? new Date(Number(row.created_at)).toISOString() : 'N/A'
    }));
  } catch (error) {
    if (error.message.includes('relation "') && error.message.includes('" does not exist')) {
      console.warn(`⚠️  Warning: Drizzle migrations table "${DRIZZLE_MIGRATIONS_TABLE}" not found. Migration history will be empty.`);
      return [];
    }
    throw error;
  }
}

function identifyPotentialDuplicateTables(tables: TableInfo[]): Array<{ name1: string, name2: string, reason: string }> {
  const potentialDuplicates: Array<{ name1: string, name2: string, reason: string }> = [];
  const tableNames = tables.map(t => t.name);

  if (tableNames.includes('estimates') && tableNames.includes('modern_estimates')) {
    potentialDuplicates.push({ name1: 'estimates', name2: 'modern_estimates', reason: 'Legacy and modern estimate tables coexist.' });
  }
  if (tableNames.includes('contacts') && tableNames.includes('leads')) {
    potentialDuplicates.push({ name1: 'contacts', name2: 'leads', reason: 'Leads might be managed in both contacts (via status) and a dedicated leads table.' });
  }
  if (tableNames.includes('customers') && tableNames.includes('contacts')) {
    potentialDuplicates.push({ name1: 'customers', name2: 'contacts', reason: '`customers` might be an alias or older version of `contacts`.' });
  }
  // Add more heuristics here if needed
  return potentialDuplicates;
}

function generateRecommendations(tables: TableInfo[], schemas: string[], duplicates: Array<{ name1: string, name2: string, reason: string }>): string[] {
  const recommendations: string[] = [];

  // Schema Consolidation
  if (schemas.length > 1) {
    recommendations.push(`Multiple schemas are in use (${schemas.join(', ')}). Consider consolidating all application tables into a single schema (e.g., \`app_schema\` or \`public\`) for simplicity, unless multi-tenancy or specific isolation is required. Ensure \`DATABASE_URL\` includes \`?schema=your_chosen_schema\`.`);
  } else if (schemas.length === 1 && schemas[0] !== 'app_schema') {
    recommendations.push(`The primary schema in use is \`${schemas[0]}\`. If \`app_schema\` is intended, ensure tables are created there and \`DATABASE_URL\` reflects this.`);
  }


  // Primary Key Standardization
  const pkTypeIssues = tables.filter(t => t.primaryKeys.some(pk => pk.dataType !== 'uuid' && !(pk.dataType.includes('int') && t.name === 'sessions'))); // sessions.sid is varchar
  if (pkTypeIssues.length > 0) {
    recommendations.push(`Standardize primary key types. Prefer UUIDs for new tables to avoid sequence issues and improve distributability. Tables with non-UUID PKs: ${pkTypeIssues.map(t => t.name).join(', ')}.`);
  }

  // Duplicate Tables
  if (duplicates.length > 0) {
    recommendations.push(`Address potential duplicate tables: ${duplicates.map(d => `${d.name1} & ${d.name2} (${d.reason})`).join('; ')}. Decide on a single source of truth and plan data migration if necessary.`);
  }

  // Foreign Key Review
  const tablesWithFKs = tables.filter(t => t.foreignKeys.length > 0).length;
  if (tablesWithFKs < tables.length / 2 && tables.length > 5) { // Heuristic: if less than half have FKs
    recommendations.push("Review foreign key constraints. Ensure relationships are explicitly defined to maintain data integrity. Many tables appear to lack foreign keys.");
  }

  // Indexing Review
  tables.forEach(table => {
    const fkColumns = table.foreignKeys.map(fk => fk.columnName);
    const indexedColumns = new Set(table.indexes.flatMap(idx => {
      // Basic parsing of indexdef; more complex parsing might be needed for multi-column indexes
      const match = idx.indexDefinition.match(/\(([^)]+)\)/);
      return match ? match[1].split(',').map(c => c.trim().replace(/"/g, '')) : [];
    }));
    fkColumns.forEach(fkCol => {
      if (!indexedColumns.has(fkCol)) {
        recommendations.push(`Consider adding an index to foreign key column \`${table.schema}.${table.name}.${fkCol}\` to improve join performance.`);
      }
    });
  });

  // Migration History
  recommendations.push(`Review the applied migrations list. If it seems incomplete or contains errors, consider a migration system hard reset (backup DB, clear ${DRIZZLE_MIGRATIONS_TABLE}, clear migration files, generate new baseline).`);

  // General
  recommendations.push("Perform a thorough audit of all tables and columns to identify and remove any unused or deprecated structures.");
  recommendations.push("Ensure consistent naming conventions for tables, columns, and indexes.");

  return recommendations;
}


async function generateInventoryReport() {
  console.log('🚀 Starting Database Inventory Report Generation...');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set.');
    process.exit(1);
  }
  // ------------------------------------------------------------------
  // Sanitize DATABASE_URL so postgres.js doesn’t choke on `schema=...`
  // ------------------------------------------------------------------
  const { cleanUrl, requestedSchema } = sanitizeDatabaseUrl(
    process.env.DATABASE_URL,
  );
  const sql = postgres(cleanUrl, { max: 1 });

  try {
    // Pass the requested schema (if any) so we only inventory the
    // application-specific namespace when one is explicitly provided.
    const rawTables = await getTablesAndSchemas(sql, requestedSchema);
    const allTableInfo: TableInfo[] = [];
    const schemasInUse = new Set<string>();

    console.log(`\n🔍 Found ${rawTables.length} tables. Fetching details...`);

    for (const rawTable of rawTables) {
      schemasInUse.add(rawTable.schema_name);
      const columns = await getTableColumns(sql, rawTable.schema_name, rawTable.table_name);
      const primaryKeys = await getTablePrimaryKeys(sql, rawTable.schema_name, rawTable.table_name);
      const foreignKeys = await getTableForeignKeys(sql, rawTable.schema_name, rawTable.table_name);
      const indexes = await getTableIndexes(sql, rawTable.schema_name, rawTable.table_name);
      allTableInfo.push({
        schema: rawTable.schema_name,
        name: rawTable.table_name,
        columns,
        primaryKeys,
        foreignKeys,
        indexes,
      });
      process.stdout.write(`.`); // Progress indicator
    }
    console.log('\n✅ Table details fetched.');

    const appliedMigrations = await getAppliedMigrations(sql);
    console.log(`📜 Found ${appliedMigrations.length} applied migrations.`);

    const potentialDuplicates = identifyPotentialDuplicateTables(allTableInfo);
    const uniqueSchemas = Array.from(schemasInUse);

    // --- Generate Markdown Report ---
    let mdReport = `# Tulboxx CRM - Database Inventory Report\n\n`;
    mdReport += `Generated on: ${new Date().toISOString()}\n\n`;

    mdReport += `## Summary\n\n`;
    mdReport += `- **Total Tables:** ${allTableInfo.length}\n`;
    mdReport += `- **Schemas In Use:** ${uniqueSchemas.join(', ')}\n`;
    mdReport += `- **Applied Migrations:** ${appliedMigrations.length}\n`;
    mdReport += `- **Requested Schema (from DATABASE_URL):** ${
      requestedSchema ?? 'not specified'
    }\n`;
    if (potentialDuplicates.length > 0) {
      mdReport += `- **Potential Duplicate Table Sets:** ${potentialDuplicates.length}\n`;
    }

    mdReport += `\n## 1. Schemas In Use\n\n`;
    uniqueSchemas.forEach(s => mdReport += `- \`${s}\`\n`);

    mdReport += `\n## 2. Table Details\n\n`;
    allTableInfo.forEach(table => {
      mdReport += `### 2.1. \`${table.schema}.${table.name}\`\n\n`;
      mdReport += `**Columns (${table.columns.length}):**\n\n`;
      mdReport += `| Name | Type | Nullable | Default |\n`;
      mdReport += `|------|------|----------|---------|\n`;
      table.columns.forEach(col => {
        mdReport += `| \`${col.name}\` | \`${col.type}\` | ${col.isNullable} | ${col.defaultValue ? `\`${col.defaultValue}\`` : 'NULL'} |\n`;
      });

      mdReport += `\n**Primary Keys (${table.primaryKeys.length}):**\n`;
      if (table.primaryKeys.length > 0) {
        table.primaryKeys.forEach(pk => {
          mdReport += `- \`${pk.columnName}\` (Type: \`${pk.dataType}\`)\n`;
        });
      } else {
        mdReport += `- None defined\n`;
      }

      mdReport += `\n**Foreign Keys (${table.foreignKeys.length}):**\n`;
      if (table.foreignKeys.length > 0) {
        table.foreignKeys.forEach(fk => {
          mdReport += `- \`${fk.columnName}\` references \`${fk.foreignTableSchema}.${fk.foreignTableName}(${fk.foreignColumnName})\` (Constraint: \`${fk.constraintName}\`)\n`;
        });
      } else {
        mdReport += `- None defined\n`;
      }

      mdReport += `\n**Indexes (${table.indexes.length}):**\n`;
      if (table.indexes.length > 0) {
        table.indexes.forEach(idx => {
          mdReport += `- Name: \`${idx.indexName}\`\n`;
          mdReport += `  Definition: \`\`\`sql\n    ${idx.indexDefinition}\n  \`\`\`\n`;
        });
      } else {
        mdReport += `- None defined (excluding default PK index if applicable)\n`;
      }
      mdReport += `\n---\n\n`;
    });

    mdReport += `\n## 3. Potential Duplicate Tables\n\n`;
    if (potentialDuplicates.length > 0) {
      potentialDuplicates.forEach(dup => {
        mdReport += `- **\`${dup.name1}\` and \`${dup.name2}\`**: ${dup.reason}\n`;
      });
    } else {
      mdReport += `- None identified based on current heuristics.\n`;
    }

    mdReport += `\n## 4. Applied Drizzle Migrations\n\n`;
    mdReport += `*(From table: \`${DRIZZLE_MIGRATIONS_TABLE}\`)*\n\n`;
    if (appliedMigrations.length > 0) {
      mdReport += `| ID | Hash | Applied At (UTC) |\n`;
      mdReport += `|----|------|------------------|\n`;
      appliedMigrations.forEach(mig => {
        mdReport += `| ${mig.id} | \`${mig.hash}\` | ${mig.created_at} |\n`;
      });
    } else {
      mdReport += `- No Drizzle migrations found or table does not exist.\n`;
    }

    const recommendations = generateRecommendations(allTableInfo, uniqueSchemas, potentialDuplicates);
    mdReport += `\n## 5. Recommendations for Cleanup & Standardization\n\n`;
    recommendations.forEach((rec, i) => {
      mdReport += `${i + 1}. ${rec}\n`;
    });

    // --- Output Report ---
    console.log('\n\n--- DATABASE INVENTORY REPORT ---');
    // For console, a summary might be better than the full markdown.
    // For now, printing a success message and where to find the file.
    console.log(mdReport); // For verbosity, can be summarized later.
    console.log('--- END OF REPORT ---');


    // Ensure db directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    fs.writeFileSync(OUTPUT_FILE, mdReport);
    console.log(`\n✅ Report successfully written to: ${OUTPUT_FILE}`);

  } catch (error) {
    console.error('❌ Error generating database inventory report:', error);
    process.exitCode = 1;
  } finally {
    await sql.end();
    console.log('🚪 Database connection closed.');
  }
}

// --- Script Execution ---
generateInventoryReport().catch(err => {
  console.error("Unhandled error in main execution:", err);
  process.exit(1);
});

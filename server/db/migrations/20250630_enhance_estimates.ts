import { type Kysely, sql } from "kysely";

// Enum values are defined here to make the migration script self-contained.
// These should match the definitions in `shared/estimates-schema.ts`.
const ESTIMATE_SOURCES = [
  "lead",
  "direct",
  "repeat",
  "template",
  "ai_draft",
] as const;
const PAYMENT_TERMS = [
  "due_on_receipt",
  "net_7",
  "net_15",
  "net_30",
  "net_45",
  "net_60",
  "custom",
] as const;
const SIGNATURE_METHODS = [
  "in_person",
  "email_link",
  "mobile_app",
  "uploaded_scan",
] as const;
const VERSION_REASONS = [
  "scope_change",
  "pricing_update",
  "client_request",
  "internal_revision",
  "other",
] as const;
const LINE_ITEM_CATEGORIES = [
  "labor",
  "materials",
  "equipment",
  "permit",
  "subcontractor",
  "other",
] as const;

/**
 * This migration enhances the estimates system by adding more detailed fields
 * for tracking, workflow management, and reporting.
 */
export async function up(db: Kysely<any>): Promise<void> {
  // Step 1: Create the new ENUM types required for the new columns.
  // This must be done before altering the tables to use them.
  await db.schema
    .createType("estimate_source_enum")
    .asEnum(ESTIMATE_SOURCES)
    .execute();
  await db.schema
    .createType("payment_terms_enum")
    .asEnum(PAYMENT_TERMS)
    .execute();
  await db.schema
    .createType("signature_method_enum")
    .asEnum(SIGNATURE_METHODS)
    .execute();
  await db.schema
    .createType("version_reason_enum")
    .asEnum(VERSION_REASONS)
    .execute();
  await db.schema
    .createType("line_item_category_enum")
    .asEnum(LINE_ITEM_CATEGORIES)
    .execute();

  // Step 2: Alter the `modern_estimates` table to add new columns.
  await db.schema
    .alterTable("modern_estimates")
    .addColumn("source", sql`estimate_source_enum`, (col) =>
      col.defaultTo("direct").notNull()
    )
    .addColumn("paymentTerms", sql`payment_terms_enum`)
    .addColumn("signatureMethod", sql`signature_method_enum`)
    .addColumn("versionReason", sql`version_reason_enum`)
    .addColumn("clientMessage", "text")
    .addColumn("depositRequired", "boolean", (col) => col.defaultTo(false).notNull())
    .addColumn("depositAmount", "decimal(10, 2)")
    .addColumn("depositPercent", "decimal(5, 2)")
    .addColumn("expectedStartDate", "date")
    .addColumn("expectedDuration", "integer") // Duration in days
    .addColumn("expirationDate", "date")
    .execute();

  // Step 3: Alter the `estimate_line_items` table to add new columns.
  await db.schema
    .alterTable("estimate_line_items")
    .addColumn("category", sql`line_item_category_enum`, (col) =>
      col.defaultTo("other").notNull()
    )
    .addColumn("markupAmount", "decimal(10, 2)")
    .addColumn("taxable", "boolean", (col) => col.defaultTo(true).notNull())
    .addColumn("notes", "text")
    .execute();

  // Step 4: Add indexes to the new columns for better query performance.
  await db.schema
    .createIndex("idx_modern_estimates_source")
    .on("modern_estimates")
    .column("source")
    .execute();

  await db.schema
    .createIndex("idx_estimate_line_items_category")
    .on("estimate_line_items")
    .column("category")
    .execute();
}

/**
 * Reverts the changes made in the `up` migration by dropping the new columns,
 * indexes, and ENUM types.
 */
export async function down(db: Kysely<any>): Promise<void> {
  // Step 1: Drop the columns from the tables.
  await db.schema
    .alterTable("modern_estimates")
    .dropColumn("source")
    .dropColumn("paymentTerms")
    .dropColumn("signatureMethod")
    .dropColumn("versionReason")
    .dropColumn("clientMessage")
    .dropColumn("depositRequired")
    .dropColumn("depositAmount")
    .dropColumn("depositPercent")
    .dropColumn("expectedStartDate")
    .dropColumn("expectedDuration")
    .dropColumn("expirationDate")
    .execute();

  await db.schema
    .alterTable("estimate_line_items")
    .dropColumn("category")
    .dropColumn("markupAmount")
    .dropColumn("taxable")
    .dropColumn("notes")
    .execute();

  // Step 2: Drop the indexes.
  await db.schema.dropIndex("idx_modern_estimates_source").ifExists().execute();
  await db.schema
    .dropIndex("idx_estimate_line_items_category")
    .ifExists()
    .execute();

  // Step 3: Drop the ENUM types. This must be done last.
  await db.schema.dropType("estimate_source_enum").ifExists().execute();
  await db.schema.dropType("payment_terms_enum").ifExists().execute();
  await db.schema.dropType("signature_method_enum").ifExists().execute();
  await db.schema.dropType("version_reason_enum").ifExists().execute();
  await db.schema.dropType("line_item_category_enum").ifExists().execute();
}

import { type Kysely } from "kysely";

/**
 * Migration to create the `business_profiles` table and link it to the `users` table.
 *
 * This migration establishes the foundational table for storing all business-specific
 * information, which is critical for personalizing documents, enabling AI features,
 * and managing settings within the Tulboxx CRM.
 */
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("business_profiles")
    // Core Columns
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("businessName", "varchar(128)", (col) => col.notNull())
    .addColumn("ownerName", "varchar(128)")
    .addColumn("email", "varchar(128)", (col) => col.notNull())
    .addColumn("phone", "varchar(20)")
    .addColumn("website", "varchar(255)")
    .addColumn("address", "text")
    .addColumn("city", "varchar(100)")
    .addColumn("state", "varchar(50)")
    .addColumn("zipCode", "varchar(20)")
    .addColumn("yearFounded", "integer")
    .addColumn("businessStructure", "varchar(50)")
    .addColumn("serviceArea", "text")
    .addColumn("companyTagline", "varchar(255)")
    .addColumn("companyBio", "text")
    .addColumn("businessType", "varchar(100)")
    .addColumn("serviceSpecialties", "text")
    .addColumn("uniqueSellingPoints", "text")
    // Branding Columns
    .addColumn("logoUrl", "text")
    .addColumn("primaryColor", "varchar(10)")
    .addColumn("accentColor", "varchar(10)")
    // Legal Info Columns
    .addColumn("licenseNumbers", "text")
    .addColumn("insuranceInfo", "text")
    .addColumn("certifications", "text")
    .addColumn("legalFooterText", "text")
    .addColumn("defaultEstimateTerms", "text")
    .addColumn("defaultInvoiceTerms", "text")
    // AI Preferences Columns
    .addColumn("brandVoice", "varchar(50)")
    .addColumn("communicationStyle", "varchar(50)")
    .addColumn("targetCustomers", "text")
    .addColumn("aiEstimateGeneration", "boolean", (col) =>
      col.defaultTo(true).notNull()
    )
    .addColumn("aiSocialMediaGeneration", "boolean", (col) =>
      col.defaultTo(false).notNull()
    )
    // Timestamps
    .addColumn("createdAt", "timestamp", (col) =>
      col.defaultTo("now()").notNull()
    )
    .addColumn("updatedAt", "timestamp", (col) =>
      col.defaultTo("now()").notNull()
    )
    .execute();

  // Add indexes for performance on frequently queried columns
  await db.schema
    .createIndex("idx_business_profiles_name")
    .on("business_profiles")
    .column("businessName")
    .execute();

  await db.schema
    .createIndex("idx_business_profiles_email")
    .on("business_profiles")
    .column("email")
    .execute();

  // Add the foreign key column to the `users` table
  await db.schema
    .alterTable("users")
    .addColumn("businessProfileId", "integer", (col) =>
      col.references("business_profiles.id").onDelete("set null")
    )
    .execute();
}

/**
 * Reverts the changes made in the `up` migration.
 *
 * This function will drop the `business_profiles` table and remove the
 * foreign key relationship from the `users` table.
 */
export async function down(db: Kysely<any>): Promise<void> {
  // First, remove the foreign key constraint and column from the `users` table
  // Kysely's `dropColumn` will also handle dropping the associated FK constraint
  await db.schema.alterTable("users").dropColumn("businessProfileId").execute();

  // Then, drop the indexes
  await db.schema.dropIndex("idx_business_profiles_name").ifExists().execute();
  await db.schema.dropIndex("idx_business_profiles_email").ifExists().execute();

  // Finally, drop the `business_profiles` table
  await db.schema.dropTable("business_profiles").ifExists().execute();
}

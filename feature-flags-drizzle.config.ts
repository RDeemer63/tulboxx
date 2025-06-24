/**
 * Drizzle Kit configuration for Tulboxx CRM - Feature Flags
 *
 * ❖ Generates SQL migration files specifically for the feature flags schema
 *   defined in `shared/feature-flags-schema.ts`.
 * ❖ Outputs compiled migrations to the project-root `feature-flags-migrations/` folder.
 * ❖ Uses DATABASE_URL from .env (which must include `?schema=app_schema` for Drizzle Kit
 *   to correctly target the `app_schema` for its operations, including storing
 *   the Drizzle migrations table and expecting application tables to reside there).
 *
 * NOTE: This configuration is separate from the main `drizzle.config.ts` to allow
 *       independent management of feature flag database schema changes if needed.
 *       Ensure that the `DATABASE_URL` is correctly set in your .env file.
 */

import { defineConfig } from "drizzle-kit";

// -------------------------------------------------------------------------
// Environment validation: Ensure DATABASE_URL is set
// -------------------------------------------------------------------------
if (!process.env.DATABASE_URL) {
  throw new Error(
    "❌ DATABASE_URL is not defined. Please create a .env file with the DATABASE_URL " +
      "or set the environment variable before running Drizzle CLI commands for feature flags.",
  );
}

// -------------------------------------------------------------------------
// Paths & constants for feature flag migrations
// -------------------------------------------------------------------------
const FEATURE_FLAGS_MIGRATIONS_OUTPUT_DIR = "feature-flags-migrations"; // Relative to project root
const FEATURE_FLAGS_SCHEMA_PATH = "./shared/feature-flags-schema.ts"; // Path to the feature flags Drizzle schema file

export default defineConfig({
  out: FEATURE_FLAGS_MIGRATIONS_OUTPUT_DIR,
  schema: FEATURE_FLAGS_SCHEMA_PATH,
  dialect: "postgresql", // Specify the dialect as PostgreSQL
  dbCredentials: {
    url: process.env.DATABASE_URL, // Uses the same database connection URL
  },
  // Optional: Add verbose logging for Drizzle Kit operations if needed during development
  // verbose: true,
  // Optional: Enable strict mode for more checks by Drizzle Kit
  // strict: true,
});

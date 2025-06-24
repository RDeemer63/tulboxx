/**
 * Temporary Drizzle Kit configuration for Tulboxx CRM - Estimates Module Only
 *
 * ❖ Generates SQL migration files from `shared/estimates-schema.ts`
 * ❖ Outputs compiled migrations to a temporary `migrations-estimates/` folder
 * ❖ Uses DATABASE_URL from .env (must include `?schema=app_schema`)
 */

import { defineConfig } from "drizzle-kit";

// -------------------------------------------------------------------------
// Environment validation
// -------------------------------------------------------------------------
if (!process.env.DATABASE_URL) {
  throw new Error(
    "❌ DATABASE_URL is not defined.  Create a .env file or export the " +
      "variable before running Drizzle CLI commands.",
  );
}

// -------------------------------------------------------------------------
// Paths & constants for this specific migration generation
// -------------------------------------------------------------------------
const ESTIMATES_MIGRATIONS_DIR = "migrations-estimates"; // Temporary directory for these migrations
const ESTIMATES_SCHEMA_PATH = "./shared/estimates-schema.ts"; // Path to the minimal schema file

export default defineConfig({
  out: ESTIMATES_MIGRATIONS_DIR,
  schema: ESTIMATES_SCHEMA_PATH,
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  // Optional: Add verbose logging if needed for debugging this specific generation
  // verbose: true, 
  // strict: true, // Enable strict mode if desired
});

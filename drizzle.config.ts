/**
 * Drizzle Kit configuration for Tulboxx CRM
 *
 * ❖ Generates SQL migration files from `shared/schema.ts`
 * ❖ Outputs compiled migrations to the project-root `migrations/` folder
 * ❖ Uses DATABASE_URL from .env (must include `?schema=app_schema`)
 *
 * NOTE: Postgres objects are created inside the `app_schema` namespace
 *       (see db/init-scripts/01-init.sql).  Keep this consistent across
 *       the app by ALWAYS including `?schema=app_schema` in DATABASE_URL.
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
// Paths & constants
// -------------------------------------------------------------------------
const MIGRATIONS_DIR = "migrations"; // resolved from project root

export default defineConfig({
  out: MIGRATIONS_DIR,
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});

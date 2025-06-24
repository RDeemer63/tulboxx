import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import postgres from 'postgres'; // Lightweight driver used by Drizzle Kit migrations
import * as schema from "../shared/schema";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL from process.env:", process.env.DATABASE_URL); // Add this for debugging
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database or is .env not loading?",
  );
}

// Use the standard 'pg' Pool
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  // Standard pg Pool options can be added here if needed, e.g.,
  // max: 20,
  // idleTimeoutMillis: 30000,
  // connectionTimeoutMillis: 5000,
});

// Use drizzle with the node-postgres client
export const db = drizzle(pool, { schema });

/**
 * --------------------------------------------------------------------
 * Separate Postgres-JS client for Drizzle Kit migrations
 * --------------------------------------------------------------------
 * • `node-postgres` (pg Pool above) – used at runtime by the app
 * • `postgres` (postgres-js)          – lightweight, single-connection
 *   driver required by Drizzle Kit’s `migrate()` helper.
 *
 * Keeping them separate avoids bundling the heavier `pg` Pool into the
 * CLI context and prevents connection-pool conflicts during migrations.
 */
export const migrationClient = postgres(process.env.DATABASE_URL as string, {
  max: 1, // single connection is plenty for migration operations
});

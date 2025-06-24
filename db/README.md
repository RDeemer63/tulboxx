# Tulboxx CRM – Database Management Guide
_Location: `db/README.md`_

This document provides an overview of the database directory, migration system, common operations, and best practices for managing the Tulboxx CRM database.

---

## 1. Purpose & Overview

The Tulboxx CRM database is built on PostgreSQL and managed using Drizzle ORM with Drizzle Kit for schema migrations. This system aims to provide:
-   A single source of truth for the database schema (`shared/schema.ts`).
-   Reliable, version-controlled schema evolution.
-   Clear separation between schema (DDL) and data (DML) migrations.
-   Tools for developers to easily manage local development databases.

All application-specific tables, functions, and types should reside within the `app_schema` namespace to avoid conflicts with system or extension objects and to prepare for potential multi-tenancy in the future.

---

## 2. Directory Structure (`db/`)

-   **`backup/`**: Intended for storing manual database backups (e.g., before major operations). This directory is in `.gitignore`.
-   **`data-migrations/`**: Contains hand-written TypeScript scripts for data transformations (e.g., backfilling columns, correcting data). These are run manually.
-   **`init-scripts/`**: SQL scripts for initial database setup.
    -   `01-init.sql`: Creates the `app_schema`, the `tulboxx_app_user`, grants necessary permissions, and enables required PostgreSQL extensions. This is run automatically by Docker on first container start and during a database reset.
-   **`templates/`**:
    -   `data-migration-template.ts`: A boilerplate script for creating new data migrations.
    -   `README.md`: Guide on how to use data migration templates.
-   **`create-baseline.ts`**: (Script: `npm run db:baseline`) A utility script to perform a "hard reset" of the Drizzle migration history. It clears the `migrations/` directory, generates a new `0000_baseline.sql` from the current `shared/schema.ts`, and marks this baseline as applied in the `__drizzle_migrations` table. **Use with extreme caution.**
-   **`inventory.ts`**: (Script: `npx tsx server/db/inventory.ts`) Generates a Markdown report (`db/INVENTORY.md`) detailing the current live database structure, including tables, columns, PKs, FKs, indexes, applied migrations, and recommendations for cleanup.
-   **`reset.ts`**: (Script: `npm run db:reset`) **Destructive script for local development only.** Drops and recreates the `app_schema`, then re-runs `01-init.sql`. This effectively wipes all application data and resets the schema structure. Requires `ALLOW_MIGRATION_SYSTEM_RESET="true"` in `.env` and confirmation.
-   **`seed.ts`**: (Script: `npm run db:seed`) Populates the database with sample data for development and testing. Can be configured with flags like `--clear` and `--sample`.
-   **`INVENTORY.md`**: (Generated File) A snapshot of the database structure, produced by `inventory.ts`.
-   **`MIGRATION_SYSTEM_RESET_PLAN.md`**: Detailed plan for performing a hard reset of the migration system.
-   **`MIGRATION_SYSTEM_UPDATES.md`**: Summary of recent changes and improvements to the migration system and tooling.

**Related Root Directory:**
-   **`migrations/`**: (Located at project root) Contains Drizzle Kit auto-generated SQL migration files (`000X_name.sql`) and a `meta/` subfolder with snapshots. This directory is the source of truth for schema changes applied by Drizzle.

---

## 3. Migration System Setup

-   **Source of Truth**: `shared/schema.ts` defines all tables, columns, types, and relations using Drizzle ORM syntax.
-   **Configuration**: `drizzle.config.ts` (at project root) configures Drizzle Kit, pointing to `shared/schema.ts` and the `migrations/` output directory. It uses the `DATABASE_URL` from `.env`, which **must** include `?schema=app_schema` for Drizzle Kit to correctly qualify table names.
-   **Applying Migrations**: The `server/db/migrate.ts` script (run via `npm run db:migrate` or `npm run db:migrate:safe`) uses Drizzle ORM's `migrate()` function to apply pending SQL migrations from the `migrations/` folder.
-   **Tracking**: Applied migrations are recorded in the `__drizzle_migrations` table within the `app_schema` (or `public` if `db:baseline` was run without `app_schema` configured for the migrations table).

---

## 4. Common Operations & Commands

| Task                                       | Command                                                                                                | Notes                                                                                                                               |
| :----------------------------------------- | :----------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------- |
| **Generate Schema Migration**              | `npm run db:generate`                                                                                  | After editing `shared/schema.ts`. Creates a new SQL file in `migrations/`.                                                        |
| Apply Pending Migrations                   | `npm run db:migrate`                                                                                   | Applies all unapplied SQL migrations from `migrations/`.                                                                            |
| Apply (Skip "Already Exists" Errors)       | `npm run db:migrate:safe`                                                                              | Dev only. Useful if DB state is inconsistent.                                                                                       |
| **View Schema with Drizzle Studio**        | `npm run db:studio`                                                                                    | Opens a local web UI to browse schema and data.                                                                                     |
| **Seed Database with Sample Data**         | `npm run db:seed -- --clear --sample`                                                                  | `--clear` drops data first. `--sample` adds sample data. Default is `--sample`.                                                   |
| **Run a Data Migration**                   | `npx tsx server/db/data-migrations/<timestamp>_name.ts up`                                             | For custom data transformations. Use `down` to revert if implemented. Add `--confirm-production-data-migration` for production. |
| **Generate Database Inventory Report**     | `npx tsx server/db/inventory.ts`                                                                       | Outputs `db/INVENTORY.md`.                                                                                                          |
| **Local DB Hard Reset (Destructive!)**     | `npm run db:reset`                                                                                     | Requires `ALLOW_MIGRATION_SYSTEM_RESET="true"` in `.env` and confirmation. Drops `app_schema`, re-runs init script.                  |
| **Migration System Hard Reset (Advanced!)**| See `db/MIGRATION_SYSTEM_RESET_PLAN.md` and `npm run db:baseline` (part of the reset plan)             | For resolving severe migration drift. **Use with extreme caution.**                                                                 |

---

## 5. Evolving the Schema & Handling Migrations

### Standard Workflow for Schema Changes:
1.  **Edit `shared/schema.ts`**: Define your table additions, column changes, new indexes, etc.
2.  **Generate Migration SQL**: Run `npm run db:generate`. This will create a new SQL file in the `migrations/` directory (e.g., `0001_add_users_table.sql`).
    *   _Review the generated SQL file to ensure it matches your intent._
3.  **Apply Migration Locally**: Run `npm run db:migrate` to apply the new migration to your local development database.
4.  **Test**: Verify your application works as expected with the schema changes.
5.  **Commit**: Commit both the changes to `shared/schema.ts` AND the newly generated files in the `migrations/` directory.
6.  **Push**: The CI/CD pipeline (`.github/workflows/db-migrations.yml`) will automatically attempt to validate and apply migrations to staging/production environments.

### Best Practices:
-   **One Logical Change Per Migration**: Keep migrations small and focused. This makes them easier to review, test, and roll back if necessary.
-   **Immutable Migrations**: Once a migration file is generated and committed (and especially if applied to any shared environment), **DO NOT EDIT IT**. If a change is needed, create a new migration to correct or revert the previous one.
-   **CI Validation**: The CI pipeline includes a step to run `npx drizzle-kit generate` to check for schema drift (i.e., changes in `shared/schema.ts` without a corresponding committed migration). Pull requests will fail if drift is detected.
-   **Data Migrations**: For changes that only involve transforming data within existing tables (e.g., backfilling a new column, reformatting values), use the data migration template. See `server/db/templates/README.md`.

---

## 6. Baseline Migration & Hard Reset Procedure

### Baseline Migration
The `npm run db:baseline` script (which executes `server/db/create-baseline.ts`) is a powerful tool designed to be used as part of a **migration system hard reset**. Its purpose is:
1.  To clean the `migrations/` directory.
2.  To generate a single `0000_baseline.sql` file from the current state of `shared/schema.ts`.
3.  To ensure the Drizzle migrations table (`__drizzle_migrations`) exists.
4.  To mark this `0000_baseline.sql` as "applied" in the `__drizzle_migrations` table **without actually running its DDL against the database**. This assumes the database schema already matches (or will be made to match) this baseline.

**When to use `db:baseline`**:
-   During the initial setup of a project on an existing database.
-   After a "hard reset" of the database schema (see below) to establish a new, clean migration history.
-   If the `migrations/` folder and `__drizzle_migrations` table become hopelessly out of sync with the actual database state.

**Safety**: This script requires `ALLOW_MIGRATION_SYSTEM_RESET="true"` in your `.env` file and interactive confirmation due to its destructive potential if misused.

### Hard Reset Procedure
If the database schema and migration history diverge significantly, a "hard reset" may be necessary. This is a complex and potentially destructive operation.
**Always back up your database before attempting a hard reset.**

The detailed procedure is documented in:
**`db/MIGRATION_SYSTEM_RESET_PLAN.md`**

A simplified overview of a hard reset:
1.  **Safeguard**: Backup the database. Freeze deployments.
2.  **Wipe/Re-create Schema**: Drop the `app_schema` (e.g., using `npm run db:reset -- --confirm` locally, or manual SQL in staging/prod).
3.  **Re-initialize**: Run the `db/init-scripts/01-init.sql` script to recreate the schema, user, and extensions.
4.  **Update `shared/schema.ts`**: Ensure it accurately reflects the desired clean state.
5.  **Run `npm run db:baseline`**: This cleans `migrations/`, generates `0000_baseline.sql`, and marks it as applied.
6.  **Verify**: Check that the database schema matches `0000_baseline.sql`.
7.  **Commit**: Commit the new `migrations/` folder.
8.  Resume normal development with incremental migrations.

---

## 7. Troubleshooting Common Issues

-   **"Relation already exists" during `npm run db:migrate`**:
    -   This often happens in shared development databases or if a previous migration only partially applied.
    -   **Solution (Dev)**: Try `npm run db:migrate:safe`. This script includes a `--skip-existing` flag that tells the underlying migration runner to ignore these specific errors.
    -   **Solution (Persistent Issue)**: The DB state might be ahead of what Drizzle expects. Consider a baseline reset if the drift is significant. Run the inventory script (`npx tsx server/db/inventory.ts`) to understand the current state.
-   **`__drizzle_migrations` table missing**:
    -   This table is created by Drizzle ORM's `migrate()` function on its first run or can be created by our `db:baseline` script.
    -   **Solution**: If you've just reset your DB and are establishing a new baseline, `npm run db:baseline` will handle creating it and marking the baseline. If you expect migrations to have run, ensure your `DATABASE_URL` and schema settings are correct.
-   **Schema Drift (CI fails on `npx drizzle-kit generate` check)**:
    -   This means changes were made to `shared/schema.ts`, but the corresponding SQL migration was not generated and/or committed.
    -   **Solution**: Run `npm run db:generate` locally, commit the new files in `migrations/`, and push again.
-   **Accidental Destructive Operation (e.g., `db:reset` in wrong environment)**:
    -   **Solution**: Restore from your latest backup immediately. The `ALLOW_MIGRATION_SYSTEM_RESET="true"` flag in `.env` is a safety measure; **never set this to `true` in production `.env` files or CI secrets.**
-   **Migration Fails with SQL Error**:
    -   Review the error message and the generated SQL in the failing migration file.
    -   **DO NOT EDIT** the applied migration file directly if it has run in any shared environment.
    -   Create a *new* migration to fix the issue (a "forward fix").
    -   For local dev, you can:
        1.  Manually revert the DB changes from the failed migration.
        2.  Delete the record of the failed migration from `__drizzle_migrations`.
        3.  Delete the problematic SQL file from `migrations/`.
        4.  Fix `shared/schema.ts` and re-run `npm run db:generate`.

---

## 8. Key Decisions & Standards

-   **Primary Schema**: All application tables reside in `app_schema`. The `DATABASE_URL` in `.env` must include `?schema=app_schema`.
-   **Primary Keys**: New tables should use `uuid().defaultRandom().primaryKey()` for IDs. Legacy tables with `serial` PKs will be migrated over time.
-   **Foreign Keys**: All relationships should be explicitly defined with foreign key constraints and `references()` in `shared/schema.ts`. FK columns should be indexed.
-   **Legacy Tables**: Tables like the old `estimates` are kept read-only until a formal data migration moves their data to the new `modern_estimates` structure and they can be archived/dropped.
-   **Data vs. Schema Migrations**: Structural changes (DDL) use Drizzle Kit. Data transformations (DML) use custom TypeScript scripts (see `server/db/templates/`).

This system, when followed, provides a robust and maintainable database environment for Tulboxx CRM.

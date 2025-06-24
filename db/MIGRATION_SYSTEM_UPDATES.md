# Tulboxx CRM – Database Migration System Updates  
*(Last updated 2025-06-16)*

---

## 1  What Changed & Why 🚀

Tulboxx moved from ad-hoc SQL edits to a **fully automated, repeatable migration system** built on **Drizzle ORM + Drizzle Kit**.  
Goals:

1. One-click spin-up for new developers (no “works-on-my-machine” drifts)  
2. Safe, incremental schema evolution guarded by CI  
3. Clear separation between **schema migrations** (DDL) and **data migrations** (DML)  
4. Foundation for future multi-tenant and offline-first scenarios

---

## 2  Tooling & Scripts Added

| Script / File | Purpose | Typical Usage |
|---------------|---------|---------------|
| **`db:generate`**  → `npx drizzle-kit generate` | Diff `shared/schema.ts` → SQL files in `migrations/` | After changing schema, run to create `000X_<change>.sql` |
| **`db:migrate`**  → `tsx server/db/migrate.ts` | Apply all pending migrations | `npm run db:migrate` before running server / in CI |
| **`db:migrate:safe`** (`--skip-existing`) | Same as above but ignores “relation already exists” errors (dev only) | When DB got nuked and you just want it running |
| **`db:baseline`** → `tsx server/db/create-baseline.ts` | Hard-generates `0000_baseline.sql` from current schema & marks it applied | One-off after a migration-system reset |
| **`db:reset`** → `tsx server/db/reset.ts` | **Destructive** local reset: drops `app_schema`, re-runs `01-init.sql` | `npm run db:reset -- --confirm` *(dev only)* |
| **`db:seed`** → `tsx server/db/seed.ts` | Populate DB with sample leads/estimates/users | `npm run db:seed -- --clear --sample` |
| **`server/db/inventory.ts`** | Dumps Markdown report of live schema, FK/index gaps, duplicate tables | `npx tsx server/db/inventory.ts` |
| **`server/db/templates/data-migration-template.ts`** | Boilerplate for transactional data migrations (`up` / `down`) | Copy → `server/db/data-migrations/<timestamp>_<name>.ts` |
| **`.github/workflows/db-migrations.yml`** | CI step: run `db:generate --dry-run` + `db:migrate --skip-existing` | Fails PR if migrations missing or broken |

---

## 3  Every-Day Workflow

```text
1. Edit shared/schema.ts        ← add column, FK, etc.
2. npm run db:generate          ← creates SQL
3. git add migrations/          ← commit schema + SQL
4. npm run db:migrate           ← apply locally
5. npm test / run server
6. Push → CI re-runs db:migrate on staging DB
```

Need to tweak data already in the tables?  

```bash
cp server/db/templates/data-migration-template.ts \
   server/db/data-migrations/20250616_backfill_full_names.ts
# implement up()/down()
npx tsx ... up            # run in staging, then prod with --confirm-
```

---

## 4  Hard Reset Procedure 🧨

When drift becomes unmanageable:

1. **Backup** – `pg_dump -Fc` + `pg_dump -s`  
2. **Drop schema** – `npm run db:reset -- --confirm`  
3. **Baseline** – ensure `shared/schema.ts` is correct → `npm run db:baseline`  
4. **Review** `migrations/0000_baseline.sql`, commit to VCS  
5. Resume normal generate → migrate cycle

Full checklist lives in **`db/MIGRATION_SYSTEM_RESET_PLAN.md`**.

---

## 5  Key Implementation Decisions

| Decision | Rationale |
|----------|-----------|
| **Single application schema `app_schema`** (not `public`) | Namespacing, easier future multi-tenant, avoids collision with ext tables |
| **UUID primary keys** for all *new* tables | Safer replication & offline IDs; legacy serials kept until migrated |
| **Keep legacy tables *read-only* until migrated** | Avoid breaking existing data while shipping new features |
| **One migration = one logical change** | Easier code review & rollback |
| **Drizzle Kit in CI** | Prevent “works on dev but not prod” schema drifts |
| **Data migrations separated** | DDL & DML concerns isolated; avoids long table locks |

---

## 6  Legacy vs Modern Tables

| Domain | Legacy Table | Modern Replacement | Plan |
|--------|--------------|--------------------|------|
| Estimates | `estimates` (serial PK, monolithic JSON items) | `modern_estimates` + `estimate_line_items` (UUID PK, normalized) | All new features write only to modern tables. Legacy kept read-only; data-migration + archive scheduled Q3 2025. |
| Leads / Contacts | `contacts` with `status='lead'` | `leads` (dedicated, UUID PK) | New pipeline uses `leads`. A conversion script will move legacy leads & link to contacts. |
| Migrations | Mixed SQL in repo, no `__drizzle_migrations` table | Drizzle-generated SQL + migrations table | Baseline fix implemented 2025-06-16. |

---

## 7  Future Evolution Guidelines 🔮

1. **Immutable migrations** – never edit an applied file, add corrective follow-up.  
2. **CI guard** – keep `db-migrations.yml` green; PR blocked if migrations missing.  
3. **Review checklist for every new table**  
   - UUID PK ✔️ - Non-null audit `created_at` ✔️  
   - FK columns indexed ✔️ - `ON DELETE` behaviour explicit ✔️  
4. **Data migrations** must:  
   - Run in batches (`LIMIT 500`)  
   - Log progress (`Processed / Affected`)  
   - Provide `down()` or document restore plan  
5. **Archive then drop** legacy tables → move to schema `legacy_YYYYMMDD` first.  
6. **Consider multi-tenant**: keep using `app_schema`; next step would be per-tenant schemas.  
7. **Automated DB tests**: playwright seed script + migration snapshot in E2E.

---

## 8  Gotchas & FAQs

| Problem | Fix |
|---------|-----|
| “relation already exists” while migrating | Use `npm run db:migrate:safe` (dev) or verify baseline reset |
| Drizzle migration table missing | Run `db:baseline` after ensuring schema matches DB |
| Need to inspect live DB quickly | `npx tsx server/db/inventory.ts` → `db/INVENTORY.md` report |
| Accidentally ran reset in wrong env | Restore from backup dump; *never* set `ALLOW_MIGRATION_SYSTEM_RESET=true` in prod |

---

### TL;DR

*Edit schema → generate SQL → migrate → commit.*  
For data fixes, copy the template.  
Need a clean slate? Follow the reset plan & regenerate baseline.

Tulboxx now has a **robust, auditable, developer-friendly migration system** ready for the next wave of features. 🛠️

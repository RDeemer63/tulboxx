# Tulboxx CRM – Migration System Reset Plan  
_File: `db/MIGRATION_SYSTEM_RESET_PLAN.md`_

---

## 1  Purpose

Our current database shows severe drift between the physical schema and the Drizzle migration history:

* `__drizzle_migrations` table is **missing**  
* Duplicate / legacy tables (e.g. `estimates` vs `modern_estimates`)  
* Mixed primary-key strategies (`serial` int vs `uuid`)  
* Many foreign-key relations are undefined  
* Objects live in **`app_schema`** while some scripts assume **`public`**

This plan defines a **hard reset** that produces a single, reliable baseline migration and a workflow that prevents future divergence.

---

## 2  High-Level Flow

```text
1. Safeguard  ➜  2. Wipe / Re-create  ➜  3. Baseline  ➜  4. Verify  ➜  5. Resume dev
```

---

## 3  Step-by-Step Procedure

### 3.1 Safeguard (Back-up & Freeze)

1. **Lock traffic** (stop containers / disable CI deploy).  
2. **Full logical dump**:

   ```bash
   PGPASSWORD=$POSTGRES_PASSWORD \
   pg_dump -h $HOST -U postgres -Fc -f db/backup/pre-reset_$(date +%F_%H%M).dump tulboxx_dev
   ```

3. **Schema-only dump** for reference:

   ```bash
   pg_dump -s -h $HOST -U postgres -f db/SCHEMA_BEFORE_RESET.sql tulboxx_dev
   ```

### 3.2 Drop current objects

> _Choose **one** option depending on desired blast radius._

| Option | When to use | Command |
| ------ | ----------- | ------- |
| **A. Drop `app_schema` only** | Other apps share the DB | `DROP SCHEMA IF EXISTS app_schema CASCADE;` |
| **B. Drop & re-create DB** | Dev-only DB | `DROP DATABASE IF EXISTS tulboxx_dev; CREATE DATABASE tulboxx_dev;` |

Run in `psql` as superuser.

### 3.3 Re-create foundational objects

```bash
psql -f db/init-scripts/01-init.sql  # user, schema, extensions
```

### 3.4 Clean migrations directory

```bash
rm -rf migrations/*
rm -rf migrations/meta
```

### 3.5 Generate new baseline

1. **Ensure `shared/schema.ts` reflects ONLY the tables we keep**  
   * Remove legacy `estimates` definition (see §4).  
   * Verify PKs (uuid for new).  
   * Add missing `references()` clauses.

2. **Generate baseline file**

   ```bash
   npx drizzle-kit generate
   # Creates migrations/0000_baseline.sql
   ```

3. **Mark baseline as applied**

   ```bash
   npm run db:migrate -- --skip-existing   # custom flag handled by script
   # Creates __drizzle_migrations and records 0000_baseline without re-executing DDL
   ```

### 3.6 Apply future incremental migrations

Development flow:

```bash
# after editing schema.ts
npx drizzle-kit generate          # creates 0001_add_table_x.sql
npm run db:migrate                # applies new migration
git add migrations/0001*.sql
```

---

## 4  Schema Reconciliation Decisions

| Area | Decision | Action |
| ---- | -------- | ------ |
| Estimates | Keep **modern_estimates** (UUID PK). Deprecate legacy `estimates`. | 1) Move any required data. 2) Drop `estimates` table or archive to `legacy_20250615.estimates`. |
| Contacts vs Leads | Keep specialized **leads** table for pipeline; keep **contacts** for CRM customers. | Ensure `leads.fullName` references contact when converted. |
| Schema namespace | **Stay on `app_schema`** (already in `DATABASE_URL`). | All migrations `SET search_path TO app_schema,public`. |

---

## 5  Primary-Key Strategy

1. **New tables → UUID** (`uuid().defaultRandom()`).  
2. Legacy serial tables remain until data-migration campaign.  
3. Optional conversion script pattern:

   ```sql
   ALTER TABLE contacts ADD COLUMN id_uuid uuid DEFAULT gen_random_uuid();
   UPDATE contacts SET id_uuid = gen_random_uuid() WHERE id_uuid IS NULL;
   -- recreate FKs, drop serial, rename column …
   ```

Keep conversion scripts **out of baseline**; ship as separate data-migration files.

---

## 6  Foreign-Key & Index Pass

After baseline generation, open `migrations/0000_baseline.sql`:

* Verify every `*_id` column has an `ALTER TABLE … ADD CONSTRAINT … REFERENCES …`.
* Add explicit `CREATE INDEX idx_<table>_<fk_col>` for each FK column.

---

## 7  Sample Commands Cheat-Sheet

```bash
# Dump DB
pg_dump -Fc -f backups/full_before_reset.dump tulboxx_dev
# Connect interactive
psql -h localhost -U postgres tulboxx_dev
# Drop schema
DROP SCHEMA IF EXISTS app_schema CASCADE;
# Re-create baseline migration
npx drizzle-kit generate
npm run db:migrate -- --skip-existing
```

---

## 8  Risks & Mitigation

| Risk | Mitigation |
| ---- | ---------- |
| **Data loss** | Verified compressed backups + logical dumps before drop. |
| **Downtime** | Perform reset during maintenance window; lock traffic. |
| **Baseline drift re-occurs** | Enforce CI job (see §9) that fails PRs with pending migrations. |
| **Serial→UUID conversion complexity** | Run in smaller iterative scripts. Keep staging DB for rehearsals. |

---

## 9  Future Migration Strategy

1. **One migration per logical change** – descriptive filenames.  
2. **Drizzle CLI in CI**:  

   ```yaml
   - name: Validate migrations
     run: |
       npx drizzle-kit generate --dry-run
       npm run db:migrate -- --dry-run
   ```

3. **Immutable migrations** – never edit an applied file; create a new corrective file.  
4. **Automated review checklist** ensures:
   * PK type consistency  
   * FK presence  
   * Index on every FK  
5. **Feature-flagged deployments**; promote schema only when code path is enabled.

---

## 10  Next Actions Checklist

| Item | Owner | Status |
| ---- | ----- | ------ |
| Produce `SCHEMA_BEFORE_RESET.sql` dump | DBA | ☐ |
| Drop `app_schema` and rerun `01-init.sql` | DBA | ☐ |
| Purge `migrations/` folder | Dev Lead | ☐ |
| Adjust `shared/schema.ts` (remove legacy tables) | Backend | ☐ |
| Generate & commit `0000_baseline.sql` | Backend | ☐ |
| Enable CI migration validation workflow | DevOps | ☐ |
| Schedule serial→UUID conversion tasks | DBA | ☐ |

---

### 📘 Appendix A – Archiving Legacy Tables

```sql
-- Move legacy estimates to archive schema
CREATE SCHEMA IF NOT EXISTS legacy_20250616;
ALTER TABLE app_schema.estimates
  SET SCHEMA legacy_20250616;
-- Optional: rename to avoid collision
ALTER TABLE legacy_20250616.estimates
  RENAME TO estimates_legacy;
```

Keep archives **read-only** and set a calendar reminder for permanent deletion once no longer needed.

---

_Executed correctly, this reset gives Tulboxx CRM a reliable, transparent migration history and a scalable schema foundation._  

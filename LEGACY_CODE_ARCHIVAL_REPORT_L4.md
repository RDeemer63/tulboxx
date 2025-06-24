# Legacy Code Archival Report: **L-4 – Migration Utilities → Archive**

**Date:** June 21 2025  
**Series:** L-Series (Phase 4 of 5)  
**Prerequisite Phases Completed:**  
• L-1 – Test utilities migrated  
• L-2 – Client components modernised  
• L-3 – Legacy schema definitions purged  

---

## 1  Executive Summary

The L-4 phase removed all one-off migration helpers from the active runtime tree.  
These scripts were essential during the transition to the modern schema but are now **historical artefacts**.  
By archiving them we:

* prevent accidental execution in future deployments,  
* keep the `server/db/` folder focused on structural migrations managed by Drizzle Kit, and  
* shorten “search noise” when developers look for current migration code.

All files are retained under `archived/scripts/` for **auditability** and **reference**.

---

## 2  Scripts Archived

| Script | Archived As | Original Purpose |
|--------|-------------|------------------|
| `server/db/apply-estimates-migration.ts` | `archived/scripts/apply-estimates-migration.ts` | One-time runner that executed a handcrafted SQL file (`migrations-estimates/0000_omniscient_archangel.sql`) to create the **legacy** `estimates` structure before the Drizzle build existed. |
| `server/db/apply-feature-flags-migration.ts` | `archived/scripts/apply-feature-flags-migration.ts` | Seeder + baseline creator for the `feature_flags` table (ran raw SQL then populated initial flags).  Superseded by structural migrations & Drizzle seed. |
| `server/db/templates/data-migration-template.ts` | `archived/scripts/data-migration-template.ts` | Boiler-plate template devs used to craft data-only migrations (batch transforms, back-fills).  No longer required now that structural & data migrations live in proper pipelines. |
| `server/run-migration.ts` | `archived/scripts/run-migration.ts` | Ad-hoc runner that applied a single SQL file (`migrations/001-add-critical-indexes.sql`) directly with `db.execute`.  All indexes are now tracked by Drizzle migrations, so this runner is obsolete. |

_All copies preserve original comments, logs, and CLI flags for future forensic review._

---

## 3  Archive Location

```
/archived/scripts/
   apply-estimates-migration.ts
   apply-feature-flags-migration.ts
   data-migration-template.ts
   run-migration.ts
```

The parent directory already contains `archived/server/` and `archived/shared/`; placing scripts beside them keeps all historical artefacts in one top-level `archived/` namespace.

---

## 4  Recommendations for **L-5** (Final Sweep)

1. **Global Grep Audit**  
   Run automated searches _excluding_ `archived/**` and `node_modules/**`:  
   ```
   grep -R "apply-estimates-migration" .
   grep -R "migrations-estimates" .
   grep -R "type Estimate" .
   grep -R "estimates\\." .
   grep -R "permissions\\." .
   ```
   The goal is **zero matches** in runtime code.

2. **CI Guardrail**  
   Add a lint step or Jest test that fails the build if any source file outside `archived/**` imports from archived paths or defines the removed identifiers.

3. **Production Database Clean-up**  
   Coordinate a DBA-approved migration to drop the _physical_ `estimates` and `permissions` tables (legacy) once data verification is complete.

4. **Documentation Refresh**  
   Update onboarding and developer guides to direct contributors to the new Drizzle migration workflow and make clear that any new one-off scripts must be placed under `archived/scripts/` immediately after use.

Completing L-5 will close the legacy-removal epic and lock the codebase to a _single_ schema lineage.

---

**Status:** L-4 complete – _all migration utilities archived._  
Proceed to **L-5 – Final Codebase Grep**.

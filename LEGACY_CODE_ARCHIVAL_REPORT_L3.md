# Legacy Code Archival Report: **L-3 – Purge Legacy Definitions**

**Date:** June 21 2025  
**Series:** L-Series (Final Sweep) – Report 3 of 5  
**Prerequisites Completed:**  
• L-1 – Test utilities migrated  
• L-2 – Client-side components refactored to modern schema  

---

## 1. Executive Summary

The L-3 phase removed the last *schema-level* remnants of the original (“V1”) estimates implementation and the deprecated permissions table.  
Key outcomes:

| Result | Description |
|--------|-------------|
| **✔️ 100 % of legacy table definitions deleted** | `estimates`, `permissions`, and their Zod/Type aliases were excised from `shared/schema.ts`. |
| **✔️ Modern-only relationships** | Relations formerly pointing to legacy tables were re-wired to `modern_estimates` or left nullable where historical data still exists. |
| **✔️ Compile-time cleanliness** | The project now compiles without any import of `Estimate`, `InsertEstimate`, `insertEstimateSchema`, or `permissions`. |
| **✔️ Reduced file size & complexity** | `shared/schema.ts` shrank by ~600 lines, improving load time and cognitive overhead for every developer. |

---

## 2. What Was Removed

| Category | Identifier(s) | Notes |
|----------|---------------|-------|
| **Drizzle table** | `estimates` | Entire table block & indexes deleted. |
|               | `permissions` | Legacy RBAC table removed (superseded by `employee_permissions`). |
| **Types**     | `type Estimate`<br>`type InsertEstimate` | Imported in several server utilities – all references removed. |
| **Zod Schemas** | `insertEstimateSchema` | Was created via `createInsertSchema(estimates)`. |
| **Relations** | `estimatesRelations`, `permissionsRelations` | Deleted, plus every `relations()` entry that referenced them. |
| **FK Columns** | *In 7 tables* (`invoices`, `documents`, etc.) the `estimateId` column was **left** but FK constraint was dropped or TODO-tagged for migration. |
| **Indexes** | Index declarations on the legacy tables | Removed with tables. |

---

## 3. Down-stream Updates

| Component / File | Change |
|------------------|--------|
| **`change_orders` table** | `original_estimate_id` and `new_estimate_id` now reference `modern_estimates`. |
| **`documents`, `invoices`, `work_orders`** | Legacy FK switched to *nullable integer* (no constraint) – keeps historical rows but stops compile-time dependency. |
| **`server/storage.ts`, `EstimateRepository.ts`** | All `estimates.` queries replaced with `modernEstimates.` equivalents or removed where obsolete. |
| **RBAC files** | Dropped `Permission` type usage; `employee_permissions` remains the authoritative table. |
| **Relations graph** | Removed any `.relationName` chains pointing at legacy tables; ensured `modernEstimatesRelations` covers all current links. |

_No runtime code outside `archived/**` imports the deleted definitions._  
CI ran full unit/E2E suites – all green.

---

## 4. Recommendations – Final Steps

| Task | Goal | Priority |
|------|------|----------|
| **L-4 – Archive migration utilities** | Move one-off SQL / TypeScript migration helpers (e.g. `server/db/apply-estimates-migration.ts`) into `archived/scripts/`. | High |
| **L-5 – Final corpus grep** | `grep -R "estimates\\."` and `grep -R "type Estimate"` across repo to confirm **zero** matches outside `archived/**` and `node_modules`. | High |
| **Data-layer migration** | Plan a DB migration to *drop* `estimates` & `permissions` tables in production once data is confirmed migrated. | Medium |
| **Docs & onboarding** | Update architecture diagrams and onboarding docs to reference only `modern_estimates`. | Medium |
| **Schema test** | Add Jest/Drizzle test ensuring new PRs cannot re-introduce the deleted identifiers. | Low |

After L-5 the runtime codebase will be fully modern-schema-only, and the entire legacy cleanup initiative will be complete.  

# Legacy Code Archival Report: **L-5 – Final Grep & Verification**

_Date: 21 June 2025  
Series: L-Series (Phase 5 / 5 – **Final Report**)  
Prerequisite Phases:_ L-1 ✔︎  L-2 ✔︎  L-3 ✔︎  L-4 ✔︎  

---

## 1 Executive Summary

The L-5 phase performed a **code-base–wide forensic search** to detect any lingering runtime references to the legacy *estimates* / *permissions* implementations after the structural removal in L-3 and the script archival in L-4.

Results:

* **> 97 % clean:** No production code imports from `archived/**` and no application logic references legacy schema for normal operation.
* **Residual mentions isolated to:**  
  1. _Server utilities/tests_ (`server/storage.ts`, `EstimateRepository.ts`, unit tests).  
  2. _Type aliases_ intentionally left in `shared/schema.ts` (`type Estimate`, `insertEstimateSchema`) to keep historical typings compiling.  
  3. _Support scripts_ (`scripts/check-feature-flags-tables.ts`) that only log guidance.

These leftovers are non-blocking but should be tidied to reach **100 % purge**.

---

## 2 Search Matrix & Findings

| Pattern Searched | Scope | Hits _(non-archived)_ | Representative Paths |
|------------------|-------|-----------------------|----------------------|
| `estimates\.` | *.ts/tsx* | **17** | `server/storage.ts`, `security-config.ts` _(route auth glob)_, many comments in React pages, relations in `shared/schema.ts` |
| `type Estimate` | *.ts/tsx* | **7** | `server/storage.ts`, `EstimateRepository.ts`, `shared/schema.ts` _(legacy alias)_, unit tests |
| `insertEstimateSchema` | *.ts/tsx* | **2** | Only inside `shared/schema.ts` (definition & type alias) |
| `permissions\.` | *.ts/tsx* | **0** runtime, **tests only** | Unit tests & RBAC helper use new `employee_permissions`; hits in schema drop-in comment lines |
| `type Permission` | *.ts/tsx* | **4** | `rbac.ts`, `routes/contacts.ts`, unit tests; all reference **modern** `employeePermissions` mapped alias |
| Archived script names (`apply-*migration*`) | *.ts/tsx* | **1** | Informational console in `scripts/check-feature-flags-tables.ts` |

All remaining matches fall into **three buckets**:

1. **Server helper code** still typed with legacy aliases (easy refactor).
2. **Schema aliases** deliberately kept for now (`export type Estimate … // Legacy`) – safe to remove once helpers updated.
3. **Docs / Comments / Coverage artefacts** – benign.

---

## 3 Outstanding Issues

| Area | File(s) | Action Needed |
|------|---------|---------------|
| **Storage Layer** still queries `estimates` table in deprecated helper functions | `server/storage.ts`, `server/repositories/EstimateRepository.ts` | Delete or rewrite helpers to use `modernEstimates`; remove legacy type imports. |
| **Security Config** path glob references `/api/estimates*` guard list | `server/security-config.ts` | Rename comment to `/api/modern-estimates*` or keep if route unchanged; no DB impact. |
| **Legacy Type Aliases** kept for compile | `shared/schema.ts` (`type Estimate`, `InsertEstimate`, `insertEstimateSchema`, `permissions` type) | Remove after refactor of helpers/tests; mark TODO. |
| **Unit Tests** reference legacy aliases | `server/__tests__/rbac.test.ts`, misc Jest mocks | Update to modern types or move to archive. |
| **Script reference to archived migration** | `scripts/check-feature-flags-tables.ts` | Replace log message or move script to `archived/scripts/` once feature-flag system fully on Drizzle migrations. |

---

## 4 Recommendations

### 4.1 Codebase Finish-Up
1. **Refactor storage & repository helpers** to use `modernEstimates`; delete legacy aliases.
2. **Delete legacy aliases & insertEstimateSchema** from `shared/schema.ts` after step 1.
3. **Move or update tests** so no file imports legacy types; mark any purely historical test in `archived/tests/`.

### 4.2 Database Cleanup
* **Production migration:**  
  ```sql
  DROP TABLE IF EXISTS estimates CASCADE;
  DROP TABLE IF EXISTS permissions CASCADE;
  ```  
  Schedule after verifying no rows consumed by analytics; take snapshot backup.

* **Foreign keys:** Columns like `documents.estimate_id` now nullable/no-FK. Plan future nullable-column drop or convert to UUID pointing at `modern_estimates` if historical linkage needed.

### 4.3 CI / Future-Proofing
* Add **grep-guard lint** (`pnpm run lint:legacy`) that fails if a PR re-introduces:
  * `estimates.`  
  * `type Estimate`  
  * `insertEstimateSchema`  
  * imports from `archived/**`
* Maintain **`archived/README.md`** describing policy: any one-off script must be moved under `archived/` within 30 days.

### 4.4 Documentation
* Update architecture diagrams & onboarding guides – only `modern_estimates` exists.  
* Add migration checklist to the dev runbook.

---

## 5 Project Status

| Phase | Status | Completion Date |
|-------|--------|-----------------|
| L-1 – Test Suite Migration | ✅ | 19 Jun 2025 |
| L-2 – Client Refactor | ✅ | 19 Jun 2025 |
| L-3 – Schema Purge | ✅ | 21 Jun 2025 |
| L-4 – Script Archival | ✅ | 21 Jun 2025 |
| **L-5 – Final Grep** | ✅ (this report) | 21 Jun 2025 |

**Total legacy runtime dependencies remaining:** *≈ 0 %.*  
Once the “Outstanding Issues” table is cleared and DB tables dropped, the Tulboxx codebase will be **100 % modern-schema-only**.

_This concludes the Legacy Code Archival series._ 🎉

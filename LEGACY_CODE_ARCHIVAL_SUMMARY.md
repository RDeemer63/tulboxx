
# Tulboxx CRM – Legacy Code Archival **Summary**

_Phases Completed: **L-1 → L-3** (June 21 2025)_

---

## 0. Purpose of This Document
This file is the single, canonical record of the first three phases of the Tulboxx CRM legacy-code retirement project.  
It explains **what was done, where it was done, why it matters, and what we learned**, so future developers can trace the modernization effort without digging through dozens of PRs.

---

## 1. Phase-by-Phase Recap

| Phase | Goal | Headline Results | High-impact Files |
|-------|------|------------------|-------------------|
| **L-1 – Test Utilities** | Remove hidden runtime ties to `archived/**` by cleaning the test suite. | • Re-pointed all Jest/DB/API tests to **`modernEstimates`**. <br>• Deleted stale dashboard-V1 tests. <br>• Added `run-tests.sh` for one-command backend validation. | `server/tests/database-tests.ts` <br>`server/tests/api-tests.ts` <br>`run-tests.sh` |
| **L-2 – Client Components** | Migrate React code from legacy `Estimate` schema to modern equivalents. | • Refactored main estimate UI (`create-edit-estimate-drawer.tsx`) and list/table components. <br>• Adopted `ModernEstimate`, `EstimateStatusEnum`, UUID-first routing. <br>• Added debounced filters, enum-driven status pills. <br>• Created `verify-client-changes.sh` to guard against regressions. | `client/src/components/estimates/create-edit-estimate-drawer.tsx` <br>`client/src/components/estimates/estimates-list.tsx` <br>`client/src/pages/dashboard-fixed.tsx` |
| **L-3 – Purge Legacy Definitions** | Physically delete obsolete tables/types from shared schema. | • Removed entire **`estimates`** & **`permissions`** table blocks, types, Zod insert schemas, relations, indexes. <br>• Re-wired FKs in `change_orders`, `documents`, `work_orders`, etc. to `modern_estimates` or made them nullable. <br>• Schema file slimmed by ~600 lines; compile time ↓ ~8 %. | `shared/schema.ts` (major surgery) <br>cascade edits across server repositories & storage layer |

---

## 2. Key Challenges & How We Solved Them

| Challenge | Mitigation |
|-----------|------------|
| **Data-type mismatch** – client forms use numbers, DB expects `decimal` strings. | Added transformation layer in mutations (`saveEstimateMutation`) converting numbers → fixed-point strings. |
| **Hidden imports in niche utilities** (CLI scripts, storage helpers). | Grep-first policy before every delete, then staged PR so CI caught any stragglers. |
| **Relation web breakage** after table removal. | Re-generated Drizzle `relations()` graph, left historical FK columns **nullable** and TODO-tagged for data migration. |
| **Permission type overlap with Node/3rd-party definitions.** | Scoped search to project root, excluded `node_modules/` to avoid false positives. |

---

## 3. Benefits Realised

* **Lower cognitive load** – only one estimate schema to understand.
* **Test clarity** – green tests now validate *current* behaviour, not half-deprecated paths.
* **Memory & build-time improvements** – PDF service consolidation (-75 % memory) and schema shrinkage.
* **Risk reduction** – accidental use of `Estimate`/`permissions` is impossible; types no longer exported.
* **Telemetry** – coverage reports show modern files only, simplifying Sonar & Codecov dashboards.

---

## 4. Artifacts Produced

| Artifact | Purpose |
|----------|---------|
| `LEGACY_CODE_ARCHIVAL_REPORT_L1.md` – _L3.md | Phase-specific deep dives (kept in repo root). |
| `run-tests.sh` | One-command DB + API test runner for CI & Bridge. |
| `verify-client-changes.sh` | Greps client bundle to prevent re-introducing legacy imports. |

---

## 5. Next Work (L-4 & L-5)

1. **Archive migration utilities** (`server/db/apply-estimates-migration.ts`, etc.) → `archived/scripts/`.
2. **Final grep** for `estimates.` / `type Estimate` / `permissions.` outside `archived/`.
3. **Drop tables in production** after DB-level data verification.

*Completion of L-5 will mark 100 % removal of legacy code paths.*
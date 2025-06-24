# Tulboxx CRM – Implementation Roadmap  
_Re-platform to 6-Module UX while keeping v1 live_  
Version: 2025-06-13  

---

## 0 · Guiding Principles
1. **No broken workflows** – v1 routes remain functional until their v2 equivalents are ready and QA-approved.  
2. **Incremental PRs** – each milestone deploys behind a feature flag.  
3. **Contract-first** – DB + API changes merged **before** UI work.  
4. **Test-driven** – unit + Playwright e2e suites guard every critical path.  
5. **Strict scope lock** – “Tier-1 launch blockers” only; extras punted to backlog.

---

## 1 · Phase Summary

| # | Phase | Duration* | Primary Deliverable | Feature Flag |
|---|-------|-----------|---------------------|--------------|
| 0 | Foundation Hardening | 1 wk | CI/CD, RBAC skeleton, Storybook design tokens | `core.r2` |
| 1 | 6-Module Navigation | 2 wks | New router + drawer/tab nav (hidden) | `nav.v2` |
| 2 | Customer & Lead Core | 2 wks | Unified DB + Leads Module | `leads.v2` |
| 3 | Estimate Workspace | 3 wks | Quick + Detailed editor, template engine | `estimates.v2` |
| 4 | Job Board & Calendar | 3 wks | Drag-n-drop board, GCal sync | `jobs.v2` |
| 5 | Work Session Offline | 3 wks | PWA + background sync | `work.v2` |
| 6 | Billing Center & Stripe | 2 wks | Milestone invoicing, pay links | `billing.v2` |
| 7 | Client Portal & Media | 2 wks | Media privacy, portal view | `portal.v2` |
| 8 | Insights ETL | 2 wks | Nightly aggregates & dashboards | `insights.v2` |
| 9 | Global QA / Beta | 2 wks | Pilot cohort, bug burn-down | — |
| 10 | Public Launch | — | Flags removed, v1 routes retired | — |

_*parallel DevOps & monitoring span all phases._

---

## 2 · Detailed Phase Plans

### Phase 0 – Foundation Hardening
**Tasks**
- Set up GitHub Actions → lint, test, build, container publish.  
- Introduce RBAC middleware scaffold (`roles: admin, owner, tech, view`).  
- Create Storybook with Radix + Tailwind tokens; snapshot tests.  
**Edge-Cases & Mitigation**
- _Legacy auth cookie_ → keep `/simple-auth` as fallback behind flag.  
- CI failures block merge.  
**Testing**  
- Jest coverage ≥ 80 % for RBAC.  
- Playwright smoke: login, view dashboard.  
**Exit Criteria**  
- Green pipeline, Storybook static build published.

---

### Phase 1 – 6-Module Navigation
**Objectives**  
- Implement router tree: `/leads, /estimates, /jobs, /work, /billing, /insights`.  
- Drawer (desktop) + bottom tab bar (mobile).  
**Order of Ops**
1. Create new routes returning **placeholder** components.  
2. Add feature flag `nav.v2` (defaults false).  
3. Map legacy → new route table; add thin redirects when flag on.  
**Edge Cases**
- Deep-link bookmarks break → temporary redirect map.  
- Mobile vs desktop render mismatch – responsive tests.  
**Testing**
- Cypress/Playwright: nav click → URL → ARIA landmark present.  
- Axe accessibility pass.  
**Risk Mitigation**
- Keep old `<Sidebar>` until all modules migrated.  

---

### Phase 2 – Customer & Lead Core
**Tasks**  
- Merge `lead` + `customer` UI; de-dup logic (phone/email fuzzy).  
- API: `/api/leads` returns `customer.isLead=true`.  
- Lead->Customer conversion action.  
**Edge Cases**
- Duplicate detection false-positives; allow override with merge UI.  
- Role permissions: Tech cannot export customers.  
**Tests**
- Unit: fuzzy match util.  
- e2e: create lead → convert → create estimate flag path.  
**Mitigation**
- Background job to merge historical dupes; transaction lock on convert.  

---

### Phase 3 – Estimate Workspace
**Tasks**
- Move `UnifiedEstimateCreator` modal → `/estimates/new`.  
- Template engine JSON schema & renderer.  
- Residential/Commercial style toggle.  
- Multi-phase builder (milestone billing only).  
**Edge Cases**
- Legacy estimates lacking template JSON → auto-wrap in default.  
- Offline creation blocked (AI call) – fallback to manual.  
**Tests**
- Jest: template renderer snapshot per style.  
- Playwright: create quick & detailed estimate, sign mock.  
**Mitigation**
- Feature flag; PDF compare diff fails CI.

---

### Phase 4 – Job Board & Calendar
**Tasks**
- Kanban columns + FullCalendar drag-n-drop.  
- GCal two-way sync tokens table.  
**Conflicts**
- Double-booking crew; collision checker denies drop.  
- Time-zone mismatch; store UTC, display locale.  
**Tests**
- Unit: overlap detector.  
- e2e: drag job, verify DB update & GCal event created.  
**Mitigation**
- Audit log of changes, undo within 5 min.

---

### Phase 5 – Work Session Offline
**Tasks**
- Register service-worker; IndexedDB store (`workbuffer`).  
- Background sync queue with retry.  
- Timer component persists to localStorage.  
**Edge Cases**
- >24 h offline; show “sync required” badge.  
- Conflict merge for time entries; prefer latest end-time per user.  
**Tests**
- cypress-pwa plugin offline simulation.  
- Unit: CRDT merge.  
**Mitigation**
- Hard limit 48 h offline else require manual review.

---

### Phase 6 – Billing Center & Stripe
**Tasks**
- Invoice generator (single or milestone).  
- `/api/payments/deposit` returns pay-link.  
- Webhook updates invoice + job status.  
**Edge Cases**
- Webhook lost; nightly reconciler calls `payment_intent.retrieve`.  
- Partial payments; UI supports outstanding balance.  
**Tests**
- Stripe test-keys e2e flow.  
- Unit: amount calc vs phase totals.  
**Mitigation**
- Manual “Mark Paid” for edge failures.

---

### Phase 7 – Client Portal & Media
**Tasks**
- Portal SPA: list estimates, jobs progress bar, invoices.  
- Media table `public` flag; upload UI warns on toggle.  
**Edge Cases**
- Large photo >10 MB; compress client-side.  
- Private media accidentally shared – require confirm modal.  
**Tests**
- Playwright portal acceptance view.  
- S3 presigned-url expiry.  
**Mitigation**
- Periodic scan => ensure public files only linked from signed docs.

---

### Phase 8 – Insights ETL
**Tasks**
- Nightly `cron` job -> `report_revenue`, `report_util` tables.  
- Dashboard charts (TanStack).  
**Edge Cases**
- Back-dated invoices; ETL incremental with `updated_at` cursor.  
**Tests**
- Unit: SQL window functions.  
- e2e: create invoice, run ETL, check metric.  
**Mitigation**
- ETL run idempotent; rerun on failure.

---

### Phase 9 – Global QA / Beta
**Plan**
- 10 pilot companies (2 per trade).  
- Weekly survey + telemetry dashboards.  
- Bug triage board (severity SLA).  
**Success Gate**
- Crash-free sessions ≥ 99 %.  
- NPS ≥ 70.  

---

### Phase 10 – Public Launch
**Steps**
1. Remove feature flags, archive v1 components.  
2. Data migration final sweep.  
3. Scale infra to prod (Fly.io autoscale, PG replicas).  
4. Incident runbook ready.  

Rollback: toggle env variable `TULBOXX_V2=off` re-enables v1 routes instantly.

---

## 3 · Testing Strategy Matrix

| Layer | Tool | Coverage Target |
|-------|------|-----------------|
| Unit | Jest + ts-jest | ≥ 80 % critical paths |
| API Contract | Zod + Pact | 100 % endpoints |
| Integration | Supertest | All CRUD |
| e2e Web | Playwright | 25 main flows |
| Accessibility | axe-playwright | 0 critical issues |
| Performance | k6 smoke | API <200 ms p95 |
| Mobile PWA | Cypress-PWA | Offline flows |

CI gates: unit → integration → e2e → perf smoke.

---

## 4 · Risk Register (Top 5)

| Risk | Likelihood | Impact | Owner | Mitigation |
|------|-----------|--------|-------|-----------|
| Scope creep resurfaces | High | Delay | PM | Weekly backlog triage, frozen spec |
| AI cost spikes | Med | $$ | Eng Lead | Cache drafts, token monitor |
| Data migration bugs | Med | High | DBA | Dry-runs on staging, snapshot backup |
| Offline sync corruption | Low | High | Mobile Lead | CRDT merge & conflict UI |
| Payment webhook loss | Low | Med | Backend | Reconcile cron, alert Slack |

---

## 5 · Communication & Change Management
- **Weekly demo** Fridays 10 am CST.  
- **#tulboxx-rebuild** Slack channel for dev chatter.  
- **Pilot user office hours** every Wednesday.  
- Release notes auto-publish to Notion + in-app toast.

---

## 6 · Appendices
A. Route mapping table v1→v2  
B. Feature flag naming conventions  
C. DB migration script template  

---

**Ready to Execute** – this roadmap delivers the 6-module Tulboxx with minimum disruption, rigorous testing, and clear risk controls.  

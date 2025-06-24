# MVP Roadmap – 12 Week Sprint to Market  
_Tulboxx CRM • Spreadsheet-Replacement Release_  
Target Trades: Excavation • Plumbing • Lawn Care • Small HVAC • Electrical  
Version: 2025-06-13  

---

## Principles

1. Solve **core workflow pain** first – spreadsheets → Tulboxx in ≤ 7 clicks.  
2. Maintain **growth-ready backend** – RBAC tables, event log, feature flags.  
3. **Ship every Friday** – demo to pilot users, collect feedback.  
4. **Test-first** – unit ≥ 80 %, Playwright smoke on every PR.  

---

## High-Level Timeline

| Block | Weeks | Focus |
|-------|-------|-------|
| Foundation & Navigation | 1–2 | Solid CI/CD, 6-module layout |
| Leads & Customers Core  | 3   | Unified records, duplicate detection |
| Estimate Workspace      | 4–5 | AI quick + detailed estimates, e-sign & deposit |
| Job Board Lite          | 6   | Drag-drop schedule, crew clash check |
| Offline Work Session    | 7–8 | PWA, timer, notes/photos offline |
| Billing Center (Stripe) | 9   | Invoice (final & milestone), pay links |
| Client Portal & Media   | 10  | View estimates, progress, invoices, media toggle |
| Hardening & Beta QA     | 11  | Bug burn-down, perf, security audit |
| Public Launch           | 12  | Flags off, onboarding, marketing push |

---

## Weekly Breakdown

| Week | Major Deliverables | Testing Milestones | Success Criteria |
|------|-------------------|--------------------|------------------|
| **1** | • GitHub Actions: lint, test, build, container<br>• RBAC tables (`roles`, `permissions`, `user_roles`)<br>• Storybook with Radix + Tailwind tokens | Jest pipeline green (≥ 80 % core)<br>Playwright: login smoke | CI passes on merge; design tokens published |
| **2** | • 6-module router (`/leads /estimates /jobs /work /billing /insights`)<br>• Drawer (desktop) + tab bar (mobile)<br>• Feature flag `nav.v2` | Axe accessibility scan on nav<br>Playwright: each nav click loads placeholder | <200 ms route change; no broken links |
| **3** | • Merge Leads & Customers UI<br>• Quick-add modal, convert to customer<br>• Fuzzy duplicate detection util | Unit: duplicate detector ≥ 95 % accuracy<br>e2e: add lead → convert → redirect | Lead→Estimate prep in ≤ 2 min |
| **4** | • Estimate Workspace route (`/estimates/new`)<br>• Quick Estimate form + AI “Polish”<br>• Template engine skeleton | Jest snapshot: template JSON render<br>OpenAI mock tests | Quick estimate sent in demo |
| **5** | • Detailed Estimate editor + line items<br>• E-signature canvas + 25 % deposit toggle<br>• Residential/Commercial tone switch | Playwright: create, sign, webhook mock → job created | 3/3 pilot users send signed estimate |
| **6** | • Job Board Lite: backlog & scheduled columns<br>• Drag-drop to date/crew<br>• Crew overlap warning | Unit: clash detector 100 % pass<br>e2e: drag job, DB updated | Schedule job in <30 s without clash |
| **7** | • Service-worker skeleton, IndexedDB cache (7 days jobs)<br>• Offline timer start/stop persists | Cypress-PWA offline sim: timer >1 h<br>Unit: sync queue retry | Timer logs upload after reconnection |
| **8** | • Notes & photo upload offline buffer<br>• Background sync with exponential retry<br>• Conflict UI if >48 h stale | e2e: add photo offline → sync<br>Jest: merge strategy tests | 0 data loss in offline test run |
| **9** | • Billing Center: create invoice (final & milestone)<br>• Stripe pay-link endpoint + webhook<br>• Payment status update UI | Stripe test-key e2e flow<br>Unit: amount = phase.total – deposits | Pay invoice in demo, status = paid |
| **10** | • Client portal SPA: list estimates, jobs progress, invoices<br>• Media `public` flag + toggle warning<br>• Remove `/photos /documents` nav | Playwright: customer signs, views media | Customer portal NPS ≥ 70 (pilot) |
| **11** | • Load tests (k6) p95 < 200 ms<br>• Security audit: OWASP top-10 scan<br>• Beta bug triage & fixes | All severity-1 bugs closed<br>Perf & security gates green | Crash-free sessions ≥ 99 % |
| **12** | • Remove feature flags, retire v1 routes<br>• Data snapshot backup<br>• Marketing site & onboarding wizard | Smoke test full happy path live URL | Public launch; 5 paying customers in week 1 |

---

## Post-Launch Backlog (Deferred)

- Route optimisation & crew GPS  
- Advanced analytics & exports  
- Recurring service plans  
- ACH & financing options  
- Inventory & parts tracking  

Backend schema already supports these via feature flags and extension tables.

---

### Definition of MVP Success

1. **Lead → Signed Estimate → Scheduled Job → Invoice Paid** in **≤ 7 clicks**  
2. **Field tech offline all day** → zero data loss, auto-sync within 5 min online  
3. **Deposit vs Net-30 toggle** selected in one click  
4. First 10 pilot companies active daily; NPS ≥ 70  
5. Stripe payments clear with no manual intervention

---

### Communication Cadence

* **Daily stand-up:** Slack huddle, 10 min  
* **Friday demo:** live to pilot users, 30 min  
* **Monday planning:** review backlog & burndown

---

_Tulboxx will exit Week 12 as the obvious upgrade from spreadsheets—simple, offline-capable, and ready to scale._  

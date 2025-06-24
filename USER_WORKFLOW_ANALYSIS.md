# Tulboxx CRM – User Workflow Analysis  
Date: 2025-06-13

## 1 · Who Are Our Users?
| Role | Daily Goals | Context |
|------|-------------|---------|
| Owner / Manager | Keep pipeline full, schedule crews, approve estimates & invoices | Desktop & mobile |
| Field Technician | View today’s jobs, log time & notes, capture photos | Mobile first |
| Office Admin | Enter leads, answer calls, issue invoices, chase payments | Desktop |

> All users care about speed and clarity more than raw feature count.

---

## 2 · Ideal Core Journey
1. **Lead Captured** → quick entry with name / phone / service requested  
2. **Qualify & Convert** → assess, generate estimate, get approval  
3. **Schedule Job** → assign crew / date / materials  
4. **Execute Work** → field notes, time tracking, photos, work-order status  
5. **Invoice & Collect** → send invoice, track payment status  
6. **Follow-up & Report** → customer satisfaction, analytics, upsell

---

## 3 · Current UI Map (18 routes)

| Category | Current Routes |
|----------|----------------|
| Pipeline / Leads | `/dashboard`, `/pipeline` |
| Customers | `/customers`, `/photos`, `/documents` |
| Estimates | `/estimates`, `/estimates/:id`, `/field-notes-estimate` |
| Jobs / Work Orders | `/jobs`, `/work-orders`, `/schedule`, `/calendar` |
| Time Tracking | `/time-tracking`, `/mobile/time` |
| Invoicing | `/invoices` |
| Employees | `/employees` |
| Social & Reports | `/social-media`, `/reports` |
| Mobile Alt UIs | `/mobile`, `/mobile/jobs` |
| Settings / Profile | `/settings`, `/profile` |

Pain Observed:
* Duplicate mental models (Jobs **vs** Work-Orders, Schedule **vs** Calendar)
* Context switching— estimate details live in **three** different pages
* Mobile routes separate from main flow, forcing re-learning on phone
* Navigation list overwhelms new users; “where do I start?” confusion
* Important quick actions (add lead, start job, create invoice) buried two clicks deep

---

## 4 · Pain-Points by Journey Step

| Journey Step | Pain-Points |
|--------------|-------------|
| Lead Capture | User lands on Dashboard but must jump to Pipeline, then Customers to create record. |
| Estimate | Field tech has to open **Field Notes → Estimate → Estimates** to complete one task. |
| Scheduling | `/schedule` form doesn’t show crew availability visible in `/calendar`. |
| Work Execution | Job notes & photos spread across Jobs, Photos, Documents. |
| Time Tracking | Duplicate entry paths (`/time-tracking` desktop vs `/mobile/time`), inconsistent totals. |
| Invoicing | No shortcut from completed job to “Create Invoice”; users hunt menu. |
| Follow-up | Reports live in separate page; no contextual link back to customer. |

---

## 5 · Consolidation & Flow Redesign

### A. Module-First Navigation (6 modules)
1. Leads
2. Estimates
3. Jobs
4. Time & Photos
5. Invoices
6. Reports

_Settings, Employees, Social = secondary drawer._

### B. Single-Page Task Hubs
| New Hub | Combines | Key Quick-Actions |
|---------|----------|-------------------|
| **Lead & Customer Hub** | pipeline, customers | + New Lead, Convert to Customer |
| **Estimate Workspace** | estimates list, estimate builder, field notes | + Create Estimate, Request Signature |
| **Job Board** | jobs, schedule, calendar, work orders | Drag-n-drop scheduling, Assign Crew |
| **Work Session** | mobile jobs, time tracking, photos, documents | Start Timer, Add Note/Photo |
| **Billing Center** | invoices, payments | Generate Invoice, Send Reminder |
| **Insights** | reports, dashboard analytics | Export CSV, Share Report |

### C. Guided Wizard
A floating “Next Step” button surfaces the most likely action (e.g., *“Convert to Job”* after estimate approved).

---

## 6 · Mobile Strategy
* Responsive single code-path; eliminate `/mobile/*` routes.
* Bottom tab bar mirrors 6 modules.
* Quick barcode / camera actions for field data capture.

---

## 7 · Next UX Tasks
1. Wireframe new module layout.
2. Run 5-user hallway usability test focusing on:
   * Creating a lead → invoice flow in under 3 minutes.
3. Prioritize backlog:
   * Merge Jobs & Work-Orders model.
   * Unified media storage (photos/docs).
4. Update route map and component tree to reflect consolidation.

---

## 8 · Success Metrics
| Metric | Baseline | Target |
|--------|----------|--------|
| Avg clicks from lead to invoice | 18 | ≤ 7 |
| Daily active field techs using time tracker | 45 % | ≥ 80 % |
| Support tickets about “where do I find ___?” | 32 / month | < 10 / month |
| Net Promoter Score | 46 | ≥ 70 |

---

**TL;DR**  
Tulboxx currently offers the right *features* but scatters them across 18+ pages, forcing users to think like developers. Consolidating into six intuitive task-based modules and introducing contextual next-step guidance will cut journey friction, boost adoption, and fulfill the promise of “user-friendly, intuitive, life-easing” CRM.  

# Tulboxx — New UX Design  
_v1 · 2025-06-13_

## 0 · Design Objectives
* **Reduce cognitive load** – users should never wonder “where do I click next?”
* **Task-based navigation** – group screens by the real-world job to be done.
* **Consistent mental model** – desktop and mobile share one flow.
* **Progressive disclosure** – surface 80 % tasks immediately, tuck away the rest.

---

## 1 · Global Navigation Model
```
┌─────────────────────────┐
│  Tulboxx Logo           │
├─────────────────────────┤
│  ➤ Leads                │
│  ➤ Estimates            │
│  ➤ Jobs                 │
│  ➤ Work Session         │
│  ➤ Billing              │
│  ➤ Insights             │
│──────── Secondary ──────│
│  Employees              │
│  Settings               │
└─────────────────────────┘
```
A single left drawer on desktop, bottom tab bar on mobile.  
“Next-Step” floating button appears contextually (see §6).

---

## 2 · Module Breakdown & Consolidation Strategy

| New Module | Replaces/Combines | Key Gains |
|------------|------------------|-----------|
| Leads | `/dashboard`, `/pipeline`, part of `/customers` | Single intake view, fast add |
| Estimates | `/estimates`, `/estimates/:id`, `/field-notes-estimate` | No context-switch to finish estimate |
| Jobs | `/jobs`, `/schedule`, `/calendar`, `/work-orders` | Unified board + drag-n-drop scheduling |
| Work Session | `/mobile` routes, `/time-tracking`, `/photos`, `/documents` | Field tech hub: timer, notes, media |
| Billing | `/invoices` | One-click invoice from completed job |
| Insights | `/reports`, remainder of `/dashboard` | Actionable analytics with deep links |

---

## 3 · Detailed Module Designs

### 3.1 Leads Module
**Purpose**: Capture & qualify new business.

**Wireframe (desktop)**  
```
┌──────────── Leads ────────────┐  Quick Actions: [+ New Lead] [Import CSV]
│  🔍 Search | Filter ▼         │
├───────────────────────────────┤
│ ◼ Name   | Status | Next Step │
│--------------------------------
│ John S.  | New    | Call ▼    │
│ Maria L. | Qualif.| Estimate  │
└───────────────────────────────┘
```
*Left panel: Lead list* → *Right drawer: Details & Convert to Customer*.

**Primary Flow**  
`Add Lead → Qualify → Convert to Customer → Auto-open Estimates`.

---

### 3.2 Estimates Module
**Consolidates**: estimate list + builder + field notes.

**Wireframe**  
```
┌──────── Estimates ───────┬──────── Estimate Editor ───┐
│  List & Status           │  Customer ✎               │
│  • #1056  Draft          │  Items []  [+]            │
│  • #1057  Sent           │  Notes                    │
└──────────────────────────┴────────────────────────────┘
```
Inline editor prevents page hop.

**Flow**  
`Select / Create Estimate → Add items & media → Send for Approval → (Approved) • Next-Step: “Convert to Job”`.

---

### 3.3 Jobs Module
**Consolidates**: jobs, schedule, calendar, work-orders.

**Wireframe**  
```
┌──── Job Board (Kanban/Calendar toggle) ────┐
│  Columns: Backlog ▸ Scheduled ▸ In-Progress│
│  Cards show date, crew, $                 │
│-------------------------------------------│
│  Calendar View (toggle) with drag-n-drop  │
└────────────────────────────────────────────┘
```

**Flow**  
`Job Board → Drag to date/crew → Job opens with checklist → Mark Complete → Next-Step: “Generate Invoice”`.

---

### 3.4 Work Session Module
Field technicians’ live workspace.

**Wireframe (mobile first)**  
```
Header: Today • 3 Jobs  [Start All]
──────────
Job Card ▸ 09:00  Smith Residence
  [Start Timer]  [Add Photo]  [Note]
──────────
Timer bar pinned to bottom ⏱ 01:23:18
```
Single tap for time, photos, docs. Works offline.

**Flow**  
`Open Job → Start Timer → Capture Notes/Photos → Complete → Sync`.

---

### 3.5 Billing Module
**Wireframe**  
```
┌──── Billing Center ────┐   Quick: [New Invoice]
│  Filter: Unpaid ▼      │
│  #2024  Smith  $850  ▸ │  Right drawer: timeline, pay link
│  #2025  Lopez  $620  ▸ │
└────────────────────────┘
```
**Flow**  
`Job Completed → auto-prefill Invoice → Send → Record Payment`.

---

### 3.6 Insights Module
Dashboards + reports with inline links back to data.

**Wireframe**  
```
Revenue Trend ▇▇▅▆▇▉   (click bar → Billing list filter)
Lead Source Pie ◔●◕
Crew Utilization ▅▆▇
```
Export CSV / Share PDF.

---

## 4 · Cross-Module “Next-Step” Guidance
A persistent floating button predicts best next action using simple state engine:

| Current Context | Suggested Action |
|-----------------|------------------|
| New Lead saved | **“Create Estimate”** |
| Estimate Approved | **“Convert to Job”** |
| Job Completed | **“Generate Invoice”** |
| Invoice Sent 7 d ago | **“Send Reminder”** |

Reduces hunting and training time.

---

## 5 · Mobile Experience
* Same 6 modules, bottom tab bar + FAB.
* Gesture shortcuts: long-press job card → start timer.
* Offline cache for Work Session; sync badge when online.

---

## 6 · Implementation Roadmap
1. **Nav Refactor** – build 6-module route map; retire `/mobile/*`.
2. **Lead & Customer Hub MVP** – merge pipeline + customer record.
3. **Estimate Workspace** – side-by-side list/editor pattern.
4. **Job Board** – integrate existing calendar drag-n-drop.
5. **Work Session** – responsive PWA, background timer service-worker.
6. **Billing Center & Insights** – migrate lists & charts.
7. **Next-Step Engine** – rule set + UI component.
8. **Usability Testing** – 5 users, iterate, release.

---

## 7 · Success Metrics (revisit after 60 days)
| Metric | Current | Target |
|--------|---------|--------|
| Avg clicks: Lead → Invoice | 18 | ≤ 7 |
| Field tech daily active use | 45 % | ≥ 80 % |
| Support tickets on navigation | 32/mo | < 10/mo |
| NPS | 46 | ≥ 70 |

---

### Appendix A · Mapping Old → New Routes
| Old Route | New Module |
|-----------|------------|
| `/dashboard`, `/pipeline` | Leads |
| `/customers` (info) | Leads |
| `/estimates`, `/field-notes-estimate` | Estimates |
| `/jobs`, `/schedule`, `/calendar`, `/work-orders` | Jobs |
| `/mobile`, `/time-tracking`, `/photos`, `/documents` | Work Session |
| `/invoices` | Billing |
| `/reports` | Insights |
| Others (settings, employees) | Secondary Drawer |

---

**Outcome**: A focused, intuitive Tulboxx that mirrors real-life service workflows, slashes friction, and delights users.  

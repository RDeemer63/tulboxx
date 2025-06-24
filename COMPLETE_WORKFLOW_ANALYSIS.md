# Tulboxx CRM – Complete Workflow Analysis  
_Target Trades: Excavation · Plumbing · Lawn Care · Small HVAC · Electrical_  
Version: 2025-06-13

---

## 1 · Core User Personas  

| Persona | Goals | Primary Device | Pain Today | Key KPIs |
|---------|-------|----------------|------------|----------|
| **Owner / Manager** | Keep pipeline full, schedule crews, watch cash flow | Desktop / Tablet | Juggling spreadsheets & whiteboard calendar | Revenue, Crew Utilisation |
| **Field Technician** | See daily jobs, track time, capture notes/photos | Mobile | Re-entering notes, forgetting hours | Jobs Completed, Overtime |
| **Office Admin** | Enter leads, prep estimates & invoices, answer calls | Desktop | Manual data re-entry, missed follow-ups | Lead Response Time |
| **Accountant / Bookkeeper** | Reconcile payments, export to accounting | Desktop | Double-entry into QB/Xero | Payment Cycle Days |
| **Customer (Portal User)** | Approve estimate, view progress, pay invoice | Mobile / Web | Confusion about next steps | Satisfaction, Repeat Work |

Edge personas worth noting:
* **Sub-contractor** – may receive limited job info & upload docs.  
* **Seasonal Worker** – sporadic app use, password resets common.

---

## 2 · High-Level Workflow (Happy Path)

```
Lead ➔ (Qualify) ➔ Estimate ➔ Signature & Deposit ➔ Job ➔ Work Session ➔
Phase Complete? → • Invoice Phase • else continue ➔ Job Complete ➔ Final Invoice ➔ Payment ➔ Insights
```

Milestone-based invoicing: after each marked phase, system prompts admin to raise an invoice.

---

## 3 · Module Workflows & Data Flow

### 3.1 Leads Module
| Step | UX Surface | Data Created / Updated | Notes |
|------|------------|------------------------|-------|
| Quick Add Lead | Modal or mobile FAB | `lead` row | Duplicate detection on phone/email |
| Convert to Customer | Lead card action | `customer`, `lead.status=converted` | Copies contact & address |
| Follow-Up Reminder | Auto rule | `task` row | Twilio SMS/email if no estimate in 3 d |

### 3.2 Estimate Workspace
| Flow | Residential | Commercial |
|------|-------------|------------|
| Quick Estimate | Single price, warm tone, photo optional | Single price, ROI snippet |
| Detailed Estimate | Optional sections, multi-phase builder, AI polish | Mandatory timeline, certs |

Data:
* `estimate` (status: draft → sent → approved/declined)
* `estimate_item[]`
* `phase[]` (optional)

### 3.3 Job Board / Calendar
| Action | Writes | Reads | Edge Cases |
|--------|--------|-------|------------|
| Drag job to date | `job.startDate`, `crew_id` | `crew` availability | Overlap detection |
| Split Job into Phases | `job_phase[]` | `estimate.phase[]` | Reschedule cascades |

Calendar integrates with Google API (two-way).

### 3.4 Work Session (Mobile)
| State | Offline? | Sync Behaviour |
|-------|----------|----------------|
| Timer running | Yes | Local storage + background sync worker |
| Add Photo | Yes | Saves to `media` with `is_synced=false` |
| Note AI Summary | No | because OpenAI call |

### 3.5 Billing Center
| Trigger | Invoice Type | Data Needed |
|---------|--------------|-------------|
| Job Complete | Final | job total – deposits – prior phase invoices |
| Phase Marked Complete | Milestone | phase.amount |
| Manual | Ad-hoc | user enters |

Stripe integration:
* `payment_intent_id` stored in `invoice`
* Webhook updates `invoice.status=paid`

### 3.6 Insights
Aggregates:
* Revenue by trade type
* Crew utilisation (% billable hours)
* Estimate win-rate
Calculated nightly ETL to `report_*` tables.

---

## 4 · Interdependency Matrix

| Module ↓ needs → | Leads | Estimates | Jobs | Work Sess | Billing | Insights | Auth |
|------------------|-------|-----------|------|-----------|---------|----------|------|
| Leads | — | C | C |   |   |   | R |
| Estimates | R | — | C |   | C | R | R |
| Jobs | R | R | — | C | C | R | R |
| Work Session |   |   | R | — | C | R | R |
| Billing |   | R | R | R | — | R | R |
| Insights | R | R | R | R | R | — |   |

_R = read, C = create/update_

---

## 5 · Data Model Snapshot (Key Entities)

```
customer 1─∞ job
lead 1─1 customer? (nullable)
estimate 1─∞ estimate_item
estimate 1─∞ phase
estimate 1─1 job (after approval)
job 1─∞ time_entry
job 1─∞ media
invoice 1─∞ invoice_item
invoice N─1 phase? (nullable)
payment 1─1 invoice
user 1─∞ time_entry
```

Sensitive fields: customer phone/email, license numbers, Stripe tokens.

---

## 6 · Edge Cases & Potential Conflicts

| Area | Edge Case | Mitigation |
|------|-----------|------------|
| Lead Duplicate | Same phone diff name | Fuzzy match warn dialogue |
| Estimate Re-Send | Customer edits after sign | Force new version, keep audit |
| Offline Work | Tech logs time >24 h offline | Conflict-free merge, allow manual review |
| Job Drag Collide | Crew double-booked | Red badge + prevent drop |
| Milestone Invoice | Phase price updated post-invoice | Lock phase on invoicing or create change-order |
| Stripe Failure | Deposit paid but webhook lost | Reconcile job with `payment_intents.retrieve` on cron |
| Permissions | Tech downloads customer list | RBAC: tech no customer export scope |
| Media Privacy | Photo marked private but manually attached to portal | Portal respects `public=true`; UI warning on attach |

---

## 7 · Integration Points

| Service | Purpose | Failure Impact | Retry Strategy |
|---------|---------|----------------|----------------|
| **OpenAI** | AI draft & polish | Estimate delays | Cache & manual edit fallback |
| **Stripe** | Payments, deposits | Cash-flow | Exponential retry, admin alert |
| **Twilio SMS/SendGrid** | Reminders, follow-ups | Lower conversions | Batch retry next cron |
| **Google Calendar** | Two-way job schedule | Double booking risk | Observe `syncToken`, full resync on 410 |
| **AWS S3 / Cloudflare R2** | Media storage | Doc loss | Local queue then re-upload |
| **Puppeteer PDF** | Generate signed docs | Block acceptance | Render fallback view in portal |

---

## 8 · Trade-Specific Nuances

| Trade | Unique Field | Workflow Note |
|-------|--------------|---------------|
| Excavation | Equipment hours, fuel surcharge | Time tracking must tag machine |
| Plumbing | Parts SKU catalogue | Detailed estimate items library |
| Lawn Care | Recurring schedule option | Job repeats weekly/biweekly |
| HVAC | System model/serial, warranty years | Estimate & invoice templates include |
| Electrical | Permit #, inspection date | Job cannot mark complete until inspection logged |

Future config table: `trade_profile`.

---

## 9 · Workflow Risks & Open Questions

1. **Milestone vs % Billing** – current plan: milestone only. If % needed later, add `billing_mode` column.  
2. **Customer Portal Permissions** – per-file toggle `public`, but what about private notes?  
3. **Change-Orders** – how to append to multi-phase without confusing totals?  
4. **Recurring Jobs** (lawn) – require cron generation & invoice scheduler.  
5. **Inventory** – not MVP but parts SKUs for plumbing & HVAC soon.  
6. **Scaling AI Costs** – token quotas? Consider local LLM for polish job.

---

## 10 · Recommended Implementation Order (Risk-Minimised)

1. **RBAC & Data Model Base**  
2. **Navigation Refactor (6 Modules)**  
3. **Customer & Lead Core**  
4. **Estimate Workspace (template engine)**  
5. **Job Board + Calendar Integration**  
6. **Work Session Offline Layer**  
7. **Billing & Stripe**  
8. **Client Portal & Media Privacy**  
9. **Insights ETL**  
10. **Nice-to-haves** (recurring, inventory, route optimise)

Each phase includes unit + e2e tests to protect workflows.

---

## 11 · Conclusion

This analysis maps every journey, data dependency, and edge case for Tulboxx’s small-trade target. Addressing the highlighted risks before coding will prevent the fragmentation seen in v1 and deliver an intuitive, resilient CRM that finally frees small crews from spreadsheets.  

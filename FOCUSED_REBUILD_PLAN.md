# Tulboxx – Focused Rebuild Plan  
_For service businesses with ≤ 7 employees moving off spreadsheets_  
Date: 2025-06-13  

---

## 1 · Vision & Target

**Mission** – Replace “spreadsheet chaos” with one intuitive workspace that streamlines _Leads → Estimate → Job → Invoice → Payment_ in **≤ 7 clicks**.

**Primary Users**  
| Role | Daily Need | Device |
|------|-----------|--------|
| Owner / Manager | Pipeline, schedule crews, cash-flow visibility | Desktop & tablet |
| Field Technician | Today’s jobs, time & notes, photos | Mobile first |
| Office Admin | Enter leads, send invoices & reminders | Desktop |

**Success Metrics**  
| KPI | Baseline | Goal |
|-----|----------|------|
| Clicks: Lead → Invoice | 18 | ≤ 7 |
| Estimate Sign-rate (48 h) | 45 % | ≥ 75 % |
| Mobile daily active techs | 45 % | ≥ 80 % |
| Support tickets on nav | 32 / mo | < 10 / mo |

---

## 2 · Core Design Principles

1. **Task-Centric Modules (6 max)** – Leads, Estimates, Jobs, Work Session, Billing, Insights.  
2. **Single Source of Truth** – One record per customer/job; no duplicate entry.  
3. **Progressive Disclosure** – Show 80 % data up front, drill-down for detail.  
4. **Consistent Modal Strategy** – modals only for _quick actions_, never for data-heavy views.  
5. **Mobile-First Parity** – Same route structure; responsive layouts not separate pages.  
6. **Speed by Default** – Sub-200 ms API, offline caching for field use.

---

## 3 · Modal / Popup Usage Guidelines

| Use Modal When… | Example | Max Fields | Close Behaviour |
|-----------------|---------|-----------|-----------------|
| Quick add / edit ≤ 30 s | “+ New Lead”, “Edit Line Item” | 6 | Click outside, ESC |
| Confirmation dialogs | “Delete Job?”, “Send Invoice?” | 0–2 | Required action |
| Contextual preview | PDF Estimate preview, Photo lightbox | – | Click outside |

**Do NOT use modals for:**  
- Viewing full customer/job records  
- Multi-step wizards (>2 steps)  
- Data tables with scrolling

Full-screen pages or side drawers handle those cases.

---

## 4 · Feature Set Focused on Small Teams

### Tier-1 (Launch Blockers)
1. **Unified Database** – Leads & Customers merged view  
2. **AI Estimate Wizard** – Draft from notes, Residential vs Commercial tone  
3. **E-Signature & Acceptance** – Embedded canvas + Stripe deposit option  
4. **Drag-n-Drop Job Board / Calendar** – Reschedule & assign crew in one place  
5. **Mobile Work Session** – Timer, notes, photos, offline sync  
6. **Billing Center + Stripe Pay Links** – Invoice & collect instantly  

### Tier-2 (Differentiators, add once Tier-1 stable)
7. Automated SMS/Email reminders  
8. Two-way Google Calendar sync  
9. QuickBooks/Xero export  
10. Customer self-service portal  

### Tier-3 (Growth Enhancers)
11. Route optimization  
12. Recurring service plans  
13. Review request automation  

---

## 5 · Phased Implementation Roadmap

| Phase | Duration | Goals | Deliverables |
|-------|----------|-------|--------------|
| **0. Foundation** | 1 wk | Clean repo, CI/CD, Storybook design system | Monorepo setup, Tailwind + Radix UI kit |
| **1. Navigation Refactor** | 2 wks | Replace 18 routes with 6 modules | New router, left drawer, mobile tab bar |
| **2. Leads Module MVP** | 2 wks | Capture & convert leads | Lead list, quick-add modal, convert flow |
| **3. Estimate Workspace** | 3 wks | AI wizard, E-signature | Wizard UI, /api/ai endpoints, PDF/sign |
| **4. Job Board & Calendar** | 3 wks | Drag-n-drop scheduling | Board view, calendar sync stub |
| **5. Work Session Mobile** | 3 wks | Timer, notes, photos offline | PWA setup, background sync |
| **6. Billing Center** | 2 wks | Invoice + Stripe payment links | Invoice generator, webhooks |
| **7. Communication Hub** | 2 wks | SMS/Email reminders | Twilio integration, templates |
| **8. QA & Beta** | 2 wks | Usability testing with 10 pilot users | Bug fixes, polish, NPS survey |
| **9. Launch** | – | Public release | Prod infra, marketing site |

> Parallel track: **Performance & Security Hardening** runs every phase (rate-limit, RBAC, backup).

---

## 6 · Technical Stack Alignment

| Layer | Tech | Rationale |
|-------|------|-----------|
| Frontend | React + TypeScript, Vite, TanStack Query | Fast DX, cache, offline support |
| UI Library | Radix UI + Tailwind | Accessibility & speed |
| Backend | Express + TypeScript | Existing codebase, quick iteration |
| DB | PostgreSQL + Drizzle ORM | Simplicity, migrations, Neon serverless |
| AI | OpenAI (gpt-4o) via /api/ai | Best language quality |
| Auth | JWT + Passport + RBAC | Lightweight & secure |
| Payments | Stripe | Fastest to MVP |
| Comms | Twilio SendGrid/SMS | Ubiquitous tooling |
| DevOps | Docker, GitHub Actions, Fly.io | Simple deploy, scale to US region |

---

## 7 · Risk & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Scope creep | High | Delay | Strict Tier-1 lock before Tier-2 |
| AI cost overruns | Medium | $$ | Token limits, caching drafts |
| Modal misuse resurfaces | Medium | UX confusion | Enforce guidelines via code review |
| Offline sync conflicts | Low | Data loss | Conflict-free replicator, last-write-wins |

---

## 8 · Next Actions

1. Approve phased roadmap & modal guidelines.  
2. Kick-off **Phase 0**: repository cleanup and Storybook design tokens.  
3. Schedule weekly 30-min demos for continuous feedback.  

---

### Built right, Tulboxx becomes the _“no-brainer upgrade”_ from spreadsheets—minimal learning curve, maximum day-to-day impact for small service teams.  

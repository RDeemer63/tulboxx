# TULBOXX_PROJECT_STATUS.md  
**Last Updated:** 12 Jul 2025  

---

## 1. Project Overview  

Tulboxx is a lightweight, AI-enhanced CRM purpose-built for small trade-service businesses (excavation, lawn/land services, plumbing, etc.). It guides owners from **lead → estimate → job → work tracking → billing → insight** with a mobile-first user experience and enterprise-grade engineering practices.

*Target audience* • Crews ≤ 7 employees, often solopreneurs who currently juggle spreadsheets, paper and generic tools.  
*Core value props*  
• Fast estimate creation with AI & PDF output  
• One-tap job scheduling & field updates (offline capable)  
• Integrated invoicing / payments (Stripe)  
• GPS time-tracking & simple analytics  
• Feature-flagged releases for continual improvement  

---

## 2. Current Status  

### ✅ Legacy Code Modernisation (Completed)  
| Series | Tasks | Result |
|--------|-------|--------|
| **H-1 → H-4** | Archived V1 schema, consolidated PDF service | 75 % mem ↓ |
| **M-1 → M-3** | Repository & React cleanup, deprecated flags removed | Zero runtime legacy refs |
| **L-1 → L-5** | Code-wide scan, schema purge, migration scripts archived | Modern-schema-only runtime |

All legacy `estimates` / `permissions` tables, types and Zod schemas are isolated under `archived/`. Test suite, client and server now import **modernEstimates** exclusively.

### 📂 Codebase Hygiene  
* Global **Sentry** error / performance monitoring **enabled** (client bootstrap + filtered prod DSN)  
* **Navigation components finalised** – permission-aware **desktop drawer** & **mobile tab-bar**, route guards, progress bar & lazy-loading boundaries  
* **Authentication context & RBAC guards live** – JWT handling, `AuthProvider`, protected routes, modular permissions  
* **Core UI library (Blue Steel) seeded** – `Button`, `Input`, RHF `Form` helpers, `Card` container & design-tokens theme file integrated  
* **Progressive Onboarding Framework live** – business-profile wizard, completion meter, contextual nudges, route gating  
* **Business Profile Module backend live** – Drizzle schema, repository, REST API, logo upload endpoint, completion-status hook integrated with onboarding  
* **Mini-Dashboard Widgets live** – KPI `StatCard`s + metrics-provider contracts integrated into Dashboard  
* **Offline Groundwork live** – IndexedDB (Dexie) schema, background sync service, status hooks & indicators  
* **Leads Module groundwork underway** – database tables, repository layer, REST API endpoints & React Context with optimistic updates  
* Feature-flag infra intact  
* Coverage & CI green after purge  

### 🚧 Leads Module Progress  
Early implementation has begun:  
* Schema: `leads` & `lead_events` tables with source/stage enums, timeline support  
* Backend: `LeadRepository` with CRUD, stage transitions, automatic timeline logging  
* API: `/api/leads` CRUD endpoints scaffolded (create, list with filters, update, delete)  
* Front-end: `LeadsProvider` (React Context) powering optimistic updates, pagination & filtering  
* **Kanban Board shipped** – `leads-kanban-board`, `kanban-column`, `lead-card` React components with dnd-kit drag-and-drop  
  * Includes one-click actions (Call, Text, Create Estimate) directly on each card  
  * Lead-aging visual indicators (New / Aging / Needs Attention) on cards  
  * Optimistic stage transitions with offline-safe retries  
* Quick-capture form live with draft recovery & source dropdown (resume-draft toast)  
* **Lead Detail View delivered** – full detail pane with:  
  * Auto-generated timeline (notes, calls, status changes, estimate-created)  
  * Manual note entry + tabbed UI for future call / meeting logs  
  * One-click actions mirrored (Call, Text, Create Estimate) and timeline auto-logging  
  * Reminder groundwork & optional .ics export link  
  * FAB refined for notch-safe / thumb-reach positioning with subtle entrance animation  
* **Leads Mini-Dashboard live** – at-a-glance KPI panel with time-range filter (This Week / This Month)  
  * New Leads This Week card with trend indicator  
  * Leads by Stage stacked-bar visual (bottleneck spotting)  
  * Lead → Estimate Conversion Rate card (clearly labelled)  
  * Top Lead Sources donut chart (tag-normalised values)  
  * Average Time in Stage (Qualified → Proposal) card  
  * Responsive card/grid layout, mobile-first & skeleton/error states  
* **Leads Module MVP Functionally Complete** – quick-capture → pipeline → detail → dashboard loop fully operational, offline-safe, and feature-flag ready  

---

## 3. Frontend Development Roadmap  

_Phase 0: Core Infrastructure – 2 weeks_  
• Auth & RBAC • Drawer/Tab navigation with progressive onboarding  
• React-Query API layer (+ offline groundwork) • Shared UI (Blue Steel)  
• Sentry / modular lazy loading baseline  

_Phase 1: Modules (value-first order)_  

| Order | Module | Duration | Mini-Dashboard | Key Extras |
|------:|--------|----------|----------------|------------|
| 0 | **Business Profile Setup** | 1 w + 1 d | – | AI tone profiles, logo/branding wizard, progress bar |
| 1 | Leads | 3 w | Conv. rate, source chart | FB Lead Forms, shareable form, Zapier hook |
| 2 | Estimates | 5-6 w + 0.5 d | Win rate, avg value | AI doc gen, “Preview-as-client”, PDF, DnD line items |
| 3 | Jobs | 3 w | Upcoming schedule, status mix | Calendar, technician assign, materials |
| 4 | Billing | 4 w | Outstanding $, payment time | Stripe, receipts, aging report |
| 5 | Work (Field) | 3 w | Productivity, hrs logged | Offline, GPS clock-in, photo capture |
| 6 | Insights | 2 w | Full dashboards | Builds on prior mini-metrics |
| – | Global Communication Layer | parallel | Message counts | SMS/Email templates, logs |
| – | Settings & Roles (basic) | early & incremental | – | Team invites, audit log |

_Post-initial_: **Global Cross-Module Search** (+3 d), enhanced offline sync.

---

## 4. Key Decisions Made  

1. **Business Profile is Gate 0** – must be completed before any client-facing doc.  
2. **Feature-Flag-First Releases** – every major feature behind a toggle.  
3. **Modern Schema Only** – legacy tables/types removed from runtime.  
4. **AI Enhancements are Additive** – core flows work offline / without AI.  
5. **Mobile-First + Offline** – Work module designed for zero-coverage zones.  
6. **Mini-Dashboards Early** – each module surfaces its own KPIs; Insights aggregates later.  
7. **Error & Performance Budgets** – <1.5 s initial load, <50 ms critical edits.  
8. **Progressive Onboarding** – inline nudges and completeness meter drive adoption.  
9. **Context-Driven Auth & Protected Routes** – client JWT refresh + `ProtectedRoute` HOC enforce role/permission checks.  
10. **Sync Queue and Optimistic Updates** – Implemented an IndexedDB-backed sync queue with optimistic UI updates for a seamless offline-first experience.  

---

## 5. Technical Stack  

Frontend  | Backend  
--------- | ---------  
React 18 + TypeScript (Vite) | Node 18 / Express  
shadcn/ui + Tailwind + dnd-kit | PostgreSQL 15 + Drizzle ORM  
React Query + Zustand | Zod validation (full-stack)  
React Hook Form + Zod | JWT auth, RBAC middleware  
IndexedDB (Dexie + React Query integration + sync event system) | PDF via Puppeteer  
Sentry, Vite-splitting | Stripe SDK (payments)  
OpenAI GPT-4o (AI docs) | Jest, Playwright (tests)  

Dev tooling: ESLint • Prettier • Husky • ts‐node • Docker.

---

## 6. Next Steps (Sprint ‑ June 24 → July 5)  

1. **Kick-off Core Infrastructure**  
   - Scaffold nav shell, auth, Sentry hook, lazy loading.  
2. **Implement Business Profile Setup**  
   - Wizard screens, logo upload, tone profile select.  
   - Store profile in `business_profiles` table; expose `/api/profile`.  
3. Define **Smart Defaults Service** (backend & hook)  
4. Tech-spike: offline IndexedDB sync strategy (select schemas).  
5. UX design finalisation for Leads board & inline mini-metrics.  
6. **Mini-Dashboard Widgets** – KPI cards, data contracts, integrate with Dashboard  

Progress will be reflected in this status file after each sprint.  

---

## 7. Phase 1 – Remaining Tasks  *(July 6 target)*

> With the successful delivery of Offline Groundwork, **all Phase 1 Core Infrastructure items are now complete.**  

1. **✅ Authentication & RBAC Foundation – _completed_**  
   - JWT flow, session persistence, role hooks now active  
2. **✅ Navigation Components – _completed_**  
   - Desktop drawer, mobile tab bar, permission guards now live  
3. **✅ Shared UI & Theme Tokens – _nearly complete_**  
   - Tier-2 components added: `Dialog`, `Tabs`, `Accordion`, `Textarea`, `Select`, `Badge`, `StatCard`, `Toast` system  
   - Remaining: **Table & other data-display widgets**  
4. **✅ Progressive On-boarding Framework – _completed_**  
   - Multi-step Business-Profile wizard (Company Info, Branding, Legal, AI Prefs)  
   - Zustand store with persistent step tracking & % meter  
   - Inline nudges + toast prompts, tabs UI, route-gating until 100 %  
5. **✅ Offline Groundwork – _completed_**  
   - IndexedDB wrapper (Dexie), sync service, offline test harness  
6. **✅ Mini-Dashboard Widgets – _completed_**  
   - Re-usable KPI card component, datasource contracts, module metrics providers  

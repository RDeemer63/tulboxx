# Tulboxx – New Estimate Template Design  
_v1 · 2025-06-13_

---

## 0 · Purpose  
Provide a **single, flexible template system** that:

1. Serves **Quick** and **Detailed** estimates.  
2. Adapts language & visuals to **Residential vs Commercial** clients.  
3. Supports **Multi-Phase** jobs with progress invoicing.  
4. Lets users toggle / omit any section without breaking layout.  
5. Fits the new **Estimate Workspace** (full-screen editor) for desktop & mobile.

Success = homeowner or property-manager can grasp scope, price & timeline in ≤ 2 minutes and sign/pay deposit without confusion.

---

## 1 · Template Architecture  

| Layer | Responsibility |
|-------|----------------|
| **Template JSON** | Declarative section list & default visibility |
| **Renderer** | React components that read JSON → HTML / PDF |
| **Adaptation Engine** | Applies Residential/Commercial copy presets & color accents |
| **Workspace UI** | Drag-drop sections, toggle visibility, reorder |
| **PDF → E-Sign Pipeline** | HTML → Puppeteer-PDF → signature fields → Stripe deposit link |

### 1.1 Template JSON Schema (simplified)

```json
{
  "layout": ["header","summary","scope","items","timeline","proof","warranty","certs","payment","signature"],
  "sections": {
    "summary": { "type":"adaptiveText", "visible":true },
    "scope":   { "type":"bulletList",  "visible":true, "allowsMedia":true },
    "items":   { "type":"lineTable",   "visible":true, "multiPhase":true },
    "proof":   { "type":"testimonial", "visible":false },
    "warranty":{ "type":"textBlock",   "visible":true },
    "certs":   { "type":"bizDocs",     "visible":true, "source":"business_profile" },
    "payment": { "type":"totalsBox",   "visible":true },
    "signature":{ "type":"acceptBox",  "visible":true }
  },
  "style":"residential"            // "commercial"
}
```

---

## 2 · Modular / Optional Sections  

| Section (id) | Default | Why It Wins | Hide Rule |
|--------------|---------|------------|-----------|
| header | always | Branding & trust | n/a |
| summary | R=yes, C=yes | Sets emotional / ROI hook | user toggle |
| scope | yes | Clarity of work | user toggle |
| items | yes | Price detail | cannot hide, but can collapse |
| timeline | C=yes, R=opt | Shows professionalism | hide if duration < 1 day |
| proof | R=opt, C=hide | Social proof vs NDA | on/off switch |
| warranty | R=yes, C=opt | Reduces risk anxiety | user toggle |
| certs | C=yes, R=opt | Compliance confidence | auto-show if docs exist |
| payment | yes | Deposit / financing | cannot hide |
| signature | yes | Easy acceptance | cannot hide |

_(R=Residential default, C=Commercial default)_

---

## 3 · Residential vs Commercial Adaptation  

| Element | Residential Style | Commercial Style |
|---------|-------------------|------------------|
| Color Accents | Warm Orange (#F97316) | Steel Blue (#3B82F6) |
| Tone Preset | Friendly, “your home” | Direct, metric-driven |
| Proof Block | Homeowner testimonial w/ photo | KPI case study snippet |
| Summary Text | 2-3 sentences, benefits | Bullet ROI, risk mitigation |
| Timeline | Hidden by default | Visible, Gantt bar |
| Certs | Hidden unless toggled | Shown if docs present |

Implementation: `style` property in template JSON triggers CSS variables & text snippets.

---

## 4 · Multi-Phase Support  

### 4.1 Data Model (Drizzle)

```ts
estimates
  id PK
  is_multi_phase boolean
  phases jsonb          // [{name, scope, amount, startDate, duration}]

invoices
  phase_index int null  // null = overall, else link to estimate.phases[idx]
```

### 4.2 Editor UX

```
┌── Phase Builder ─────────────────────────────────────┐
│ [ + Add Phase ]                                      │
│ Phase 1  Demo & Rough-in   $4 800  ▶ edit            │
│ Phase 2  Finish & Inspection $6 200 ▶ edit           │
└───────────────────────────────────────────────────────┘
```

* Drag-reorder phases.  
* “Invoice Phase” button appears when Job marks phase complete.  
* Totals Panel shows subtotal per phase and project grand total.

### 4.3 Client View  
Progress bar in portal: `███▒▒` 60 % complete.  
Phased invoices list under “Billing”.

---

## 5 · Estimate Workspace UI / UX  

### 5.1 Layout (Desktop ≥1024 px)

```
┌──────────── Estimate List (30 %) ───────────┬─── Editor (70 %) ─┐
│  • Draft 1058                               │ [Header □]        │
│  • Sent 1057                                │ [Summary ✎ | 👁]   │
│  • …                                        │ [Scope   ✎ | 👁]   │
│                                             │ [Line Items table] │
│                                             │ [+ Phase]          │
│                                             │ [Totals  $▸]       │
│                                             │ [Signature box]    │
└──────────────────────────────────────────────┴────────────────────┘
```

* **👁 icon** toggles visibility; drag handle to reorder.  
* Left list shows status badges & quick filters (Draft/Sent/Accepted).  
* Right column scrolls independently; Totals box floats on scroll.  
* **AI Assist Panel** (slide-over) provides “Generate from Notes” & “Polish Line”.

### 5.2 Mobile (< 1024 px)

* Drawer navigation for list.  
* Sticky section tabs at top.  
* Totals + Accept button pinned at bottom.

### 5.3 Accessible Modals (only)

| Modal | Trigger | Fields |
|-------|---------|--------|
| Add Phase | “+ Phase” | name, price, dates |
| Insert Photo | “Attach” | media picker |
| Delete Confirm | trash icon | none |

No long forms in modals.

---

## 6 · Implementation Guidelines  

1. **Template Storage** – save JSON blob per estimate; renderer always respects it.  
2. **Adaptive Copy** – use Handlebars helpers: `{{#if isResidential}}` etc.  
3. **Renderer Components** – pure-presentational; no DB calls.  
4. **Workspace State** – TanStack Query + Zod schema validation.  
5. **PDF Engine** – server-side Puppeteer; same HTML as renderer.  
6. **E-Signature** – canvas overlay; on sign → `estimates.status='approved'`.  
7. **Stripe Deposit** – `/api/payments/deposit` returns pay-link; show after accept.  
8. **Client Portal** – respects `visible` flags; photos/docs marked `public=true`.  

---

## 7 · Developer Checklist  

- [ ] Build `TemplateEditorContext` for drag-drop & visibility toggles.  
- [ ] Migrate existing quick/detailed modal into full workspace route.  
- [ ] Implement Residential/Commercial style switcher with CSS vars.  
- [ ] Add Phase builder UI & CRUD.  
- [ ] Extend line-item table for AI “Suggest” & “Polish”.  
- [ ] Footer injection of biz docs (certs, insurance).  
- [ ] Signature + Stripe deposit flow.  
- [ ] Automated Jest + Playwright tests for PDF output regressions.  

---

## 8 · Success Metrics  

| Metric | Target |
|--------|--------|
| Time to create & send quick estimate | ≤ 3 min |
| Acceptance rate within 48 h | ≥ 75 % |
| % estimates using phased option | ≥ 25 % (commercial) |
| User satisfaction (post-send prompt) | ≥ 4.5 / 5 |
| Support tickets “how to edit estimate” | < 5 / month |

---

_Tulboxx will now deliver crystal-clear, psychologically tuned estimates that convert leads into revenue faster than any spreadsheet ever could._  

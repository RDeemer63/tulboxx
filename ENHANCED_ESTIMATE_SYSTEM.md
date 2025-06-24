# Enhanced Estimate System & Contextual Media Plan  
_Tulboxx CRM · v1 · 2025-06-13_

---

## 1 · Current State Recap
| Mode | Component | Strengths | Pain-Points |
|------|-----------|-----------|-------------|
| **Quick Estimate** | `UnifiedEstimateCreator → tab=quick` | Fast single-price quote, inline AI “polish” | Limited description depth, can’t show certifications, no e-signature |
| **Detailed Estimate** | `UnifiedEstimateCreator → tab=detailed` | Line items, terms, AI polish per field | Long form inside modal, no business docs, photos/docs navigation separate |

---

## 2 · Enhancement Objectives
1. **Keep dual-mode flexibility** while unifying UI patterns.  
2. **Surface Business Profile assets** (certifications, insurance, licenses) automatically on estimates & invoices.  
3. **Boost AI assist** – full draft from notes, targeted polish, cost-margin warnings.  
4. **Replace standalone “Photos / Documents” nav** with **contextual media panels** tied to Customer & Job records.  
5. **Support e-signature & Stripe deposit links** on both estimate types.  

Success = _estimate → signed → job_ in ≤ **3 min** for simple quotes, ≤ **7 min** for detailed ones.

---

## 3 · UX Redesign

### 3.1 Wrapper Pattern  
Move `UnifiedEstimateCreator` **out of modal** → dedicated _Estimate Workspace_ route (`/estimates/new`, `/estimates/:id/edit`).

```
┌── Estimate List (left 30 %) ─┬── Workspace (right 70 %) ────┐
│ • Draft 1058                 │  Header: Customer   Status   │
│ • Sent 1057                  │  Tabs: Quick | Detailed      │
│ • …                          │  Form (scroll)               │
└──────────────────────────────┴──────────────────────────────┘
```

### 3.2 Quick Estimate Enhancements
* Add optional **Deposit $** field (triggers Stripe link).  
* AI “Improve description” button remains.  
* Inline preview of attached business docs footer.

### 3.3 Detailed Estimate Enhancements
* **Notes-to-Draft** side drawer → drag notes/photos into estimate.  
* **Line-Item AI**:  
  * `+/AI Suggest` generates common services from note keywords.  
  * ✨ polish icon per row.  
* **Totals panel** floats on scroll (shows margin %, tax, deposit).

### 3.4 Certifications & Docs Injection
* Footer zone with toggle switches:
  * `✔ License #`  
  * `✔ Insurance Proof`  
  * `✔ Certifications`  
* Auto-pulls latest file from **Business Profile Store**.

---

## 4 · Data Model Updates (Drizzle)

### 4.1 New Tables / Columns
```ts
business_profile
  id PK
  license_number text
  insurance_doc_url text
  certifications jsonb   -- array of {name,url}

estimates
  ...
  include_license boolean default false
  include_insurance boolean default false
  include_certs boolean default false
  deposit_amount numeric   -- nullable
```

### 4.2 Media Storage
```
media
  id PK
  entity_type enum('customer','job','estimate')
  entity_id  FK
  url text
  type enum('photo','document')
  uploaded_by
  uploaded_at
```

---

## 5 · API Contract Changes

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/estimates/:id/docs` | GET | Returns URLs for selected biz docs |
| `/api/media` | POST | Upload photo/doc tied to entity |
| `/api/ai/estimate/draft` | POST | Existing, add `deposit` & `customerType` |
| `/api/payments/deposit` | POST | Creates Stripe payment link |

---

## 6 · Contextual Media Strategy

### 6.1 UI Access
* **Customer Profile** → “Media” tab (shows all customer-level files).  
* **Job View** → side panel “Photos & Docs”.  
* Estimate Workspace right drawer → drag job/customer media into estimate body.

### 6.2 Navigation Cleanup
Remove `/photos` and `/documents` routes from main nav.  
Search still finds media via global command-K.

### 6.3 Mobile Capture Flow
`Work Session → Job → + Photo` saves with `entity_type='job'`.  
Offline cache then sync.

---

## 7 · PDF & Signature Pipeline

1. Generate HTML with selected biz docs footer.  
2. Convert via `puppeteer` → PDF.  
3. Embed signature fields (canvas) or external DocuSign fallback.  
4. On sign, webhook → `estimates.status = 'approved'` and creates Job.

---

## 8 · Migration Plan
1. **Schema migration** – add columns & media table.  
2. **Backend** – update `/api/estimates` CRUD.  
3. **Move media files**:  
   `UPDATE media SET entity_type='customer', entity_id=job.customer_id WHERE …`  
4. **Refactor UI** – replace modal with workspace, add drawers.  
5. **Remove Photo/Doc nav items**.  
6. QA with 5 pilot users.

---

## 9 · KPIs & Timeline
| Milestone | Weeks | KPI |
|-----------|-------|-----|
| Workspace + docs footer | 2 | 80 % testers prefer new flow |
| AI line-item assist | 1 | 50 % reduction manual typing |
| Contextual media live | 1 | 0 standalone media nav clicks |
| E-sign + deposit | 1 | 75 % signed within 48 h |

_Total: 5 weeks (parallelizable with nav refactor)._

---

## 10 · Open Questions
1. Allowed file types & max size for certifications/insurance?  
2. Deposit rules (flat %, custom)?  
3. Need watermark on unsigned PDFs?  

---

### Ready to build — this plan keeps dual estimate power, adds AI & compliance docs, and makes media truly contextual while eliminating navigation clutter.

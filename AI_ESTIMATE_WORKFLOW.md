# AI-Powered Estimate Generation Workflow  
_Tulboxx CRM · v1 · 2025-06-13_

## 1 · Goal  
Convert raw field notes from technicians or sales reps into polished, professional estimates in **under 3 minutes**, tailor the tone for **Residential** or **Commercial** customers, and require *zero copy-paste*.

---

## 2 · High-Level Flow  

| Step | Actor | UI Surface | AI Role | Output |
|------|-------|-----------|---------|--------|
| 1. Capture Notes | Field Tech | Mobile “Work Session” ➜ **Notes Drawer** | — | Unstructured text, photos, voice-to-text |
| 2. Open Estimate Wizard | Office/Admin | **Estimate Workspace** (right panel) | Detect customer type | Prefilled “Smart Draft” |
| 3. Review & Tweak | Admin/Owner | Same panel | “Polish line” per row | Editable line items & summary |
| 4. Send for Signature | Admin/Owner | Click **Send** | — | PDF + e-signature link |
| 5. Sign & Accept | Customer | Email/Web | — | Signed PDF → Job status “Approved” |

---

## 3 · Detailed UX  

### 3.1 Notes Capture  
- **Quick Add** button in Work Session (camera, voice, text).  
- All notes automatically tagged to the Job / Lead.  
- Offline capable; syncs when connection returns.

### 3.2 Estimate Wizard (3-pane layout)  

```
┌────────── Lead / Job Info ─────────┬────── Smart Draft ──────┬── Context Panel ──┐
│ Customer, Site, Contacts          │ Line Items table        │ Field Notes       │
│ Type toggle: ● Residential ○Comm  │  Qty  Desc  Price       │ Photos, Voice txt │
│ [+] Import Notes                  │  1   …     $…           │ History           │
└────────────────────────────────────┴─────────────────────────┴───────────────────┘
```

Primary CTA: **“Generate Smart Draft”** (greyed until at least one note exists).  
Secondary CTAs: _Regenerate_, _Polish Line_, _Add Item_, _Preview_.

### 3.3 “Polish Line” Interaction  
Hover any description → click ✨ icon  
AI rewrites only that row, preserving quantities & pricing.

---

## 4 · Customer-Type Detection  

1. **Source**  
   * CRM “Company Type” field (`'residential' | 'commercial' | null`).  
   * Heuristic fallback: domain email ends with company suffix → commercial.  

2. **Confidence**  
   * `high` if explicit field, `medium` if heuristic, `low` if none.  
   * If `low`, wizard asks: _“Is this a home owner or a business?”_  

3. **Prompt Modifiers**  
   Residential → warm, trust-building, fewer acronyms.  
   Commercial → ROI, timelines, compliance language.

---

## 5 · Prompt Engineering Spec  

### 5.1 System Prompt  
```
You are an expert estimator for a {SERVICE_TYPE} company.
Generate a concise, professional estimate.
Audience: {CUSTOMER_TYPE}.
Language: {TONE_GUIDE}.
Currency: USD.
Return JSON: {header, lineItems[], subtotal, tax, total, terms}
```

### 5.2 User Prompt Template  
```
FIELD_NOTES:
{NOTES}

BUSINESS_CONTEXT:
- Service offered: {SERVICE_TYPE}
- Materials catalog: {CATALOG_SNIPPET}

CUSTOMER_CONTEXT:
- Name: {CUSTOMER_NAME}
- Property: {PROPERTY_INFO}

OUTPUT INSTRUCTIONS:
- Derive clear line items (max 12)
- Use present tense action verbs
- Include warranty if applicable
```

### 5.3 “Polish Line” Prompt  
```
Rewrite the following line item description
to be clear and persuasive, keep technical accuracy,
do NOT alter quantity or price.

INPUT: "{LINE_DESC}"
AUDIENCE: {CUSTOMER_TYPE}
```

### 5.4 Temperature & Model Settings  
| Task | Model | Temp | Max Tokens |
|------|-------|------|------------|
| Draft Estimate | gpt-4o | 0.4 | 800 |
| Polish Line | gpt-4o | 0.6 | 120 |

---

## 6 · Data & API  

- **POST /api/ai/estimate/draft**  
  Body: `jobId`, `notesIds[]`, `customerType?`, `serviceType`  
  Returns: `draftId`, `estimateJSON`, `confidence`, `messages[]`

- **POST /api/ai/estimate/polish**  
  Body: `lineId`, `customerType`  
  Returns: `{lineId, newDescription}`

- **Webhook /signature-complete**  
  Updates estimate status ➜ auto-create Job.

---

## 7 · Error & Edge Cases  

| Scenario | UX Handling |
|----------|-------------|
| Model returns invalid JSON | Retry silently once, else show “AI hiccup” toast with manual edit option |
| Customer type low confidence | Prompt user selection before draft |
| Large note payload (>6k tokens) | Chunk notes, summarise first |
| Model quota exceeded | Fall back to cached “last good” generation or allow manual creation |

---

## 8 · Success Metrics  

| Metric | Target |
|--------|--------|
| Avg time: notes → sent estimate | ≤ 3 min |
| % estimates sent without manual edits | ≥ 60 % |
| Signature rate within 48 h | ≥ 75 % |
| Support tickets re: “confusing estimate flow” | < 5 / month |

---

## 9 · Future Enhancements  

1. **Voice-only workflow**: tech dictates notes → AI auto-drafts estimate.  
2. **Multilingual output** based on customer locale.  
3. **Cost margin checker** warns if markup < threshold.  
4. **AI-suggested photos** auto-embed before/after comparison captions.

---

**Deliverable Ready** – this document defines the UX, prompting, API contracts, and KPIs for Tulboxx’s AI-powered estimate system. Development can begin with Wizard UI scaffolding and endpoint stubs.

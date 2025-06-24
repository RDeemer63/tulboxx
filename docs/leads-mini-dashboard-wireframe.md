# Leads Mini-Dashboard Wireframe

**Purpose**  
Provide a low-fidelity, implementation-ready blueprint for the Leads Mini-Dashboard.  The dashboard surfaces five high-value metrics, is mobile-first, and re-uses existing Blue Steel UI primitives (`StatCard`, `Card`, `Badge`, `Select`, `Skeleton`, etc.).

---

## 1. Core Layouts (ASCII)

### 1.1 Mobile (< 640 px)

```
┌───────────────────────────────┐
│  📈 Leads Dashboard           │
│  Range: [ This Week ▾ ]       │
├───────────────────────────────┤
│ [StatCard] New Leads This Week│
├───────────────────────────────┤
│ [BarStack] Leads by Stage     │
│  ▓▓ New  ░ Contacted …        │
├───────────────────────────────┤
│ [StatCard] Lead → Estimate    │
│            Conversion Rate    │
├───────────────────────────────┤
│ [Donut] Top Lead Sources      │
│      • Web 40% • Ref 30% …    │
├───────────────────────────────┤
│ [StatCard] Avg Time in Stage  │
│            (Qualified→Prop.)  │
└───────────────────────────────┘
```

### 1.2 Desktop (≥ 1024 px)

```
┌──────────────────────────────────────────────────────────────┐
│  📈 Leads Dashboard                             Range ▾     │
├────────────────────────┬────────────────────────┬───────────┤
│ New Leads This Week    │ Lead → Estimate        │ Avg Time  │
│ [StatCard]             │ Conversion Rate        │ in Stage  │
│                        │ [StatCard]             │ [StatCard]│
├────────────────────────┴────────────────────────┼───────────┤
│                 Leads by Stage (Stacked Bar)                 │
│ ▓▓▓ New ░░ Contacted ▒▒ Qualified ▤ Proposal ▥ Won ▨ Lost     │
├──────────────────────────────────────────────────────────────┤
│ Top Lead Sources (Donut / List)                              │
│  • Web 40 %  • Referral 30 % …                               │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Metric Cards & Visualisation Types

| Metric | Component | Visualisation | Details / Notes |
|--------|-----------|--------------|-----------------|
| **New Leads This Week** | `StatCard` | Large count + Δ vs. previous period | Tap → list pre-filtered to “created this week”. |
| **Leads by Stage** | `Card` with compact **stacked bar** | Bar segments sized by count; legend inline | Hover/press on segment → tooltip with count & %. |
| **Lead **→** Estimate Conversion Rate** | `StatCard` | Percentage + up/down arrow | **Label exactly:** *Lead to Estimate Conversion Rate* |
| **Top Lead Sources** | `Card` | Donut chart + ordered list | Sources limited to top 4, “Other” bucket auto-grouped. |
| **Average Time in Stage** (Qualified → Proposal) | `StatCard` | Number of days | Basis: diff between first “Qualified” event and first “Proposal” event per lead. |

All cards show a `Skeleton` placeholder during loading and a ⚠️ icon on error.

---

## 3. Time-Range Filter

* Component: `Select` / `SegmentedToggle` fixed in header.  
* Options: **This Week**, **This Month** (future: custom).  
* Changing range re-queries all five metrics in parallel (React Query).

---

## 4. Source Tracking Standardisation

* **Data entry**: Quick-capture form uses a **dropdown/tag picker** seeded with common values (`Website`, `Referral`, `Social Media`, `Walk-up`, `Advertisement`, `Other`).  
* **Governance**:  
  * Users **cannot edit** `source` once lead reaches **Qualified** stage (prevents metric skew).  
  * Admin can manage source list in Settings (future).  
* **Reporting**: Dashboard queries aggregated `source` column ensuring clean, comparable data.

---

## 5. Loading & Empty States

| State | Behaviour |
|-------|-----------|
| **Loading** | Each card shows `Skeleton` shimmer; charts display grey placeholders. |
| **No Data** | Card body replaces metric with “No data for selected range” + subdued icon. |
| **Error**   | Red outline + small retry button inside card footer. |

---

## 6. Responsive Behaviour

| Breakpoint | Layout Rules |
|------------|--------------|
| `< 640 px` | Single-column stacked cards (see mobile ASCII). |
| `640 – 1023 px` | Two-column masonry (metrics top row, bar + donut full-width). |
| `≥ 1024 px` | Grid: 3 metric cards top, bar chart full-width middle, donut bottom (desktop ASCII). |
| **General** | Cards are flex-children with `min-width: 280px`; container uses `gap:16px`. |

---

## 7. Interactive Elements

1. **Metric Taps / Clicks**  
   * Count & percentage cards navigate to pre-filtered Leads list or Estimates list.
2. **Bar Chart Segments**  
   * Hover/press reveals tooltip (`Stage: count (percent)`).
3. **Donut Chart Segments**  
   * Press to filter Leads list by source (future flag).
4. **Header Time-Range Toggle**  
   * Instant re-fetch with loading skeletons.

---

## 8. Visual Hierarchy & Colour

* **Primary colour (#0070D2)** reserved for interactive accents (hover, selected range).  
* **Stage colours** reuse Kanban palette for mental consistency.  
* Percent trend arrows: green ↑ for improvement, red ↓ for decline.

---

## 9. Implementation Notes

* Data selectors live in `/client/src/hooks/analytics/leads.ts`.  
* Each metric query memoised & cached by `(metric, range)` key.  
* Use React Query’s `refetchOnWindowFocus` to keep dashboard fresh.  
* Charts built with `recharts` (already dependency) wrapped in `MiniChart` component for reuse.  

---

### Deliverables

1. `LeadsMiniDashboard.tsx` – main container  
2. `MiniMetricCard.tsx` – reusable stat card  
3. `MiniBarChart.tsx`, `MiniDonutChart.tsx` – compact chart wrappers  
4. Tests: snapshot + selector unit tests (`__tests__/mini-dashboard.spec.tsx`)  

This wireframe provides clear guidance for developers and designers to build an intuitive, mobile-first mini-dashboard that surfaces actionable lead insights while maintaining data integrity. 
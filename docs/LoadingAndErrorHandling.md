# Loading & Error-Handling Guide (Tulboxx)

_Last updated: 27 Jun 2025_

Tulboxx’s philosophy is **“transparent to users – observable to devs”**:

* Users must always see clear loading or error feedback.
* Devs must get actionable telemetry in Sentry.
* Patterns are **consistent** across modules so copy-pasting code “just works”.

---

## 1 React Query Guidelines

| Area | Practice | Why |
|------|----------|-----|
| **Queries** | Prefer `useQuery` with `staleTime` >= 30 s for lists, 0 for details. | Reduces refetch spam, keeps detail views fresh. |
| | Always name keys with **scope → id** pattern: `['leads','list']`, `['estimate',id]`. | Enables fine-grained `invalidateQueries`. |
| | Co-locate `queryFn` in `/lib/api/…` to share in React Native / tests. | Single source of truth. |
| **Mutations** | Use optimistic updates + `queryClient.setQueryData` where UI must stay snappy (e.g. Kanban). | 140 ms latency target. |
| | Invalidate only affected lists: `invalidateQueries(['leads','list'])`. | Avoids global refetch storms. |
| **Lifecycle hooks** | `onError` = toast + `captureException`. <br>`onSettled` = invalidate relevant queries. | User notices → dev gets stack. |
| **Retry** | Queries: `retry: 3` exponential. <br>Mutations: `retry: 0` (let user retry). | Don’t double-act on server changes. |
| **Suspense** | Wrap route pages in `<Suspense />` with skeleton fallback. | Keeps layout first paint fast. |

### Example (good)

```ts
const { data: leads } = useQuery({
  queryKey: ['leads', 'list'],
  queryFn: api.leads.list,
  staleTime: 60_000,
  suspense: true,
});
```

### Anti-pattern (bad)

```ts
useQuery(['leads'], fetchLeads, { suspense:false, retry:0 });
//   • key too generic  • suspense off breaks consistent UX
```

---

## 2 Error Boundaries & Fallbacks

| Layer | Component / Hook | User view | Dev view |
|-------|------------------|-----------|----------|
| **Global** | `<ErrorBoundary>` in `AppLayout` | Friendly full-screen (“Restart app”) | Auto-captured in Sentry |
| **Route** | `<Suspense fallback={<SkeletonPage/>}>` | Skeleton until data | — |
| **Component** | local `<ErrorBoundary>` (e.g. AI draft editor) | Inline retry button | `captureException` with `componentStack` |
| **API/Mutation** | `useMutation.onError` | Toast “Couldn’t save” | `captureException(error,'saveLead')` |

Create special fallbacks **per domain** (e.g. Estimate editor shows “Reconnect to continue editing”).

---

## 3 Loading State Patterns

### 3.1 Components

| Pattern | Component / Hook | Use case |
|---------|------------------|----------|
| **Global bar** | `<ProgressBar>` + `useProgress` | Route navigation, onboarding |
| **Inline skeleton** | `<Skeleton>` (shadcn) | Lists, cards, tables |
| **Indeterminate** | `simulateProgress()` | AI draft, PDF generation |
| **Tiny spinners** | `<Loader2 className="h-4 w-4 animate-spin" />` | Buttons (`loading` prop in `<Button>`) |
| **Stat loading** | `<StatCard loading />` | Dashboard widgets |

### 3.2 Loader rules

1. **>300 ms** predicted → show loader (use `setTimeout` 150 ms gate to avoid flash).
2. Keep layout stable (skeletons mimic final width/height).
3. Remove loader **200 ms** after 100 % to avoid flicker.

---

## 4 Form & API Error Patterns

* **React Hook Form + Zod** – Validation runs client side _and_ server side.
* Server should return `{ message, fieldErrors }`.
* Show field error via `<FormMessage>`, toast unknown errors.

Example:

```ts
onError: (err: ApiError) => {
  if (err.fieldErrors) return; // RHF handles
  toast.error({ title: 'Save failed', description: err.message });
  captureException(err,'estimateSave');
}
```

Bad:

```ts
catch(e){ alert(e) } // blocks thread, no telemetry
```

---

## 5 Toast System

| Type | Purpose | When |
|------|---------|------|
| `toast.success` | Happy path confirmation (“Estimate sent”) | Brief actionable feedback |
| `toast.error`   | Non-field API errors | After retryable failures |
| `toast.info`    | Onboarding nudges (“Add your logo next”) | Contextual guidance |

Guidelines:

1. **One toast at a time** (`useToast` enforces ≤3).
2. Keep to **<60 chars title** + **<120 chars description**.
3. Link to next action (e.g. “Open invoices”).

---

## 6 Sentry Instrumentation

* Initialize in `main.tsx` via `initializeSentry()`.
* Attach user context after login: `setSentryUser({ id, email, companyId })`.
* `beforeSend` filters dev/local, common network noise.
* Wrap _manual_ catches: `captureException(err, 'context tag')`.
* For performance: `const txn = startTransaction('estimate/pdf'); … txn.finish()`.

---

## 7 Good vs Bad Cheatsheet

| Scenario | Good | Bad |
|----------|------|-----|
| Data fetch error | Toast + boundary fallback | `console.error` only |
| Long AI draft | `simulateProgress()` bar, allow cancel | Spinner with no % |
| Save form | Disable button, show inline errors | Double-submit possible |
| Unknown crash | Boundary → Sentry event | White screen |
| Network offline | `syncStatus==='offline'` banner | Silent failure |

---

## 8 Checklist for Devs

- [ ] Wrap pages in `Suspense` + `ErrorBoundary`.
- [ ] Use `useProgress` for any async >500 ms.
- [ ] Use React Query default retry rules.
- [ ] Capture every `.catch` with Sentry + user toast.
- [ ] Form APIs return `{fieldErrors}`; map to `<FormMessage>`.
- [ ] No `alert()`, `confirm()`, or silent fails in prod.

Copy these patterns; update this doc if you must deviate. Consistency is leverage.  

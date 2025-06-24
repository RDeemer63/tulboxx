# Tulboxx CRM Design System (“Blue Steel”)

A premium, Salesforce-inspired visual language crafted for service-business owners who need power without complexity.

---

## 1  Design Philosophy

| Principle | What it Means in Tulboxx |
|-----------|-------------------------|
| Radical Simplicity | Every pixel earns its keep. We remove, then remove again, until the experience is obvious. |
| Familiar Professionalism | Feels like Salesforce: confident blues, clear hierarchy, enterprise polish. |
| Speed by Design | 140 ms open/close targets, 300 ms max animations, 60 fps scrolling. |
| Accessible for All | WCAG 2.2 AA or better, full keyboard support, smart focus rings. |
| Brand Warmth | A single orange accent evokes helpfulness and action. |

---

## 2  Core Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Primary `--color-primary` | #0070D2 | Actions, links, highlights |
| Primary-Hover | #005BB5 |
| Accent `--color-accent` | #FF8C00 | CTAs, success path, empty-state illustrations |
| Success | #22C55E |
| Warning | #F59E0B |
| Danger | #EF4444 |
| Info | #06B6D4 |
| Gray-900 | #111827 Primary text |
| Gray-700 | #374151 Secondary text |
| Gray-200 | #E5E7EB Borders / Hairlines |
| Gray-50 | #F9FAFB Canvas |

_All colors generated as CSS variables; Tailwind theme extended via `colors: { primary: "hsl(var(--color-primary))", … }`._

---

## 3  Typography

| Level | Size / Weight | Usage |
|-------|--------------|-------|
| Display | 40 / 800 | Marketing splash |
| H1 | 30 / 700 | Module titles |
| H2 | 24 / 600 | Section headings |
| H3 | 20 / 600 | Card titles |
| Body lg | 16 / 400 |
| Body sm | 14 / 400 |
| Mono | `SFMono, Menlo` 12–14 | Numbers & code |

Font stack: `Inter, "Helvetica Neue", ui-sans-serif, system-ui, sans-serif`.

Line-height: 1.4; Letter-spacing: −0.2 px for headings, 0 for body.

---

## 4  Spacing & Layout

Base unit **4 px**.  
`spacing = 4n` → 4 • 8 • 12 • 16 • 24 • 32 • 48.

• Card padding = 24 px  
• Drawer padding = 32 px desktop / 20 px mobile  
• Column gutter = 16 px  
• Section vertical rhythm = 48 px

Grid: CSS Grid / Flexbox, max-width 1440 px, 12 columns for desktop, 4 columns mobile.

---

## 5  Elevation & Shadows

| Level | Shadow | Usage |
|-------|--------|-------|
| 0  | none | Base canvas |
| 1  | 0 1 2 rgba(0,0,0,.04) | Cards, inputs |
| 2  | 0 4 8 rgba(0,0,0,.06) | Popovers, dropdowns |
| 3  | 0 8 24 rgba(0,0,0,.08) | Modals, side-drawers |

No multiple stacked shadows; elevate on hover by **+1 level** only.

---

## 6  Motion & Micro-interaction

| Guideline | Value |
|-----------|-------|
| Duration | 150–300 ms |
| Easing | `cubic-bezier(.4,0,.2,1)` |
| Enter / Exit | 20 px slide + fade |
| Drag & Drop | 0 ms follow cursor, 100 ms snap |
| Skeletons | Pulse 1.4 s infinite |

Use motion to clarify, never to decorate.

---

## 7  Component Guidelines (shadcn/ui + Tulboxx additions)

### 7.1 Buttons
| Variant | Background | Text | Shadow |
|---------|------------|------|--------|
| Primary | Primary | White | Level 1 |
| Secondary | Gray-50 | Gray-900 | None |
| Ghost | Transparent | Primary | None |
| Destructive | Danger | White | Level 1 |

Minimum click target 44 × 44.

### 7.2 Form Inputs
• 12 px inner padding, 2 px radius, 1 px Gray-200 border  
• Focus: 2 px Primary ring (`outline-offset:2`).  
• Error: border Danger, helper text Danger-600.

### 7.3 Cards
• 24 px padding, Level 1 shadow, 4 px radius.  
• Header / Content / Footer slots.

### 7.4 Drawers & Modals
• Level 3 shadow, slide X 32 px desktop, slide Y 24 px mobile.  
• Close affordance top-right, ESC closes.

### 7.5 Tables
• Zebra Gray-50 rows  
• Header 12 px uppercase caption  
• Row hover Gray-50 / dark Gray-800

### 7.6 Badges
Color tokens map ↔ status (success, info, warning, danger). Use solid backgrounds at 100/20 opacity for light/dark.

### 7.7 Navigation
Desktop: Left rail 72 px collapsible, icons 24 px, label on hover.  
Mobile: Bottom tab bar, 56 px height.

---

## 8  Accessibility

1. Color contrast ≥ 4.5:1 (text)  
2. All interactive elements reachable via Tab; focus visible.  
3. ARIA roles for components (dialog, alert, menu).  
4. Prefers-reduced-motion ⇒ animations fade only.  
5. Screen-reader readable toast announcements.

---

## 9  Implementation Notes

1. **Tailwind**: Put palette in `tailwind.config.ts` under `extend.colors`.  
2. **CSS Variables**: Define in `:root` for light, `[data-theme="dark"]` for dark.  
3. **shadcn/ui**: Use `npx shadcn-ui@latest add button input …` then override via `tailwind.config` and `src/styles/overrides.css`.  
4. **Dark Mode**: Use class strategy; invert gray ramp, keep brand blues/oranges but shift 8 % lighter.  
5. **Iconography**: Lucide 24 px regular weight.  
6. **Design Tokens**: Expose as JSON for future Figma sync.

---

## 10  Roadmap to Adoption

| Week | Milestone |
|------|-----------|
| 1 | Theme tokens implemented, global styles updated |
| 2 | Core components (buttons, inputs, cards, nav) restyled |
| 3 | Feature modules (Leads, Estimates) migrated |
| 4 | Remaining pages, dark-mode QA, motion audit |
| 5 | Pixel-perfect polish, accessibility sweep, documentation |

---

## 11  Reference Inspiration

• Salesforce Lightning Design System  
• Linear.app (clarity & spacing)  
• Stripe Dashboard (premium feel)  
• Apple Human Interface (motion subtlety)

---

**Tulboxx CRM** now has a clear, premium, human-centred design language. Every future screen should reference this guide to maintain coherence and deliver a $100K+ experience to every service-business owner.

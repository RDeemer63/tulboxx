# Permissions & Scope Analysis  
_Tulboxx CRM · small-trade edition_  
Date: 2025-06-13  

---

## 1 · Role & Permission Model  

### 1.1 Design Goals  
1. **Simplicity first** – owners must understand roles in 30 s.  
2. **Least-privilege** – techs never see profit margins.  
3. **Granular overrides** – occasional edge-cases handled without new role creation.  
4. **Future-proof** – RBAC tables, not hard-coded enums.  

### 1.2 Core Roles (keep to four)

| Role | Typical Users | Default Access | Hidden Data |
|------|---------------|----------------|-------------|
| **Owner** *(super)* | business owner | All modules, all records, manage billing | — |
| **Manager** | ops/office mgr | Leads, Estimates, Jobs, Billing, Reports; can manage staff & media | Profit margin %, API keys |
| **Field Tech** | crew/technician | Work Session (jobs assigned), start/stop timer, upload media | Customer list export, pricing, reports |
| **Bookkeeper** | accountant | Billing, Payments, Reports, export to QB/Xero | Job scheduling, crew GPS |

Avoid more roles— confusion rises sharply after four.  

### 1.3 Granular Overrides  
* **Role + Scope matrix** stored in `user_permissions` table (`entity`, `action`, `granted_by`).  
* UI pattern: _“Advanced Permissions”_ link reveals toggle grid (hidden in 90 % of cases).  
* Owner may elevate/de-elevate any user in two clicks.  

### 1.4 Sensitive Actions (require 2-Step Confirm)  
| Action | Why | Roles Allowed |
|--------|-----|---------------|
| Delete Customer/Job | Data loss | Owner only |
| Refund Payment | Financial risk | Owner, Bookkeeper |
| Public Media Toggle | Privacy risk | Owner, Manager |

---

## 2 · Offline Functionality for Field Workers  

| Requirement | Implementation | Sync Strategy |
|-------------|----------------|---------------|
| **View Day’s Jobs** | IndexedDB cache of next 7 days’ assigned jobs at login | Background refresh every 15 min online |
| **Start/Stop Timer** | Local timer persisted to `localStorage` on tick | On reconnection, POST `/api/time/bulk` |
| **Add Notes / Photos** | Store in `workbuffer` table (IndexedDB) | Queue uploads; retry exponential back-off |
| **Form Autofill** | Service-worker caches common parts catalog | Version hash check on app load |

Offline >48 h: flag record `is_stale`, require manual merge by Manager.  

---

## 3 · Flexible Payment Flows  

### 3.1 Deposit vs Net-30 Selector  

| Setting | Residential Default | Commercial Default |
|---------|---------------------|--------------------|
| Require Deposit? | Yes (25 % pre-filled) | No |
| Deposit Amount Field | % or fixed $ | % or fixed $ |
| Payment Terms | “Due on receipt” | “Net 30” |

UI: estimate acceptance panel shows **toggle** – “Require deposit” → reveals amount.  

### 3.2 Milestone Invoicing (Commercial)  
* When estimate has multi-phase blocks, each **Phase Complete** triggers _Generate Invoice_ wizard with pre-filled amount.  
* If deposit collected, deduct from final phase automatically.  

### 3.3 Configuration Table  
```
payment_rules
  id PK
  customer_type enum('residential','commercial')
  require_deposit boolean
  default_deposit_percent numeric
  terms text        -- e.g., 'NET30'
```
Owner may override per estimate.

---

## 4 · Minimum Viable Rebuild (Tier-1 Scope)  

| Module | Must-Have Features | Exclusions (Phase 2+) |
|--------|--------------------|-----------------------|
| **Navigation & RBAC** | 6-module layout, 4 core roles, granular override grid | Franchise multi-org hierarchy |
| **Leads & Customers** | Quick add, duplicate detection, convert to customer | CSV import, referral sources |
| **Estimate Workspace** | Quick + Detailed, template engine, AI polish, e-sign, deposit toggle | Good-Better-Best tiers, financing offers |
| **Job Board & Calendar** | Drag-drop scheduling, crew clash detection | Route optimisation, weather sync |
| **Work Session (Offline MVP)** | View jobs, timer, notes/photos offline-first | Push notifications, live chat |
| **Billing Center** | Invoice (final & milestone), Stripe pay links, webhook updates | ACH, surcharging, financing |
| **Media & Client Portal** | Attach media, public/private toggle, portal acceptance | Customer review requests |
| **Reporting (Lite)** | Revenue, win-rate, utilisation basic charts | Predictive analytics, export |

Backend architecture (DB schema, service-layer) designed **up-front** to support future add-ons (ACH, inventory, automation rules) without breaking API contracts.

---

## 5 · Growth-Ready Backend Principles  

1. **RBAC Tables** – `roles`, `permissions`, `user_roles`.  
2. **Event-Sourcing Lite** – store immutable `activity_log` rows for audit & integrations.  
3. **Namespaced IDs** – prepare for multi-org future (`org_id` FK everywhere).  
4. **Feature Flags** – LaunchDarkly key check around in-progress modules.  
5. **Message Queue** – simple Redis stream for webhook retries & ETL tasks.  

These guard against rewriting core once Tulboxx scales beyond 7-employee shops.

---

### Key Takeaways  
* **Keep roles to four**; granular toggles cover edge cases without overwhelming setup.  
* **True offline mode** is mandatory for field tech adoption – IndexedDB + background sync suffices.  
* **Deposit vs milestone billing** toggled at estimate level; defaults by customer type.  
* **Tier-1 rebuild** solves fragmented UX & adds revenue-critical flows while laying a scalable foundation for advanced features later.  

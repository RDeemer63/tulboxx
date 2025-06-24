# Tulboxx CRM - Database Inventory Report

Generated on: 2025-06-16T08:07:00.175Z

## Summary

- **Total Tables:** 31
- **Schemas In Use:** app_schema
- **Applied Migrations:** 0
- **Requested Schema (from DATABASE_URL):** app_schema

## 1. Schemas In Use

- `app_schema`

## 2. Table Details

### 2.1. `app_schema.assigned_routes`

**Columns (10):**

| Name | Type | Nullable | Default |
|------|------|----------|---------|
| `id` | `integer` | undefined | NULL |
| `technician_id` | `integer` | undefined | NULL |
| `date` | `date` | undefined | NULL |
| `total_drive_time` | `integer` | undefined | NULL |
| `total_work_time` | `integer` | undefined | NULL |
| `route_data` | `json` | undefined | NULL |
| `status` | `text` | undefined | NULL |
| `assigned_at` | `timestamp without time zone` | undefined | NULL |
| `completed_at` | `timestamp without time zone` | undefined | NULL |
| `notes` | `text` | undefined | NULL |

**Primary Keys (1):**
- `id` (Type: `integer`)

**Foreign Keys (0):**
- None defined

**Indexes (1):**
- Name: `assigned_routes_pkey`
  Definition: ```sql
    CREATE UNIQUE INDEX assigned_routes_pkey ON app_schema.assigned_routes USING btree (id)
  ```

---

### 2.1. `app_schema.business_profiles`

**Columns (45):**

| Name | Type | Nullable | Default |
|------|------|----------|---------|
| `id` | `integer` | undefined | NULL |
| `business_name` | `text` | undefined | NULL |
| `owner_name` | `text` | undefined | NULL |
| `email` | `text` | undefined | NULL |
| `phone` | `text` | undefined | NULL |
| `address` | `text` | undefined | NULL |
| `city` | `text` | undefined | NULL |
| `state` | `text` | undefined | NULL |
| `zip_code` | `text` | undefined | NULL |
| `website` | `text` | undefined | NULL |
| `license_numbers` | `text` | undefined | NULL |
| `bonded_insured` | `boolean` | undefined | NULL |
| `bonded_insured_description` | `text` | undefined | NULL |
| `certifications` | `text` | undefined | NULL |
| `year_founded` | `integer` | undefined | NULL |
| `business_structure` | `character varying` | undefined | NULL |
| `preferred_estimate_style` | `character varying` | undefined | NULL |
| `service_area` | `text` | undefined | NULL |
| `company_tagline` | `text` | undefined | NULL |
| `company_bio` | `text` | undefined | NULL |
| `legal_footer_text` | `text` | undefined | NULL |
| `terms_conditions` | `text` | undefined | NULL |
| `default_signature_name` | `text` | undefined | NULL |
| `logo_url` | `text` | undefined | NULL |
| `business_type` | `text` | undefined | NULL |
| `license_number` | `text` | undefined | NULL |
| `insurance_info` | `text` | undefined | NULL |
| `social_linkedin` | `text` | undefined | NULL |
| `social_facebook` | `text` | undefined | NULL |
| `social_instagram` | `text` | undefined | NULL |
| `estimate_terms` | `text` | undefined | NULL |
| `default_estimate_terms` | `text` | undefined | NULL |
| `default_invoice_terms` | `text` | undefined | NULL |
| `default_email_signature` | `text` | undefined | NULL |
| `contract_template_url` | `text` | undefined | NULL |
| `default_tax_rate` | `numeric` | undefined | NULL |
| `description` | `text` | undefined | NULL |
| `terms` | `text` | undefined | NULL |
| `brand_voice` | `text` | undefined | NULL |
| `communication_style` | `text` | undefined | NULL |
| `target_customers` | `text` | undefined | NULL |
| `service_specialties` | `text` | undefined | NULL |
| `unique_selling_points` | `text` | undefined | NULL |
| `created_at` | `timestamp without time zone` | undefined | NULL |
| `updated_at` | `timestamp without time zone` | undefined | NULL |

**Primary Keys (1):**
- `id` (Type: `integer`)

**Foreign Keys (0):**
- None defined

**Indexes (1):**
- Name: `business_profiles_pkey`
  Definition: ```sql
    CREATE UNIQUE INDEX business_profiles_pkey ON app_schema.business_profiles USING btree (id)
  ```

---

### 2.1. `app_schema.change_orders`

**Columns (12):**

| Name | Type | Nullable | Default |
|------|------|----------|---------|
| `id` | `integer` | undefined | NULL |
| `original_estimate_id` | `integer` | undefined | NULL |
| `new_estimate_id` | `integer` | undefined | NULL |
| `change_order_number` | `text` | undefined | NULL |
| `reason` | `text` | undefined | NULL |
| `description` | `text` | undefined | NULL |
| `original_amount` | `numeric` | undefined | NULL |
| `new_amount` | `numeric` | undefined | NULL |
| `change_amount` | `numeric` | undefined | NULL |
| `status` | `character varying` | undefined | NULL |
| `approved_at` | `timestamp without time zone` | undefined | NULL |
| `created_at` | `timestamp without time zone` | undefined | NULL |

**Primary Keys (1):**
- `id` (Type: `integer`)

**Foreign Keys (0):**
- None defined

**Indexes (2):**
- Name: `change_orders_pkey`
  Definition: ```sql
    CREATE UNIQUE INDEX change_orders_pkey ON app_schema.change_orders USING btree (id)
  ```
- Name: `change_orders_change_order_number_unique`
  Definition: ```sql
    CREATE UNIQUE INDEX change_orders_change_order_number_unique ON app_schema.change_orders USING btree (change_order_number)
  ```

---

### 2.1. `app_schema.communications`

**Columns (8):**

| Name | Type | Nullable | Default |
|------|------|----------|---------|
| `id` | `integer` | undefined | NULL |
| `customer_id` | `integer` | undefined | NULL |
| `job_id` | `integer` | undefined | NULL |
| `type` | `character varying` | undefined | NULL |
| `subject` | `text` | undefined | NULL |
| `content` | `text` | undefined | NULL |
| `sent_at` | `timestamp without time zone` | undefined | NULL |
| `created_at` | `timestamp without time zone` | undefined | NULL |

**Primary Keys (1):**
- `id` (Type: `integer`)

**Foreign Keys (0):**
- None defined

**Indexes (1):**
- Name: `communications_pkey`
  Definition: ```sql
    CREATE UNIQUE INDEX communications_pkey ON app_schema.communications USING btree (id)
  ```

---

### 2.1. `app_schema.contact_activities`

**Columns (11):**

| Name | Type | Nullable | Default |
|------|------|----------|---------|
| `id` | `integer` | undefined | NULL |
| `contact_id` | `integer` | undefined | NULL |
| `activity_type` | `character varying` | undefined | NULL |
| `subject` | `text` | undefined | NULL |
| `content` | `text` | undefined | NULL |
| `scheduled_at` | `timestamp without time zone` | undefined | NULL |
| `completed_at` | `timestamp without time zone` | undefined | NULL |
| `created_by` | `integer` | undefined | NULL |
| `is_completed` | `boolean` | undefined | NULL |
| `priority` | `character varying` | undefined | NULL |
| `created_at` | `timestamp without time zone` | undefined | NULL |

**Primary Keys (1):**
- `id` (Type: `integer`)

**Foreign Keys (0):**
- None defined

**Indexes (1):**
- Name: `contact_activities_pkey`
  Definition: ```sql
    CREATE UNIQUE INDEX contact_activities_pkey ON app_schema.contact_activities USING btree (id)
  ```

---

### 2.1. `app_schema.contacts`

**Columns (22):**

| Name | Type | Nullable | Default |
|------|------|----------|---------|
| `id` | `integer` | undefined | NULL |
| `first_name` | `text` | undefined | NULL |
| `last_name` | `text` | undefined | NULL |
| `email` | `text` | undefined | NULL |
| `phone` | `text` | undefined | NULL |
| `secondary_phone` | `text` | undefined | NULL |
| `address` | `text` | undefined | NULL |
| `city` | `text` | undefined | NULL |
| `state` | `text` | undefined | NULL |
| `zip_code` | `text` | undefined | NULL |
| `property_type` | `character varying` | undefined | NULL |
| `access_instructions` | `text` | undefined | NULL |
| `preferred_contact_method` | `character varying` | undefined | NULL |
| `notes` | `text` | undefined | NULL |
| `status` | `character varying` | undefined | NULL |
| `lead_source` | `character varying` | undefined | NULL |
| `lead_score` | `integer` | undefined | NULL |
| `last_contact_date` | `timestamp without time zone` | undefined | NULL |
| `next_follow_up_date` | `timestamp without time zone` | undefined | NULL |
| `converted_at` | `timestamp without time zone` | undefined | NULL |
| `tags` | `text` | undefined | NULL |
| `created_at` | `timestamp without time zone` | undefined | NULL |

**Primary Keys (1):**
- `id` (Type: `integer`)

**Foreign Keys (0):**
- None defined

**Indexes (1):**
- Name: `contacts_pkey`
  Definition: ```sql
    CREATE UNIQUE INDEX contacts_pkey ON app_schema.contacts USING btree (id)
  ```

---

### 2.1. `app_schema.documents`

**Columns (18):**

| Name | Type | Nullable | Default |
|------|------|----------|---------|
| `id` | `integer` | undefined | NULL |
| `file_name` | `text` | undefined | NULL |
| `original_name` | `text` | undefined | NULL |
| `file_type` | `text` | undefined | NULL |
| `mime_type` | `text` | undefined | NULL |
| `file_size` | `integer` | undefined | NULL |
| `file_url` | `text` | undefined | NULL |
| `category` | `text` | undefined | NULL |
| `description` | `text` | undefined | NULL |
| `customer_id` | `integer` | undefined | NULL |
| `job_id` | `integer` | undefined | NULL |
| `estimate_id` | `integer` | undefined | NULL |
| `invoice_id` | `integer` | undefined | NULL |
| `captured_at` | `timestamp without time zone` | undefined | NULL |
| `gps_location` | `text` | undefined | NULL |
| `is_public` | `boolean` | undefined | NULL |
| `created_at` | `timestamp without time zone` | undefined | NULL |
| `updated_at` | `timestamp without time zone` | undefined | NULL |

**Primary Keys (1):**
- `id` (Type: `integer`)

**Foreign Keys (0):**
- None defined

**Indexes (1):**
- Name: `documents_pkey`
  Definition: ```sql
    CREATE UNIQUE INDEX documents_pkey ON app_schema.documents USING btree (id)
  ```

---

### 2.1. `app_schema.employee_availability`

**Columns (9):**

| Name | Type | Nullable | Default |
|------|------|----------|---------|
| `id` | `integer` | undefined | NULL |
| `employee_id` | `integer` | undefined | NULL |
| `date` | `timestamp without time zone` | undefined | NULL |
| `is_available` | `boolean` | undefined | NULL |
| `start_time` | `character varying` | undefined | NULL |
| `end_time` | `character varying` | undefined | NULL |
| `notes` | `text` | undefined | NULL |
| `created_at` | `timestamp without time zone` | undefined | NULL |
| `updated_at` | `timestamp without time zone` | undefined | NULL |

**Primary Keys (1):**
- `id` (Type: `integer`)

**Foreign Keys (0):**
- None defined

**Indexes (1):**
- Name: `employee_availability_pkey`
  Definition: ```sql
    CREATE UNIQUE INDEX employee_availability_pkey ON app_schema.employee_availability USING btree (id)
  ```

---

### 2.1. `app_schema.employee_permissions`

**Columns (20):**

| Name | Type | Nullable | Default |
|------|------|----------|---------|
| `id` | `integer` | undefined | NULL |
| `employee_id` | `integer` | undefined | NULL |
| `can_view_revenue` | `boolean` | undefined | NULL |
| `can_view_job_costs` | `boolean` | undefined | NULL |
| `can_edit_pricing` | `boolean` | undefined | NULL |
| `can_export_data` | `boolean` | undefined | NULL |
| `can_view_all_employees` | `boolean` | undefined | NULL |
| `can_edit_employee_info` | `boolean` | undefined | NULL |
| `can_manage_schedules` | `boolean` | undefined | NULL |
| `can_approve_time_entries` | `boolean` | undefined | NULL |
| `can_view_all_customers` | `boolean` | undefined | NULL |
| `can_edit_customer_info` | `boolean` | undefined | NULL |
| `can_create_assign_jobs` | `boolean` | undefined | NULL |
| `can_access_payment_history` | `boolean` | undefined | NULL |
| `can_manage_estimates_invoices` | `boolean` | undefined | NULL |
| `can_view_performance_metrics` | `boolean` | undefined | NULL |
| `can_manage_inventory` | `boolean` | undefined | NULL |
| `can_configure_settings` | `boolean` | undefined | NULL |
| `created_at` | `timestamp without time zone` | undefined | NULL |
| `updated_at` | `timestamp without time zone` | undefined | NULL |

**Primary Keys (1):**
- `id` (Type: `integer`)

**Foreign Keys (0):**
- None defined

**Indexes (1):**
- Name: `employee_permissions_pkey`
  Definition: ```sql
    CREATE UNIQUE INDEX employee_permissions_pkey ON app_schema.employee_permissions USING btree (id)
  ```

---

### 2.1. `app_schema.employees`

**Columns (13):**

| Name | Type | Nullable | Default |
|------|------|----------|---------|
| `id` | `integer` | undefined | NULL |
| `first_name` | `text` | undefined | NULL |
| `last_name` | `text` | undefined | NULL |
| `email` | `text` | undefined | NULL |
| `phone` | `text` | undefined | NULL |
| `role` | `character varying` | undefined | NULL |
| `hourly_rate` | `numeric` | undefined | NULL |
| `overtime_rate` | `numeric` | undefined | NULL |
| `is_active` | `boolean` | undefined | NULL |
| `is_available` | `boolean` | undefined | NULL |
| `hire_date` | `timestamp without time zone` | undefined | NULL |
| `notes` | `text` | undefined | NULL |
| `created_at` | `timestamp without time zone` | undefined | NULL |

**Primary Keys (1):**
- `id` (Type: `integer`)

**Foreign Keys (0):**
- None defined

**Indexes (2):**
- Name: `employees_pkey`
  Definition: ```sql
    CREATE UNIQUE INDEX employees_pkey ON app_schema.employees USING btree (id)
  ```
- Name: `employees_email_unique`
  Definition: ```sql
    CREATE UNIQUE INDEX employees_email_unique ON app_schema.employees USING btree (email)
  ```

---

### 2.1. `app_schema.equipment`

**Columns (19):**

| Name | Type | Nullable | Default |
|------|------|----------|---------|
| `id` | `integer` | undefined | NULL |
| `name` | `text` | undefined | NULL |
| `type` | `character varying` | undefined | NULL |
| `make` | `text` | undefined | NULL |
| `model` | `text` | undefined | NULL |
| `year` | `integer` | undefined | NULL |
| `serial_number` | `text` | undefined | NULL |
| `license_plate` | `text` | undefined | NULL |
| `purchase_date` | `timestamp without time zone` | undefined | NULL |
| `purchase_price` | `numeric` | undefined | NULL |
| `current_value` | `numeric` | undefined | NULL |
| `status` | `character varying` | undefined | NULL |
| `assigned_to_employee_id` | `integer` | undefined | NULL |
| `location` | `text` | undefined | NULL |
| `next_maintenance_date` | `timestamp without time zone` | undefined | NULL |
| `maintenance_interval` | `integer` | undefined | NULL |
| `notes` | `text` | undefined | NULL |
| `is_active` | `boolean` | undefined | NULL |
| `created_at` | `timestamp without time zone` | undefined | NULL |

**Primary Keys (1):**
- `id` (Type: `integer`)

**Foreign Keys (0):**
- None defined

**Indexes (1):**
- Name: `equipment_pkey`
  Definition: ```sql
    CREATE UNIQUE INDEX equipment_pkey ON app_schema.equipment USING btree (id)
  ```

---

### 2.1. `app_schema.equipment_maintenance`

**Columns (11):**

| Name | Type | Nullable | Default |
|------|------|----------|---------|
| `id` | `integer` | undefined | NULL |
| `equipment_id` | `integer` | undefined | NULL |
| `type` | `character varying` | undefined | NULL |
| `description` | `text` | undefined | NULL |
| `performed_date` | `timestamp without time zone` | undefined | NULL |
| `performed_by_employee_id` | `integer` | undefined | NULL |
| `cost` | `numeric` | undefined | NULL |
| `supplier_service_id` | `integer` | undefined | NULL |
| `next_service_date` | `timestamp without time zone` | undefined | NULL |
| `notes` | `text` | undefined | NULL |
| `created_at` | `timestamp without time zone` | undefined | NULL |

**Primary Keys (1):**
- `id` (Type: `integer`)

**Foreign Keys (0):**
- None defined

**Indexes (1):**
- Name: `equipment_maintenance_pkey`
  Definition: ```sql
    CREATE UNIQUE INDEX equipment_maintenance_pkey ON app_schema.equipment_maintenance USING btree (id)
  ```

---

### 2.1. `app_schema.estimates`

**Columns (38):**

| Name | Type | Nullable | Default |
|------|------|----------|---------|
| `id` | `integer` | undefined | NULL |
| `customer_id` | `integer` | undefined | NULL |
| `job_id` | `integer` | undefined | NULL |
| `parent_estimate_id` | `integer` | undefined | NULL |
| `estimate_number` | `text` | undefined | NULL |
| `title` | `text` | undefined | NULL |
| `description` | `text` | undefined | NULL |
| `total_amount` | `numeric` | undefined | NULL |
| `status` | `character varying` | undefined | NULL |
| `type` | `character varying` | undefined | NULL |
| `version` | `integer` | undefined | NULL |
| `change_reason` | `text` | undefined | NULL |
| `valid_until` | `timestamp without time zone` | undefined | NULL |
| `sent_at` | `timestamp without time zone` | undefined | NULL |
| `responded_at` | `timestamp without time zone` | undefined | NULL |
| `items` | `text` | undefined | NULL |
| `subtotal` | `numeric` | undefined | NULL |
| `discount_type` | `character varying` | undefined | NULL |
| `discount_value` | `numeric` | undefined | NULL |
| `discount_amount` | `numeric` | undefined | NULL |
| `tax_rate` | `numeric` | undefined | NULL |
| `tax_amount` | `numeric` | undefined | NULL |
| `deposit_type` | `character varying` | undefined | NULL |
| `deposit_value` | `numeric` | undefined | NULL |
| `deposit_amount` | `numeric` | undefined | NULL |
| `customer_signature_url` | `text` | undefined | NULL |
| `company_signature_url` | `text` | undefined | NULL |
| `include_license` | `boolean` | undefined | NULL |
| `include_insurance` | `boolean` | undefined | NULL |
| `include_certs` | `boolean` | undefined | NULL |
| `terms_and_conditions` | `text` | undefined | NULL |
| `notes_for_customer` | `text` | undefined | NULL |
| `field_notes` | `text` | undefined | NULL |
| `project_description` | `text` | undefined | NULL |
| `scope_of_work` | `text` | undefined | NULL |
| `warranties_and_benefits` | `text` | undefined | NULL |
| `ai_generation_metadata` | `text` | undefined | NULL |
| `created_at` | `timestamp without time zone` | undefined | NULL |

**Primary Keys (1):**
- `id` (Type: `integer`)

**Foreign Keys (0):**
- None defined

**Indexes (1):**
- Name: `estimates_pkey`
  Definition: ```sql
    CREATE UNIQUE INDEX estimates_pkey ON app_schema.estimates USING btree (id)
  ```

---

### 2.1. `app_schema.inventory_items`

**Columns (16):**

| Name | Type | Nullable | Default |
|------|------|----------|---------|
| `id` | `integer` | undefined | NULL |
| `name` | `text` | undefined | NULL |
| `description` | `text` | undefined | NULL |
| `sku` | `text` | undefined | NULL |
| `category` | `character varying` | undefined | NULL |
| `unit` | `character varying` | undefined | NULL |
| `current_stock` | `integer` | undefined | NULL |
| `minimum_stock` | `integer` | undefined | NULL |
| `maximum_stock` | `integer` | undefined | NULL |
| `unit_cost` | `numeric` | undefined | NULL |
| `retail_price` | `numeric` | undefined | NULL |
| `supplier_id` | `integer` | undefined | NULL |
| `location` | `text` | undefined | NULL |
| `is_active` | `boolean` | undefined | NULL |
| `created_at` | `timestamp without time zone` | undefined | NULL |
| `updated_at` | `timestamp without time zone` | undefined | NULL |

**Primary Keys (1):**
- `id` (Type: `integer`)

**Foreign Keys (0):**
- None defined

**Indexes (2):**
- Name: `inventory_items_pkey`
  Definition: ```sql
    CREATE UNIQUE INDEX inventory_items_pkey ON app_schema.inventory_items USING btree (id)
  ```
- Name: `inventory_items_sku_unique`
  Definition: ```sql
    CREATE UNIQUE INDEX inventory_items_sku_unique ON app_schema.inventory_items USING btree (sku)
  ```

---

### 2.1. `app_schema.invoices`

**Columns (28):**

| Name | Type | Nullable | Default |
|------|------|----------|---------|
| `id` | `integer` | undefined | NULL |
| `customer_id` | `integer` | undefined | NULL |
| `job_id` | `integer` | undefined | NULL |
| `estimate_id` | `integer` | undefined | NULL |
| `invoice_number` | `text` | undefined | NULL |
| `title` | `text` | undefined | NULL |
| `description` | `text` | undefined | NULL |
| `subtotal` | `numeric` | undefined | NULL |
| `tax_rate` | `numeric` | undefined | NULL |
| `tax_amount` | `numeric` | undefined | NULL |
| `total_amount` | `numeric` | undefined | NULL |
| `paid_amount` | `numeric` | undefined | NULL |
| `balance_due` | `numeric` | undefined | NULL |
| `status` | `character varying` | undefined | NULL |
| `payment_terms` | `character varying` | undefined | NULL |
| `is_recurring` | `boolean` | undefined | NULL |
| `recurring_interval` | `character varying` | undefined | NULL |
| `recurring_end_date` | `timestamp without time zone` | undefined | NULL |
| `next_invoice_date` | `timestamp without time zone` | undefined | NULL |
| `due_date` | `timestamp without time zone` | undefined | NULL |
| `sent_at` | `timestamp without time zone` | undefined | NULL |
| `paid_at` | `timestamp without time zone` | undefined | NULL |
| `last_reminder_sent` | `timestamp without time zone` | undefined | NULL |
| `items` | `text` | undefined | NULL |
| `notes` | `text` | undefined | NULL |
| `internal_notes` | `text` | undefined | NULL |
| `created_at` | `timestamp without time zone` | undefined | NULL |
| `updated_at` | `timestamp without time zone` | undefined | NULL |

**Primary Keys (1):**
- `id` (Type: `integer`)

**Foreign Keys (0):**
- None defined

**Indexes (2):**
- Name: `invoices_pkey`
  Definition: ```sql
    CREATE UNIQUE INDEX invoices_pkey ON app_schema.invoices USING btree (id)
  ```
- Name: `invoices_invoice_number_unique`
  Definition: ```sql
    CREATE UNIQUE INDEX invoices_invoice_number_unique ON app_schema.invoices USING btree (invoice_number)
  ```

---

### 2.1. `app_schema.jobs`

**Columns (21):**

| Name | Type | Nullable | Default |
|------|------|----------|---------|
| `id` | `integer` | undefined | NULL |
| `customer_id` | `integer` | undefined | NULL |
| `title` | `text` | undefined | NULL |
| `description` | `text` | undefined | NULL |
| `status` | `character varying` | undefined | NULL |
| `service_type` | `text` | undefined | NULL |
| `scheduled_date` | `timestamp without time zone` | undefined | NULL |
| `scheduled_start_time` | `timestamp without time zone` | undefined | NULL |
| `scheduled_end_time` | `timestamp without time zone` | undefined | NULL |
| `estimated_duration` | `integer` | undefined | NULL |
| `assigned_technician_id` | `integer` | undefined | NULL |
| `completed_date` | `timestamp without time zone` | undefined | NULL |
| `estimated_value` | `numeric` | undefined | NULL |
| `actual_value` | `numeric` | undefined | NULL |
| `notes` | `text` | undefined | NULL |
| `calendar_event_id` | `text` | undefined | NULL |
| `latitude` | `numeric` | undefined | NULL |
| `longitude` | `numeric` | undefined | NULL |
| `address` | `text` | undefined | NULL |
| `geofence_radius` | `integer` | undefined | NULL |
| `created_at` | `timestamp without time zone` | undefined | NULL |

**Primary Keys (1):**
- `id` (Type: `integer`)

**Foreign Keys (0):**
- None defined

**Indexes (1):**
- Name: `jobs_pkey`
  Definition: ```sql
    CREATE UNIQUE INDEX jobs_pkey ON app_schema.jobs USING btree (id)
  ```

---

### 2.1. `app_schema.lead_notes`

**Columns (8):**

| Name | Type | Nullable | Default |
|------|------|----------|---------|
| `id` | `integer` | undefined | NULL |
| `lead_pipeline_entry_id` | `integer` | undefined | NULL |
| `content` | `text` | undefined | NULL |
| `note_type` | `character varying` | undefined | NULL |
| `author_name` | `character varying` | undefined | NULL |
| `is_deleted` | `boolean` | undefined | NULL |
| `created_at` | `timestamp without time zone` | undefined | NULL |
| `updated_at` | `timestamp without time zone` | undefined | NULL |

**Primary Keys (1):**
- `id` (Type: `integer`)

**Foreign Keys (0):**
- None defined

**Indexes (1):**
- Name: `lead_notes_pkey`
  Definition: ```sql
    CREATE UNIQUE INDEX lead_notes_pkey ON app_schema.lead_notes USING btree (id)
  ```

---

### 2.1. `app_schema.lead_pipeline_entries`

**Columns (10):**

| Name | Type | Nullable | Default |
|------|------|----------|---------|
| `id` | `integer` | undefined | NULL |
| `contact_id` | `integer` | undefined | NULL |
| `stage_id` | `integer` | undefined | NULL |
| `probability` | `integer` | undefined | NULL |
| `estimated_value` | `numeric` | undefined | NULL |
| `expected_close_date` | `timestamp without time zone` | undefined | NULL |
| `notes` | `text` | undefined | NULL |
| `entered_stage_at` | `timestamp without time zone` | undefined | NULL |
| `created_at` | `timestamp without time zone` | undefined | NULL |
| `updated_at` | `timestamp without time zone` | undefined | NULL |

**Primary Keys (1):**
- `id` (Type: `integer`)

**Foreign Keys (0):**
- None defined

**Indexes (1):**
- Name: `lead_pipeline_entries_pkey`
  Definition: ```sql
    CREATE UNIQUE INDEX lead_pipeline_entries_pkey ON app_schema.lead_pipeline_entries USING btree (id)
  ```

---

### 2.1. `app_schema.lead_pipeline_stages`

**Columns (10):**

| Name | Type | Nullable | Default |
|------|------|----------|---------|
| `id` | `integer` | undefined | NULL |
| `business_profile_id` | `integer` | undefined | NULL |
| `name` | `character varying` | undefined | NULL |
| `description` | `text` | undefined | NULL |
| `color` | `character varying` | undefined | NULL |
| `sort_order` | `integer` | undefined | NULL |
| `is_active` | `boolean` | undefined | NULL |
| `is_default` | `boolean` | undefined | NULL |
| `created_at` | `timestamp without time zone` | undefined | NULL |
| `updated_at` | `timestamp without time zone` | undefined | NULL |

**Primary Keys (1):**
- `id` (Type: `integer`)

**Foreign Keys (0):**
- None defined

**Indexes (1):**
- Name: `lead_pipeline_stages_pkey`
  Definition: ```sql
    CREATE UNIQUE INDEX lead_pipeline_stages_pkey ON app_schema.lead_pipeline_stages USING btree (id)
  ```

---

### 2.1. `app_schema.notifications`

**Columns (13):**

| Name | Type | Nullable | Default |
|------|------|----------|---------|
| `id` | `integer` | undefined | NULL |
| `business_profile_id` | `integer` | undefined | NULL |
| `type` | `character varying` | undefined | NULL |
| `title` | `text` | undefined | NULL |
| `message` | `text` | undefined | NULL |
| `priority` | `character varying` | undefined | NULL |
| `is_read` | `boolean` | undefined | NULL |
| `related_entity_type` | `character varying` | undefined | NULL |
| `related_entity_id` | `integer` | undefined | NULL |
| `action_url` | `text` | undefined | NULL |
| `expires_at` | `timestamp without time zone` | undefined | NULL |
| `created_at` | `timestamp without time zone` | undefined | NULL |
| `updated_at` | `timestamp without time zone` | undefined | NULL |

**Primary Keys (1):**
- `id` (Type: `integer`)

**Foreign Keys (0):**
- None defined

**Indexes (1):**
- Name: `notifications_pkey`
  Definition: ```sql
    CREATE UNIQUE INDEX notifications_pkey ON app_schema.notifications USING btree (id)
  ```

---

### 2.1. `app_schema.payments`

**Columns (9):**

| Name | Type | Nullable | Default |
|------|------|----------|---------|
| `id` | `integer` | undefined | NULL |
| `invoice_id` | `integer` | undefined | NULL |
| `amount` | `numeric` | undefined | NULL |
| `payment_method` | `character varying` | undefined | NULL |
| `payment_reference` | `text` | undefined | NULL |
| `payment_date` | `timestamp without time zone` | undefined | NULL |
| `notes` | `text` | undefined | NULL |
| `processed_by` | `integer` | undefined | NULL |
| `created_at` | `timestamp without time zone` | undefined | NULL |

**Primary Keys (1):**
- `id` (Type: `integer`)

**Foreign Keys (0):**
- None defined

**Indexes (1):**
- Name: `payments_pkey`
  Definition: ```sql
    CREATE UNIQUE INDEX payments_pkey ON app_schema.payments USING btree (id)
  ```

---

### 2.1. `app_schema.permissions`

**Columns (24):**

| Name | Type | Nullable | Default |
|------|------|----------|---------|
| `id` | `integer` | undefined | NULL |
| `employee_id` | `integer` | undefined | NULL |
| `can_view_revenue` | `boolean` | undefined | NULL |
| `can_view_profit_margins` | `boolean` | undefined | NULL |
| `can_view_employee_wages` | `boolean` | undefined | NULL |
| `can_view_job_costs` | `boolean` | undefined | NULL |
| `can_edit_pricing` | `boolean` | undefined | NULL |
| `can_access_financial_reports` | `boolean` | undefined | NULL |
| `can_view_all_employees` | `boolean` | undefined | NULL |
| `can_edit_employee_info` | `boolean` | undefined | NULL |
| `can_manage_schedules` | `boolean` | undefined | NULL |
| `can_approve_time_entries` | `boolean` | undefined | NULL |
| `can_view_performance_metrics` | `boolean` | undefined | NULL |
| `can_view_all_customers` | `boolean` | undefined | NULL |
| `can_edit_customer_info` | `boolean` | undefined | NULL |
| `can_create_assign_jobs` | `boolean` | undefined | NULL |
| `can_access_payment_history` | `boolean` | undefined | NULL |
| `can_manage_estimates_invoices` | `boolean` | undefined | NULL |
| `can_manage_user_roles` | `boolean` | undefined | NULL |
| `can_access_system_settings` | `boolean` | undefined | NULL |
| `can_export_data` | `boolean` | undefined | NULL |
| `can_manage_integrations` | `boolean` | undefined | NULL |
| `created_at` | `timestamp without time zone` | undefined | NULL |
| `updated_at` | `timestamp without time zone` | undefined | NULL |

**Primary Keys (1):**
- `id` (Type: `integer`)

**Foreign Keys (0):**
- None defined

**Indexes (1):**
- Name: `permissions_pkey`
  Definition: ```sql
    CREATE UNIQUE INDEX permissions_pkey ON app_schema.permissions USING btree (id)
  ```

---

### 2.1. `app_schema.project_updates`

**Columns (10):**

| Name | Type | Nullable | Default |
|------|------|----------|---------|
| `id` | `integer` | undefined | NULL |
| `contact_id` | `integer` | undefined | NULL |
| `update_number` | `integer` | undefined | NULL |
| `update_type` | `character varying` | undefined | NULL |
| `work_needed` | `text` | undefined | NULL |
| `customer_requests` | `text` | undefined | NULL |
| `site_conditions` | `text` | undefined | NULL |
| `additional_notes` | `text` | undefined | NULL |
| `created_by` | `integer` | undefined | NULL |
| `created_at` | `timestamp without time zone` | undefined | NULL |

**Primary Keys (1):**
- `id` (Type: `integer`)

**Foreign Keys (0):**
- None defined

**Indexes (1):**
- Name: `project_updates_pkey`
  Definition: ```sql
    CREATE UNIQUE INDEX project_updates_pkey ON app_schema.project_updates USING btree (id)
  ```

---

### 2.1. `app_schema.recurring_billing`

**Columns (20):**

| Name | Type | Nullable | Default |
|------|------|----------|---------|
| `id` | `integer` | undefined | NULL |
| `customer_id` | `integer` | undefined | NULL |
| `title` | `text` | undefined | NULL |
| `description` | `text` | undefined | NULL |
| `amount` | `numeric` | undefined | NULL |
| `frequency` | `character varying` | undefined | NULL |
| `day_of_week` | `integer` | undefined | NULL |
| `day_of_month` | `integer` | undefined | NULL |
| `month_of_year` | `integer` | undefined | NULL |
| `start_date` | `timestamp without time zone` | undefined | NULL |
| `end_date` | `timestamp without time zone` | undefined | NULL |
| `next_bill_date` | `timestamp without time zone` | undefined | NULL |
| `last_invoice_date` | `timestamp without time zone` | undefined | NULL |
| `is_active` | `boolean` | undefined | NULL |
| `auto_generate_invoice` | `boolean` | undefined | NULL |
| `payment_terms` | `character varying` | undefined | NULL |
| `items` | `text` | undefined | NULL |
| `notes` | `text` | undefined | NULL |
| `created_at` | `timestamp without time zone` | undefined | NULL |
| `updated_at` | `timestamp without time zone` | undefined | NULL |

**Primary Keys (1):**
- `id` (Type: `integer`)

**Foreign Keys (0):**
- None defined

**Indexes (1):**
- Name: `recurring_billing_pkey`
  Definition: ```sql
    CREATE UNIQUE INDEX recurring_billing_pkey ON app_schema.recurring_billing USING btree (id)
  ```

---

### 2.1. `app_schema.sessions`

**Columns (3):**

| Name | Type | Nullable | Default |
|------|------|----------|---------|
| `sid` | `character varying` | undefined | NULL |
| `sess` | `json` | undefined | NULL |
| `expire` | `timestamp without time zone` | undefined | NULL |

**Primary Keys (1):**
- `sid` (Type: `character varying`)

**Foreign Keys (0):**
- None defined

**Indexes (1):**
- Name: `sessions_pkey`
  Definition: ```sql
    CREATE UNIQUE INDEX sessions_pkey ON app_schema.sessions USING btree (sid)
  ```

---

### 2.1. `app_schema.suppliers`

**Columns (13):**

| Name | Type | Nullable | Default |
|------|------|----------|---------|
| `id` | `integer` | undefined | NULL |
| `name` | `text` | undefined | NULL |
| `contact_name` | `text` | undefined | NULL |
| `email` | `text` | undefined | NULL |
| `phone` | `text` | undefined | NULL |
| `address` | `text` | undefined | NULL |
| `city` | `text` | undefined | NULL |
| `state` | `text` | undefined | NULL |
| `zip_code` | `text` | undefined | NULL |
| `website` | `text` | undefined | NULL |
| `notes` | `text` | undefined | NULL |
| `is_active` | `boolean` | undefined | NULL |
| `created_at` | `timestamp without time zone` | undefined | NULL |

**Primary Keys (1):**
- `id` (Type: `integer`)

**Foreign Keys (0):**
- None defined

**Indexes (1):**
- Name: `suppliers_pkey`
  Definition: ```sql
    CREATE UNIQUE INDEX suppliers_pkey ON app_schema.suppliers USING btree (id)
  ```

---

### 2.1. `app_schema.time_entries`

**Columns (21):**

| Name | Type | Nullable | Default |
|------|------|----------|---------|
| `id` | `integer` | undefined | NULL |
| `employee_id` | `integer` | undefined | NULL |
| `work_order_id` | `integer` | undefined | NULL |
| `job_id` | `integer` | undefined | NULL |
| `clock_in_time` | `timestamp without time zone` | undefined | NULL |
| `clock_out_time` | `timestamp without time zone` | undefined | NULL |
| `total_minutes` | `integer` | undefined | NULL |
| `is_overtime` | `boolean` | undefined | NULL |
| `hourly_rate` | `numeric` | undefined | NULL |
| `total_cost` | `numeric` | undefined | NULL |
| `description` | `text` | undefined | NULL |
| `clock_in_latitude` | `numeric` | undefined | NULL |
| `clock_in_longitude` | `numeric` | undefined | NULL |
| `clock_out_latitude` | `numeric` | undefined | NULL |
| `clock_out_longitude` | `numeric` | undefined | NULL |
| `clock_in_address` | `text` | undefined | NULL |
| `clock_out_address` | `text` | undefined | NULL |
| `is_location_verified` | `boolean` | undefined | NULL |
| `location_accuracy` | `numeric` | undefined | NULL |
| `gps_location` | `text` | undefined | NULL |
| `created_at` | `timestamp without time zone` | undefined | NULL |

**Primary Keys (1):**
- `id` (Type: `integer`)

**Foreign Keys (0):**
- None defined

**Indexes (1):**
- Name: `time_entries_pkey`
  Definition: ```sql
    CREATE UNIQUE INDEX time_entries_pkey ON app_schema.time_entries USING btree (id)
  ```

---

### 2.1. `app_schema.users`

**Columns (12):**

| Name | Type | Nullable | Default |
|------|------|----------|---------|
| `id` | `character varying` | undefined | NULL |
| `email` | `character varying` | undefined | NULL |
| `password_hash` | `text` | undefined | NULL |
| `first_name` | `character varying` | undefined | NULL |
| `last_name` | `character varying` | undefined | NULL |
| `profile_image_url` | `character varying` | undefined | NULL |
| `business_profile_id` | `integer` | undefined | NULL |
| `role` | `text` | undefined | NULL |
| `is_active` | `boolean` | undefined | NULL |
| `last_login_at` | `timestamp without time zone` | undefined | NULL |
| `created_at` | `timestamp without time zone` | undefined | NULL |
| `updated_at` | `timestamp without time zone` | undefined | NULL |

**Primary Keys (1):**
- `id` (Type: `character varying`)

**Foreign Keys (0):**
- None defined

**Indexes (2):**
- Name: `users_pkey`
  Definition: ```sql
    CREATE UNIQUE INDEX users_pkey ON app_schema.users USING btree (id)
  ```
- Name: `users_email_unique`
  Definition: ```sql
    CREATE UNIQUE INDEX users_email_unique ON app_schema.users USING btree (email)
  ```

---

### 2.1. `app_schema.work_order_materials`

**Columns (8):**

| Name | Type | Nullable | Default |
|------|------|----------|---------|
| `id` | `integer` | undefined | NULL |
| `work_order_id` | `integer` | undefined | NULL |
| `inventory_item_id` | `integer` | undefined | NULL |
| `quantity_used` | `numeric` | undefined | NULL |
| `unit_cost` | `numeric` | undefined | NULL |
| `total_cost` | `numeric` | undefined | NULL |
| `used_at` | `timestamp without time zone` | undefined | NULL |
| `notes` | `text` | undefined | NULL |

**Primary Keys (1):**
- `id` (Type: `integer`)

**Foreign Keys (0):**
- None defined

**Indexes (1):**
- Name: `work_order_materials_pkey`
  Definition: ```sql
    CREATE UNIQUE INDEX work_order_materials_pkey ON app_schema.work_order_materials USING btree (id)
  ```

---

### 2.1. `app_schema.work_order_tasks`

**Columns (14):**

| Name | Type | Nullable | Default |
|------|------|----------|---------|
| `id` | `integer` | undefined | NULL |
| `work_order_id` | `integer` | undefined | NULL |
| `title` | `text` | undefined | NULL |
| `description` | `text` | undefined | NULL |
| `order_index` | `integer` | undefined | NULL |
| `status` | `character varying` | undefined | NULL |
| `estimated_minutes` | `integer` | undefined | NULL |
| `actual_minutes` | `integer` | undefined | NULL |
| `completed_at` | `timestamp without time zone` | undefined | NULL |
| `completed_by_technician_id` | `integer` | undefined | NULL |
| `notes` | `text` | undefined | NULL |
| `requires_photo` | `boolean` | undefined | NULL |
| `requires_signature` | `boolean` | undefined | NULL |
| `created_at` | `timestamp without time zone` | undefined | NULL |

**Primary Keys (1):**
- `id` (Type: `integer`)

**Foreign Keys (0):**
- None defined

**Indexes (1):**
- Name: `work_order_tasks_pkey`
  Definition: ```sql
    CREATE UNIQUE INDEX work_order_tasks_pkey ON app_schema.work_order_tasks USING btree (id)
  ```

---

### 2.1. `app_schema.work_orders`

**Columns (20):**

| Name | Type | Nullable | Default |
|------|------|----------|---------|
| `id` | `integer` | undefined | NULL |
| `work_order_number` | `text` | undefined | NULL |
| `job_id` | `integer` | undefined | NULL |
| `estimate_id` | `integer` | undefined | NULL |
| `customer_id` | `integer` | undefined | NULL |
| `assigned_technician_id` | `integer` | undefined | NULL |
| `title` | `text` | undefined | NULL |
| `description` | `text` | undefined | NULL |
| `status` | `character varying` | undefined | NULL |
| `priority` | `character varying` | undefined | NULL |
| `scheduled_start_date` | `timestamp without time zone` | undefined | NULL |
| `actual_start_date` | `timestamp without time zone` | undefined | NULL |
| `scheduled_end_date` | `timestamp without time zone` | undefined | NULL |
| `actual_end_date` | `timestamp without time zone` | undefined | NULL |
| `estimated_hours` | `numeric` | undefined | NULL |
| `actual_hours` | `numeric` | undefined | NULL |
| `customer_signature_url` | `text` | undefined | NULL |
| `completion_notes` | `text` | undefined | NULL |
| `created_at` | `timestamp without time zone` | undefined | NULL |
| `updated_at` | `timestamp without time zone` | undefined | NULL |

**Primary Keys (1):**
- `id` (Type: `integer`)

**Foreign Keys (0):**
- None defined

**Indexes (2):**
- Name: `work_orders_pkey`
  Definition: ```sql
    CREATE UNIQUE INDEX work_orders_pkey ON app_schema.work_orders USING btree (id)
  ```
- Name: `work_orders_work_order_number_unique`
  Definition: ```sql
    CREATE UNIQUE INDEX work_orders_work_order_number_unique ON app_schema.work_orders USING btree (work_order_number)
  ```

---


## 3. Potential Duplicate Tables

- None identified based on current heuristics.

## 4. Applied Drizzle Migrations

*(From table: `__drizzle_migrations`)*

- No Drizzle migrations found or table does not exist.

## 5. Recommendations for Cleanup & Standardization

1. Standardize primary key types. Prefer UUIDs for new tables to avoid sequence issues and improve distributability. Tables with non-UUID PKs: assigned_routes, business_profiles, change_orders, communications, contact_activities, contacts, documents, employee_availability, employee_permissions, employees, equipment, equipment_maintenance, estimates, inventory_items, invoices, jobs, lead_notes, lead_pipeline_entries, lead_pipeline_stages, notifications, payments, permissions, project_updates, recurring_billing, sessions, suppliers, time_entries, users, work_order_materials, work_order_tasks, work_orders.
2. Review foreign key constraints. Ensure relationships are explicitly defined to maintain data integrity. Many tables appear to lack foreign keys.
3. Review the applied migrations list. If it seems incomplete or contains errors, consider a migration system hard reset (backup DB, clear __drizzle_migrations, clear migration files, generate new baseline).
4. Perform a thorough audit of all tables and columns to identify and remove any unused or deprecated structures.
5. Ensure consistent naming conventions for tables, columns, and indexes.

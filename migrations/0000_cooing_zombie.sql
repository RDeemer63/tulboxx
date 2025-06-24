CREATE TABLE "assigned_routes" (
	"id" serial PRIMARY KEY NOT NULL,
	"technician_id" integer NOT NULL,
	"date" date NOT NULL,
	"total_drive_time" integer NOT NULL,
	"total_work_time" integer NOT NULL,
	"route_data" json NOT NULL,
	"status" text DEFAULT 'assigned' NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "business_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_name" text NOT NULL,
	"owner_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"zip_code" text NOT NULL,
	"website" text,
	"license_numbers" text,
	"bonded_insured" boolean DEFAULT false,
	"bonded_insured_description" text,
	"certifications" text,
	"year_founded" integer,
	"business_structure" varchar(50),
	"preferred_estimate_style" varchar(50) DEFAULT 'flat_project_price',
	"service_area" text,
	"company_tagline" text,
	"company_bio" text,
	"legal_footer_text" text,
	"terms_conditions" text,
	"default_signature_name" text,
	"logo_url" text,
	"business_type" text NOT NULL,
	"license_number" text,
	"insurance_info" text,
	"social_linkedin" text,
	"social_facebook" text,
	"social_instagram" text,
	"estimate_terms" text,
	"default_estimate_terms" text,
	"default_invoice_terms" text,
	"default_email_signature" text,
	"contract_template_url" text,
	"default_tax_rate" numeric(5, 4) DEFAULT '0',
	"description" text,
	"terms" text,
	"brand_voice" text,
	"communication_style" text,
	"target_customers" text,
	"service_specialties" text,
	"unique_selling_points" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "change_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"original_estimate_id" integer NOT NULL,
	"new_estimate_id" integer NOT NULL,
	"change_order_number" text NOT NULL,
	"reason" text NOT NULL,
	"description" text,
	"original_amount" numeric(10, 2) NOT NULL,
	"new_amount" numeric(10, 2) NOT NULL,
	"change_amount" numeric(10, 2) NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "change_orders_change_order_number_unique" UNIQUE("change_order_number")
);
--> statement-breakpoint
CREATE TABLE "communications" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"job_id" integer,
	"type" varchar(50) NOT NULL,
	"subject" text,
	"content" text NOT NULL,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"contact_id" integer NOT NULL,
	"activity_type" varchar(50) NOT NULL,
	"subject" text,
	"content" text NOT NULL,
	"scheduled_at" timestamp,
	"completed_at" timestamp,
	"created_by" integer,
	"is_completed" boolean DEFAULT false,
	"priority" varchar(20) DEFAULT 'medium',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text,
	"phone" text,
	"secondary_phone" text,
	"address" text,
	"city" text,
	"state" text,
	"zip_code" text,
	"property_type" varchar(50) DEFAULT 'residential',
	"access_instructions" text,
	"preferred_contact_method" varchar(20) DEFAULT 'phone',
	"notes" text,
	"status" varchar(20) DEFAULT 'customer' NOT NULL,
	"lead_source" varchar(50),
	"lead_score" integer DEFAULT 0,
	"last_contact_date" timestamp,
	"next_follow_up_date" timestamp,
	"converted_at" timestamp,
	"tags" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"file_name" text NOT NULL,
	"original_name" text NOT NULL,
	"file_type" text NOT NULL,
	"mime_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"file_url" text NOT NULL,
	"category" text NOT NULL,
	"description" text,
	"customer_id" integer,
	"job_id" integer,
	"estimate_id" integer,
	"invoice_id" integer,
	"captured_at" timestamp,
	"gps_location" text,
	"is_public" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employee_availability" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer NOT NULL,
	"date" timestamp NOT NULL,
	"is_available" boolean DEFAULT true,
	"start_time" varchar(5),
	"end_time" varchar(5),
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employee_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer NOT NULL,
	"can_view_revenue" boolean DEFAULT false,
	"can_view_job_costs" boolean DEFAULT false,
	"can_edit_pricing" boolean DEFAULT false,
	"can_export_data" boolean DEFAULT false,
	"can_view_all_employees" boolean DEFAULT false,
	"can_edit_employee_info" boolean DEFAULT false,
	"can_manage_schedules" boolean DEFAULT false,
	"can_approve_time_entries" boolean DEFAULT false,
	"can_view_all_customers" boolean DEFAULT false,
	"can_edit_customer_info" boolean DEFAULT false,
	"can_create_assign_jobs" boolean DEFAULT false,
	"can_access_payment_history" boolean DEFAULT false,
	"can_manage_estimates_invoices" boolean DEFAULT false,
	"can_view_performance_metrics" boolean DEFAULT false,
	"can_manage_inventory" boolean DEFAULT false,
	"can_configure_settings" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text,
	"phone" text,
	"role" varchar(50) DEFAULT 'technician' NOT NULL,
	"hourly_rate" numeric(8, 2),
	"overtime_rate" numeric(8, 2),
	"is_active" boolean DEFAULT true,
	"is_available" boolean DEFAULT true,
	"hire_date" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "employees_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "equipment" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" varchar(50) NOT NULL,
	"make" text,
	"model" text,
	"year" integer,
	"serial_number" text,
	"license_plate" text,
	"purchase_date" timestamp,
	"purchase_price" numeric(10, 2),
	"current_value" numeric(10, 2),
	"status" varchar(20) DEFAULT 'available' NOT NULL,
	"assigned_to_employee_id" integer,
	"location" text,
	"next_maintenance_date" timestamp,
	"maintenance_interval" integer,
	"notes" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "equipment_maintenance" (
	"id" serial PRIMARY KEY NOT NULL,
	"equipment_id" integer NOT NULL,
	"type" varchar(50) NOT NULL,
	"description" text NOT NULL,
	"performed_date" timestamp NOT NULL,
	"performed_by_employee_id" integer,
	"cost" numeric(10, 2),
	"supplier_service_id" integer,
	"next_service_date" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "estimate_line_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"estimate_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"total" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "estimate_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(128) NOT NULL,
	"description" text,
	"default_tax_rate" numeric(5, 4) DEFAULT '0',
	"default_notes" text,
	"line_items" json NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "estimates" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"job_id" integer,
	"parent_estimate_id" integer,
	"estimate_number" text,
	"title" text NOT NULL,
	"description" text,
	"total_amount" numeric(10, 2) NOT NULL,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"type" varchar(50) DEFAULT 'original' NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"change_reason" text,
	"valid_until" timestamp,
	"sent_at" timestamp,
	"responded_at" timestamp,
	"items" text,
	"subtotal" numeric(10, 2) DEFAULT '0',
	"discount_type" varchar(20) DEFAULT 'none',
	"discount_value" numeric(10, 2) DEFAULT '0',
	"discount_amount" numeric(10, 2) DEFAULT '0',
	"tax_rate" numeric(5, 4) DEFAULT '0',
	"tax_amount" numeric(10, 2) DEFAULT '0',
	"deposit_type" varchar(20) DEFAULT 'none',
	"deposit_value" numeric(10, 2) DEFAULT '0',
	"deposit_amount" numeric(10, 2) DEFAULT '0',
	"customer_signature_url" text,
	"company_signature_url" text,
	"include_license" boolean DEFAULT false,
	"include_insurance" boolean DEFAULT false,
	"include_certs" boolean DEFAULT false,
	"terms_and_conditions" text,
	"notes_for_customer" text,
	"field_notes" text,
	"project_description" text,
	"scope_of_work" text,
	"warranties_and_benefits" text,
	"ai_generation_metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inventory_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"sku" text,
	"category" varchar(50) DEFAULT 'general' NOT NULL,
	"unit" varchar(20) DEFAULT 'each' NOT NULL,
	"current_stock" integer DEFAULT 0 NOT NULL,
	"minimum_stock" integer DEFAULT 0 NOT NULL,
	"maximum_stock" integer,
	"unit_cost" numeric(10, 4),
	"retail_price" numeric(10, 2),
	"supplier_id" integer,
	"location" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_items_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"job_id" integer,
	"estimate_id" integer,
	"invoice_number" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"subtotal" numeric(10, 2) NOT NULL,
	"tax_rate" numeric(5, 4) DEFAULT '0',
	"tax_amount" numeric(10, 2) DEFAULT '0',
	"total_amount" numeric(10, 2) NOT NULL,
	"paid_amount" numeric(10, 2) DEFAULT '0',
	"balance_due" numeric(10, 2) NOT NULL,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"payment_terms" varchar(50) DEFAULT 'net_30',
	"is_recurring" boolean DEFAULT false,
	"recurring_interval" varchar(20),
	"recurring_end_date" timestamp,
	"next_invoice_date" timestamp,
	"due_date" timestamp,
	"sent_at" timestamp,
	"paid_at" timestamp,
	"last_reminder_sent" timestamp,
	"items" text,
	"notes" text,
	"internal_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"service_type" text NOT NULL,
	"scheduled_date" timestamp,
	"scheduled_start_time" timestamp,
	"scheduled_end_time" timestamp,
	"estimated_duration" integer,
	"assigned_technician_id" integer,
	"completed_date" timestamp,
	"estimated_value" numeric(10, 2),
	"actual_value" numeric(10, 2),
	"notes" text,
	"calendar_event_id" text,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"address" text,
	"geofence_radius" integer DEFAULT 100,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lead_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"type" varchar(64) NOT NULL,
	"content" text,
	"created_at" timestamp DEFAULT now(),
	"created_by" uuid,
	"meta" jsonb DEFAULT '{}'
);
--> statement-breakpoint
CREATE TABLE "lead_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"lead_pipeline_entry_id" integer NOT NULL,
	"content" text NOT NULL,
	"note_type" varchar(50) DEFAULT 'general',
	"author_name" varchar(100) DEFAULT 'User',
	"is_deleted" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lead_pipeline_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"contact_id" integer NOT NULL,
	"stage_id" integer NOT NULL,
	"probability" integer DEFAULT 0,
	"estimated_value" numeric(10, 2),
	"expected_close_date" timestamp,
	"notes" text,
	"entered_stage_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lead_pipeline_stages" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_profile_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"color" varchar(20) DEFAULT '#3B82F6',
	"sort_order" integer NOT NULL,
	"is_active" boolean DEFAULT true,
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" varchar(128) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"email" varchar(128),
	"service_type" varchar(64),
	"source" varchar(64),
	"notes" text,
	"stage" varchar(20) DEFAULT 'new' NOT NULL,
	"follow_up_date" date,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"assigned_to" uuid,
	"origin_contact_id" integer,
	"job_id" uuid
);
--> statement-breakpoint
CREATE TABLE "modern_estimates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"subtotal" numeric(10, 2) DEFAULT '0',
	"tax" numeric(10, 2) DEFAULT '0',
	"total" numeric(10, 2) DEFAULT '0',
	"notes" text,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_profile_id" integer NOT NULL,
	"type" varchar(50) NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"priority" varchar(20) DEFAULT 'medium' NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"related_entity_type" varchar(50),
	"related_entity_id" integer,
	"action_url" text,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_id" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"payment_method" varchar(50) NOT NULL,
	"payment_reference" text,
	"payment_date" timestamp NOT NULL,
	"notes" text,
	"processed_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer NOT NULL,
	"can_view_revenue" boolean DEFAULT false NOT NULL,
	"can_view_profit_margins" boolean DEFAULT false NOT NULL,
	"can_view_employee_wages" boolean DEFAULT false NOT NULL,
	"can_view_job_costs" boolean DEFAULT false NOT NULL,
	"can_edit_pricing" boolean DEFAULT false NOT NULL,
	"can_access_financial_reports" boolean DEFAULT false NOT NULL,
	"can_view_all_employees" boolean DEFAULT false NOT NULL,
	"can_edit_employee_info" boolean DEFAULT false NOT NULL,
	"can_manage_schedules" boolean DEFAULT false NOT NULL,
	"can_approve_time_entries" boolean DEFAULT false NOT NULL,
	"can_view_performance_metrics" boolean DEFAULT false NOT NULL,
	"can_view_all_customers" boolean DEFAULT false NOT NULL,
	"can_edit_customer_info" boolean DEFAULT false NOT NULL,
	"can_create_assign_jobs" boolean DEFAULT false NOT NULL,
	"can_access_payment_history" boolean DEFAULT false NOT NULL,
	"can_manage_estimates_invoices" boolean DEFAULT false NOT NULL,
	"can_manage_user_roles" boolean DEFAULT false NOT NULL,
	"can_access_system_settings" boolean DEFAULT false NOT NULL,
	"can_export_data" boolean DEFAULT false NOT NULL,
	"can_manage_integrations" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_updates" (
	"id" serial PRIMARY KEY NOT NULL,
	"contact_id" integer NOT NULL,
	"update_number" integer NOT NULL,
	"update_type" varchar(50) DEFAULT 'general',
	"work_needed" text,
	"customer_requests" text,
	"site_conditions" text,
	"additional_notes" text,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recurring_billing" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"amount" numeric(10, 2) NOT NULL,
	"frequency" varchar(20) NOT NULL,
	"day_of_week" integer,
	"day_of_month" integer,
	"month_of_year" integer,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"next_bill_date" timestamp NOT NULL,
	"last_invoice_date" timestamp,
	"is_active" boolean DEFAULT true,
	"auto_generate_invoice" boolean DEFAULT true,
	"payment_terms" varchar(50) DEFAULT 'net_30',
	"items" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" json NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"contact_name" text,
	"email" text,
	"phone" text,
	"address" text,
	"city" text,
	"state" text,
	"zip_code" text,
	"website" text,
	"notes" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "time_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" integer NOT NULL,
	"work_order_id" integer,
	"job_id" integer,
	"clock_in_time" timestamp NOT NULL,
	"clock_out_time" timestamp,
	"total_minutes" integer,
	"is_overtime" boolean DEFAULT false,
	"hourly_rate" numeric(8, 2),
	"total_cost" numeric(10, 2),
	"description" text,
	"clock_in_latitude" numeric(10, 8),
	"clock_in_longitude" numeric(11, 8),
	"clock_out_latitude" numeric(10, 8),
	"clock_out_longitude" numeric(11, 8),
	"clock_in_address" text,
	"clock_out_address" text,
	"is_location_verified" boolean DEFAULT false,
	"location_accuracy" numeric(6, 2),
	"gps_location" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" varchar,
	"password_hash" text NOT NULL,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"business_profile_id" integer,
	"role" text DEFAULT 'owner' NOT NULL,
	"is_active" boolean DEFAULT true,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "work_order_materials" (
	"id" serial PRIMARY KEY NOT NULL,
	"work_order_id" integer NOT NULL,
	"inventory_item_id" integer NOT NULL,
	"quantity_used" numeric(10, 4) NOT NULL,
	"unit_cost" numeric(10, 4) NOT NULL,
	"total_cost" numeric(10, 2) NOT NULL,
	"used_at" timestamp DEFAULT now() NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "work_order_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"work_order_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"order_index" integer DEFAULT 0 NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"estimated_minutes" integer,
	"actual_minutes" integer,
	"completed_at" timestamp,
	"completed_by_technician_id" integer,
	"notes" text,
	"requires_photo" boolean DEFAULT false,
	"requires_signature" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "work_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"work_order_number" text NOT NULL,
	"job_id" integer NOT NULL,
	"estimate_id" integer,
	"customer_id" integer NOT NULL,
	"assigned_technician_id" integer,
	"title" text NOT NULL,
	"description" text,
	"status" varchar(50) DEFAULT 'scheduled' NOT NULL,
	"priority" varchar(20) DEFAULT 'normal' NOT NULL,
	"scheduled_start_date" timestamp,
	"actual_start_date" timestamp,
	"scheduled_end_date" timestamp,
	"actual_end_date" timestamp,
	"estimated_hours" numeric(5, 2),
	"actual_hours" numeric(5, 2),
	"customer_signature_url" text,
	"completion_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "work_orders_work_order_number_unique" UNIQUE("work_order_number")
);
--> statement-breakpoint
ALTER TABLE "assigned_routes" ADD CONSTRAINT "assigned_routes_technician_id_employees_id_fk" FOREIGN KEY ("technician_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "change_orders" ADD CONSTRAINT "change_orders_original_estimate_id_estimates_id_fk" FOREIGN KEY ("original_estimate_id") REFERENCES "public"."estimates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "change_orders" ADD CONSTRAINT "change_orders_new_estimate_id_estimates_id_fk" FOREIGN KEY ("new_estimate_id") REFERENCES "public"."estimates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communications" ADD CONSTRAINT "communications_customer_id_contacts_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communications" ADD CONSTRAINT "communications_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_activities" ADD CONSTRAINT "contact_activities_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_activities" ADD CONSTRAINT "contact_activities_created_by_employees_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_customer_id_contacts_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_estimate_id_estimates_id_fk" FOREIGN KEY ("estimate_id") REFERENCES "public"."estimates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_availability" ADD CONSTRAINT "employee_availability_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_permissions" ADD CONSTRAINT "employee_permissions_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_assigned_to_employee_id_employees_id_fk" FOREIGN KEY ("assigned_to_employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_maintenance" ADD CONSTRAINT "equipment_maintenance_equipment_id_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_maintenance" ADD CONSTRAINT "equipment_maintenance_performed_by_employee_id_employees_id_fk" FOREIGN KEY ("performed_by_employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_maintenance" ADD CONSTRAINT "equipment_maintenance_supplier_service_id_suppliers_id_fk" FOREIGN KEY ("supplier_service_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "estimate_line_items" ADD CONSTRAINT "estimate_line_items_estimate_id_modern_estimates_id_fk" FOREIGN KEY ("estimate_id") REFERENCES "public"."modern_estimates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "estimates" ADD CONSTRAINT "estimates_customer_id_contacts_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "estimates" ADD CONSTRAINT "estimates_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_contacts_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_estimate_id_estimates_id_fk" FOREIGN KEY ("estimate_id") REFERENCES "public"."estimates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_customer_id_contacts_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_assigned_technician_id_employees_id_fk" FOREIGN KEY ("assigned_technician_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_events" ADD CONSTRAINT "lead_events_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_events" ADD CONSTRAINT "lead_events_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_notes" ADD CONSTRAINT "lead_notes_lead_pipeline_entry_id_lead_pipeline_entries_id_fk" FOREIGN KEY ("lead_pipeline_entry_id") REFERENCES "public"."lead_pipeline_entries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_pipeline_entries" ADD CONSTRAINT "lead_pipeline_entries_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_pipeline_entries" ADD CONSTRAINT "lead_pipeline_entries_stage_id_lead_pipeline_stages_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."lead_pipeline_stages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_pipeline_stages" ADD CONSTRAINT "lead_pipeline_stages_business_profile_id_business_profiles_id_fk" FOREIGN KEY ("business_profile_id") REFERENCES "public"."business_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modern_estimates" ADD CONSTRAINT "modern_estimates_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modern_estimates" ADD CONSTRAINT "modern_estimates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_business_profile_id_business_profiles_id_fk" FOREIGN KEY ("business_profile_id") REFERENCES "public"."business_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_processed_by_employees_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_updates" ADD CONSTRAINT "project_updates_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_updates" ADD CONSTRAINT "project_updates_created_by_employees_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_billing" ADD CONSTRAINT "recurring_billing_customer_id_contacts_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_work_order_id_work_orders_id_fk" FOREIGN KEY ("work_order_id") REFERENCES "public"."work_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_business_profile_id_business_profiles_id_fk" FOREIGN KEY ("business_profile_id") REFERENCES "public"."business_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_order_materials" ADD CONSTRAINT "work_order_materials_work_order_id_work_orders_id_fk" FOREIGN KEY ("work_order_id") REFERENCES "public"."work_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_order_materials" ADD CONSTRAINT "work_order_materials_inventory_item_id_inventory_items_id_fk" FOREIGN KEY ("inventory_item_id") REFERENCES "public"."inventory_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_order_tasks" ADD CONSTRAINT "work_order_tasks_work_order_id_work_orders_id_fk" FOREIGN KEY ("work_order_id") REFERENCES "public"."work_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_order_tasks" ADD CONSTRAINT "work_order_tasks_completed_by_technician_id_employees_id_fk" FOREIGN KEY ("completed_by_technician_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_estimate_id_estimates_id_fk" FOREIGN KEY ("estimate_id") REFERENCES "public"."estimates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_customer_id_contacts_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_assigned_technician_id_employees_id_fk" FOREIGN KEY ("assigned_technician_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_estimate_line_items_est" ON "estimate_line_items" USING btree ("estimate_id");--> statement-breakpoint
CREATE INDEX "IDX_modern_estimates_lead" ON "modern_estimates" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "IDX_modern_estimates_status" ON "modern_estimates" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");
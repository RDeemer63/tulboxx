CREATE TABLE "contacts" (
	"id" serial PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "estimate_line_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"estimate_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"quantity" numeric(10, 2) DEFAULT '1.00' NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"markup_pct" numeric(5, 2) DEFAULT '0.00',
	"category" varchar(64),
	"total" numeric(10, 2) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "estimate_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(128) NOT NULL,
	"description" text,
	"industry_tag" jsonb,
	"visibility" varchar(20) DEFAULT 'private',
	"default_tax_rate" numeric(5, 4) DEFAULT '0.0000',
	"default_notes" text,
	"default_terms" text,
	"line_items_json" jsonb NOT NULL,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" serial PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "modern_estimates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) DEFAULT 'New Estimate' NOT NULL,
	"estimate_number" varchar(50) DEFAULT 'EST-' || upper(substring(replace(uuid_generate_v4()::text, '-', ''), 1, 12)) NOT NULL,
	"lead_id" uuid,
	"customer_id" integer,
	"job_id" integer,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"estimate_type" varchar(20) DEFAULT 'detailed' NOT NULL,
	"subtotal" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"tax_rate" numeric(5, 4) DEFAULT '0.0000' NOT NULL,
	"total" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"notes" text,
	"terms_and_conditions" text,
	"valid_until" date,
	"signature" text,
	"signature_date" timestamp,
	"sent_at" timestamp,
	"approved_at" timestamp,
	"version_of" uuid,
	"option_group_id" uuid,
	"is_template" boolean DEFAULT false NOT NULL,
	"synced" boolean DEFAULT true NOT NULL,
	"created_by" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "modern_estimates_estimate_number_unique" UNIQUE("estimate_number")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL
);
--> statement-breakpoint
ALTER TABLE "estimate_line_items" ADD CONSTRAINT "estimate_line_items_estimate_id_modern_estimates_id_fk" FOREIGN KEY ("estimate_id") REFERENCES "public"."modern_estimates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "estimate_templates" ADD CONSTRAINT "estimate_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modern_estimates" ADD CONSTRAINT "modern_estimates_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modern_estimates" ADD CONSTRAINT "modern_estimates_customer_id_contacts_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modern_estimates" ADD CONSTRAINT "modern_estimates_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modern_estimates" ADD CONSTRAINT "modern_estimates_version_of_modern_estimates_id_fk" FOREIGN KEY ("version_of") REFERENCES "public"."modern_estimates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modern_estimates" ADD CONSTRAINT "modern_estimates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_estimate_line_items_est" ON "estimate_line_items" USING btree ("estimate_id");--> statement-breakpoint
CREATE INDEX "IDX_estimate_templates_name" ON "estimate_templates" USING btree ("name");--> statement-breakpoint
CREATE INDEX "IDX_estimate_templates_visibility" ON "estimate_templates" USING btree ("visibility");--> statement-breakpoint
CREATE INDEX "IDX_modern_estimates_lead" ON "modern_estimates" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "IDX_modern_estimates_status" ON "modern_estimates" USING btree ("status");--> statement-breakpoint
CREATE INDEX "IDX_modern_estimates_customer" ON "modern_estimates" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "IDX_modern_estimates_job" ON "modern_estimates" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "IDX_modern_estimates_option_group" ON "modern_estimates" USING btree ("option_group_id");--> statement-breakpoint
CREATE INDEX "IDX_modern_estimates_version_of" ON "modern_estimates" USING btree ("version_of");
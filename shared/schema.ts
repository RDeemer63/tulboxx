import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  decimal,
  varchar,
  json,
  jsonb,
  date,
  index,
  uuid,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// --- Enums ---
export const ESTIMATE_STATUSES = ["draft", "sent", "approved", "declined", "archived", "converted", "revision", "superseded"] as const;
export const EstimateStatusEnum = z.enum(ESTIMATE_STATUSES);
export type EstimateStatusEnumType = z.infer<typeof EstimateStatusEnum>;

export const ESTIMATE_TYPES = ["simple", "detailed"] as const;
export const EstimateTypeEnum = z.enum(ESTIMATE_TYPES);
export type EstimateTypeEnumType = z.infer<typeof EstimateTypeEnum>;

export const TEMPLATE_VISIBILITY_TYPES = ["private", "public", "shared_with_team"] as const;
export const TemplateVisibilityEnum = z.enum(TEMPLATE_VISIBILITY_TYPES);
export type TemplateVisibilityEnumType = z.infer<typeof TemplateVisibilityEnum>;


// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: json("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Business Profiles must be defined before Users if Users references it
export const businessProfiles = pgTable("business_profiles", {
  id: serial("id").primaryKey(),
  businessName: text("business_name").notNull(),
  ownerName: text("owner_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  website: text("website"),
  licenseNumbers: text("license_numbers"),
  bondedInsured: boolean("bonded_insured").default(false),
  bondedInsuredDescription: text("bonded_insured_description"),
  certifications: text("certifications"),
  yearFounded: integer("year_founded"),
  businessStructure: varchar("business_structure", { length: 50 }),
  preferredEstimateStyle: varchar("preferred_estimate_style", { length: 50 }).default("flat_project_price"),
  serviceArea: text("service_area"),
  companyTagline: text("company_tagline"),
  companyBio: text("company_bio"),
  legalFooterText: text("legal_footer_text"),
  termsConditions: text("terms_conditions"),
  defaultSignatureName: text("default_signature_name"),
  logoUrl: text("logo_url"),
  businessType: text("business_type").notNull(),
  licenseNumber: text("license_number"),
  insuranceInfo: text("insurance_info"),
  socialLinkedin: text("social_linkedin"),
  socialFacebook: text("social_facebook"),
  socialInstagram: text("social_instagram"),
  estimateTerms: text("estimate_terms"),
  defaultEstimateTerms: text("default_estimate_terms"),
  defaultInvoiceTerms: text("default_invoice_terms"),
  defaultEmailSignature: text("default_email_signature"),
  contractTemplateUrl: text("contract_template_url"),
  defaultTaxRate: decimal("default_tax_rate", { precision: 5, scale: 4 }).default("0.0000"),
  description: text("description"),
  terms: text("terms"),
  brandVoice: text("brand_voice"),
  communicationStyle: text("communication_style"),
  targetCustomers: text("target_customers"),
  serviceSpecialties: text("service_specialties"),
  uniqueSellingPoints: text("unique_selling_points"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(), // Replit Auth uses varchar for user IDs
  email: varchar("email").unique(),
  passwordHash: text("password_hash").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  businessProfileId: integer("business_profile_id").references(() => businessProfiles.id, { onDelete: 'set null' }),
  role: text("role").notNull().default("owner"), // owner, admin, employee
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

// Contacts (formerly Customers)
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  secondaryPhone: text("secondary_phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  propertyType: varchar("property_type", { length: 50 }).default("residential"),
  accessInstructions: text("access_instructions"),
  preferredContactMethod: varchar("preferred_contact_method", { length: 20 }).default("phone"),
  notes: text("notes"),
  status: varchar("status", { length: 20 }).notNull().default("customer"),
  leadSource: varchar("lead_source", { length: 50 }),
  leadScore: integer("lead_score").default(0),
  lastContactDate: timestamp("last_contact_date"),
  nextFollowUpDate: timestamp("next_follow_up_date"),
  convertedAt: timestamp("converted_at"),
  tags: text("tags"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});
export const customers = contacts; // Alias for backward compatibility

// Employees
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").unique(),
  phone: text("phone"),
  role: varchar("role", { length: 50 }).notNull().default("technician"),
  hourlyRate: decimal("hourly_rate", { precision: 8, scale: 2 }),
  overtimeRate: decimal("overtime_rate", { precision: 8, scale: 2 }),
  isActive: boolean("is_active").default(true),
  isAvailable: boolean("is_available").default(true),
  hireDate: timestamp("hire_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

// Jobs
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id, { onDelete: 'cascade' }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  serviceType: text("service_type").notNull(),
  scheduledDate: timestamp("scheduled_date"),
  scheduledStartTime: timestamp("scheduled_start_time"),
  scheduledEndTime: timestamp("scheduled_end_time"),
  estimatedDuration: integer("estimated_duration"),
  assignedTechnicianId: integer("assigned_technician_id").references(() => employees.id, { onDelete: 'set null' }),
  completedDate: timestamp("completed_date"),
  estimatedValue: decimal("estimated_value", { precision: 10, scale: 2 }),
  actualValue: decimal("actual_value", { precision: 10, scale: 2 }),
  notes: text("notes"),
  calendarEventId: text("calendar_event_id"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  address: text("address"),
  geofenceRadius: integer("geofence_radius").default(100),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

/* ------------------------------------------------------------------ */
/*  Leads Domain                                                      */
/* ------------------------------------------------------------------ */
export const leads = pgTable("leads", {
  id: uuid("id").defaultRandom().primaryKey(),
  fullName: varchar("full_name", { length: 128 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: varchar("email", { length: 128 }),
  serviceType: varchar("service_type", { length: 64 }),
  source: varchar("source", { length: 64 }),
  notes: text("notes"),
  stage: varchar("stage", { length: 20 })
    .notNull()
    .default("new"), // new, contacted, estimate_sent, won, lost
  followUpDate: date("follow_up_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
  assignedTo: varchar("assigned_to").references(() => users.id, { onDelete: 'set null' }),
  originContactId: integer("origin_contact_id").references(() => contacts.id, { onDelete: 'set null' }),
  jobId: integer("job_id").references(() => jobs.id, { onDelete: 'set null' }),
});

export const leadEvents = pgTable("lead_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  leadId: uuid("lead_id").notNull().references(() => leads.id, { onDelete: 'cascade' }),
  type: varchar("type", { length: 64 }).notNull(),
  content: text("content"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: varchar("created_by").references(() => users.id, { onDelete: 'set null' }),
  meta: jsonb("meta").default("{}"),
});

/* ------------------------------------------------------------------ */
/*  Modern Estimates (new workflow)                                   */
/* ------------------------------------------------------------------ */
export const modernEstimates = pgTable(
  "modern_estimates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 255 }).notNull().default('New Estimate'),
    estimateNumber: varchar("estimate_number", { length: 50 }).notNull().unique().default(sql`'EST-' || upper(substring(replace(uuid_generate_v4()::text, '-', ''), 1, 12))`),
    leadId: uuid("lead_id").references(() => leads.id, { onDelete: 'set null' }),
    customerId: integer("customer_id").references(() => contacts.id, { onDelete: 'set null' }),
    jobId: integer("job_id").references(() => jobs.id, { onDelete: 'set null' }),
    status: varchar("status", { length: 20, enum: ESTIMATE_STATUSES }).notNull().default("draft"),
    estimateType: varchar("estimate_type", { length: 20, enum: ESTIMATE_TYPES }).notNull().default("detailed"),
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }).default("0.00").notNull(),
    taxRate: decimal("tax_rate", { precision: 5, scale: 4 }).default("0.0000").notNull(),
    total: decimal("total", { precision: 10, scale: 2 }).default("0.00").notNull(),
    notes: text("notes"),
    termsAndConditions: text("terms_and_conditions"),
    validUntil: date("valid_until"),
    signature: text("signature"),
    signatureDate: timestamp("signature_date"),
    sentAt: timestamp("sent_at"),
    approvedAt: timestamp("approved_at"),
    declinedAt: timestamp("declined_at"), 
    archivedAt: timestamp("archived_at"), 
    convertedAt: timestamp("converted_at"), 
    versionOf: uuid("version_of").references(() => modernEstimates.id, { onDelete: 'set null' }),
    optionGroupId: uuid("option_group_id"),
    isTemplate: boolean("is_template").default(false).notNull(),
    synced: boolean("synced").default(true).notNull(),
    createdBy: varchar("created_by").references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
  },
  (t) => ({
    leadIdx: index("IDX_modern_estimates_lead").on(t.leadId),
    statusIdx: index("IDX_modern_estimates_status").on(t.status),
    customerIdx: index("IDX_modern_estimates_customer").on(t.customerId),
    jobIdx: index("IDX_modern_estimates_job").on(t.jobId),
    optionGroupIdx: index("IDX_modern_estimates_option_group").on(t.optionGroupId),
    versionOfIdx: index("IDX_modern_estimates_version_of").on(t.versionOf),
  }),
);

export const estimateLineItems = pgTable(
  "estimate_line_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    estimateId: uuid("estimate_id").references(() => modernEstimates.id, { onDelete: 'cascade' }).notNull(),
    title: text("title").notNull(), 
    description: text("description"),
    quantity: decimal("quantity", { precision: 10, scale: 2 }).default("1.00").notNull(),
    unit: varchar("unit", { length: 50 }), 
    unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
    markupPct: decimal("markup_pct", { precision: 5, scale: 2 }).default("0.00"),
    category: varchar("category", { length: 64 }),
    total: decimal("total", { precision: 10, scale: 2 }).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
  },
  (t) => ({
    estimateIdx: index("IDX_estimate_line_items_est").on(t.estimateId)
  }),
);

export const estimateTemplates = pgTable(
  "estimate_templates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 128 }).notNull(),
    description: text("description"),
    industryTag: jsonb("industry_tag").$type<string[]>(),
    visibility: varchar("visibility", { length: 20, enum: TEMPLATE_VISIBILITY_TYPES }).default("private"),
    defaultTaxRate: decimal("default_tax_rate", { precision: 5, scale: 4 }).default("0.0000"),
    defaultNotes: text("default_notes"),
    defaultTerms: text("default_terms"),
    lineItemsJson: jsonb("line_items_json").notNull().$type<Array<Omit<typeof estimateLineItems.$inferInsert, 'id' | 'estimateId'>>>(),
    createdBy: varchar("created_by").references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
  },
   (t) => ({
    nameIdx: index("IDX_estimate_templates_name").on(t.name),
    visibilityIdx: index("IDX_estimate_templates_visibility").on(t.visibility),
  }),
);

// --- Remaining Tables (Legacy and Operational) ---

export const projectUpdates = pgTable("project_updates", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").references(() => contacts.id, { onDelete: 'cascade' }).notNull(),
  updateNumber: integer("update_number").notNull(),
  updateType: varchar("update_type", { length: 50 }).default("general"),
  workNeeded: text("work_needed"),
  customerRequests: text("customer_requests"),
  siteConditions: text("site_conditions"),
  additionalNotes: text("additional_notes"),
  createdBy: integer("created_by").references(() => employees.id, { onDelete: 'set null' }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ------------------------------------------------------------------
//  Change Orders (uses modern_estimates only)
// ------------------------------------------------------------------
export const changeOrders = pgTable("change_orders", {
  id: serial("id").primaryKey(),
  changeOrderNumber: text("change_order_number").notNull().unique(),
  originalEstimateId: uuid("original_estimate_id")
    .references(() => modernEstimates.id, { onDelete: "cascade" })
    .notNull(),
  newEstimateId: uuid("new_estimate_id")
    .references(() => modernEstimates.id, { onDelete: "cascade" })
    .notNull(),
  originalAmount: decimal("original_amount", { precision: 10, scale: 2 }).notNull(),
  newAmount: decimal("new_amount", { precision: 10, scale: 2 }).notNull(),
  changeAmount: decimal("change_amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id, { onDelete: 'cascade' }).notNull(),
  jobId: integer("job_id").references(() => jobs.id, { onDelete: 'set null' }),
  estimateId: integer("estimate_id").references(() => estimates.id, { onDelete: 'set null' }),
  modernEstimateId: uuid("modern_estimate_id").references(() => modernEstimates.id, { onDelete: 'set null' }),
  invoiceNumber: text("invoice_number").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxRate: decimal("tax_rate", { precision: 5, scale: 4 }).default("0"),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).default("0"),
  balanceDue: decimal("balance_due", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  paymentTerms: varchar("payment_terms", { length: 50 }).default("net_30"),
  isRecurring: boolean("is_recurring").default(false),
  recurringInterval: varchar("recurring_interval", { length: 20 }),
  recurringEndDate: timestamp("recurring_end_date"),
  nextInvoiceDate: timestamp("next_invoice_date"),
  dueDate: timestamp("due_date"),
  sentAt: timestamp("sent_at"),
  paidAt: timestamp("paid_at"),
  lastReminderSent: timestamp("last_reminder_sent"),
  items: text("items"),
  notes: text("notes"),
  internalNotes: text("internal_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").references(() => invoices.id, { onDelete: 'cascade' }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
  paymentReference: text("payment_reference"),
  paymentDate: timestamp("payment_date").notNull(),
  notes: text("notes"),
  processedBy: integer("processed_by").references(() => employees.id, { onDelete: 'set null' }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const recurringBilling = pgTable("recurring_billing", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id, { onDelete: 'cascade' }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  frequency: varchar("frequency", { length: 20 }).notNull(),
  dayOfWeek: integer("day_of_week"),
  dayOfMonth: integer("day_of_month"),
  monthOfYear: integer("month_of_year"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  nextBillDate: timestamp("next_bill_date").notNull(),
  lastInvoiceDate: timestamp("last_invoice_date"),
  isActive: boolean("is_active").default(true),
  autoGenerateInvoice: boolean("auto_generate_invoice").default(true),
  paymentTerms: varchar("payment_terms", { length: 50 }).default("net_30"),
  items: text("items"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const communications = pgTable("communications", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id, { onDelete: 'cascade' }).notNull(),
  jobId: integer("job_id").references(() => jobs.id, { onDelete: 'set null' }),
  type: varchar("type", { length: 50 }).notNull(),
  subject: text("subject"),
  content: text("content").notNull(),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contactActivities = pgTable("contact_activities", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").references(() => contacts.id, { onDelete: 'cascade' }).notNull(),
  activityType: varchar("activity_type", { length: 50 }).notNull(),
  subject: text("subject"),
  content: text("content").notNull(),
  scheduledAt: timestamp("scheduled_at"),
  completedAt: timestamp("completed_at"),
  createdBy: integer("created_by").references(() => employees.id, { onDelete: 'set null' }),
  isCompleted: boolean("is_completed").default(false),
  priority: varchar("priority", { length: 20 }).default("medium"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leadPipelineStages = pgTable("lead_pipeline_stages", {
  id: serial("id").primaryKey(),
  businessProfileId: integer("business_profile_id").references(() => businessProfiles.id, { onDelete: 'cascade' }).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  color: varchar("color", { length: 20 }).default("#3B82F6"),
  sortOrder: integer("sort_order").notNull(),
  isActive: boolean("is_active").default(true),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const leadPipelineEntries = pgTable("lead_pipeline_entries", {
  id: serial("id").primaryKey(),
  contactId: integer("contact_id").references(() => contacts.id, { onDelete: 'cascade' }).notNull(),
  stageId: integer("stage_id").references(() => leadPipelineStages.id, { onDelete: 'cascade' }).notNull(),
  probability: integer("probability").default(0),
  estimatedValue: decimal("estimated_value", { precision: 10, scale: 2 }),
  expectedCloseDate: timestamp("expected_close_date"),
  notes: text("notes"),
  enteredStageAt: timestamp("entered_stage_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const leadNotes = pgTable("lead_notes", {
  id: serial("id").primaryKey(),
  leadPipelineEntryId: integer("lead_pipeline_entry_id").references(() => leadPipelineEntries.id, { onDelete: 'cascade' }).notNull(),
  content: text("content").notNull(),
  noteType: varchar("note_type", { length: 50 }).default("general"),
  authorName: varchar("author_name", { length: 100 }).default("User"),
  isDeleted: boolean("is_deleted").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  fileName: text("file_name").notNull(),
  originalName: text("original_name").notNull(),
  fileType: text("file_type").notNull(),
  mimeType: text("mime_type").notNull(),
  fileSize: integer("file_size").notNull(),
  fileUrl: text("file_url").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  customerId: integer("customer_id").references(() => customers.id, { onDelete: 'set null' }),
  jobId: integer("job_id").references(() => jobs.id, { onDelete: 'set null' }),
  // estimateId column pointed at legacy table – kept nullable for now, but FK removed.
  estimateId: integer("estimate_id"),
  modernEstimateId: uuid("modern_estimate_id").references(() => modernEstimates.id, { onDelete: 'set null' }),
  invoiceId: integer("invoice_id").references(() => invoices.id, { onDelete: 'set null' }),
  capturedAt: timestamp("captured_at"),
  gpsLocation: text("gps_location"),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const employeeAvailability = pgTable("employee_availability", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id, { onDelete: 'cascade' }).notNull(),
  date: timestamp("date").notNull(),
  isAvailable: boolean("is_available").default(true),
  startTime: varchar("start_time", { length: 5 }),
  endTime: varchar("end_time", { length: 5 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const workOrders = pgTable("work_orders", {
  id: serial("id").primaryKey(),
  workOrderNumber: text("work_order_number").notNull().unique(),
  jobId: integer("job_id").references(() => jobs.id, { onDelete: 'cascade' }).notNull(),
  estimateId: integer("estimate_id").references(() => estimates.id, { onDelete: 'set null' }),
  modernEstimateId: uuid("modern_estimate_id").references(() => modernEstimates.id, { onDelete: 'set null' }),
  customerId: integer("customer_id").references(() => customers.id, { onDelete: 'cascade' }).notNull(),
  assignedTechnicianId: integer("assigned_technician_id").references(() => employees.id, { onDelete: 'set null' }),
  title: text("title").notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).notNull().default("scheduled"),
  priority: varchar("priority", { length: 20 }).notNull().default("normal"),
  scheduledStartDate: timestamp("scheduled_start_date"),
  actualStartDate: timestamp("actual_start_date"),
  scheduledEndDate: timestamp("scheduled_end_date"),
  actualEndDate: timestamp("actual_end_date"),
  estimatedHours: decimal("estimated_hours", { precision: 5, scale: 2 }),
  actualHours: decimal("actual_hours", { precision: 5, scale: 2 }),
  customerSignatureUrl: text("customer_signature_url"),
  completionNotes: text("completion_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  businessProfileId: integer("business_profile_id").references(() => businessProfiles.id, { onDelete: 'cascade' }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  priority: varchar("priority", { length: 20 }).notNull().default("medium"),
  isRead: boolean("is_read").default(false).notNull(),
  relatedEntityType: varchar("related_entity_type", { length: 50 }),
  relatedEntityId: integer("related_entity_id"),
  actionUrl: text("action_url"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const workOrderTasks = pgTable("work_order_tasks", {
  id: serial("id").primaryKey(),
  workOrderId: integer("work_order_id").references(() => workOrders.id, { onDelete: 'cascade' }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  orderIndex: integer("order_index").notNull().default(0),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  estimatedMinutes: integer("estimated_minutes"),
  actualMinutes: integer("actual_minutes"),
  completedAt: timestamp("completed_at"),
  completedByTechnicianId: integer("completed_by_technician_id").references(() => employees.id, { onDelete: 'set null' }),
  notes: text("notes"),
  requiresPhoto: boolean("requires_photo").default(false),
  requiresSignature: boolean("requires_signature").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const timeEntries = pgTable("time_entries", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id, { onDelete: 'cascade' }).notNull(),
  workOrderId: integer("work_order_id").references(() => workOrders.id, { onDelete: 'set null' }),
  jobId: integer("job_id").references(() => jobs.id, { onDelete: 'set null' }),
  clockInTime: timestamp("clock_in_time").notNull(),
  clockOutTime: timestamp("clock_out_time"),
  totalMinutes: integer("total_minutes"),
  isOvertime: boolean("is_overtime").default(false),
  hourlyRate: decimal("hourly_rate", { precision: 8, scale: 2 }),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  description: text("description"),
  clockInLatitude: decimal("clock_in_latitude", { precision: 10, scale: 8 }),
  clockInLongitude: decimal("clock_in_longitude", { precision: 11, scale: 8 }),
  clockOutLatitude: decimal("clock_out_latitude", { precision: 10, scale: 8 }),
  clockOutLongitude: decimal("clock_out_longitude", { precision: 11, scale: 8 }),
  clockInAddress: text("clock_in_address"),
  clockOutAddress: text("clock_out_address"),
  isLocationVerified: boolean("is_location_verified").default(false),
  locationAccuracy: decimal("location_accuracy", { precision: 6, scale: 2 }),
  gpsLocation: text("gps_location"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  sku: text("sku").unique(),
  category: varchar("category", { length: 50 }).notNull().default("general"),
  unit: varchar("unit", { length: 20 }).notNull().default("each"),
  currentStock: integer("current_stock").notNull().default(0),
  minimumStock: integer("minimum_stock").notNull().default(0),
  maximumStock: integer("maximum_stock"),
  unitCost: decimal("unit_cost", { precision: 10, scale: 4 }),
  retailPrice: decimal("retail_price", { precision: 10, scale: 2 }),
  supplierId: integer("supplier_id").references(() => suppliers.id, { onDelete: 'set null' }),
  location: text("location"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contactName: text("contact_name"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  website: text("website"),
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const workOrderMaterials = pgTable("work_order_materials", {
  id: serial("id").primaryKey(),
  workOrderId: integer("work_order_id").references(() => workOrders.id, { onDelete: 'cascade' }).notNull(),
  inventoryItemId: integer("inventory_item_id").references(() => inventoryItems.id, { onDelete: 'cascade' }).notNull(),
  quantityUsed: decimal("quantity_used", { precision: 10, scale: 4 }).notNull(),
  unitCost: decimal("unit_cost", { precision: 10, scale: 4 }).notNull(),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }).notNull(),
  usedAt: timestamp("used_at").defaultNow().notNull(),
  notes: text("notes"),
});

export const equipment = pgTable("equipment", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  make: text("make"),
  model: text("model"),
  year: integer("year"),
  serialNumber: text("serial_number"),
  licensePlate: text("license_plate"),
  purchaseDate: timestamp("purchase_date"),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }),
  currentValue: decimal("current_value", { precision: 10, scale: 2 }),
  status: varchar("status", { length: 20 }).notNull().default("available"),
  assignedToEmployeeId: integer("assigned_to_employee_id").references(() => employees.id, { onDelete: 'set null' }),
  location: text("location"),
  nextMaintenanceDate: timestamp("next_maintenance_date"),
  maintenanceInterval: integer("maintenance_interval"),
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

export const assignedRoutes = pgTable("assigned_routes", {
  id: serial("id").primaryKey(),
  technicianId: integer("technician_id").references(() => employees.id, { onDelete: 'cascade' }).notNull(),
  date: date("date").notNull(),
  totalDriveTime: integer("total_drive_time").notNull(),
  totalWorkTime: integer("total_work_time").notNull(),
  routeData: json("route_data").notNull(),
  status: text("status").default("assigned").notNull(),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
});

export const equipmentMaintenance = pgTable("equipment_maintenance", {
  id: serial("id").primaryKey(),
  equipmentId: integer("equipment_id").references(() => equipment.id, { onDelete: 'cascade' }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  description: text("description").notNull(),
  performedDate: timestamp("performed_date").notNull(),
  performedByEmployeeId: integer("performed_by_employee_id").references(() => employees.id, { onDelete: 'set null' }),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  supplierServiceId: integer("supplier_service_id").references(() => suppliers.id, { onDelete: 'set null' }),
  nextServiceDate: timestamp("next_service_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  businessProfile: one(businessProfiles, {
    fields: [users.businessProfileId],
    references: [businessProfiles.id],
  }),
  createdLeads: many(leads, { relationName: 'leadCreator' }),
  createdLeadEvents: many(leadEvents),
  createdModernEstimates: many(modernEstimates),
  createdEstimateTemplates: many(estimateTemplates),
}));

export const contactsRelations = relations(contacts, ({ many }) => ({
  jobs: many(jobs),
  legacyEstimates: many(estimates, { relationName: 'legacyEstimatesForContact' }),
  modernEstimates: many(modernEstimates),
  invoices: many(invoices),
  communications: many(communications),
  activities: many(contactActivities),
  projectUpdates: many(projectUpdates),
  leads: many(leads, { relationName: 'leadsFromContactOrigin' }),
}));

export const projectUpdatesRelations = relations(projectUpdates, ({ one }) => ({
  contact: one(contacts, {
    fields: [projectUpdates.contactId],
    references: [contacts.id],
  }),
  createdByEmployee: one(employees, {
    fields: [projectUpdates.createdBy],
    references: [employees.id],
  }),
}));

export const customersRelations = contactsRelations; // Alias

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  customer: one(customers, {
    fields: [jobs.customerId],
    references: [customers.id],
  }),
  legacyEstimates: many(estimates, { relationName: 'legacyEstimatesForJob' }),
  modernEstimates: many(modernEstimates),
  invoices: many(invoices),
  communications: many(communications),
  workOrders: many(workOrders),
  timeEntries: many(timeEntries),
  assignedTechnician: one(employees, {
    fields: [jobs.assignedTechnicianId],
    references: [employees.id],
  }),
}));

// Legacy estimates relations
export const estimatesRelations = relations(estimates, ({ one, many }) => ({
  customer: one(customers, {
    fields: [estimates.customerId],
    references: [customers.id],
  }),
  job: one(jobs, {
    fields: [estimates.jobId],
    references: [jobs.id],
  }),
  parentEstimate: one(estimates, {
    fields: [estimates.parentEstimateId],
    references: [estimates.id],
    relationName: "revisionsOfEstimate",
  }),
  childEstimates: many(estimates, { relationName: "revisionsOfEstimate" }),
  originalChangeOrders: many(changeOrders, { relationName: "originalEstimateForChangeOrder" }),
  newChangeOrders: many(changeOrders, { relationName: "newEstimateForChangeOrder" }),
  invoices: many(invoices),
  documents: many(documents, { relationName: "documentsForLegacyEstimate" }),
}));

export const changeOrdersRelations = relations(changeOrders, ({ one }) => ({
  originalEstimate: one(estimates, {
    fields: [changeOrders.originalEstimateId],
    references: [estimates.id],
    relationName: "originalEstimateForChangeOrder",
  }),
  newEstimate: one(estimates, {
    fields: [changeOrders.newEstimateId],
    references: [estimates.id],
    relationName: "newEstimateForChangeOrder",
  }),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  customer: one(customers, {
    fields: [invoices.customerId],
    references: [customers.id],
  }),
  job: one(jobs, {
    fields: [invoices.jobId],
    references: [jobs.id],
  }),
  legacyEstimate: one(estimates, {
    fields: [invoices.estimateId],
    references: [estimates.id],
  }),
  modernEstimate: one(modernEstimates, {
    fields: [invoices.modernEstimateId],
    references: [modernEstimates.id],
  }),
  payments: many(payments),
  documents: many(documents, { relationName: "documentsForInvoice" }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  invoice: one(invoices, {
    fields: [payments.invoiceId],
    references: [invoices.id],
  }),
  processedByEmployee: one(employees, {
    fields: [payments.processedBy],
    references: [employees.id],
  }),
}));

export const recurringBillingRelations = relations(recurringBilling, ({ one }) => ({
  customer: one(customers, {
    fields: [recurringBilling.customerId],
    references: [customers.id],
  }),
}));

export const communicationsRelations = relations(communications, ({ one }) => ({
  customer: one(customers, {
    fields: [communications.customerId],
    references: [customers.id],
  }),
  job: one(jobs, {
    fields: [communications.jobId],
    references: [jobs.id],
  }),
}));

export const contactActivitiesRelations = relations(contactActivities, ({ one }) => ({
  contact: one(contacts, {
    fields: [contactActivities.contactId],
    references: [contacts.id],
  }),
  createdByEmployee: one(employees, {
    fields: [contactActivities.createdBy],
    references: [employees.id],
  }),
}));

export const leadPipelineStagesRelations = relations(leadPipelineStages, ({ one, many }) => ({
  businessProfile: one(businessProfiles, {
    fields: [leadPipelineStages.businessProfileId],
    references: [businessProfiles.id],
  }),
  pipelineEntries: many(leadPipelineEntries),
}));

export const leadPipelineEntriesRelations = relations(leadPipelineEntries, ({ one, many }) => ({
  contact: one(contacts, {
    fields: [leadPipelineEntries.contactId],
    references: [contacts.id],
  }),
  stage: one(leadPipelineStages, {
    fields: [leadPipelineEntries.stageId],
    references: [leadPipelineStages.id],
  }),
  notes: many(leadNotes),
}));

export const leadNotesRelations = relations(leadNotes, ({ one }) => ({
  leadPipelineEntry: one(leadPipelineEntries, {
    fields: [leadNotes.leadPipelineEntryId],
    references: [leadPipelineEntries.id],
  }),
}));

export const leadsRelations = relations(leads, ({ one, many }) => ({
  events: many(leadEvents),
  originContact: one(contacts, {
    fields: [leads.originContactId],
    references: [contacts.id],
    relationName: 'leadsFromContactOrigin',
  }),
  job: one(jobs, {
    fields: [leads.jobId],
    references: [jobs.id],
  }),
  modernEstimates: many(modernEstimates),
  assignedToUser: one(users, {
    fields: [leads.assignedTo],
    references: [users.id]
  })
}));

export const leadEventsRelations = relations(leadEvents, ({ one }) => ({
  lead: one(leads, {
    fields: [leadEvents.leadId],
    references: [leads.id],
  }),
  createdByUser: one(users, {
    fields: [leadEvents.createdBy],
    references: [users.id],
  }),
}));

// New Modern Estimate Relations
export const modernEstimatesRelations = relations(modernEstimates, ({ one, many }) => ({
  lead: one(leads, {
    fields: [modernEstimates.leadId],
    references: [leads.id],
  }),
  customer: one(contacts, {
    fields: [modernEstimates.customerId],
    references: [contacts.id],
  }),
  job: one(jobs, {
    fields: [modernEstimates.jobId],
    references: [jobs.id],
  }),
  createdByUser: one(users, {
    fields: [modernEstimates.createdBy],
    references: [users.id],
  }),
  lineItems: many(estimateLineItems),
  originalEstimate: one(modernEstimates, {
    fields: [modernEstimates.versionOf],
    references: [modernEstimates.id],
    relationName: "versionsOfEstimate",
  }),
  versions: many(modernEstimates, { relationName: "versionsOfEstimate" }),
  documents: many(documents, {relationName: "documentsForModernEstimate"}),
  invoices: many(invoices),
}));

export const estimateLineItemsRelations = relations(estimateLineItems, ({ one }) => ({
  estimate: one(modernEstimates, {
    fields: [estimateLineItems.estimateId],
    references: [modernEstimates.id],
  }),
}));

export const estimateTemplatesRelations = relations(estimateTemplates, ({ one }) => ({
  createdByUser: one(users, {
    fields: [estimateTemplates.createdBy],
    references: [users.id],
  }),
}));


export const notificationsRelations = relations(notifications, ({ one }) => ({
  businessProfile: one(businessProfiles, {
    fields: [notifications.businessProfileId],
    references: [businessProfiles.id],
  }),
}));

export const employeesRelations = relations(employees, ({ one, many }) => ({
  permissions: one(employeePermissions, {
    fields: [employees.id],
    references: [employeePermissions.employeeId],
  }),
  assignedWorkOrders: many(workOrders, { relationName: "technicianForWorkOrder"}),
  timeEntries: many(timeEntries),
  completedTasks: many(workOrderTasks, { relationName: "technicianWhoCompletedTask"}),
  assignedEquipment: many(equipment, { relationName: "employeeAssignedToEquipment"}),
  performedMaintenance: many(equipmentMaintenance, { relationName: "employeeWhoPerformedMaintenance"}),
  createdProjectUpdates: many(projectUpdates),
  createdContactActivities: many(contactActivities),
  processedPayments: many(payments),
  assignedJobs: many(jobs, {relationName: "technicianForJob"}),
}));

export const employeePermissionsRelations = relations(employeePermissions, ({ one }) => ({
  employee: one(employees, {
    fields: [employeePermissions.employeeId],
    references: [employees.id],
  }),
}));

export const workOrdersRelations = relations(workOrders, ({ one, many }) => ({
  job: one(jobs, {
    fields: [workOrders.jobId],
    references: [jobs.id],
  }),
  legacyEstimate: one(estimates, {
    fields: [workOrders.estimateId],
    references: [estimates.id],
  }),
  modernEstimate: one(modernEstimates, {
    fields: [workOrders.modernEstimateId],
    references: [modernEstimates.id],
  }),
  customer: one(customers, {
    fields: [workOrders.customerId],
    references: [customers.id],
  }),
  assignedTechnician: one(employees, {
    fields: [workOrders.assignedTechnicianId],
    references: [employees.id],
    relationName: "technicianForWorkOrder",
  }),
  tasks: many(workOrderTasks),
  timeEntries: many(timeEntries),
  materials: many(workOrderMaterials),
}));

export const workOrderTasksRelations = relations(workOrderTasks, ({ one }) => ({
  workOrder: one(workOrders, {
    fields: [workOrderTasks.workOrderId],
    references: [workOrders.id],
  }),
  completedByTechnician: one(employees, {
    fields: [workOrderTasks.completedByTechnicianId],
    references: [employees.id],
    relationName: "technicianWhoCompletedTask",
  }),
}));

export const timeEntriesRelations = relations(timeEntries, ({ one }) => ({
  employee: one(employees, {
    fields: [timeEntries.employeeId],
    references: [employees.id],
  }),
  workOrder: one(workOrders, {
    fields: [timeEntries.workOrderId],
    references: [workOrders.id],
  }),
  job: one(jobs, {
    fields: [timeEntries.jobId],
    references: [jobs.id],
  }),
}));

export const inventoryItemsRelations = relations(inventoryItems, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [inventoryItems.supplierId],
    references: [suppliers.id],
  }),
  workOrderMaterials: many(workOrderMaterials),
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  inventoryItems: many(inventoryItems),
  maintenanceServices: many(equipmentMaintenance, {relationName: "supplierForMaintenance"}),
}));

export const workOrderMaterialsRelations = relations(workOrderMaterials, ({ one }) => ({
  workOrder: one(workOrders, {
    fields: [workOrderMaterials.workOrderId],
    references: [workOrders.id],
  }),
  inventoryItem: one(inventoryItems, {
    fields: [workOrderMaterials.inventoryItemId],
    references: [inventoryItems.id],
  }),
}));

export const equipmentRelations = relations(equipment, ({ one, many }) => ({
  assignedToEmployee: one(employees, {
    fields: [equipment.assignedToEmployeeId],
    references: [employees.id],
    relationName: "employeeAssignedToEquipment",
  }),
  maintenanceHistory: many(equipmentMaintenance),
}));

export const equipmentMaintenanceRelations = relations(equipmentMaintenance, ({ one }) => ({
  equipment: one(equipment, {
    fields: [equipmentMaintenance.equipmentId],
    references: [equipment.id],
  }),
  performedByEmployee: one(employees, {
    fields: [equipmentMaintenance.performedByEmployeeId],
    references: [employees.id],
    relationName: "employeeWhoPerformedMaintenance",
  }),
  supplierService: one(suppliers, {
    fields: [equipmentMaintenance.supplierServiceId],
    references: [suppliers.id],
    relationName: "supplierForMaintenance",
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  customer: one(contacts, {
    fields: [documents.customerId],
    references: [contacts.id],
  }),
  job: one(jobs, {
    fields: [documents.jobId],
    references: [jobs.id],
  }),
  legacyEstimate: one(estimates, {
    fields: [documents.estimateId],
    references: [estimates.id],
    relationName: "documentsForLegacyEstimate",
  }),
  modernEstimate: one(modernEstimates, {
    fields: [documents.modernEstimateId],
    references: [modernEstimates.id],
    relationName: "documentsForModernEstimate",
  }),
  invoice: one(invoices, {
    fields: [documents.invoiceId],
    references: [invoices.id],
    relationName: "documentsForInvoice",
  }),
}));

// Business Profile relations (usually a singleton, but can have relations to default templates etc.)
export const businessProfilesRelations = relations(businessProfiles, ({ many }) => ({
  users: many(users),
  leadPipelineStages: many(leadPipelineStages),
  notifications: many(notifications),
}));


// Insert schemas
export const insertContactSchema = createInsertSchema(contacts, {
  status: z.enum(["lead", "customer", "past_customer", "vendor", "subcontractor"]),
  leadSource: z.enum(["referral", "website", "google", "facebook", "repeat_customer", "word_of_mouth", "other"]).optional(),
  leadScore: z.number().min(0).max(5).optional(),
  preferredContactMethod: z.enum(["phone", "email", "text"]),
  propertyType: z.enum(["residential", "commercial"]),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCustomerSchema = insertContactSchema; // Alias

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  scheduledDate: z.string().datetime().optional().or(z.date().optional()),
  estimatedValue: z.union([z.string(), z.number()]).optional().nullable(),
  actualValue: z.union([z.string(), z.number()]).optional().nullable(),
});

// Legacy estimate insert schema
export const insertEstimateSchema = createInsertSchema(estimates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  subtotal: z.union([z.string(), z.number()]).optional(),
  discountType: z.enum(["none", "percentage", "fixed"]).optional(),
  discountValue: z.union([z.string(), z.number()]).optional(),
  discountAmount: z.union([z.string(), z.number()]).optional(),
  taxRate: z.union([z.string(), z.number()]).optional(),
  taxAmount: z.union([z.string(), z.number()]).optional(),
  depositType: z.enum(["none", "percentage", "fixed"]).optional(),
  depositValue: z.union([z.string(), z.number()]).optional(),
  depositAmount: z.union([z.string(), z.number()]).optional(),
  customerSignatureUrl: z.string().optional().nullable(),
  companySignatureUrl: z.string().optional().nullable(),
  includeLicense: z.boolean().optional(),
  includeInsurance: z.boolean().optional(),
  includeCerts: z.boolean().optional(),
  termsAndConditions: z.string().optional(),
  notesForCustomer: z.string().optional(),
});

/* ---------- Modern Estimate insert schemas ---------- */
export const insertModernEstimateSchema = createInsertSchema(modernEstimates, {
  status: EstimateStatusEnum,
  estimateType: EstimateTypeEnum,
  subtotal: z.union([z.string(), z.number()]).transform(val => Number(val).toFixed(2)),
  taxRate: z.union([z.string(), z.number()]).transform(val => Number(val).toFixed(4)),
  total: z.union([z.string(), z.number()]).transform(val => Number(val).toFixed(2)),
  validUntil: z.string().datetime().optional().nullable().or(z.date().optional().nullable()),
  signatureDate: z.string().datetime().optional().nullable().or(z.date().optional().nullable()),
  sentAt: z.string().datetime().optional().nullable().or(z.date().optional().nullable()),
  approvedAt: z.string().datetime().optional().nullable().or(z.date().optional().nullable()),
  declinedAt: z.string().datetime().optional().nullable().or(z.date().optional().nullable()),
  archivedAt: z.string().datetime().optional().nullable().or(z.date().optional().nullable()),
  convertedAt: z.string().datetime().optional().nullable().or(z.date().optional().nullable()),
  lineItems: z.array(createInsertSchema(estimateLineItems).omit({id: true, estimateId: true})).optional(), // For creating with line items
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  estimateNumber: true, // Auto-generated
});

export const updateModernEstimateSchema = insertModernEstimateSchema.partial().omit({ 
  createdBy: true, // Cannot change creator
  // estimateNumber: true, // Should not be updatable, already omitted by insert schema
});


export const insertEstimateLineItemSchema = createInsertSchema(estimateLineItems, {
  quantity: z.union([z.string(), z.number()]).transform(val => Number(val).toFixed(2)),
  unitPrice: z.union([z.string(), z.number()]).transform(val => Number(val).toFixed(2)),
  markupPct: z.union([z.string(), z.number()]).optional().nullable().transform(val => val !== undefined && val !== null ? Number(val).toFixed(2) : undefined),
  total: z.union([z.string(), z.number()]).transform(val => Number(val).toFixed(2)),
}).omit({
  id: true, // Auto-generated
});

export const updateEstimateLineItemSchema = insertEstimateLineItemSchema.partial().omit({
  estimateId: true, // Should not change the parent estimate
});


export const insertEstimateTemplateSchema = createInsertSchema(estimateTemplates, {
  visibility: TemplateVisibilityEnum,
  lineItemsJson: z.array(insertEstimateLineItemSchema.omit({estimateId: true})), // Validate structure of lineItemsJson
  defaultTaxRate: z.union([z.string(), z.number()]).optional().nullable().transform(val => val !== undefined && val !== null ? Number(val).toFixed(4) : undefined),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateEstimateTemplateSchema = insertEstimateTemplateSchema.partial().omit({
  createdBy: true, // Cannot change creator
});


export const insertChangeOrderSchema = createInsertSchema(changeOrders).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  customerId: z.number(),
  jobId: z.number().optional().nullable(),
  estimateId: z.number().optional().nullable(),
  modernEstimateId: z.string().uuid().optional().nullable(),
  invoiceNumber: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  subtotal: z.union([z.string(), z.number()]).optional(),
  taxRate: z.union([z.string(), z.number()]).optional(),
  taxAmount: z.union([z.string(), z.number()]).optional(),
  totalAmount: z.union([z.string(), z.number()]),
  paidAmount: z.union([z.string(), z.number()]).optional(),
  balanceDue: z.union([z.string(), z.number()]).optional(),
  status: z.string().optional(),
  paymentTerms: z.string().optional(),
  isRecurring: z.boolean().optional(),
  recurringInterval: z.string().optional(),
  items: z.string().optional(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
  dueDate: z.string().optional().nullable(),
  sentAt: z.string().optional().nullable(),
  paidAt: z.string().optional().nullable(),
  lastReminderSent: z.string().optional().nullable(),
  nextInvoiceDate: z.string().optional().nullable(),
  recurringEndDate: z.string().optional().nullable(),
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
}).extend({
  paymentDate: z.string().datetime().optional().or(z.date().optional()),
});

export const insertRecurringBillingSchema = createInsertSchema(recurringBilling).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  startDate: z.string().datetime().optional().or(z.date().optional()),
  endDate: z.string().datetime().optional().or(z.date().optional()).nullable(),
  nextBillDate: z.string().datetime().optional().or(z.date().optional()),
  lastInvoiceDate: z.string().datetime().optional().or(z.date().optional()).nullable(),
});

export const insertCommunicationSchema = createInsertSchema(communications).omit({
  id: true,
  createdAt: true,
});

export const insertBusinessProfileSchema = createInsertSchema(businessProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  companyBio: z.string().max(400, "Company bio must be 400 characters or less").optional(),
  yearFounded: z.number().min(1800).max(new Date().getFullYear()).optional(),
  businessStructure: z.enum(["sole_proprietorship", "llc", "corporation", "partnership", "other"]).optional(),
  preferredEstimateStyle: z.enum(["flat_project_price", "line_items", "grouped_by_category"]).default("flat_project_price"),
  bondedInsured: z.boolean().optional(),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeadEventSchema = createInsertSchema(leadEvents).omit({
  id: true,
  createdAt: true,
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmployeePermissionsSchema = createInsertSchema(employeePermissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPermissionsSchema = createInsertSchema(permissions).omit({ // Legacy
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
});

export const insertWorkOrderSchema = createInsertSchema(workOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  workOrderNumber: z.string().optional(),
  scheduledStartDate: z.string().datetime().optional().or(z.date().optional()),
  actualStartDate: z.string().datetime().optional().or(z.date().optional()),
  scheduledEndDate: z.string().datetime().optional().or(z.date().optional()),
  actualEndDate: z.string().datetime().optional().or(z.date().optional()),
});

export const insertWorkOrderTaskSchema = createInsertSchema(workOrderTasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTimeEntrySchema = createInsertSchema(timeEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  clockInTime: z.string().datetime().or(z.date()),
  clockOutTime: z.string().datetime().optional().or(z.date().optional()),
});

export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWorkOrderMaterialSchema = createInsertSchema(workOrderMaterials).omit({
  id: true,
});

export const insertEquipmentSchema = createInsertSchema(equipment).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  purchaseDate: z.string().datetime().optional().or(z.date().optional()),
  nextMaintenanceDate: z.string().datetime().optional().or(z.date().optional()),
});

export const insertEquipmentMaintenanceSchema = createInsertSchema(equipmentMaintenance).omit({
  id: true,
  createdAt: true,
}).extend({
  performedDate: z.string().datetime().or(z.date()),
  nextServiceDate: z.string().datetime().optional().or(z.date().optional()),
});

export const insertContactActivitySchema = createInsertSchema(contactActivities, {
  activityType: z.enum(["call", "email", "meeting", "note", "follow_up"]),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  scheduledAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
}).omit({
  id: true,
  createdAt: true,
});

export const insertLeadPipelineStageSchema = createInsertSchema(leadPipelineStages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeadPipelineEntrySchema = createInsertSchema(leadPipelineEntries, {
  expectedCloseDate: z.string().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  enteredStageAt: true,
});

export const insertLeadNoteSchema = createInsertSchema(leadNotes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectUpdateSchema = createInsertSchema(projectUpdates).omit({
  id: true,
  updateNumber: true,
  createdAt: true,
}).extend({
  updateType: z.enum(["general", "site_visit", "phone_call", "email", "scope_change"]).default("general"),
  workNeeded: z.string().optional(),
  customerRequests: z.string().optional(),
  siteConditions: z.string().optional(),
  additionalNotes: z.string().optional(),
});

// Types
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;

export type ContactActivity = typeof contactActivities.$inferSelect;
export type InsertContactActivity = z.infer<typeof insertContactActivitySchema>;

export type LeadPipelineStage = typeof leadPipelineStages.$inferSelect;
export type InsertLeadPipelineStage = z.infer<typeof insertLeadPipelineStageSchema>;

export type LeadPipelineEntry = typeof leadPipelineEntries.$inferSelect;
export type InsertLeadPipelineEntry = z.infer<typeof insertLeadPipelineEntrySchema>;

export type LeadNote = typeof leadNotes.$inferSelect;
export type InsertLeadNote = z.infer<typeof insertLeadNoteSchema>;

export type ProjectUpdate = typeof projectUpdates.$inferSelect;
export type InsertProjectUpdate = z.infer<typeof insertProjectUpdateSchema>;

export const fieldNotesToEstimateSchema = z.object({
  customerId: z.number(),
  jobId: z.number().optional().nullable(),
  fieldNotes: z.string().min(10, "Field notes must be at least 10 characters"),
  serviceType: z.string().min(1, "Service type is required"),
  propertyType: z.enum(["residential", "commercial"]).default("residential"),
  customerContext: z.object({
    firstName: z.string(),
    lastName: z.string(),
    propertyType: z.string(),
    address: z.string().optional(),
    notes: z.string().optional(),
  }),
  businessContext: z.object({
    businessName: z.string(),
    serviceTypes: z.array(z.string()),
    specializations: z.array(z.string()).optional(),
    warranties: z.string().optional(),
    insuranceInfo: z.string().optional(),
  }),
  estimatePreferences: z.object({
    includeWarranties: z.boolean().default(true),
    tone: z.enum(["professional", "friendly", "technical"]).default("professional"),
    detailLevel: z.enum(["basic", "detailed", "comprehensive"]).default("detailed"),
  }).optional(),
});

export type FieldNotesToEstimateRequest = z.infer<typeof fieldNotesToEstimateSchema>;

export type Customer = typeof customers.$inferSelect; // Alias
export type InsertCustomer = z.infer<typeof insertCustomerSchema>; // Alias

export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;

export type Estimate = typeof estimates.$inferSelect; // Legacy
export type InsertEstimate = z.infer<typeof insertEstimateSchema>; // Legacy

export type ChangeOrder = typeof changeOrders.$inferSelect;
export type InsertChangeOrder = z.infer<typeof insertChangeOrderSchema>;

export type ModernEstimate = typeof modernEstimates.$inferSelect;
export type InsertModernEstimate = z.infer<typeof insertModernEstimateSchema>;
export type UpdateModernEstimate = z.infer<typeof updateModernEstimateSchema>;


export type EstimateLineItem = typeof estimateLineItems.$inferSelect;
export type InsertEstimateLineItem = z.infer<typeof insertEstimateLineItemSchema>;
export type UpdateEstimateLineItem = z.infer<typeof updateEstimateLineItemSchema>;

export type EstimateTemplate = typeof estimateTemplates.$inferSelect;
export type InsertEstimateTemplate = z.infer<typeof insertEstimateTemplateSchema>;
export type UpdateEstimateTemplate = z.infer<typeof updateEstimateTemplateSchema>;

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type RecurringBilling = typeof recurringBilling.$inferSelect;
export type InsertRecurringBilling = z.infer<typeof insertRecurringBillingSchema>;

export type Communication = typeof communications.$inferSelect;
export type InsertCommunication = z.infer<typeof insertCommunicationSchema>;

export type BusinessProfile = typeof businessProfiles.$inferSelect;
export type InsertBusinessProfile = z.infer<typeof insertBusinessProfileSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;

export type EmployeePermissions = typeof employeePermissions.$inferSelect;
export type InsertEmployeePermissions = z.infer<typeof insertEmployeePermissionsSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type Permission = typeof permissions.$inferSelect; // Legacy
export type InsertPermission = z.infer<typeof insertPermissionsSchema>; // Legacy

export type WorkOrder = typeof workOrders.$inferSelect;
export type InsertWorkOrder = z.infer<typeof insertWorkOrderSchema>;

export type WorkOrderTask = typeof workOrderTasks.$inferSelect;
export type InsertWorkOrderTask = z.infer<typeof insertWorkOrderTaskSchema>;

export type TimeEntry = typeof timeEntries.$inferSelect;
export type InsertTimeEntry = z.infer<typeof insertTimeEntrySchema>;

export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;

export type WorkOrderMaterial = typeof workOrderMaterials.$inferSelect;
export type InsertWorkOrderMaterial = z.infer<typeof insertWorkOrderMaterialSchema>;

export type Equipment = typeof equipment.$inferSelect;
export type InsertEquipment = z.infer<typeof insertEquipmentSchema>;

export type EquipmentMaintenance = typeof equipmentMaintenance.$inferSelect;
export type InsertEquipmentMaintenance = z.infer<typeof insertEquipmentMaintenanceSchema>;

export const aiEstimateRequestSchema = z.object({
  serviceType: z.string().min(1),
  propertySize: z.string().min(1),
  location: z.string().min(1),
  additionalNotes: z.string().optional(),
  customerId: z.number().optional(),
  projectDescription: z.string().optional(),
  targetBudget: z.string().optional(),
  complexity: z.enum(["simple", "standard", "complex"]).optional(),
  customerType: z.enum(["residential", "commercial"]).optional(),
  urgency: z.enum(["standard", "rush"]).optional(),
  additionalRequirements: z.string().optional(),
  pricingMethod: z.enum(["single_price", "line_items", "hybrid"]).optional(),
});

export const aiSocialContentRequestSchema = z.object({
  businessType: z.string().min(1),
  contentTheme: z.string().min(1),
  platforms: z.array(z.string()).min(1),
});

export type AIEstimateRequest = z.infer<typeof aiEstimateRequestSchema>;
export type AISocialContentRequest = z.infer<typeof aiSocialContentRequestSchema>;

export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;

export type LeadEvent = typeof leadEvents.$inferSelect;
export type InsertLeadEvent = z.infer<typeof insertLeadEventSchema>;

// Select Schemas (useful for API responses)
export const selectModernEstimateSchema = createSelectSchema(modernEstimates);
export const selectEstimateLineItemSchema = createSelectSchema(estimateLineItems);
export const selectEstimateTemplateSchema = createSelectSchema(estimateTemplates);
export const selectLeadSchema = createSelectSchema(leads);
export const selectLeadEventSchema = createSelectSchema(leadEvents);
export const selectContactSchema = createSelectSchema(contacts);
export const selectUserSchema = createSelectSchema(users);
// Add other select schemas as needed

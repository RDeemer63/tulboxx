var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  aiEstimateRequestSchema: () => aiEstimateRequestSchema,
  aiSocialContentRequestSchema: () => aiSocialContentRequestSchema,
  assignedRoutes: () => assignedRoutes,
  businessProfiles: () => businessProfiles,
  changeOrders: () => changeOrders,
  changeOrdersRelations: () => changeOrdersRelations,
  communications: () => communications,
  communicationsRelations: () => communicationsRelations,
  contactActivities: () => contactActivities,
  contactActivitiesRelations: () => contactActivitiesRelations,
  contacts: () => contacts,
  contactsRelations: () => contactsRelations,
  customers: () => customers,
  customersRelations: () => customersRelations,
  documents: () => documents2,
  employeeAvailability: () => employeeAvailability,
  employeePermissions: () => employeePermissions,
  employeePermissionsRelations: () => employeePermissionsRelations,
  employees: () => employees,
  employeesRelations: () => employeesRelations,
  equipment: () => equipment,
  equipmentMaintenance: () => equipmentMaintenance,
  equipmentMaintenanceRelations: () => equipmentMaintenanceRelations,
  equipmentRelations: () => equipmentRelations,
  estimates: () => estimates,
  estimatesRelations: () => estimatesRelations,
  fieldNotesToEstimateSchema: () => fieldNotesToEstimateSchema,
  insertBusinessProfileSchema: () => insertBusinessProfileSchema,
  insertChangeOrderSchema: () => insertChangeOrderSchema,
  insertCommunicationSchema: () => insertCommunicationSchema,
  insertContactActivitySchema: () => insertContactActivitySchema,
  insertContactSchema: () => insertContactSchema,
  insertCustomerSchema: () => insertCustomerSchema,
  insertDocumentSchema: () => insertDocumentSchema,
  insertEmployeePermissionsSchema: () => insertEmployeePermissionsSchema,
  insertEmployeeSchema: () => insertEmployeeSchema,
  insertEquipmentMaintenanceSchema: () => insertEquipmentMaintenanceSchema,
  insertEquipmentSchema: () => insertEquipmentSchema,
  insertEstimateSchema: () => insertEstimateSchema,
  insertInventoryItemSchema: () => insertInventoryItemSchema,
  insertInvoiceSchema: () => insertInvoiceSchema,
  insertJobSchema: () => insertJobSchema,
  insertLeadNoteSchema: () => insertLeadNoteSchema,
  insertLeadPipelineEntrySchema: () => insertLeadPipelineEntrySchema,
  insertLeadPipelineStageSchema: () => insertLeadPipelineStageSchema,
  insertNotificationSchema: () => insertNotificationSchema,
  insertPaymentSchema: () => insertPaymentSchema,
  insertPermissionsSchema: () => insertPermissionsSchema,
  insertProjectUpdateSchema: () => insertProjectUpdateSchema,
  insertRecurringBillingSchema: () => insertRecurringBillingSchema,
  insertSupplierSchema: () => insertSupplierSchema,
  insertTimeEntrySchema: () => insertTimeEntrySchema,
  insertUserSchema: () => insertUserSchema,
  insertWorkOrderMaterialSchema: () => insertWorkOrderMaterialSchema,
  insertWorkOrderSchema: () => insertWorkOrderSchema,
  insertWorkOrderTaskSchema: () => insertWorkOrderTaskSchema,
  inventoryItems: () => inventoryItems,
  inventoryItemsRelations: () => inventoryItemsRelations,
  invoices: () => invoices,
  invoicesRelations: () => invoicesRelations,
  jobs: () => jobs,
  jobsRelations: () => jobsRelations,
  leadNotes: () => leadNotes,
  leadNotesRelations: () => leadNotesRelations,
  leadPipelineEntries: () => leadPipelineEntries,
  leadPipelineEntriesRelations: () => leadPipelineEntriesRelations,
  leadPipelineStages: () => leadPipelineStages,
  leadPipelineStagesRelations: () => leadPipelineStagesRelations,
  notifications: () => notifications,
  notificationsRelations: () => notificationsRelations,
  payments: () => payments,
  paymentsRelations: () => paymentsRelations,
  permissions: () => permissions,
  permissionsRelations: () => permissionsRelations,
  projectUpdates: () => projectUpdates,
  projectUpdatesRelations: () => projectUpdatesRelations,
  recurringBilling: () => recurringBilling,
  recurringBillingRelations: () => recurringBillingRelations,
  sessions: () => sessions,
  suppliers: () => suppliers,
  suppliersRelations: () => suppliersRelations,
  timeEntries: () => timeEntries,
  timeEntriesRelations: () => timeEntriesRelations,
  users: () => users,
  workOrderMaterials: () => workOrderMaterials,
  workOrderMaterialsRelations: () => workOrderMaterialsRelations,
  workOrderTasks: () => workOrderTasks,
  workOrderTasksRelations: () => workOrderTasksRelations,
  workOrders: () => workOrders,
  workOrdersRelations: () => workOrdersRelations
});
import { pgTable, text, serial, integer, boolean, timestamp, decimal, varchar, json, date, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var sessions, users, contacts, projectUpdates, customers, jobs, estimates, changeOrders, invoices, payments, recurringBilling, communications, contactActivities, leadPipelineStages, leadPipelineEntries, leadNotes, businessProfiles, documents2, employees, employeeAvailability, employeePermissions, permissions, workOrders, notifications, workOrderTasks, timeEntries, inventoryItems, suppliers, workOrderMaterials, equipment, assignedRoutes, equipmentMaintenance, contactsRelations, projectUpdatesRelations, customersRelations, jobsRelations, estimatesRelations, changeOrdersRelations, invoicesRelations, paymentsRelations, recurringBillingRelations, communicationsRelations, contactActivitiesRelations, leadPipelineStagesRelations, leadPipelineEntriesRelations, leadNotesRelations, notificationsRelations, employeesRelations, employeePermissionsRelations, permissionsRelations, workOrdersRelations, workOrderTasksRelations, timeEntriesRelations, inventoryItemsRelations, suppliersRelations, workOrderMaterialsRelations, equipmentRelations, equipmentMaintenanceRelations, insertContactSchema, insertCustomerSchema, insertJobSchema, insertEstimateSchema, insertChangeOrderSchema, insertNotificationSchema, insertInvoiceSchema, insertPaymentSchema, insertRecurringBillingSchema, insertCommunicationSchema, insertBusinessProfileSchema, insertDocumentSchema, insertEmployeeSchema, insertEmployeePermissionsSchema, insertPermissionsSchema, insertUserSchema, insertWorkOrderSchema, insertWorkOrderTaskSchema, insertTimeEntrySchema, insertInventoryItemSchema, insertSupplierSchema, insertWorkOrderMaterialSchema, insertEquipmentSchema, insertEquipmentMaintenanceSchema, insertContactActivitySchema, insertLeadPipelineStageSchema, insertLeadPipelineEntrySchema, insertLeadNoteSchema, insertProjectUpdateSchema, fieldNotesToEstimateSchema, aiEstimateRequestSchema, aiSocialContentRequestSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    sessions = pgTable(
      "sessions",
      {
        sid: varchar("sid").primaryKey(),
        sess: json("sess").notNull(),
        expire: timestamp("expire").notNull()
      },
      (table) => [index("IDX_session_expire").on(table.expire)]
    );
    users = pgTable("users", {
      id: varchar("id").primaryKey().notNull(),
      email: varchar("email").unique(),
      passwordHash: text("password_hash").notNull(),
      firstName: varchar("first_name"),
      lastName: varchar("last_name"),
      profileImageUrl: varchar("profile_image_url"),
      businessProfileId: integer("business_profile_id").references(() => businessProfiles.id),
      role: text("role").notNull().default("owner"),
      // owner, admin, employee
      isActive: boolean("is_active").default(true),
      lastLoginAt: timestamp("last_login_at"),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    contacts = pgTable("contacts", {
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
      // residential, commercial
      accessInstructions: text("access_instructions"),
      preferredContactMethod: varchar("preferred_contact_method", { length: 20 }).default("phone"),
      // phone, email, text
      notes: text("notes"),
      // New contact status and lead management fields
      status: varchar("status", { length: 20 }).notNull().default("customer"),
      // lead, customer, past_customer, vendor, subcontractor
      leadSource: varchar("lead_source", { length: 50 }),
      // referral, website, google, facebook, repeat_customer, word_of_mouth
      leadScore: integer("lead_score").default(0),
      // 1-5 star rating for lead quality
      lastContactDate: timestamp("last_contact_date"),
      nextFollowUpDate: timestamp("next_follow_up_date"),
      convertedAt: timestamp("converted_at"),
      // When lead became customer
      tags: text("tags"),
      // JSON array of custom tags
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    projectUpdates = pgTable("project_updates", {
      id: serial("id").primaryKey(),
      contactId: integer("contact_id").references(() => contacts.id).notNull(),
      updateNumber: integer("update_number").notNull(),
      // 1, 2, 3, etc.
      updateType: varchar("update_type", { length: 50 }).default("general"),
      // site_visit, phone_call, email, scope_change
      // Guided field structure
      workNeeded: text("work_needed"),
      // What needs to be done?
      customerRequests: text("customer_requests"),
      // Customer requests/concerns
      siteConditions: text("site_conditions"),
      // Site conditions/measurements
      additionalNotes: text("additional_notes"),
      // Additional notes
      createdBy: integer("created_by").references(() => employees.id),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    customers = contacts;
    jobs = pgTable("jobs", {
      id: serial("id").primaryKey(),
      customerId: integer("customer_id").references(() => customers.id).notNull(),
      title: text("title").notNull(),
      description: text("description"),
      status: varchar("status", { length: 50 }).notNull().default("pending"),
      // pending, scheduled, in_progress, completed, cancelled
      serviceType: text("service_type").notNull(),
      scheduledDate: timestamp("scheduled_date"),
      scheduledStartTime: timestamp("scheduled_start_time"),
      scheduledEndTime: timestamp("scheduled_end_time"),
      estimatedDuration: integer("estimated_duration"),
      // Duration in minutes
      assignedTechnicianId: integer("assigned_technician_id").references(() => employees.id),
      completedDate: timestamp("completed_date"),
      estimatedValue: decimal("estimated_value", { precision: 10, scale: 2 }),
      actualValue: decimal("actual_value", { precision: 10, scale: 2 }),
      notes: text("notes"),
      calendarEventId: text("calendar_event_id"),
      // Google Calendar event ID for sync
      // Location fields for GPS/geofencing
      latitude: decimal("latitude", { precision: 10, scale: 8 }),
      // Job site GPS coordinates
      longitude: decimal("longitude", { precision: 11, scale: 8 }),
      address: text("address"),
      // Job site address
      geofenceRadius: integer("geofence_radius").default(100),
      // Radius in meters for location verification
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    estimates = pgTable("estimates", {
      id: serial("id").primaryKey(),
      customerId: integer("customer_id").references(() => customers.id).notNull(),
      jobId: integer("job_id").references(() => jobs.id),
      parentEstimateId: integer("parent_estimate_id"),
      // For change orders and revisions
      estimateNumber: text("estimate_number"),
      title: text("title").notNull(),
      description: text("description"),
      totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
      status: varchar("status", { length: 50 }).notNull().default("draft"),
      // draft, sent, accepted, rejected, expired
      type: varchar("type", { length: 50 }).notNull().default("original"),
      // original, revision, change_order
      version: integer("version").notNull().default(1),
      changeReason: text("change_reason"),
      // Reason for change order or revision
      validUntil: timestamp("valid_until"),
      sentAt: timestamp("sent_at"),
      respondedAt: timestamp("responded_at"),
      items: text("items"),
      // JSON string of estimate items
      /* ---------- Pricing breakdown fields ---------- */
      subtotal: decimal("subtotal", { precision: 10, scale: 2 }).default("0"),
      /* Discount */
      discountType: varchar("discount_type", { length: 20 }).default("none"),
      // none, percentage, fixed
      discountValue: decimal("discount_value", { precision: 10, scale: 2 }).default("0"),
      discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0"),
      /* Tax */
      taxRate: decimal("tax_rate", { precision: 5, scale: 4 }).default("0"),
      // 0.0825 for 8.25 %
      taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0"),
      /* Deposit */
      depositType: varchar("deposit_type", { length: 20 }).default("none"),
      // none, percentage, fixed
      depositValue: decimal("deposit_value", { precision: 10, scale: 2 }).default("0"),
      depositAmount: decimal("deposit_amount", { precision: 10, scale: 2 }).default("0"),
      /* ---------- Signature & toggles ---------- */
      customerSignatureUrl: text("customer_signature_url"),
      companySignatureUrl: text("company_signature_url"),
      includeLicense: boolean("include_license").default(false),
      includeInsurance: boolean("include_insurance").default(false),
      includeCerts: boolean("include_certs").default(false),
      /* ---------- Customer-facing text ---------- */
      termsAndConditions: text("terms_and_conditions"),
      notesForCustomer: text("notes_for_customer"),
      // AI-enhanced estimate fields
      fieldNotes: text("field_notes"),
      // Raw technician notes from site visit
      projectDescription: text("project_description"),
      // AI-generated project overview
      scopeOfWork: text("scope_of_work"),
      // AI-generated detailed scope
      warrantiesAndBenefits: text("warranties_and_benefits"),
      // AI-generated closing section
      aiGenerationMetadata: text("ai_generation_metadata"),
      // JSON with AI processing details
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    changeOrders = pgTable("change_orders", {
      id: serial("id").primaryKey(),
      originalEstimateId: integer("original_estimate_id").references(() => estimates.id).notNull(),
      newEstimateId: integer("new_estimate_id").references(() => estimates.id).notNull(),
      changeOrderNumber: text("change_order_number").notNull().unique(),
      reason: text("reason").notNull(),
      description: text("description"),
      originalAmount: decimal("original_amount", { precision: 10, scale: 2 }).notNull(),
      newAmount: decimal("new_amount", { precision: 10, scale: 2 }).notNull(),
      changeAmount: decimal("change_amount", { precision: 10, scale: 2 }).notNull(),
      // Can be positive or negative
      status: varchar("status", { length: 50 }).notNull().default("pending"),
      // pending, approved, rejected
      approvedAt: timestamp("approved_at"),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    invoices = pgTable("invoices", {
      id: serial("id").primaryKey(),
      customerId: integer("customer_id").references(() => customers.id).notNull(),
      jobId: integer("job_id").references(() => jobs.id),
      estimateId: integer("estimate_id").references(() => estimates.id),
      invoiceNumber: text("invoice_number").notNull().unique(),
      title: text("title").notNull(),
      description: text("description"),
      subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
      taxRate: decimal("tax_rate", { precision: 5, scale: 4 }).default("0"),
      // Tax rate as decimal (e.g., 0.0825 for 8.25%)
      taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0"),
      totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
      paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).default("0"),
      balanceDue: decimal("balance_due", { precision: 10, scale: 2 }).notNull(),
      status: varchar("status", { length: 50 }).notNull().default("draft"),
      // draft, sent, paid, partial_paid, overdue, cancelled
      paymentTerms: varchar("payment_terms", { length: 50 }).default("net_30"),
      // due_on_receipt, net_15, net_30, net_60
      isRecurring: boolean("is_recurring").default(false),
      recurringInterval: varchar("recurring_interval", { length: 20 }),
      // weekly, monthly, quarterly, annually
      recurringEndDate: timestamp("recurring_end_date"),
      nextInvoiceDate: timestamp("next_invoice_date"),
      dueDate: timestamp("due_date"),
      sentAt: timestamp("sent_at"),
      paidAt: timestamp("paid_at"),
      lastReminderSent: timestamp("last_reminder_sent"),
      items: text("items"),
      // JSON string of invoice items
      notes: text("notes"),
      internalNotes: text("internal_notes"),
      // Private notes not visible to customer
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    payments = pgTable("payments", {
      id: serial("id").primaryKey(),
      invoiceId: integer("invoice_id").references(() => invoices.id).notNull(),
      amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
      paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
      // cash, check, credit_card, ach, online
      paymentReference: text("payment_reference"),
      // Check number, transaction ID, etc.
      paymentDate: timestamp("payment_date").notNull(),
      notes: text("notes"),
      processedBy: integer("processed_by").references(() => employees.id),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    recurringBilling = pgTable("recurring_billing", {
      id: serial("id").primaryKey(),
      customerId: integer("customer_id").references(() => customers.id).notNull(),
      title: text("title").notNull(),
      description: text("description"),
      amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
      frequency: varchar("frequency", { length: 20 }).notNull(),
      // weekly, monthly, quarterly, annually
      dayOfWeek: integer("day_of_week"),
      // For weekly (0=Sunday, 6=Saturday)
      dayOfMonth: integer("day_of_month"),
      // For monthly (1-31)
      monthOfYear: integer("month_of_year"),
      // For annually (1-12)
      startDate: timestamp("start_date").notNull(),
      endDate: timestamp("end_date"),
      nextBillDate: timestamp("next_bill_date").notNull(),
      lastInvoiceDate: timestamp("last_invoice_date"),
      isActive: boolean("is_active").default(true),
      autoGenerateInvoice: boolean("auto_generate_invoice").default(true),
      paymentTerms: varchar("payment_terms", { length: 50 }).default("net_30"),
      items: text("items"),
      // JSON string of recurring service items
      notes: text("notes"),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    communications = pgTable("communications", {
      id: serial("id").primaryKey(),
      customerId: integer("customer_id").references(() => customers.id).notNull(),
      jobId: integer("job_id").references(() => jobs.id),
      type: varchar("type", { length: 50 }).notNull(),
      // email, sms, call, note
      subject: text("subject"),
      content: text("content").notNull(),
      sentAt: timestamp("sent_at"),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    contactActivities = pgTable("contact_activities", {
      id: serial("id").primaryKey(),
      contactId: integer("contact_id").references(() => contacts.id).notNull(),
      activityType: varchar("activity_type", { length: 50 }).notNull(),
      // call, email, meeting, note, follow_up
      subject: text("subject"),
      content: text("content").notNull(),
      scheduledAt: timestamp("scheduled_at"),
      completedAt: timestamp("completed_at"),
      createdBy: integer("created_by").references(() => employees.id),
      isCompleted: boolean("is_completed").default(false),
      priority: varchar("priority", { length: 20 }).default("medium"),
      // low, medium, high, urgent
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    leadPipelineStages = pgTable("lead_pipeline_stages", {
      id: serial("id").primaryKey(),
      businessProfileId: integer("business_profile_id").references(() => businessProfiles.id).notNull(),
      name: varchar("name", { length: 100 }).notNull(),
      description: text("description"),
      color: varchar("color", { length: 20 }).default("#3B82F6"),
      // hex color for UI
      sortOrder: integer("sort_order").notNull(),
      isActive: boolean("is_active").default(true),
      isDefault: boolean("is_default").default(false),
      // one default stage per business
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    leadPipelineEntries = pgTable("lead_pipeline_entries", {
      id: serial("id").primaryKey(),
      contactId: integer("contact_id").references(() => contacts.id).notNull(),
      stageId: integer("stage_id").references(() => leadPipelineStages.id).notNull(),
      probability: integer("probability").default(0),
      // 0-100 percentage chance of conversion
      estimatedValue: decimal("estimated_value", { precision: 10, scale: 2 }),
      expectedCloseDate: timestamp("expected_close_date"),
      notes: text("notes"),
      // Legacy field - will be migrated to leadNotes table
      enteredStageAt: timestamp("entered_stage_at").defaultNow().notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    leadNotes = pgTable("lead_notes", {
      id: serial("id").primaryKey(),
      leadPipelineEntryId: integer("lead_pipeline_entry_id").references(() => leadPipelineEntries.id).notNull(),
      content: text("content").notNull(),
      noteType: varchar("note_type", { length: 50 }).default("general"),
      // general, phone_call, email, meeting, follow_up, proposal
      authorName: varchar("author_name", { length: 100 }).default("User"),
      // Simple author tracking
      isDeleted: boolean("is_deleted").default(false),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    businessProfiles = pgTable("business_profiles", {
      id: serial("id").primaryKey(),
      // Basic Company Info (existing fields cleaned up)
      businessName: text("business_name").notNull(),
      ownerName: text("owner_name").notNull(),
      // Combined from ownerFirstName/ownerLastName
      email: text("email").notNull(),
      phone: text("phone").notNull(),
      address: text("address").notNull(),
      city: text("city").notNull(),
      state: text("state").notNull(),
      zipCode: text("zip_code").notNull(),
      website: text("website"),
      // Trust & Credentials
      licenseNumbers: text("license_numbers"),
      // JSON array or comma-separated
      bondedInsured: boolean("bonded_insured").default(false),
      bondedInsuredDescription: text("bonded_insured_description"),
      certifications: text("certifications"),
      // JSON array or comma-separated
      yearFounded: integer("year_founded"),
      businessStructure: varchar("business_structure", { length: 50 }),
      // LLC, Corp, Sole Prop, etc.
      // AI Personalization Settings
      preferredEstimateStyle: varchar("preferred_estimate_style", { length: 50 }).default("flat_project_price"),
      // flat_project_price, line_items, grouped_by_category
      serviceArea: text("service_area"),
      companyTagline: text("company_tagline"),
      companyBio: text("company_bio"),
      // max 400 characters
      // Defaults & Legal Footers
      legalFooterText: text("legal_footer_text"),
      termsConditions: text("terms_conditions"),
      defaultSignatureName: text("default_signature_name"),
      // Existing fields to maintain compatibility
      logoUrl: text("logo_url"),
      businessType: text("business_type").notNull(),
      licenseNumber: text("license_number"),
      // Keep for backward compatibility
      insuranceInfo: text("insurance_info"),
      // Keep for backward compatibility
      socialLinkedin: text("social_linkedin"),
      socialFacebook: text("social_facebook"),
      socialInstagram: text("social_instagram"),
      estimateTerms: text("estimate_terms"),
      defaultEstimateTerms: text("default_estimate_terms"),
      defaultInvoiceTerms: text("default_invoice_terms"),
      defaultEmailSignature: text("default_email_signature"),
      contractTemplateUrl: text("contract_template_url"),
      /* ---------- Financial Defaults ---------- */
      // Default tax rate stored as decimal (e.g., 0.0825 for 8.25 %)
      defaultTaxRate: decimal("default_tax_rate", { precision: 5, scale: 4 }).default("0"),
      description: text("description"),
      // Keep for backward compatibility
      terms: text("terms"),
      // Keep for backward compatibility
      // AI Brand Voice fields (existing)
      brandVoice: text("brand_voice"),
      communicationStyle: text("communication_style"),
      targetCustomers: text("target_customers"),
      serviceSpecialties: text("service_specialties"),
      uniqueSellingPoints: text("unique_selling_points"),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    documents2 = pgTable("documents", {
      id: serial("id").primaryKey(),
      fileName: text("file_name").notNull(),
      originalName: text("original_name").notNull(),
      fileType: text("file_type").notNull(),
      // "image", "pdf", "document"
      mimeType: text("mime_type").notNull(),
      fileSize: integer("file_size").notNull(),
      fileUrl: text("file_url").notNull(),
      category: text("category").notNull(),
      // "job_photo", "contract", "receipt", "insurance", "before_after"
      description: text("description"),
      // Relationship fields
      customerId: integer("customer_id").references(() => customers.id),
      jobId: integer("job_id").references(() => jobs.id),
      estimateId: integer("estimate_id").references(() => estimates.id),
      invoiceId: integer("invoice_id").references(() => invoices.id),
      // Metadata
      capturedAt: timestamp("captured_at"),
      // When photo was taken vs when uploaded
      gpsLocation: text("gps_location"),
      // For job site photos
      isPublic: boolean("is_public").default(false),
      // Can customer see this document
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    employees = pgTable("employees", {
      id: serial("id").primaryKey(),
      firstName: text("first_name").notNull(),
      lastName: text("last_name").notNull(),
      email: text("email").unique(),
      phone: text("phone"),
      role: varchar("role", { length: 50 }).notNull().default("technician"),
      // admin, manager, technician, helper
      hourlyRate: decimal("hourly_rate", { precision: 8, scale: 2 }),
      overtimeRate: decimal("overtime_rate", { precision: 8, scale: 2 }),
      isActive: boolean("is_active").default(true),
      isAvailable: boolean("is_available").default(true),
      // Daily availability status
      hireDate: timestamp("hire_date"),
      notes: text("notes"),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    employeeAvailability = pgTable("employee_availability", {
      id: serial("id").primaryKey(),
      employeeId: integer("employee_id").references(() => employees.id).notNull(),
      date: timestamp("date").notNull(),
      isAvailable: boolean("is_available").default(true),
      startTime: varchar("start_time", { length: 5 }),
      // HH:MM format
      endTime: varchar("end_time", { length: 5 }),
      // HH:MM format
      notes: text("notes"),
      // Reason for unavailability or special notes
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    employeePermissions = pgTable("employee_permissions", {
      id: serial("id").primaryKey(),
      employeeId: integer("employee_id").references(() => employees.id).notNull(),
      // Financial permissions
      canViewRevenue: boolean("can_view_revenue").default(false),
      canViewJobCosts: boolean("can_view_job_costs").default(false),
      canEditPricing: boolean("can_edit_pricing").default(false),
      canExportData: boolean("can_export_data").default(false),
      // Team permissions
      canViewAllEmployees: boolean("can_view_all_employees").default(false),
      canEditEmployeeInfo: boolean("can_edit_employee_info").default(false),
      canManageSchedules: boolean("can_manage_schedules").default(false),
      canApproveTimeEntries: boolean("can_approve_time_entries").default(false),
      // Customer permissions
      canViewAllCustomers: boolean("can_view_all_customers").default(false),
      canEditCustomerInfo: boolean("can_edit_customer_info").default(false),
      canCreateAssignJobs: boolean("can_create_assign_jobs").default(false),
      canAccessPaymentHistory: boolean("can_access_payment_history").default(false),
      // Operations permissions
      canManageEstimatesInvoices: boolean("can_manage_estimates_invoices").default(false),
      canViewPerformanceMetrics: boolean("can_view_performance_metrics").default(false),
      canManageInventory: boolean("can_manage_inventory").default(false),
      canConfigureSettings: boolean("can_configure_settings").default(false),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    permissions = pgTable("permissions", {
      id: serial("id").primaryKey(),
      employeeId: integer("employee_id").references(() => employees.id).notNull(),
      // Financial Access Permissions
      canViewRevenue: boolean("can_view_revenue").default(false).notNull(),
      canViewProfitMargins: boolean("can_view_profit_margins").default(false).notNull(),
      canViewEmployeeWages: boolean("can_view_employee_wages").default(false).notNull(),
      canViewJobCosts: boolean("can_view_job_costs").default(false).notNull(),
      canEditPricing: boolean("can_edit_pricing").default(false).notNull(),
      canAccessFinancialReports: boolean("can_access_financial_reports").default(false).notNull(),
      // Employee Management Permissions
      canViewAllEmployees: boolean("can_view_all_employees").default(false).notNull(),
      canEditEmployeeInfo: boolean("can_edit_employee_info").default(false).notNull(),
      canManageSchedules: boolean("can_manage_schedules").default(false).notNull(),
      canApproveTimeEntries: boolean("can_approve_time_entries").default(false).notNull(),
      canViewPerformanceMetrics: boolean("can_view_performance_metrics").default(false).notNull(),
      // Customer & Job Management Permissions
      canViewAllCustomers: boolean("can_view_all_customers").default(false).notNull(),
      canEditCustomerInfo: boolean("can_edit_customer_info").default(false).notNull(),
      canCreateAssignJobs: boolean("can_create_assign_jobs").default(false).notNull(),
      canAccessPaymentHistory: boolean("can_access_payment_history").default(false).notNull(),
      canManageEstimatesInvoices: boolean("can_manage_estimates_invoices").default(false).notNull(),
      // System Administration Permissions
      canManageUserRoles: boolean("can_manage_user_roles").default(false).notNull(),
      canAccessSystemSettings: boolean("can_access_system_settings").default(false).notNull(),
      canExportData: boolean("can_export_data").default(false).notNull(),
      canManageIntegrations: boolean("can_manage_integrations").default(false).notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    workOrders = pgTable("work_orders", {
      id: serial("id").primaryKey(),
      workOrderNumber: text("work_order_number").notNull().unique(),
      jobId: integer("job_id").references(() => jobs.id).notNull(),
      estimateId: integer("estimate_id").references(() => estimates.id),
      customerId: integer("customer_id").references(() => customers.id).notNull(),
      assignedTechnicianId: integer("assigned_technician_id").references(() => employees.id),
      title: text("title").notNull(),
      description: text("description"),
      status: varchar("status", { length: 50 }).notNull().default("scheduled"),
      // scheduled, in_progress, completed, on_hold, cancelled
      priority: varchar("priority", { length: 20 }).notNull().default("normal"),
      // low, normal, high, urgent
      scheduledStartDate: timestamp("scheduled_start_date"),
      actualStartDate: timestamp("actual_start_date"),
      scheduledEndDate: timestamp("scheduled_end_date"),
      actualEndDate: timestamp("actual_end_date"),
      estimatedHours: decimal("estimated_hours", { precision: 5, scale: 2 }),
      actualHours: decimal("actual_hours", { precision: 5, scale: 2 }),
      customerSignatureUrl: text("customer_signature_url"),
      completionNotes: text("completion_notes"),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    notifications = pgTable("notifications", {
      id: serial("id").primaryKey(),
      businessProfileId: integer("business_profile_id").references(() => businessProfiles.id).notNull(),
      type: varchar("type", { length: 50 }).notNull(),
      // estimate_overdue, job_today, invoice_overdue, job_completed
      title: text("title").notNull(),
      message: text("message").notNull(),
      priority: varchar("priority", { length: 20 }).notNull().default("medium"),
      // low, medium, high, urgent
      isRead: boolean("is_read").default(false).notNull(),
      relatedEntityType: varchar("related_entity_type", { length: 50 }),
      // customer, job, estimate, invoice
      relatedEntityId: integer("related_entity_id"),
      actionUrl: text("action_url"),
      // URL to take action on the notification
      expiresAt: timestamp("expires_at"),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    workOrderTasks = pgTable("work_order_tasks", {
      id: serial("id").primaryKey(),
      workOrderId: integer("work_order_id").references(() => workOrders.id).notNull(),
      title: text("title").notNull(),
      description: text("description"),
      orderIndex: integer("order_index").notNull().default(0),
      status: varchar("status", { length: 20 }).notNull().default("pending"),
      // pending, in_progress, completed, skipped
      estimatedMinutes: integer("estimated_minutes"),
      actualMinutes: integer("actual_minutes"),
      completedAt: timestamp("completed_at"),
      completedByTechnicianId: integer("completed_by_technician_id").references(() => employees.id),
      notes: text("notes"),
      requiresPhoto: boolean("requires_photo").default(false),
      requiresSignature: boolean("requires_signature").default(false),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    timeEntries = pgTable("time_entries", {
      id: serial("id").primaryKey(),
      employeeId: integer("employee_id").references(() => employees.id).notNull(),
      workOrderId: integer("work_order_id").references(() => workOrders.id),
      jobId: integer("job_id").references(() => jobs.id),
      clockInTime: timestamp("clock_in_time").notNull(),
      clockOutTime: timestamp("clock_out_time"),
      totalMinutes: integer("total_minutes"),
      isOvertime: boolean("is_overtime").default(false),
      hourlyRate: decimal("hourly_rate", { precision: 8, scale: 2 }),
      totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
      description: text("description"),
      // Enhanced GPS/Location tracking
      clockInLatitude: decimal("clock_in_latitude", { precision: 10, scale: 8 }),
      clockInLongitude: decimal("clock_in_longitude", { precision: 11, scale: 8 }),
      clockOutLatitude: decimal("clock_out_latitude", { precision: 10, scale: 8 }),
      clockOutLongitude: decimal("clock_out_longitude", { precision: 11, scale: 8 }),
      clockInAddress: text("clock_in_address"),
      // Reverse geocoded address
      clockOutAddress: text("clock_out_address"),
      // Reverse geocoded address
      isLocationVerified: boolean("is_location_verified").default(false),
      // Within geofence
      locationAccuracy: decimal("location_accuracy", { precision: 6, scale: 2 }),
      // GPS accuracy in meters
      gpsLocation: text("gps_location"),
      // Legacy field - keeping for backward compatibility
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    inventoryItems = pgTable("inventory_items", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      description: text("description"),
      sku: text("sku").unique(),
      category: varchar("category", { length: 50 }).notNull().default("general"),
      // parts, materials, tools, supplies
      unit: varchar("unit", { length: 20 }).notNull().default("each"),
      // each, box, gallon, foot, etc.
      currentStock: integer("current_stock").notNull().default(0),
      minimumStock: integer("minimum_stock").notNull().default(0),
      maximumStock: integer("maximum_stock"),
      unitCost: decimal("unit_cost", { precision: 10, scale: 4 }),
      retailPrice: decimal("retail_price", { precision: 10, scale: 2 }),
      supplierId: integer("supplier_id").references(() => suppliers.id),
      location: text("location"),
      // warehouse location, truck, etc.
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      updatedAt: timestamp("updated_at").defaultNow().notNull()
    });
    suppliers = pgTable("suppliers", {
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
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    workOrderMaterials = pgTable("work_order_materials", {
      id: serial("id").primaryKey(),
      workOrderId: integer("work_order_id").references(() => workOrders.id).notNull(),
      inventoryItemId: integer("inventory_item_id").references(() => inventoryItems.id).notNull(),
      quantityUsed: decimal("quantity_used", { precision: 10, scale: 4 }).notNull(),
      unitCost: decimal("unit_cost", { precision: 10, scale: 4 }).notNull(),
      totalCost: decimal("total_cost", { precision: 10, scale: 2 }).notNull(),
      usedAt: timestamp("used_at").defaultNow().notNull(),
      notes: text("notes")
    });
    equipment = pgTable("equipment", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      type: varchar("type", { length: 50 }).notNull(),
      // vehicle, tool, equipment
      make: text("make"),
      model: text("model"),
      year: integer("year"),
      serialNumber: text("serial_number"),
      licensePlate: text("license_plate"),
      // for vehicles
      purchaseDate: timestamp("purchase_date"),
      purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }),
      currentValue: decimal("current_value", { precision: 10, scale: 2 }),
      status: varchar("status", { length: 20 }).notNull().default("available"),
      // available, in_use, maintenance, retired
      assignedToEmployeeId: integer("assigned_to_employee_id").references(() => employees.id),
      location: text("location"),
      nextMaintenanceDate: timestamp("next_maintenance_date"),
      maintenanceInterval: integer("maintenance_interval"),
      // days
      notes: text("notes"),
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    assignedRoutes = pgTable("assigned_routes", {
      id: serial("id").primaryKey(),
      technicianId: integer("technician_id").references(() => employees.id).notNull(),
      date: date("date").notNull(),
      totalDriveTime: integer("total_drive_time").notNull(),
      // minutes
      totalWorkTime: integer("total_work_time").notNull(),
      // minutes
      routeData: json("route_data").notNull(),
      // Stores the optimized jobs array
      status: text("status").default("assigned").notNull(),
      // assigned, started, completed
      assignedAt: timestamp("assigned_at").defaultNow().notNull(),
      completedAt: timestamp("completed_at"),
      notes: text("notes")
    });
    equipmentMaintenance = pgTable("equipment_maintenance", {
      id: serial("id").primaryKey(),
      equipmentId: integer("equipment_id").references(() => equipment.id).notNull(),
      type: varchar("type", { length: 50 }).notNull(),
      // routine, repair, inspection
      description: text("description").notNull(),
      performedDate: timestamp("performed_date").notNull(),
      performedByEmployeeId: integer("performed_by_employee_id").references(() => employees.id),
      cost: decimal("cost", { precision: 10, scale: 2 }),
      supplierServiceId: integer("supplier_service_id").references(() => suppliers.id),
      nextServiceDate: timestamp("next_service_date"),
      notes: text("notes"),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    contactsRelations = relations(contacts, ({ many }) => ({
      jobs: many(jobs),
      estimates: many(estimates),
      invoices: many(invoices),
      communications: many(communications),
      activities: many(contactActivities),
      projectUpdates: many(projectUpdates)
    }));
    projectUpdatesRelations = relations(projectUpdates, ({ one }) => ({
      contact: one(contacts, {
        fields: [projectUpdates.contactId],
        references: [contacts.id]
      }),
      createdByEmployee: one(employees, {
        fields: [projectUpdates.createdBy],
        references: [employees.id]
      })
    }));
    customersRelations = contactsRelations;
    jobsRelations = relations(jobs, ({ one, many }) => ({
      customer: one(customers, {
        fields: [jobs.customerId],
        references: [customers.id]
      }),
      estimates: many(estimates),
      invoices: many(invoices),
      communications: many(communications),
      workOrders: many(workOrders),
      timeEntries: many(timeEntries)
    }));
    estimatesRelations = relations(estimates, ({ one, many }) => ({
      customer: one(customers, {
        fields: [estimates.customerId],
        references: [customers.id]
      }),
      job: one(jobs, {
        fields: [estimates.jobId],
        references: [jobs.id]
      }),
      parentEstimate: one(estimates, {
        fields: [estimates.parentEstimateId],
        references: [estimates.id]
      }),
      childEstimates: many(estimates),
      originalChangeOrders: many(changeOrders, {
        relationName: "originalEstimate"
      }),
      newChangeOrders: many(changeOrders, {
        relationName: "newEstimate"
      }),
      invoices: many(invoices)
    }));
    changeOrdersRelations = relations(changeOrders, ({ one }) => ({
      originalEstimate: one(estimates, {
        fields: [changeOrders.originalEstimateId],
        references: [estimates.id],
        relationName: "originalEstimate"
      }),
      newEstimate: one(estimates, {
        fields: [changeOrders.newEstimateId],
        references: [estimates.id],
        relationName: "newEstimate"
      })
    }));
    invoicesRelations = relations(invoices, ({ one, many }) => ({
      customer: one(customers, {
        fields: [invoices.customerId],
        references: [customers.id]
      }),
      job: one(jobs, {
        fields: [invoices.jobId],
        references: [jobs.id]
      }),
      estimate: one(estimates, {
        fields: [invoices.estimateId],
        references: [estimates.id]
      }),
      payments: many(payments)
    }));
    paymentsRelations = relations(payments, ({ one }) => ({
      invoice: one(invoices, {
        fields: [payments.invoiceId],
        references: [invoices.id]
      }),
      processedByEmployee: one(employees, {
        fields: [payments.processedBy],
        references: [employees.id]
      })
    }));
    recurringBillingRelations = relations(recurringBilling, ({ one }) => ({
      customer: one(customers, {
        fields: [recurringBilling.customerId],
        references: [customers.id]
      })
    }));
    communicationsRelations = relations(communications, ({ one }) => ({
      customer: one(customers, {
        fields: [communications.customerId],
        references: [customers.id]
      }),
      job: one(jobs, {
        fields: [communications.jobId],
        references: [jobs.id]
      })
    }));
    contactActivitiesRelations = relations(contactActivities, ({ one }) => ({
      contact: one(contacts, {
        fields: [contactActivities.contactId],
        references: [contacts.id]
      }),
      createdByEmployee: one(employees, {
        fields: [contactActivities.createdBy],
        references: [employees.id]
      })
    }));
    leadPipelineStagesRelations = relations(leadPipelineStages, ({ one, many }) => ({
      businessProfile: one(businessProfiles, {
        fields: [leadPipelineStages.businessProfileId],
        references: [businessProfiles.id]
      }),
      pipelineEntries: many(leadPipelineEntries)
    }));
    leadPipelineEntriesRelations = relations(leadPipelineEntries, ({ one, many }) => ({
      contact: one(contacts, {
        fields: [leadPipelineEntries.contactId],
        references: [contacts.id]
      }),
      stage: one(leadPipelineStages, {
        fields: [leadPipelineEntries.stageId],
        references: [leadPipelineStages.id]
      }),
      notes: many(leadNotes)
    }));
    leadNotesRelations = relations(leadNotes, ({ one }) => ({
      leadPipelineEntry: one(leadPipelineEntries, {
        fields: [leadNotes.leadPipelineEntryId],
        references: [leadPipelineEntries.id]
      })
    }));
    notificationsRelations = relations(notifications, ({ one }) => ({
      businessProfile: one(businessProfiles, {
        fields: [notifications.businessProfileId],
        references: [businessProfiles.id]
      })
    }));
    employeesRelations = relations(employees, ({ one, many }) => ({
      permissions: one(employeePermissions, {
        fields: [employees.id],
        references: [employeePermissions.employeeId]
      }),
      legacyPermissions: one(permissions, {
        fields: [employees.id],
        references: [permissions.employeeId]
      }),
      assignedWorkOrders: many(workOrders),
      timeEntries: many(timeEntries),
      completedTasks: many(workOrderTasks),
      assignedEquipment: many(equipment),
      performedMaintenance: many(equipmentMaintenance)
    }));
    employeePermissionsRelations = relations(employeePermissions, ({ one }) => ({
      employee: one(employees, {
        fields: [employeePermissions.employeeId],
        references: [employees.id]
      })
    }));
    permissionsRelations = relations(permissions, ({ one }) => ({
      employee: one(employees, {
        fields: [permissions.employeeId],
        references: [employees.id]
      })
    }));
    workOrdersRelations = relations(workOrders, ({ one, many }) => ({
      job: one(jobs, {
        fields: [workOrders.jobId],
        references: [jobs.id]
      }),
      estimate: one(estimates, {
        fields: [workOrders.estimateId],
        references: [estimates.id]
      }),
      customer: one(customers, {
        fields: [workOrders.customerId],
        references: [customers.id]
      }),
      assignedTechnician: one(employees, {
        fields: [workOrders.assignedTechnicianId],
        references: [employees.id]
      }),
      tasks: many(workOrderTasks),
      timeEntries: many(timeEntries),
      materials: many(workOrderMaterials)
    }));
    workOrderTasksRelations = relations(workOrderTasks, ({ one }) => ({
      workOrder: one(workOrders, {
        fields: [workOrderTasks.workOrderId],
        references: [workOrders.id]
      }),
      completedByTechnician: one(employees, {
        fields: [workOrderTasks.completedByTechnicianId],
        references: [employees.id]
      })
    }));
    timeEntriesRelations = relations(timeEntries, ({ one }) => ({
      employee: one(employees, {
        fields: [timeEntries.employeeId],
        references: [employees.id]
      }),
      workOrder: one(workOrders, {
        fields: [timeEntries.workOrderId],
        references: [workOrders.id]
      }),
      job: one(jobs, {
        fields: [timeEntries.jobId],
        references: [jobs.id]
      })
    }));
    inventoryItemsRelations = relations(inventoryItems, ({ one, many }) => ({
      supplier: one(suppliers, {
        fields: [inventoryItems.supplierId],
        references: [suppliers.id]
      }),
      workOrderMaterials: many(workOrderMaterials)
    }));
    suppliersRelations = relations(suppliers, ({ many }) => ({
      inventoryItems: many(inventoryItems),
      maintenanceServices: many(equipmentMaintenance)
    }));
    workOrderMaterialsRelations = relations(workOrderMaterials, ({ one }) => ({
      workOrder: one(workOrders, {
        fields: [workOrderMaterials.workOrderId],
        references: [workOrders.id]
      }),
      inventoryItem: one(inventoryItems, {
        fields: [workOrderMaterials.inventoryItemId],
        references: [inventoryItems.id]
      })
    }));
    equipmentRelations = relations(equipment, ({ one, many }) => ({
      assignedToEmployee: one(employees, {
        fields: [equipment.assignedToEmployeeId],
        references: [employees.id]
      }),
      maintenanceHistory: many(equipmentMaintenance)
    }));
    equipmentMaintenanceRelations = relations(equipmentMaintenance, ({ one }) => ({
      equipment: one(equipment, {
        fields: [equipmentMaintenance.equipmentId],
        references: [equipment.id]
      }),
      performedByEmployee: one(employees, {
        fields: [equipmentMaintenance.performedByEmployeeId],
        references: [employees.id]
      }),
      supplierService: one(suppliers, {
        fields: [equipmentMaintenance.supplierServiceId],
        references: [suppliers.id]
      })
    }));
    insertContactSchema = createInsertSchema(contacts, {
      status: z.enum(["lead", "customer", "past_customer", "vendor", "subcontractor"]),
      leadSource: z.enum(["referral", "website", "google", "facebook", "repeat_customer", "word_of_mouth"]).optional(),
      leadScore: z.number().min(0).max(5).optional(),
      preferredContactMethod: z.enum(["phone", "email", "text"]),
      propertyType: z.enum(["residential", "commercial"])
    }).omit({
      id: true,
      createdAt: true
    });
    insertCustomerSchema = insertContactSchema;
    insertJobSchema = createInsertSchema(jobs).omit({
      id: true,
      createdAt: true
    }).extend({
      scheduledDate: z.string().datetime().optional().or(z.date().optional()),
      estimatedValue: z.union([z.string(), z.number()]).optional().nullable(),
      actualValue: z.union([z.string(), z.number()]).optional().nullable()
    });
    insertEstimateSchema = createInsertSchema(estimates).omit({
      id: true,
      createdAt: true
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
      notesForCustomer: z.string().optional()
    });
    insertChangeOrderSchema = createInsertSchema(changeOrders).omit({
      id: true,
      createdAt: true
    });
    insertNotificationSchema = createInsertSchema(notifications).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertInvoiceSchema = createInsertSchema(invoices).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    }).extend({
      customerId: z.number(),
      jobId: z.number().optional().nullable(),
      estimateId: z.number().optional().nullable(),
      invoiceNumber: z.string().optional(),
      // Make optional since we generate it server-side
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
      recurringEndDate: z.string().optional().nullable()
    });
    insertPaymentSchema = createInsertSchema(payments).omit({
      id: true,
      createdAt: true
    }).extend({
      paymentDate: z.string().datetime().optional().or(z.date().optional())
    });
    insertRecurringBillingSchema = createInsertSchema(recurringBilling).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    }).extend({
      startDate: z.string().datetime().optional().or(z.date().optional()),
      endDate: z.string().datetime().optional().or(z.date().optional()).nullable(),
      nextBillDate: z.string().datetime().optional().or(z.date().optional()),
      lastInvoiceDate: z.string().datetime().optional().or(z.date().optional()).nullable()
    });
    insertCommunicationSchema = createInsertSchema(communications).omit({
      id: true,
      createdAt: true
    });
    insertBusinessProfileSchema = createInsertSchema(businessProfiles).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    }).extend({
      // Basic validation for new fields
      companyBio: z.string().max(400, "Company bio must be 400 characters or less").optional(),
      yearFounded: z.number().min(1800).max((/* @__PURE__ */ new Date()).getFullYear()).optional(),
      businessStructure: z.enum(["sole_proprietorship", "llc", "corporation", "partnership", "other"]).optional(),
      preferredEstimateStyle: z.enum(["flat_project_price", "line_items", "grouped_by_category"]).default("flat_project_price"),
      bondedInsured: z.boolean().optional()
    });
    insertDocumentSchema = createInsertSchema(documents2).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertEmployeeSchema = createInsertSchema(employees).omit({
      id: true,
      createdAt: true
    });
    insertEmployeePermissionsSchema = createInsertSchema(employeePermissions).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertPermissionsSchema = createInsertSchema(permissions).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertUserSchema = createInsertSchema(users).omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true
    });
    insertWorkOrderSchema = createInsertSchema(workOrders).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    }).extend({
      workOrderNumber: z.string().optional(),
      scheduledStartDate: z.string().datetime().optional().or(z.date().optional()),
      actualStartDate: z.string().datetime().optional().or(z.date().optional()),
      scheduledEndDate: z.string().datetime().optional().or(z.date().optional()),
      actualEndDate: z.string().datetime().optional().or(z.date().optional())
    });
    insertWorkOrderTaskSchema = createInsertSchema(workOrderTasks).omit({
      id: true,
      createdAt: true
    });
    insertTimeEntrySchema = createInsertSchema(timeEntries).omit({
      id: true,
      createdAt: true
    }).extend({
      clockInTime: z.string().datetime().or(z.date()),
      clockOutTime: z.string().datetime().optional().or(z.date().optional())
    });
    insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertSupplierSchema = createInsertSchema(suppliers).omit({
      id: true,
      createdAt: true
    });
    insertWorkOrderMaterialSchema = createInsertSchema(workOrderMaterials).omit({
      id: true,
      usedAt: true
    });
    insertEquipmentSchema = createInsertSchema(equipment).omit({
      id: true,
      createdAt: true
    }).extend({
      purchaseDate: z.string().datetime().optional().or(z.date().optional()),
      nextMaintenanceDate: z.string().datetime().optional().or(z.date().optional())
    });
    insertEquipmentMaintenanceSchema = createInsertSchema(equipmentMaintenance).omit({
      id: true,
      createdAt: true
    }).extend({
      performedDate: z.string().datetime().or(z.date()),
      nextServiceDate: z.string().datetime().optional().or(z.date().optional())
    });
    insertContactActivitySchema = createInsertSchema(contactActivities, {
      activityType: z.enum(["call", "email", "meeting", "note", "follow_up"]),
      priority: z.enum(["low", "medium", "high", "urgent"]),
      scheduledAt: z.string().datetime().optional(),
      completedAt: z.string().datetime().optional()
    });
    insertLeadPipelineStageSchema = createInsertSchema(leadPipelineStages).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertLeadPipelineEntrySchema = createInsertSchema(leadPipelineEntries, {
      expectedCloseDate: z.string().optional()
    }).omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      enteredStageAt: true
    });
    insertLeadNoteSchema = createInsertSchema(leadNotes).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertProjectUpdateSchema = createInsertSchema(projectUpdates).omit({
      id: true,
      updateNumber: true,
      // Auto-calculated
      createdAt: true
    }).extend({
      updateType: z.enum(["general", "site_visit", "phone_call", "email", "scope_change"]).default("general"),
      workNeeded: z.string().optional(),
      customerRequests: z.string().optional(),
      siteConditions: z.string().optional(),
      additionalNotes: z.string().optional()
    });
    fieldNotesToEstimateSchema = z.object({
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
        notes: z.string().optional()
      }),
      businessContext: z.object({
        businessName: z.string(),
        serviceTypes: z.array(z.string()),
        specializations: z.array(z.string()).optional(),
        warranties: z.string().optional(),
        insuranceInfo: z.string().optional()
      }),
      estimatePreferences: z.object({
        includeWarranties: z.boolean().default(true),
        tone: z.enum(["professional", "friendly", "technical"]).default("professional"),
        detailLevel: z.enum(["basic", "detailed", "comprehensive"]).default("detailed")
      }).optional()
    });
    aiEstimateRequestSchema = z.object({
      serviceType: z.string().min(1),
      propertySize: z.string().min(1),
      location: z.string().min(1),
      additionalNotes: z.string().optional(),
      customerId: z.number().optional(),
      // Enhanced fields for streamlined workflow
      projectDescription: z.string().optional(),
      targetBudget: z.string().optional(),
      complexity: z.enum(["simple", "standard", "complex"]).optional(),
      customerType: z.enum(["residential", "commercial"]).optional(),
      urgency: z.enum(["standard", "rush"]).optional(),
      additionalRequirements: z.string().optional(),
      pricingMethod: z.enum(["single_price", "line_items", "hybrid"]).optional()
    });
    aiSocialContentRequestSchema = z.object({
      businessType: z.string().min(1),
      contentTheme: z.string().min(1),
      platforms: z.array(z.string()).min(1)
    });
  }
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
var pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    neonConfig.webSocketConstructor = ws;
    neonConfig.pipelineConnect = false;
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 5e3,
      idleTimeoutMillis: 3e4,
      max: 20
    });
    db = drizzle({ client: pool, schema: schema_exports });
  }
});

// server/repositories/BaseRepository.ts
var BaseRepository;
var init_BaseRepository = __esm({
  "server/repositories/BaseRepository.ts"() {
    "use strict";
    init_db();
    BaseRepository = class {
      db = db;
      createPaginationResult(data, total, page, limit) {
        return {
          data,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1
          }
        };
      }
      getOffset(page, limit) {
        return (page - 1) * limit;
      }
    };
  }
});

// server/repositories/CustomerRepository.ts
import { eq, desc, or, ilike, count } from "drizzle-orm";
var CustomerRepository;
var init_CustomerRepository = __esm({
  "server/repositories/CustomerRepository.ts"() {
    "use strict";
    init_BaseRepository();
    init_schema();
    CustomerRepository = class extends BaseRepository {
      async findById(id) {
        const [customer] = await this.db.select().from(contacts).where(eq(contacts.id, id)).limit(1);
        return customer || void 0;
      }
      async findByEmail(email) {
        const [customer] = await this.db.select().from(contacts).where(eq(contacts.email, email)).limit(1);
        return customer || void 0;
      }
      async create(data) {
        const [customer] = await this.db.insert(contacts).values(data).returning();
        return customer;
      }
      async update(id, data) {
        const [customer] = await this.db.update(contacts).set(data).where(eq(contacts.id, id)).returning();
        return customer || void 0;
      }
      async delete(id) {
        const result = await this.db.delete(contacts).where(eq(contacts.id, id));
        return (result.rowCount ?? 0) > 0;
      }
      async findPaginated(options) {
        const { page, limit, search } = options;
        const offset = this.getOffset(page, limit);
        const baseQuery = this.db.select().from(contacts);
        const baseCountQuery = this.db.select({ count: count() }).from(contacts);
        if (search) {
          const searchCondition = or(
            ilike(contacts.firstName, `%${search}%`),
            ilike(contacts.lastName, `%${search}%`),
            ilike(contacts.email, `%${search}%`),
            ilike(contacts.phone, `%${search}%`)
          );
          const [data2, countResult2] = await Promise.all([
            baseQuery.where(searchCondition).orderBy(desc(contacts.createdAt)).limit(limit).offset(offset),
            baseCountQuery.where(searchCondition)
          ]);
          return this.createPaginationResult(data2, countResult2[0].count, page, limit);
        }
        const [data, countResult] = await Promise.all([
          baseQuery.orderBy(desc(contacts.createdAt)).limit(limit).offset(offset),
          baseCountQuery
        ]);
        return this.createPaginationResult(data, countResult[0].count, page, limit);
      }
      async findByStatus(status) {
        return await this.db.select().from(contacts).where(eq(contacts.status, status)).orderBy(desc(contacts.createdAt));
      }
      async getTotalCount() {
        const [{ count: total }] = await this.db.select({ count: count() }).from(contacts);
        return total;
      }
      async getRecentCustomers(limit = 10) {
        return await this.db.select().from(contacts).orderBy(desc(contacts.createdAt)).limit(limit);
      }
    };
  }
});

// server/repositories/JobRepository.ts
import { eq as eq2, desc as desc2, or as or2, ilike as ilike2, count as count2, and, gte, lte, inArray } from "drizzle-orm";
var JobRepository;
var init_JobRepository = __esm({
  "server/repositories/JobRepository.ts"() {
    "use strict";
    init_BaseRepository();
    init_schema();
    JobRepository = class extends BaseRepository {
      async findById(id) {
        const [result] = await this.db.select().from(jobs).leftJoin(contacts, eq2(jobs.customerId, contacts.id)).where(eq2(jobs.id, id)).limit(1);
        if (!result || !result.contacts) return void 0;
        return { ...result.jobs, customer: result.contacts };
      }
      async create(data) {
        const processedData = {
          ...data,
          scheduledDate: data.scheduledDate && typeof data.scheduledDate === "string" ? new Date(data.scheduledDate) : data.scheduledDate
        };
        const [job] = await this.db.insert(jobs).values(processedData).returning();
        const jobWithCustomer = await this.findById(job.id);
        if (!jobWithCustomer) {
          throw new Error("Failed to create job with customer data");
        }
        return jobWithCustomer;
      }
      async update(id, data) {
        const processedData = {
          ...data,
          scheduledDate: data.scheduledDate && typeof data.scheduledDate === "string" ? new Date(data.scheduledDate) : data.scheduledDate
        };
        const [job] = await this.db.update(jobs).set(processedData).where(eq2(jobs.id, id)).returning();
        if (!job) return void 0;
        return await this.findById(job.id);
      }
      async delete(id) {
        const result = await this.db.delete(jobs).where(eq2(jobs.id, id));
        return (result.rowCount ?? 0) > 0;
      }
      async findPaginated(options) {
        const { page, limit, search } = options;
        const offset = this.getOffset(page, limit);
        const baseQuery = this.db.select().from(jobs).leftJoin(contacts, eq2(jobs.customerId, contacts.id));
        const baseCountQuery = this.db.select({ count: count2() }).from(jobs);
        if (search) {
          const searchCondition = or2(
            ilike2(jobs.title, `%${search}%`),
            ilike2(jobs.description, `%${search}%`),
            ilike2(contacts.firstName, `%${search}%`),
            ilike2(contacts.lastName, `%${search}%`)
          );
          const [rows2, countResult2] = await Promise.all([
            baseQuery.where(searchCondition).orderBy(desc2(jobs.createdAt)).limit(limit).offset(offset),
            baseCountQuery.leftJoin(contacts, eq2(jobs.customerId, contacts.id)).where(searchCondition)
          ]);
          const data2 = rows2.filter((row) => row.contacts !== null).map((row) => ({ ...row.jobs, customer: row.contacts }));
          return this.createPaginationResult(data2, countResult2[0].count, page, limit);
        }
        const [rows, countResult] = await Promise.all([
          baseQuery.orderBy(desc2(jobs.createdAt)).limit(limit).offset(offset),
          baseCountQuery
        ]);
        const data = rows.filter((row) => row.contacts !== null).map((row) => ({ ...row.jobs, customer: row.contacts }));
        return this.createPaginationResult(data, countResult[0].count, page, limit);
      }
      async findByCustomerId(customerId) {
        const rows = await this.db.select().from(jobs).leftJoin(contacts, eq2(jobs.customerId, contacts.id)).where(eq2(jobs.customerId, customerId)).orderBy(desc2(jobs.createdAt));
        return rows.filter((row) => row.contacts !== null).map((row) => ({ ...row.jobs, customer: row.contacts }));
      }
      async findByStatus(status) {
        const rows = await this.db.select().from(jobs).leftJoin(contacts, eq2(jobs.customerId, contacts.id)).where(eq2(jobs.status, status)).orderBy(desc2(jobs.createdAt));
        return rows.filter((row) => row.contacts !== null).map((row) => ({ ...row.jobs, customer: row.contacts }));
      }
      async getTodaySchedule() {
        const today = /* @__PURE__ */ new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        const rows = await this.db.select().from(jobs).leftJoin(contacts, eq2(jobs.customerId, contacts.id)).where(and(
          gte(jobs.scheduledDate, startOfDay),
          lte(jobs.scheduledDate, endOfDay)
        )).orderBy(jobs.scheduledDate);
        return rows.filter((row) => row.contacts !== null).map((row) => ({ ...row.jobs, customer: row.contacts }));
      }
      async getActiveJobsCount() {
        const [{ count: total }] = await this.db.select({ count: count2() }).from(jobs).where(inArray(jobs.status, ["scheduled", "in_progress"]));
        return total;
      }
      async getRecentJobs(limit = 10) {
        const rows = await this.db.select().from(jobs).leftJoin(contacts, eq2(jobs.customerId, contacts.id)).orderBy(desc2(jobs.createdAt)).limit(limit);
        return rows.filter((row) => row.contacts !== null).map((row) => ({ ...row.jobs, customer: row.contacts }));
      }
    };
  }
});

// server/repositories/EstimateRepository.ts
import { eq as eq3, desc as desc3, or as or3, ilike as ilike3, count as count3, inArray as inArray2 } from "drizzle-orm";
var EstimateRepository;
var init_EstimateRepository = __esm({
  "server/repositories/EstimateRepository.ts"() {
    "use strict";
    init_BaseRepository();
    init_schema();
    EstimateRepository = class extends BaseRepository {
      async findById(id) {
        const [result] = await this.db.select().from(estimates).leftJoin(contacts, eq3(estimates.customerId, contacts.id)).where(eq3(estimates.id, id)).limit(1);
        if (!result || !result.contacts) return void 0;
        return { ...result.estimates, customer: result.contacts };
      }
      async create(data) {
        const [estimate] = await this.db.insert(estimates).values(data).returning();
        const estimateWithCustomer = await this.findById(estimate.id);
        if (!estimateWithCustomer) {
          throw new Error("Failed to create estimate with customer data");
        }
        return estimateWithCustomer;
      }
      async update(id, data) {
        const [estimate] = await this.db.update(estimates).set(data).where(eq3(estimates.id, id)).returning();
        if (!estimate) return void 0;
        return await this.findById(estimate.id);
      }
      async delete(id) {
        const result = await this.db.delete(estimates).where(eq3(estimates.id, id));
        return (result.rowCount ?? 0) > 0;
      }
      async findPaginated(options) {
        const { page, limit, search } = options;
        const offset = this.getOffset(page, limit);
        const baseQuery = this.db.select().from(estimates).leftJoin(contacts, eq3(estimates.customerId, contacts.id));
        const baseCountQuery = this.db.select({ count: count3() }).from(estimates);
        if (search) {
          const searchCondition = or3(
            ilike3(estimates.title, `%${search}%`),
            ilike3(contacts.firstName, `%${search}%`),
            ilike3(contacts.lastName, `%${search}%`)
          );
          const [rows2, countResult2] = await Promise.all([
            baseQuery.where(searchCondition).orderBy(desc3(estimates.createdAt)).limit(limit).offset(offset),
            baseCountQuery.leftJoin(contacts, eq3(estimates.customerId, contacts.id)).where(searchCondition)
          ]);
          const data2 = rows2.filter((row) => row.contacts !== null).map((row) => ({ ...row.estimates, customer: row.contacts }));
          return this.createPaginationResult(data2, countResult2[0].count, page, limit);
        }
        const [rows, countResult] = await Promise.all([
          baseQuery.orderBy(desc3(estimates.createdAt)).limit(limit).offset(offset),
          baseCountQuery
        ]);
        const data = rows.filter((row) => row.contacts !== null).map((row) => ({ ...row.estimates, customer: row.contacts }));
        return this.createPaginationResult(data, countResult[0].count, page, limit);
      }
      async findByCustomerId(customerId) {
        const rows = await this.db.select().from(estimates).leftJoin(contacts, eq3(estimates.customerId, contacts.id)).where(eq3(estimates.customerId, customerId)).orderBy(desc3(estimates.createdAt));
        return rows.filter((row) => row.contacts !== null).map((row) => ({ ...row.estimates, customer: row.contacts }));
      }
      async findByStatus(status) {
        const rows = await this.db.select().from(estimates).leftJoin(contacts, eq3(estimates.customerId, contacts.id)).where(eq3(estimates.status, status)).orderBy(desc3(estimates.createdAt));
        return rows.filter((row) => row.contacts !== null).map((row) => ({ ...row.estimates, customer: row.contacts }));
      }
      async getPendingEstimatesCount() {
        const [{ count: total }] = await this.db.select({ count: count3() }).from(estimates).where(inArray2(estimates.status, ["draft", "sent"]));
        return total;
      }
      async getRecentEstimates(limit = 10) {
        const rows = await this.db.select().from(estimates).leftJoin(contacts, eq3(estimates.customerId, contacts.id)).orderBy(desc3(estimates.createdAt)).limit(limit);
        return rows.filter((row) => row.contacts !== null).map((row) => ({ ...row.estimates, customer: row.contacts }));
      }
    };
  }
});

// server/repositories/InvoiceRepository.ts
import { eq as eq4, desc as desc4, or as or4, ilike as ilike4, count as count4, sum } from "drizzle-orm";
var InvoiceRepository;
var init_InvoiceRepository = __esm({
  "server/repositories/InvoiceRepository.ts"() {
    "use strict";
    init_BaseRepository();
    init_schema();
    InvoiceRepository = class extends BaseRepository {
      async findById(id) {
        const [result] = await this.db.select().from(invoices).leftJoin(contacts, eq4(invoices.customerId, contacts.id)).where(eq4(invoices.id, id)).limit(1);
        if (!result || !result.contacts) return void 0;
        return { ...result.invoices, customer: result.contacts };
      }
      async create(data) {
        const processedData = {
          ...data,
          totalAmount: typeof data.totalAmount === "number" ? data.totalAmount.toString() : data.totalAmount
        };
        const [invoice] = await this.db.insert(invoices).values(processedData).returning();
        const invoiceWithCustomer = await this.findById(invoice.id);
        if (!invoiceWithCustomer) {
          throw new Error("Failed to create invoice with customer data");
        }
        return invoiceWithCustomer;
      }
      async update(id, data) {
        const processedData = {
          ...data,
          totalAmount: data.totalAmount && typeof data.totalAmount === "number" ? data.totalAmount.toString() : data.totalAmount
        };
        const [invoice] = await this.db.update(invoices).set(processedData).where(eq4(invoices.id, id)).returning();
        if (!invoice) return void 0;
        return await this.findById(invoice.id);
      }
      async delete(id) {
        const result = await this.db.delete(invoices).where(eq4(invoices.id, id));
        return (result.rowCount ?? 0) > 0;
      }
      async findPaginated(options) {
        const { page, limit, search } = options;
        const offset = this.getOffset(page, limit);
        const baseQuery = this.db.select().from(invoices).leftJoin(contacts, eq4(invoices.customerId, contacts.id));
        const baseCountQuery = this.db.select({ count: count4() }).from(invoices);
        if (search) {
          const searchCondition = or4(
            ilike4(invoices.invoiceNumber, `%${search}%`),
            ilike4(contacts.firstName, `%${search}%`),
            ilike4(contacts.lastName, `%${search}%`)
          );
          const [rows2, countResult2] = await Promise.all([
            baseQuery.where(searchCondition).orderBy(desc4(invoices.createdAt)).limit(limit).offset(offset),
            baseCountQuery.leftJoin(contacts, eq4(invoices.customerId, contacts.id)).where(searchCondition)
          ]);
          const data2 = rows2.filter((row) => row.contacts !== null).map((row) => ({ ...row.invoices, customer: row.contacts }));
          return this.createPaginationResult(data2, countResult2[0].count, page, limit);
        }
        const [rows, countResult] = await Promise.all([
          baseQuery.orderBy(desc4(invoices.createdAt)).limit(limit).offset(offset),
          baseCountQuery
        ]);
        const data = rows.filter((row) => row.contacts !== null).map((row) => ({ ...row.invoices, customer: row.contacts }));
        return this.createPaginationResult(data, countResult[0].count, page, limit);
      }
      async findByCustomerId(customerId) {
        const rows = await this.db.select().from(invoices).leftJoin(contacts, eq4(invoices.customerId, contacts.id)).where(eq4(invoices.customerId, customerId)).orderBy(desc4(invoices.createdAt));
        return rows.filter((row) => row.contacts !== null).map((row) => ({ ...row.invoices, customer: row.contacts }));
      }
      async findByStatus(status) {
        const rows = await this.db.select().from(invoices).leftJoin(contacts, eq4(invoices.customerId, contacts.id)).where(eq4(invoices.status, status)).orderBy(desc4(invoices.createdAt));
        return rows.filter((row) => row.contacts !== null).map((row) => ({ ...row.invoices, customer: row.contacts }));
      }
      async getTotalRevenue() {
        const [result] = await this.db.select({ total: sum(invoices.totalAmount) }).from(invoices).where(eq4(invoices.status, "paid"));
        return parseFloat(result.total) || 0;
      }
      async getRecentInvoices(limit = 10) {
        const rows = await this.db.select().from(invoices).leftJoin(contacts, eq4(invoices.customerId, contacts.id)).orderBy(desc4(invoices.createdAt)).limit(limit);
        return rows.filter((row) => row.contacts !== null).map((row) => ({ ...row.invoices, customer: row.contacts }));
      }
    };
  }
});

// server/repositories/ProjectUpdateRepository.ts
import { eq as eq5, desc as desc5, count as count5 } from "drizzle-orm";
var ProjectUpdateRepository;
var init_ProjectUpdateRepository = __esm({
  "server/repositories/ProjectUpdateRepository.ts"() {
    "use strict";
    init_db();
    init_schema();
    ProjectUpdateRepository = class {
      async findByContactId(contactId) {
        const updates = await db.select({
          id: projectUpdates.id,
          contactId: projectUpdates.contactId,
          updateNumber: projectUpdates.updateNumber,
          updateType: projectUpdates.updateType,
          workNeeded: projectUpdates.workNeeded,
          customerRequests: projectUpdates.customerRequests,
          siteConditions: projectUpdates.siteConditions,
          additionalNotes: projectUpdates.additionalNotes,
          createdBy: projectUpdates.createdBy,
          createdAt: projectUpdates.createdAt,
          createdByEmployee: {
            id: employees.id,
            firstName: employees.firstName,
            lastName: employees.lastName,
            email: employees.email,
            phone: employees.phone,
            role: employees.role,
            hireDate: employees.hireDate,
            createdAt: employees.createdAt,
            notes: employees.notes,
            hourlyRate: employees.hourlyRate,
            overtimeRate: employees.overtimeRate,
            isActive: employees.isActive,
            isAvailable: employees.isAvailable
          }
        }).from(projectUpdates).leftJoin(employees, eq5(projectUpdates.createdBy, employees.id)).where(eq5(projectUpdates.contactId, contactId)).orderBy(desc5(projectUpdates.updateNumber));
        return updates.map((update) => ({
          ...update,
          createdByEmployee: update.createdByEmployee?.id ? update.createdByEmployee : void 0
        }));
      }
      async create(data) {
        const maxUpdateResult = await db.select({ count: count5() }).from(projectUpdates).where(eq5(projectUpdates.contactId, data.contactId));
        const updateNumber = (maxUpdateResult[0]?.count || 0) + 1;
        const [created] = await db.insert(projectUpdates).values({
          ...data,
          updateNumber
        }).returning();
        return created;
      }
      async findById(id) {
        const [update] = await db.select().from(projectUpdates).where(eq5(projectUpdates.id, id)).limit(1);
        return update;
      }
      async update(id, data) {
        const [updated] = await db.update(projectUpdates).set(data).where(eq5(projectUpdates.id, id)).returning();
        return updated;
      }
      async delete(id) {
        const result = await db.delete(projectUpdates).where(eq5(projectUpdates.id, id));
        return result.rowCount !== null && result.rowCount > 0;
      }
      async getUpdateCountByContact(contactId) {
        const [result] = await db.select({ count: count5() }).from(projectUpdates).where(eq5(projectUpdates.contactId, contactId));
        return result?.count || 0;
      }
      async getAllUpdates() {
        const updates = await db.select({
          id: projectUpdates.id,
          contactId: projectUpdates.contactId,
          updateNumber: projectUpdates.updateNumber,
          updateType: projectUpdates.updateType,
          workNeeded: projectUpdates.workNeeded,
          customerRequests: projectUpdates.customerRequests,
          siteConditions: projectUpdates.siteConditions,
          additionalNotes: projectUpdates.additionalNotes,
          createdBy: projectUpdates.createdBy,
          createdAt: projectUpdates.createdAt,
          createdByEmployee: {
            id: employees.id,
            firstName: employees.firstName,
            lastName: employees.lastName,
            email: employees.email,
            phone: employees.phone,
            role: employees.role,
            hireDate: employees.hireDate,
            createdAt: employees.createdAt,
            notes: employees.notes,
            hourlyRate: employees.hourlyRate,
            overtimeRate: employees.overtimeRate,
            isActive: employees.isActive,
            isAvailable: employees.isAvailable
          }
        }).from(projectUpdates).leftJoin(employees, eq5(projectUpdates.createdBy, employees.id)).orderBy(desc5(projectUpdates.createdAt));
        return updates;
      }
      async getRecentUpdates(limit = 10) {
        const updates = await db.select({
          id: projectUpdates.id,
          contactId: projectUpdates.contactId,
          updateNumber: projectUpdates.updateNumber,
          updateType: projectUpdates.updateType,
          workNeeded: projectUpdates.workNeeded,
          customerRequests: projectUpdates.customerRequests,
          siteConditions: projectUpdates.siteConditions,
          additionalNotes: projectUpdates.additionalNotes,
          createdBy: projectUpdates.createdBy,
          createdAt: projectUpdates.createdAt,
          createdByEmployee: {
            id: employees.id,
            firstName: employees.firstName,
            lastName: employees.lastName,
            email: employees.email,
            phone: employees.phone,
            role: employees.role,
            hireDate: employees.hireDate,
            createdAt: employees.createdAt,
            notes: employees.notes,
            hourlyRate: employees.hourlyRate,
            overtimeRate: employees.overtimeRate,
            isActive: employees.isActive,
            isAvailable: employees.isAvailable
          },
          contactName: {
            firstName: contacts.firstName,
            lastName: contacts.lastName
          }
        }).from(projectUpdates).leftJoin(employees, eq5(projectUpdates.createdBy, employees.id)).leftJoin(contacts, eq5(projectUpdates.contactId, contacts.id)).orderBy(desc5(projectUpdates.createdAt)).limit(limit);
        return updates.map((update) => ({
          ...update,
          createdByEmployee: update.createdByEmployee?.id ? update.createdByEmployee : void 0
        }));
      }
    };
  }
});

// server/repositories/index.ts
var customerRepository, jobRepository, estimateRepository, invoiceRepository, projectUpdateRepository;
var init_repositories = __esm({
  "server/repositories/index.ts"() {
    "use strict";
    init_CustomerRepository();
    init_JobRepository();
    init_EstimateRepository();
    init_InvoiceRepository();
    init_ProjectUpdateRepository();
    customerRepository = new CustomerRepository();
    jobRepository = new JobRepository();
    estimateRepository = new EstimateRepository();
    invoiceRepository = new InvoiceRepository();
    projectUpdateRepository = new ProjectUpdateRepository();
  }
});

// server/storage.ts
var storage_exports = {};
__export(storage_exports, {
  DatabaseStorage: () => DatabaseStorage,
  storage: () => storage
});
import { eq as eq6, desc as desc6, and as and3, gte as gte2, lte as lte2, count as count6, not, inArray as inArray4 } from "drizzle-orm";
var DatabaseStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_schema();
    init_db();
    init_repositories();
    DatabaseStorage = class {
      async getCustomers() {
        return await db.select().from(contacts).orderBy(desc6(contacts.createdAt));
      }
      async getCustomer(id) {
        const [customer] = await db.select().from(contacts).where(eq6(contacts.id, id));
        return customer || void 0;
      }
      async createCustomer(customer) {
        const [newCustomer] = await db.insert(contacts).values(customer).returning();
        return newCustomer;
      }
      async updateCustomer(id, customer) {
        const [updatedCustomer] = await db.update(contacts).set(customer).where(eq6(contacts.id, id)).returning();
        return updatedCustomer || void 0;
      }
      async deleteCustomer(id) {
        const result = await db.delete(contacts).where(eq6(contacts.id, id));
        return (result.rowCount ?? 0) > 0;
      }
      async getJobs() {
        const rows = await db.select().from(jobs).leftJoin(contacts, eq6(jobs.customerId, contacts.id)).orderBy(desc6(jobs.createdAt));
        return rows.filter((row) => row.contacts !== null).map((row) => ({
          ...row.jobs,
          customer: row.contacts
        }));
      }
      async getJob(id) {
        const [result] = await db.select().from(jobs).leftJoin(contacts, eq6(jobs.customerId, contacts.id)).where(eq6(jobs.id, id));
        return result && result.contacts ? { ...result.jobs, customer: result.contacts } : void 0;
      }
      async getJobsByCustomer(customerId) {
        return await db.select().from(jobs).where(eq6(jobs.customerId, customerId));
      }
      async createJob(job) {
        const processedJob = { ...job };
        if (processedJob.scheduledDate && typeof processedJob.scheduledDate === "string") {
          processedJob.scheduledDate = new Date(processedJob.scheduledDate);
        }
        const [newJob] = await db.insert(jobs).values([processedJob]).returning();
        return newJob;
      }
      async updateJob(id, job) {
        const updateData = { ...job };
        if (updateData.scheduledDate && typeof updateData.scheduledDate === "string") {
          updateData.scheduledDate = new Date(updateData.scheduledDate);
        }
        const [updatedJob] = await db.update(jobs).set(updateData).where(eq6(jobs.id, id)).returning();
        return updatedJob || void 0;
      }
      async deleteJob(id) {
        const result = await db.delete(jobs).where(eq6(jobs.id, id));
        return (result.rowCount ?? 0) > 0;
      }
      async getEstimates() {
        return await db.select().from(estimates).leftJoin(contacts, eq6(estimates.customerId, contacts.id)).orderBy(desc6(estimates.createdAt)).then((rows) => rows.map((row) => ({ ...row.estimates, customer: row.contacts })));
      }
      async getEstimate(id) {
        const [result] = await db.select().from(estimates).leftJoin(contacts, eq6(estimates.customerId, contacts.id)).where(eq6(estimates.id, id));
        return result ? { ...result.estimates, customer: result.contacts } : void 0;
      }
      async getEstimatesByCustomer(customerId) {
        return await db.select().from(estimates).where(eq6(estimates.customerId, customerId));
      }
      async createEstimate(estimate) {
        const estimateData = {
          ...estimate,
          validUntil: estimate.validUntil ? new Date(estimate.validUntil) : null,
          sentAt: estimate.sentAt ? new Date(estimate.sentAt) : null,
          respondedAt: estimate.respondedAt ? new Date(estimate.respondedAt) : null
        };
        const [newEstimate] = await db.insert(estimates).values(estimateData).returning();
        return newEstimate;
      }
      async updateEstimate(id, estimate) {
        const estimateData = { ...estimate };
        if (estimate.validUntil) estimateData.validUntil = new Date(estimate.validUntil);
        if (estimate.sentAt) estimateData.sentAt = new Date(estimate.sentAt);
        if (estimate.respondedAt) estimateData.respondedAt = new Date(estimate.respondedAt);
        const [updatedEstimate] = await db.update(estimates).set(estimateData).where(eq6(estimates.id, id)).returning();
        return updatedEstimate || void 0;
      }
      async deleteEstimate(id) {
        const result = await db.delete(estimates).where(eq6(estimates.id, id));
        return (result.rowCount ?? 0) > 0;
      }
      async getInvoices() {
        return await db.select().from(invoices).leftJoin(contacts, eq6(invoices.customerId, contacts.id)).orderBy(desc6(invoices.createdAt)).then((rows) => rows.map((row) => ({ ...row.invoices, customer: row.contacts })));
      }
      async getInvoice(id) {
        const [result] = await db.select().from(invoices).leftJoin(contacts, eq6(invoices.customerId, contacts.id)).where(eq6(invoices.id, id));
        return result ? { ...result.invoices, customer: result.contacts } : void 0;
      }
      async getInvoicesByCustomer(customerId) {
        return await db.select().from(invoices).where(eq6(invoices.customerId, customerId));
      }
      async generateInvoiceNumber() {
        const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
        const yearStr = currentYear.toString();
        const startOfYear = new Date(currentYear, 0, 1);
        const [result] = await db.select({ count: count6() }).from(invoices).where(gte2(invoices.createdAt, startOfYear));
        const nextNumber = (result?.count || 0) + 1;
        const paddedNumber = nextNumber.toString().padStart(3, "0");
        return `INV-${yearStr}-${paddedNumber}`;
      }
      async createInvoice(invoice) {
        const invoiceNumber = invoice.invoiceNumber || await this.generateInvoiceNumber();
        const totalAmount = parseFloat(invoice.totalAmount.toString());
        const subtotal = invoice.subtotal ? parseFloat(invoice.subtotal.toString()) : totalAmount;
        const taxAmount = invoice.taxAmount ? parseFloat(invoice.taxAmount.toString()) : 0;
        const paidAmount = invoice.paidAmount ? parseFloat(invoice.paidAmount.toString()) : 0;
        const balanceDue = totalAmount - paidAmount;
        const processedInvoice = {
          customerId: invoice.customerId,
          jobId: invoice.jobId || null,
          estimateId: invoice.estimateId || null,
          invoiceNumber,
          title: invoice.title || "Invoice",
          description: invoice.description || "",
          subtotal: subtotal.toFixed(2),
          taxRate: invoice.taxRate ? parseFloat(invoice.taxRate.toString()) : 0,
          taxAmount: taxAmount.toFixed(2),
          totalAmount: totalAmount.toFixed(2),
          paidAmount: paidAmount.toFixed(2),
          balanceDue: balanceDue.toFixed(2),
          status: invoice.status || "draft",
          paymentTerms: invoice.paymentTerms || "net_30",
          isRecurring: invoice.isRecurring || false,
          dueDate: invoice.dueDate ? new Date(invoice.dueDate) : null,
          sentAt: invoice.sentAt ? new Date(invoice.sentAt) : null,
          paidAt: invoice.paidAt ? new Date(invoice.paidAt) : null,
          items: invoice.items || "",
          notes: invoice.notes || "",
          internalNotes: invoice.internalNotes || ""
        };
        if (invoice.title) processedInvoice.title = invoice.title;
        if (invoice.description) processedInvoice.description = invoice.description;
        if (invoice.subtotal) processedInvoice.subtotal = invoice.subtotal;
        if (invoice.taxRate !== void 0) processedInvoice.taxRate = invoice.taxRate;
        if (invoice.taxAmount !== void 0) processedInvoice.taxAmount = invoice.taxAmount;
        if (invoice.balanceDue !== void 0) processedInvoice.balanceDue = invoice.balanceDue;
        if (invoice.paymentTerms) processedInvoice.paymentTerms = invoice.paymentTerms;
        if (invoice.isRecurring !== void 0) processedInvoice.isRecurring = invoice.isRecurring;
        if (invoice.recurringInterval) processedInvoice.recurringInterval = invoice.recurringInterval;
        const [newInvoice] = await db.insert(invoices).values([processedInvoice]).returning();
        return newInvoice;
      }
      async updateInvoice(id, invoice) {
        const processedInvoice = {};
        if (invoice.title !== void 0) processedInvoice.title = invoice.title;
        if (invoice.description !== void 0) processedInvoice.description = invoice.description;
        if (invoice.invoiceNumber !== void 0) processedInvoice.invoiceNumber = invoice.invoiceNumber;
        if (invoice.subtotal !== void 0) processedInvoice.subtotal = invoice.subtotal;
        if (invoice.taxRate !== void 0) processedInvoice.taxRate = invoice.taxRate;
        if (invoice.taxAmount !== void 0) processedInvoice.taxAmount = invoice.taxAmount;
        if (invoice.totalAmount !== void 0) processedInvoice.totalAmount = invoice.totalAmount;
        if (invoice.internalNotes !== void 0) processedInvoice.internalNotes = invoice.internalNotes;
        if (invoice.sentAt !== void 0) {
          processedInvoice.sentAt = invoice.sentAt ? typeof invoice.sentAt === "string" ? new Date(invoice.sentAt) : invoice.sentAt : null;
        }
        if (invoice.dueDate !== void 0) {
          processedInvoice.dueDate = invoice.dueDate ? typeof invoice.dueDate === "string" ? new Date(invoice.dueDate) : invoice.dueDate : null;
        }
        if (invoice.paidAt !== void 0) {
          processedInvoice.paidAt = invoice.paidAt ? typeof invoice.paidAt === "string" ? new Date(invoice.paidAt) : invoice.paidAt : null;
        }
        if (invoice.lastReminderSent !== void 0) {
          processedInvoice.lastReminderSent = invoice.lastReminderSent ? typeof invoice.lastReminderSent === "string" ? new Date(invoice.lastReminderSent) : invoice.lastReminderSent : null;
        }
        processedInvoice.updatedAt = /* @__PURE__ */ new Date();
        const [updatedInvoice] = await db.update(invoices).set(processedInvoice).where(eq6(invoices.id, id)).returning();
        return updatedInvoice || void 0;
      }
      async deleteInvoice(id) {
        const result = await db.delete(invoices).where(eq6(invoices.id, id));
        return (result.rowCount ?? 0) > 0;
      }
      // Payment methods - simplified implementation
      async getPayments() {
        try {
          return await db.select().from(payments).orderBy(desc6(payments.createdAt));
        } catch (error) {
          console.log("Payments table not ready, returning empty array");
          return [];
        }
      }
      async getPaymentsByInvoice(invoiceId) {
        try {
          return await db.select().from(payments).where(eq6(payments.invoiceId, invoiceId));
        } catch (error) {
          console.log("Payments table not ready, returning empty array");
          return [];
        }
      }
      async createPayment(payment) {
        try {
          const processedPayment = {
            ...payment,
            paymentDate: payment.paymentDate ? new Date(payment.paymentDate) : /* @__PURE__ */ new Date()
          };
          const [newPayment] = await db.insert(payments).values(processedPayment).returning();
          if (newPayment) {
            await this.updateInvoiceBalance(newPayment.invoiceId);
          }
          return newPayment;
        } catch (error) {
          console.log("Payment creation failed, table may not be ready:", error);
          throw error;
        }
      }
      async updateInvoiceBalance(invoiceId) {
        const invoicePayments = await db.select({ amount: payments.amount }).from(payments).where(eq6(payments.invoiceId, invoiceId));
        const totalPaid = invoicePayments.reduce((sum4, payment) => sum4 + parseFloat(payment.amount.toString()), 0);
        const [invoice] = await db.select({ totalAmount: invoices.totalAmount }).from(invoices).where(eq6(invoices.id, invoiceId));
        if (invoice) {
          const totalAmount = parseFloat(invoice.totalAmount.toString());
          const balanceDue = totalAmount - totalPaid;
          let status = "sent";
          if (balanceDue <= 0) {
            status = "paid";
          } else if (totalPaid > 0) {
            status = "partial_paid";
          }
          await db.update(invoices).set({
            paidAmount: totalPaid.toString(),
            balanceDue: Math.max(0, balanceDue).toString(),
            status,
            paidAt: balanceDue <= 0 ? /* @__PURE__ */ new Date() : null
          }).where(eq6(invoices.id, invoiceId));
        }
      }
      // Recurring billing methods
      async getRecurringBilling() {
        return await db.select().from(recurringBilling).orderBy(desc6(recurringBilling.createdAt));
      }
      async getRecurringBillingByCustomer(customerId) {
        return await db.select().from(recurringBilling).where(eq6(recurringBilling.customerId, customerId));
      }
      async createRecurringBilling(billing) {
        const processedBilling = {
          ...billing,
          startDate: billing.startDate ? new Date(billing.startDate) : /* @__PURE__ */ new Date(),
          endDate: billing.endDate ? new Date(billing.endDate) : null,
          nextBillDate: billing.nextBillDate ? new Date(billing.nextBillDate) : /* @__PURE__ */ new Date(),
          lastInvoiceDate: billing.lastInvoiceDate ? new Date(billing.lastInvoiceDate) : null
        };
        const [newBilling] = await db.insert(recurringBilling).values(processedBilling).returning();
        return newBilling;
      }
      async updateRecurringBilling(id, billing) {
        const processedBilling = { ...billing };
        if (processedBilling.startDate && typeof processedBilling.startDate === "string") {
          processedBilling.startDate = new Date(processedBilling.startDate);
        }
        if (processedBilling.endDate && typeof processedBilling.endDate === "string") {
          processedBilling.endDate = new Date(processedBilling.endDate);
        }
        if (processedBilling.nextBillDate && typeof processedBilling.nextBillDate === "string") {
          processedBilling.nextBillDate = new Date(processedBilling.nextBillDate);
        }
        if (processedBilling.lastInvoiceDate && typeof processedBilling.lastInvoiceDate === "string") {
          processedBilling.lastInvoiceDate = new Date(processedBilling.lastInvoiceDate);
        }
        const [updatedBilling] = await db.update(recurringBilling).set(processedBilling).where(eq6(recurringBilling.id, id)).returning();
        return updatedBilling || void 0;
      }
      // User authentication methods for persistent storage
      async getUserByEmail(email) {
        try {
          const [user] = await db.select().from(users).where(eq6(users.email, email));
          return user || void 0;
        } catch (error) {
          console.log("User lookup failed, table may not be ready:", error);
          return void 0;
        }
      }
      async getUserById(id) {
        try {
          const [user] = await db.select().from(users).where(eq6(users.id, id));
          return user || void 0;
        } catch (error) {
          console.log("User lookup failed, table may not be ready:", error);
          return void 0;
        }
      }
      async createUser(userData) {
        try {
          const [newUser] = await db.insert(users).values(userData).returning();
          return newUser;
        } catch (error) {
          console.log("User creation failed, table may not be ready:", error);
          throw error;
        }
      }
      async updateUser(id, userData) {
        try {
          const [updatedUser] = await db.update(users).set(userData).where(eq6(users.id, id)).returning();
          return updatedUser || void 0;
        } catch (error) {
          console.log("User update failed:", error);
          throw error;
        }
      }
      async updateUserLastLogin(id) {
        try {
          await db.update(users).set({ lastLoginAt: /* @__PURE__ */ new Date() }).where(eq6(users.id, id));
        } catch (error) {
          console.log("User last login update failed:", error);
        }
      }
      async getCommunications() {
        return await db.select().from(communications).leftJoin(contacts, eq6(communications.customerId, contacts.id)).orderBy(desc6(communications.createdAt)).then((rows) => rows.map((row) => ({ ...row.communications, customer: row.contacts })));
      }
      async getCommunicationsByCustomer(customerId) {
        return await db.select().from(communications).where(eq6(communications.customerId, customerId));
      }
      async createCommunication(communication) {
        const [newCommunication] = await db.insert(communications).values(communication).returning();
        return newCommunication;
      }
      async getDashboardStats() {
        const now = /* @__PURE__ */ new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const paidInvoices = await db.select({ totalAmount: invoices.totalAmount }).from(invoices).where(and3(
          eq6(invoices.status, "paid"),
          gte2(invoices.createdAt, startOfMonth)
        ));
        const totalRevenue = paidInvoices.reduce((sum4, invoice) => {
          const value = parseFloat(invoice.totalAmount || "0");
          return sum4 + (isNaN(value) ? 0 : value);
        }, 0);
        const [activeJobsResult] = await db.select({ count: count6() }).from(jobs).where(and3(
          not(eq6(jobs.status, "completed")),
          not(eq6(jobs.status, "cancelled"))
        ));
        const [newCustomersResult] = await db.select({ count: count6() }).from(contacts).where(gte2(contacts.createdAt, startOfMonth));
        const [pendingEstimatesResult] = await db.select({ count: count6() }).from(estimates).where(eq6(estimates.status, "sent"));
        return {
          totalRevenue,
          activeJobs: activeJobsResult?.count || 0,
          newCustomers: newCustomersResult?.count || 0,
          pendingEstimates: pendingEstimatesResult?.count || 0
        };
      }
      // Removed duplicate - using repository pattern implementation below
      async getTodaySchedule() {
        const today = /* @__PURE__ */ new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        return await db.select().from(jobs).leftJoin(contacts, eq6(jobs.customerId, contacts.id)).where(and3(
          gte2(jobs.scheduledDate, startOfDay),
          lte2(jobs.scheduledDate, endOfDay)
        )).orderBy(jobs.scheduledDate).then((rows) => rows.map((row) => ({ ...row.jobs, customer: row.contacts })));
      }
      async getBusinessProfile() {
        const [profile] = await db.select().from(businessProfiles).limit(1);
        return profile || void 0;
      }
      async createBusinessProfile(profile) {
        const [created] = await db.insert(businessProfiles).values(profile).returning();
        return created;
      }
      async updateBusinessProfile(profile) {
        const existing = await this.getBusinessProfile();
        if (!existing) return void 0;
        const [updated] = await db.update(businessProfiles).set({ ...profile, updatedAt: /* @__PURE__ */ new Date() }).where(eq6(businessProfiles.id, existing.id)).returning();
        return updated || void 0;
      }
      // Document methods implementation
      async getDocuments() {
        return await db.select().from(documents2).orderBy(desc6(documents2.createdAt));
      }
      async getDocumentsByCustomer(customerId) {
        return await db.select().from(documents2).where(eq6(documents2.customerId, customerId)).orderBy(desc6(documents2.createdAt));
      }
      async getDocumentsByJob(jobId) {
        return await db.select().from(documents2).where(eq6(documents2.jobId, jobId)).orderBy(desc6(documents2.createdAt));
      }
      async getDocumentsByEstimate(estimateId) {
        return await db.select().from(documents2).where(eq6(documents2.estimateId, estimateId)).orderBy(desc6(documents2.createdAt));
      }
      async getDocumentsByInvoice(invoiceId) {
        return await db.select().from(documents2).where(eq6(documents2.invoiceId, invoiceId)).orderBy(desc6(documents2.createdAt));
      }
      async getDocument(id) {
        const [document] = await db.select().from(documents2).where(eq6(documents2.id, id));
        return document || void 0;
      }
      async createDocument(document) {
        const [created] = await db.insert(documents2).values(document).returning();
        return created;
      }
      async updateDocument(id, document) {
        const [updated] = await db.update(documents2).set({ ...document, updatedAt: /* @__PURE__ */ new Date() }).where(eq6(documents2.id, id)).returning();
        return updated || void 0;
      }
      async deleteDocument(id) {
        const result = await db.delete(documents2).where(eq6(documents2.id, id));
        return result.rowCount !== null && result.rowCount > 0;
      }
      // Employee methods
      async getEmployees() {
        return await db.select().from(employees).where(eq6(employees.isActive, true)).orderBy(employees.firstName, employees.lastName);
      }
      async getEmployee(id) {
        const [employee] = await db.select().from(employees).where(eq6(employees.id, id));
        return employee || void 0;
      }
      async createEmployee(employee) {
        const [created] = await db.insert(employees).values(employee).returning();
        return created;
      }
      async updateEmployee(id, employee) {
        const [updated] = await db.update(employees).set(employee).where(eq6(employees.id, id)).returning();
        return updated || void 0;
      }
      async deleteEmployee(id) {
        const result = await db.update(employees).set({ isActive: false }).where(eq6(employees.id, id));
        return result.rowCount !== null && result.rowCount > 0;
      }
      // Work Order methods
      async getWorkOrders() {
        const results = await db.select().from(workOrders).leftJoin(contacts, eq6(workOrders.customerId, contacts.id)).leftJoin(jobs, eq6(workOrders.jobId, jobs.id)).leftJoin(employees, eq6(workOrders.assignedTechnicianId, employees.id)).orderBy(desc6(workOrders.createdAt));
        return results.map((row) => ({
          ...row.work_orders,
          customer: row.contacts,
          job: row.jobs,
          assignedTechnician: row.employees || void 0
        }));
      }
      async getWorkOrder(id) {
        const [workOrder] = await db.select().from(workOrders).leftJoin(contacts, eq6(workOrders.customerId, contacts.id)).leftJoin(jobs, eq6(workOrders.jobId, jobs.id)).leftJoin(employees, eq6(workOrders.assignedTechnicianId, employees.id)).where(eq6(workOrders.id, id));
        if (!workOrder) return void 0;
        const tasks = await db.select().from(workOrderTasks).where(eq6(workOrderTasks.workOrderId, id)).orderBy(workOrderTasks.orderIndex);
        return { ...workOrder.work_orders, customer: workOrder.contacts, job: workOrder.jobs, assignedTechnician: workOrder.employees || void 0, tasks };
      }
      async getWorkOrdersByJob(jobId) {
        return await db.select().from(workOrders).where(eq6(workOrders.jobId, jobId)).orderBy(desc6(workOrders.createdAt));
      }
      async createWorkOrder(workOrder) {
        const countResult = await db.select({ count: count6() }).from(workOrders);
        const nextNumber = (countResult[0]?.count || 0) + 1;
        const workOrderNumber = `WO-${nextNumber.toString().padStart(6, "0")}`;
        const newWorkOrder = {
          workOrderNumber,
          title: workOrder.title,
          description: workOrder.description || null,
          customerId: workOrder.customer_id,
          jobId: workOrder.job_id,
          estimateId: workOrder.estimate_id || null,
          assignedTechnicianId: workOrder.assigned_technician_id || null,
          status: workOrder.status || "scheduled",
          priority: workOrder.priority || "normal",
          scheduledStartDate: workOrder.scheduled_start_date || null,
          scheduledEndDate: workOrder.scheduled_end_date || null,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        const [created] = await db.insert(workOrders).values(newWorkOrder).returning();
        return created;
      }
      async updateWorkOrder(id, workOrder) {
        const processedWorkOrder = { ...workOrder };
        if (processedWorkOrder.scheduledStartDate && typeof processedWorkOrder.scheduledStartDate === "string") {
          processedWorkOrder.scheduledStartDate = new Date(processedWorkOrder.scheduledStartDate);
        }
        if (processedWorkOrder.scheduledEndDate && typeof processedWorkOrder.scheduledEndDate === "string") {
          processedWorkOrder.scheduledEndDate = new Date(processedWorkOrder.scheduledEndDate);
        }
        const [updated] = await db.update(workOrders).set({ ...processedWorkOrder, updatedAt: /* @__PURE__ */ new Date() }).where(eq6(workOrders.id, id)).returning();
        return updated || void 0;
      }
      async deleteWorkOrder(id) {
        const result = await db.delete(workOrders).where(eq6(workOrders.id, id));
        return result.rowCount !== null && result.rowCount > 0;
      }
      async createWorkOrderFromEstimate(estimateId) {
        const estimate = await this.getEstimate(estimateId);
        if (!estimate) {
          throw new Error("Estimate not found");
        }
        const workOrder = {
          jobId: estimate.jobId || 0,
          // This should be required
          estimateId,
          customerId: estimate.customerId,
          title: estimate.title,
          description: estimate.description,
          status: "scheduled",
          priority: "normal"
        };
        return await this.createWorkOrder(workOrder);
      }
      // Work Order Task methods
      async getWorkOrderTasks(workOrderId) {
        return await db.select().from(workOrderTasks).where(eq6(workOrderTasks.workOrderId, workOrderId)).orderBy(workOrderTasks.orderIndex);
      }
      async createWorkOrderTask(task) {
        const [created] = await db.insert(workOrderTasks).values(task).returning();
        return created;
      }
      async updateWorkOrderTask(id, task) {
        const [updated] = await db.update(workOrderTasks).set(task).where(eq6(workOrderTasks.id, id)).returning();
        return updated || void 0;
      }
      async deleteWorkOrderTask(id) {
        const result = await db.delete(workOrderTasks).where(eq6(workOrderTasks.id, id));
        return result.rowCount !== null && result.rowCount > 0;
      }
      // Time Entry methods
      async getTimeEntries() {
        const results = await db.select().from(timeEntries).leftJoin(employees, eq6(timeEntries.employeeId, employees.id)).leftJoin(workOrders, eq6(timeEntries.workOrderId, workOrders.id)).leftJoin(jobs, eq6(timeEntries.jobId, jobs.id)).leftJoin(contacts, eq6(jobs.customerId, contacts.id)).orderBy(desc6(timeEntries.createdAt));
        return results.map((row) => ({
          ...row.time_entries,
          employee: row.employees,
          workOrder: row.work_orders || void 0,
          job: row.jobs ? { ...row.jobs, customer: row.contacts } : void 0
        }));
      }
      async getTimeEntriesByEmployee(employeeId) {
        return await db.select().from(timeEntries).where(eq6(timeEntries.employeeId, employeeId)).orderBy(desc6(timeEntries.clockInTime));
      }
      async getTimeEntriesByWorkOrder(workOrderId) {
        return await db.select().from(timeEntries).where(eq6(timeEntries.workOrderId, workOrderId)).orderBy(desc6(timeEntries.clockInTime));
      }
      async createTimeEntry(timeEntry) {
        const processedEntry = {
          ...timeEntry,
          clockInTime: typeof timeEntry.clockInTime === "string" ? new Date(timeEntry.clockInTime) : timeEntry.clockInTime,
          clockOutTime: timeEntry.clockOutTime ? typeof timeEntry.clockOutTime === "string" ? new Date(timeEntry.clockOutTime) : timeEntry.clockOutTime : void 0
        };
        const [created] = await db.insert(timeEntries).values(processedEntry).returning();
        return created;
      }
      async updateTimeEntry(id, timeEntry) {
        const processedEntry = {
          ...timeEntry,
          clockInTime: timeEntry.clockInTime ? typeof timeEntry.clockInTime === "string" ? new Date(timeEntry.clockInTime) : timeEntry.clockInTime : void 0,
          clockOutTime: timeEntry.clockOutTime ? typeof timeEntry.clockOutTime === "string" ? new Date(timeEntry.clockOutTime) : timeEntry.clockOutTime : void 0
        };
        const [updated] = await db.update(timeEntries).set(processedEntry).where(eq6(timeEntries.id, id)).returning();
        return updated || void 0;
      }
      async deleteTimeEntry(id) {
        const result = await db.delete(timeEntries).where(eq6(timeEntries.id, id));
        return result.rowCount !== null && result.rowCount > 0;
      }
      // Inventory methods
      async getInventoryItems() {
        const results = await db.select().from(inventoryItems).leftJoin(suppliers, eq6(inventoryItems.supplierId, suppliers.id)).where(eq6(inventoryItems.isActive, true)).orderBy(inventoryItems.name);
        return results.map((row) => ({
          ...row.inventory_items,
          supplier: row.suppliers || void 0
        }));
      }
      async getInventoryItem(id) {
        const [item] = await db.select().from(inventoryItems).where(eq6(inventoryItems.id, id));
        return item || void 0;
      }
      async createInventoryItem(item) {
        const [created] = await db.insert(inventoryItems).values(item).returning();
        return created;
      }
      async updateInventoryItem(id, item) {
        const [updated] = await db.update(inventoryItems).set({ ...item, updatedAt: /* @__PURE__ */ new Date() }).where(eq6(inventoryItems.id, id)).returning();
        return updated || void 0;
      }
      async deleteInventoryItem(id) {
        const result = await db.update(inventoryItems).set({ isActive: false }).where(eq6(inventoryItems.id, id));
        return result.rowCount !== null && result.rowCount > 0;
      }
      async getLowStockItems() {
        return await db.select().from(inventoryItems).where(and3(
          eq6(inventoryItems.isActive, true),
          lte2(inventoryItems.currentStock, inventoryItems.minimumStock)
        )).orderBy(inventoryItems.name);
      }
      // Supplier methods
      async getSuppliers() {
        return await db.select().from(suppliers).where(eq6(suppliers.isActive, true)).orderBy(suppliers.name);
      }
      async getSupplier(id) {
        const [supplier] = await db.select().from(suppliers).where(eq6(suppliers.id, id));
        return supplier || void 0;
      }
      async createSupplier(supplier) {
        const [created] = await db.insert(suppliers).values(supplier).returning();
        return created;
      }
      async updateSupplier(id, supplier) {
        const [updated] = await db.update(suppliers).set(supplier).where(eq6(suppliers.id, id)).returning();
        return updated || void 0;
      }
      async deleteSupplier(id) {
        const result = await db.update(suppliers).set({ isActive: false }).where(eq6(suppliers.id, id));
        return result.rowCount !== null && result.rowCount > 0;
      }
      // Equipment methods
      async getEquipment() {
        const results = await db.select().from(equipment).leftJoin(employees, eq6(equipment.assignedToEmployeeId, employees.id)).where(eq6(equipment.isActive, true)).orderBy(equipment.name);
        return results.map((row) => ({
          ...row.equipment,
          assignedToEmployee: row.employees || void 0
        }));
      }
      async getEquipmentItem(id) {
        const [item] = await db.select().from(equipment).where(eq6(equipment.id, id));
        return item || void 0;
      }
      async createEquipment(equipmentItem) {
        const processedEquipment = { ...equipmentItem };
        if (processedEquipment.purchaseDate && typeof processedEquipment.purchaseDate === "string") {
          processedEquipment.purchaseDate = new Date(processedEquipment.purchaseDate);
        }
        const [created] = await db.insert(equipment).values([processedEquipment]).returning();
        return created;
      }
      async updateEquipment(id, equipmentItem) {
        const processedEquipment = { ...equipmentItem };
        if (processedEquipment.purchaseDate && typeof processedEquipment.purchaseDate === "string") {
          processedEquipment.purchaseDate = new Date(processedEquipment.purchaseDate);
        }
        if (processedEquipment.nextMaintenanceDate && typeof processedEquipment.nextMaintenanceDate === "string") {
          processedEquipment.nextMaintenanceDate = new Date(processedEquipment.nextMaintenanceDate);
        }
        const [updated] = await db.update(equipment).set(processedEquipment).where(eq6(equipment.id, id)).returning();
        return updated || void 0;
      }
      async deleteEquipment(id) {
        const result = await db.update(equipment).set({ isActive: false }).where(eq6(equipment.id, id));
        return result.rowCount !== null && result.rowCount > 0;
      }
      // Employee Permission methods
      async getEmployeePermissions(employeeId) {
        const [permissions3] = await db.select().from(employeePermissions).where(eq6(employeePermissions.employeeId, employeeId));
        return permissions3;
      }
      async createEmployeePermissions(permissions3) {
        const [created] = await db.insert(employeePermissions).values({
          ...permissions3,
          updatedAt: /* @__PURE__ */ new Date()
        }).returning();
        return created;
      }
      async updateEmployeePermissions(employeeId, permissions3) {
        const [updated] = await db.update(employeePermissions).set({
          ...permissions3,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq6(employeePermissions.employeeId, employeeId)).returning();
        return updated;
      }
      async deleteEmployeePermissions(employeeId) {
        const result = await db.delete(employeePermissions).where(eq6(employeePermissions.employeeId, employeeId));
        return result.rowCount !== null && result.rowCount > 0;
      }
      // Notification methods
      async getNotifications() {
        return await db.select().from(notifications).where(eq6(notifications.businessProfileId, 1)).orderBy(desc6(notifications.createdAt));
      }
      async createNotification(notification) {
        const [created] = await db.insert(notifications).values({
          ...notification,
          businessProfileId: 1
          // TODO: Use actual business profile ID
        }).returning();
        return created;
      }
      async markNotificationAsRead(id) {
        const [updated] = await db.update(notifications).set({
          isRead: true,
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq6(notifications.id, id)).returning();
        return updated || void 0;
      }
      async deleteNotification(id) {
        const result = await db.delete(notifications).where(eq6(notifications.id, id));
        return result.rowCount !== null && result.rowCount > 0;
      }
      async generateBusinessNotifications() {
        const generatedNotifications = [];
        const estimates2 = await this.getEstimates();
        const jobs2 = await this.getJobs();
        const invoices2 = await this.getInvoices();
        await db.delete(notifications).where(and3(
          eq6(notifications.businessProfileId, 1),
          lte2(notifications.expiresAt, /* @__PURE__ */ new Date())
        ));
        const overdueEstimates = estimates2.filter((est) => {
          const estimateDate = new Date(est.createdAt);
          const daysDiff = (Date.now() - estimateDate.getTime()) / (1e3 * 60 * 60 * 24);
          return est.status === "pending" && daysDiff > 7;
        });
        if (overdueEstimates.length > 0) {
          const notification = await this.createNotification({
            type: "estimate_overdue",
            title: `${overdueEstimates.length} Overdue Estimate${overdueEstimates.length > 1 ? "s" : ""}`,
            message: `Follow up with customers: ${overdueEstimates.map((e) => e.customer.firstName + " " + e.customer.lastName).join(", ")}`,
            priority: "high",
            relatedEntityType: "estimate",
            relatedEntityId: overdueEstimates[0].id,
            actionUrl: "/estimates",
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3),
            // 7 days
            businessProfileId: 1
          });
          generatedNotifications.push(notification);
        }
        const todayJobs = jobs2.filter((job) => {
          if (!job.scheduledDate) return false;
          const jobDate = new Date(job.scheduledDate).toDateString();
          const today = (/* @__PURE__ */ new Date()).toDateString();
          return jobDate === today && job.status !== "completed";
        });
        if (todayJobs.length > 0) {
          const notification = await this.createNotification({
            type: "job_today",
            title: `${todayJobs.length} Job${todayJobs.length > 1 ? "s" : ""} Scheduled Today`,
            message: `Upcoming work: ${todayJobs.map((j) => j.title).join(", ")}`,
            priority: "medium",
            relatedEntityType: "job",
            relatedEntityId: todayJobs[0].id,
            actionUrl: "/jobs",
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1e3),
            // 24 hours
            businessProfileId: 1
          });
          generatedNotifications.push(notification);
        }
        const overdueInvoices = invoices2.filter((inv) => {
          const invoiceDate = new Date(inv.createdAt);
          const daysDiff = (Date.now() - invoiceDate.getTime()) / (1e3 * 60 * 60 * 24);
          return inv.status === "sent" && daysDiff > 30;
        });
        if (overdueInvoices.length > 0) {
          const totalAmount = overdueInvoices.reduce((sum4, inv) => sum4 + parseFloat(inv.totalAmount || "0"), 0);
          const notification = await this.createNotification({
            type: "invoice_overdue",
            title: `${overdueInvoices.length} Overdue Invoice${overdueInvoices.length > 1 ? "s" : ""}`,
            message: `$${totalAmount.toFixed(2)} pending collection from ${overdueInvoices.map((i) => i.customer.firstName + " " + i.customer.lastName).join(", ")}`,
            priority: "urgent",
            relatedEntityType: "invoice",
            relatedEntityId: overdueInvoices[0].id,
            actionUrl: "/invoices",
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3),
            // 30 days
            businessProfileId: 1
          });
          generatedNotifications.push(notification);
        }
        const recentCompletions = jobs2.filter((job) => {
          if (job.status !== "completed" || !job.completedDate) return false;
          const completedDate = new Date(job.completedDate);
          const daysDiff = (Date.now() - completedDate.getTime()) / (1e3 * 60 * 60 * 24);
          return daysDiff <= 3;
        });
        if (recentCompletions.length > 0) {
          const notification = await this.createNotification({
            type: "job_completed",
            title: `${recentCompletions.length} Job${recentCompletions.length > 1 ? "s" : ""} Ready for Invoicing`,
            message: `Generate invoices for: ${recentCompletions.map((j) => j.title).join(", ")}`,
            priority: "medium",
            relatedEntityType: "job",
            relatedEntityId: recentCompletions[0].id,
            actionUrl: "/invoices",
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3),
            // 7 days
            businessProfileId: 1
          });
          generatedNotifications.push(notification);
        }
        return generatedNotifications;
      }
      // Lead pipeline methods
      async getLeadPipelineStages() {
        return await db.select().from(leadPipelineStages).where(eq6(leadPipelineStages.isActive, true)).orderBy(leadPipelineStages.sortOrder);
      }
      async createLeadPipelineStage(stage) {
        const [newStage] = await db.insert(leadPipelineStages).values(stage).returning();
        return newStage;
      }
      async updateLeadPipelineStage(id, stage) {
        const [updatedStage] = await db.update(leadPipelineStages).set({ ...stage, updatedAt: /* @__PURE__ */ new Date() }).where(eq6(leadPipelineStages.id, id)).returning();
        return updatedStage || void 0;
      }
      async deleteLeadPipelineStage(id) {
        const result = await db.update(leadPipelineStages).set({ isActive: false }).where(eq6(leadPipelineStages.id, id));
        return result.rowCount !== null && result.rowCount > 0;
      }
      async getLeadPipelineEntries() {
        const results = await db.select().from(leadPipelineEntries).leftJoin(contacts, eq6(leadPipelineEntries.contactId, contacts.id)).leftJoin(leadPipelineStages, eq6(leadPipelineEntries.stageId, leadPipelineStages.id)).orderBy(leadPipelineEntries.enteredStageAt);
        return results.map((row) => ({
          ...row.lead_pipeline_entries,
          contact: row.contacts,
          stage: row.lead_pipeline_stages
        }));
      }
      async createLeadPipelineEntry(entry) {
        const processedEntry = { ...entry };
        if (processedEntry.expectedCloseDate && typeof processedEntry.expectedCloseDate === "string") {
          processedEntry.expectedCloseDate = new Date(processedEntry.expectedCloseDate);
        }
        const [newEntry] = await db.insert(leadPipelineEntries).values([processedEntry]).returning();
        return newEntry;
      }
      async updateLeadPipelineEntry(id, entry) {
        const processedEntry = { ...entry };
        if (processedEntry.expectedCloseDate && typeof processedEntry.expectedCloseDate === "string") {
          processedEntry.expectedCloseDate = new Date(processedEntry.expectedCloseDate);
        }
        const [updatedEntry] = await db.update(leadPipelineEntries).set({ ...processedEntry, updatedAt: /* @__PURE__ */ new Date() }).where(eq6(leadPipelineEntries.id, id)).returning();
        return updatedEntry || void 0;
      }
      async deleteLeadPipelineEntry(id) {
        const result = await db.delete(leadPipelineEntries).where(eq6(leadPipelineEntries.id, id));
        return result.rowCount !== null && result.rowCount > 0;
      }
      // Lead Notes methods
      async getLeadNotes(leadPipelineEntryId) {
        try {
          return await db.select().from(leadNotes).where(and3(eq6(leadNotes.leadPipelineEntryId, leadPipelineEntryId), eq6(leadNotes.isDeleted, false))).orderBy(desc6(leadNotes.createdAt));
        } catch (error) {
          console.warn("Lead notes table not yet available:", error);
          return [];
        }
      }
      async createLeadNote(note) {
        try {
          const [newNote] = await db.insert(leadNotes).values(note).returning();
          return newNote;
        } catch (error) {
          console.error("Error creating lead note:", error);
          throw error;
        }
      }
      async updateLeadNote(id, note) {
        try {
          const [updatedNote] = await db.update(leadNotes).set({ ...note, updatedAt: /* @__PURE__ */ new Date() }).where(eq6(leadNotes.id, id)).returning();
          return updatedNote || void 0;
        } catch (error) {
          console.error("Error updating lead note:", error);
          return void 0;
        }
      }
      async deleteLeadNote(id) {
        try {
          const result = await db.update(leadNotes).set({ isDeleted: true, updatedAt: /* @__PURE__ */ new Date() }).where(eq6(leadNotes.id, id));
          return result.rowCount !== null && result.rowCount > 0;
        } catch (error) {
          console.error("Error deleting lead note:", error);
          return false;
        }
      }
      async getLeadNotesCount() {
        try {
          const counts = await db.select({
            leadPipelineEntryId: leadNotes.leadPipelineEntryId,
            count: count6(leadNotes.id)
          }).from(leadNotes).where(eq6(leadNotes.isDeleted, false)).groupBy(leadNotes.leadPipelineEntryId);
          const result = {};
          counts.forEach((item) => {
            result[item.leadPipelineEntryId] = Number(item.count);
          });
          return result;
        } catch (error) {
          console.warn("Lead notes count not yet available:", error);
          return {};
        }
      }
      // Bulk operations for lead pipeline entries
      async bulkUpdateLeadStage(leadIds, stageId) {
        const updatedEntries = await db.update(leadPipelineEntries).set({
          stageId,
          enteredStageAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).where(inArray4(leadPipelineEntries.id, leadIds)).returning();
        return updatedEntries;
      }
      async bulkDeleteLeads(leadIds) {
        const result = await db.delete(leadPipelineEntries).where(eq6(leadPipelineEntries.id, leadIds[0]));
        return result.rowCount || 0;
      }
      // Employee Scheduling Methods
      async getEmployeeSchedule(employeeId, startDate, endDate) {
        return await db.select().from(jobs).where(and3(
          eq6(jobs.assignedTechnicianId, employeeId),
          gte2(jobs.scheduledDate, startDate),
          lte2(jobs.scheduledDate, endDate)
        )).orderBy(jobs.scheduledDate, jobs.scheduledStartTime);
      }
      async getAvailableEmployees(date2, startTime, endTime) {
        const allEmployees = await db.select().from(employees).where(and3(
          eq6(employees.isActive, true),
          eq6(employees.isAvailable, true)
        ));
        const availableEmployees = [];
        for (const employee of allEmployees) {
          const conflicts = await db.select().from(jobs).where(and3(
            eq6(jobs.assignedTechnicianId, employee.id),
            eq6(jobs.scheduledDate, date2),
            inArray4(jobs.status, ["scheduled", "in_progress"])
          ));
          if (conflicts.length === 0) {
            availableEmployees.push(employee);
          }
        }
        return availableEmployees;
      }
      async assignJobToEmployee(jobId, employeeId, assignedBy) {
        const employee = await this.getEmployee(employeeId);
        if (!employee || !employee.isActive) {
          throw new Error("Employee not found or inactive");
        }
        const [updatedJob] = await db.update(jobs).set({
          assignedTechnicianId: employeeId,
          status: "scheduled"
        }).where(eq6(jobs.id, jobId)).returning();
        return updatedJob;
      }
      async setEmployeeAvailability(employeeId, date2, availability) {
        const [existing] = await db.select().from(employeeAvailability).where(and3(
          eq6(employeeAvailability.employeeId, employeeId),
          eq6(employeeAvailability.date, date2)
        ));
        if (existing) {
          const [updated] = await db.update(employeeAvailability).set({
            ...availability,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq6(employeeAvailability.id, existing.id)).returning();
          return updated;
        } else {
          const [created] = await db.insert(employeeAvailability).values(availability).returning();
          return created;
        }
      }
      async getEmployeeAvailability(employeeId, startDate, endDate) {
        return await db.select().from(employeeAvailability).where(and3(
          eq6(employeeAvailability.employeeId, employeeId),
          gte2(employeeAvailability.date, startDate),
          lte2(employeeAvailability.date, endDate)
        )).orderBy(employeeAvailability.date);
      }
      async updateEmployeeAvailabilityStatus(employeeId, isAvailable) {
        const [updated] = await db.update(employees).set({ isAvailable }).where(eq6(employees.id, employeeId)).returning();
        return updated;
      }
      // Role-based permission check for job assignment
      async canEmployeeAssignJobs(employeeId) {
        const employee = await this.getEmployee(employeeId);
        if (!employee) return false;
        if (employee.role === "admin" || employee.role === "manager") {
          return true;
        }
        const permissions3 = await this.getEmployeePermissions(employeeId);
        return permissions3?.canCreateAssignJobs || false;
      }
      // Optimized dashboard statistics using repositories
      async getDashboardStatsOptimized() {
        const [totalCustomers, activeJobs, pendingEstimates, totalRevenue] = await Promise.all([
          customerRepository.getTotalCount(),
          jobRepository.getActiveJobsCount(),
          estimateRepository.getPendingEstimatesCount(),
          invoiceRepository.getTotalRevenue()
        ]);
        return {
          totalCustomers,
          activeJobs,
          pendingEstimates,
          totalRevenue
        };
      }
      async getRecentCustomers(limit = 10) {
        return await customerRepository.getRecentCustomers(limit);
      }
      async getRecentJobs(limit = 10) {
        return await jobRepository.getRecentJobs(limit);
      }
      async getRecentEstimates(limit = 10) {
        return await estimateRepository.getRecentEstimates(limit);
      }
      async getRecentInvoices(limit = 10) {
        return await invoiceRepository.getRecentInvoices(limit);
      }
      // Project Updates methods implementation using repository pattern
      async getProjectUpdates(contactId) {
        return await projectUpdateRepository.findByContactId(contactId);
      }
      async createProjectUpdate(update) {
        return await projectUpdateRepository.create(update);
      }
      async updateProjectUpdate(id, update) {
        return await projectUpdateRepository.update(id, update);
      }
      async deleteProjectUpdate(id) {
        return await projectUpdateRepository.delete(id);
      }
    };
    storage = new DatabaseStorage();
  }
});

// server/index.ts
import express4 from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

// server/routes.ts
init_storage();
import { createServer } from "http";

// server/services/BaseService.ts
var ServiceError = class extends Error {
  constructor(message, statusCode = 500, validationErrors) {
    super(message);
    this.statusCode = statusCode;
    this.validationErrors = validationErrors;
    this.name = "ServiceError";
  }
};
var BaseService = class {
  createSuccessResponse(data, message) {
    return {
      success: true,
      data,
      message
    };
  }
  createErrorResponse(error, statusCode = 500) {
    return {
      success: false,
      error
    };
  }
  validateRequired(data, requiredFields) {
    const errors = [];
    for (const field of requiredFields) {
      if (!data[field] || typeof data[field] === "string" && data[field].trim() === "") {
        errors.push({
          field,
          message: `${field} is required`
        });
      }
    }
    return errors;
  }
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  validatePhone(phone) {
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  }
};

// server/services/CustomerService.ts
var CustomerService = class extends BaseService {
  constructor(customerRepo) {
    super();
    this.customerRepo = customerRepo;
  }
  async createCustomer(data) {
    const validationErrors = this.validateRequired(data, ["firstName", "lastName"]);
    if (data.email && !this.validateEmail(data.email)) {
      validationErrors.push({
        field: "email",
        message: "Invalid email format"
      });
    }
    if (data.phone && !this.validatePhone(data.phone)) {
      validationErrors.push({
        field: "phone",
        message: "Invalid phone number format"
      });
    }
    if (validationErrors.length > 0) {
      throw new ServiceError("Validation failed", 400, validationErrors);
    }
    if (data.email) {
      const existingCustomer = await this.customerRepo.findByEmail(data.email);
      if (existingCustomer) {
        throw new ServiceError("Customer with this email already exists", 409);
      }
    }
    try {
      const customer = await this.customerRepo.create(data);
      return customer;
    } catch (error) {
      throw new ServiceError("Failed to create customer", 500);
    }
  }
  async updateCustomer(id, data) {
    const existingCustomer = await this.customerRepo.findById(id);
    if (!existingCustomer) {
      throw new ServiceError("Customer not found", 404);
    }
    if (data.email && !this.validateEmail(data.email)) {
      throw new ServiceError("Invalid email format", 400);
    }
    if (data.phone && !this.validatePhone(data.phone)) {
      throw new ServiceError("Invalid phone number format", 400);
    }
    if (data.email && data.email !== existingCustomer.email) {
      const duplicateCustomer = await this.customerRepo.findByEmail(data.email);
      if (duplicateCustomer) {
        throw new ServiceError("Customer with this email already exists", 409);
      }
    }
    try {
      const updatedCustomer = await this.customerRepo.update(id, data);
      if (!updatedCustomer) {
        throw new ServiceError("Failed to update customer", 500);
      }
      return updatedCustomer;
    } catch (error) {
      throw new ServiceError("Failed to update customer", 500);
    }
  }
  async getCustomer(id) {
    const customer = await this.customerRepo.findById(id);
    if (!customer) {
      throw new ServiceError("Customer not found", 404);
    }
    return customer;
  }
  async getCustomers(options) {
    try {
      return await this.customerRepo.findPaginated(options);
    } catch (error) {
      throw new ServiceError("Failed to fetch customers", 500);
    }
  }
  async deleteCustomer(id) {
    const customer = await this.customerRepo.findById(id);
    if (!customer) {
      throw new ServiceError("Customer not found", 404);
    }
    const success = await this.customerRepo.delete(id);
    if (!success) {
      throw new ServiceError("Failed to delete customer", 500);
    }
  }
  async getCustomersByStatus(status) {
    try {
      return await this.customerRepo.findByStatus(status);
    } catch (error) {
      throw new ServiceError("Failed to fetch customers by status", 500);
    }
  }
};

// server/services/JobService.ts
var JobService = class extends BaseService {
  constructor(jobRepo, customerRepo) {
    super();
    this.jobRepo = jobRepo;
    this.customerRepo = customerRepo;
  }
  async createJob(data) {
    const validationErrors = this.validateRequired(data, ["customerId", "title", "serviceType"]);
    if (validationErrors.length > 0) {
      throw new ServiceError("Validation failed", 400, validationErrors);
    }
    const customer = await this.customerRepo.findById(data.customerId);
    if (!customer) {
      throw new ServiceError("Customer not found", 404);
    }
    try {
      const job = await this.jobRepo.create(data);
      return job;
    } catch (error) {
      throw new ServiceError("Failed to create job", 500);
    }
  }
  async updateJob(id, data) {
    const existingJob = await this.jobRepo.findById(id);
    if (!existingJob) {
      throw new ServiceError("Job not found", 404);
    }
    if (data.customerId && data.customerId !== existingJob.customerId) {
      const customer = await this.customerRepo.findById(data.customerId);
      if (!customer) {
        throw new ServiceError("Customer not found", 404);
      }
    }
    try {
      const updatedJob = await this.jobRepo.update(id, data);
      if (!updatedJob) {
        throw new ServiceError("Failed to update job", 500);
      }
      return updatedJob;
    } catch (error) {
      throw new ServiceError("Failed to update job", 500);
    }
  }
  async getJob(id) {
    const job = await this.jobRepo.findById(id);
    if (!job) {
      throw new ServiceError("Job not found", 404);
    }
    return job;
  }
  async getJobs(options) {
    try {
      return await this.jobRepo.findPaginated(options);
    } catch (error) {
      throw new ServiceError("Failed to fetch jobs", 500);
    }
  }
  async deleteJob(id) {
    const job = await this.jobRepo.findById(id);
    if (!job) {
      throw new ServiceError("Job not found", 404);
    }
    const success = await this.jobRepo.delete(id);
    if (!success) {
      throw new ServiceError("Failed to delete job", 500);
    }
  }
  async getJobsByCustomer(customerId) {
    const customer = await this.customerRepo.findById(customerId);
    if (!customer) {
      throw new ServiceError("Customer not found", 404);
    }
    try {
      return await this.jobRepo.findByCustomerId(customerId);
    } catch (error) {
      throw new ServiceError("Failed to fetch customer jobs", 500);
    }
  }
  async getTodaySchedule() {
    try {
      return await this.jobRepo.getTodaySchedule();
    } catch (error) {
      throw new ServiceError("Failed to fetch today's schedule", 500);
    }
  }
  async getJobsByStatus(status) {
    try {
      return await this.jobRepo.findByStatus(status);
    } catch (error) {
      throw new ServiceError("Failed to fetch jobs by status", 500);
    }
  }
};

// server/services/index.ts
init_repositories();
var customerService = new CustomerService(customerRepository);
var jobService = new JobService(jobRepository, customerRepository);

// server/services/projectUpdateService.ts
init_repositories();
var ProjectUpdateService = class {
  async getProjectUpdatesForContact(contactId) {
    return await projectUpdateRepository.findByContactId(contactId);
  }
  async createProjectUpdate(data) {
    const hasContent = data.workNeeded || data.customerRequests || data.siteConditions || data.additionalNotes;
    if (!hasContent) {
      throw new Error("At least one field must contain content");
    }
    return await projectUpdateRepository.create(data);
  }
  async updateProjectUpdate(id, data) {
    const existing = await projectUpdateRepository.findById(id);
    if (!existing) {
      throw new Error("Project update not found");
    }
    const updated = await projectUpdateRepository.update(id, data);
    if (!updated) {
      throw new Error("Failed to update project update");
    }
    return updated;
  }
  async deleteProjectUpdate(id) {
    const existing = await projectUpdateRepository.findById(id);
    if (!existing) {
      throw new Error("Project update not found");
    }
    const success = await projectUpdateRepository.delete(id);
    if (!success) {
      throw new Error("Failed to delete project update");
    }
  }
  async getUpdateCount(contactId) {
    return await projectUpdateRepository.getUpdateCountByContact(contactId);
  }
  async getRecentUpdates(limit = 10) {
    return await projectUpdateRepository.getRecentUpdates(limit);
  }
  async getAllProjectUpdates() {
    return await projectUpdateRepository.getAllUpdates();
  }
};
var projectUpdateService = new ProjectUpdateService();

// server/utils/errorHandler.ts
function handleServiceError(error, res) {
  console.error("Service error:", error);
  if (error instanceof ServiceError) {
    const response = {
      success: false,
      error: error.message
    };
    if (error.validationErrors) {
      response.validationErrors = error.validationErrors;
    }
    res.status(error.statusCode).json(response);
    return;
  }
  res.status(500).json({
    success: false,
    error: "Internal server error"
  });
}

// server/auth-middleware.ts
init_storage();
import jwt from "jsonwebtoken";
var JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
function generateToken(userId, email, role, businessProfileId) {
  return jwt.sign(
    {
      userId,
      email,
      role,
      businessProfileId,
      iat: Math.floor(Date.now() / 1e3)
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}
async function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      req.user = {
        id: 1,
        email: "admin@tulboxx.com",
        role: "admin",
        businessProfileId: 1
      };
      return next();
    }
    if (token === "demo-token") {
      req.user = {
        id: 1,
        email: "demo@tulboxx.com",
        role: "admin",
        businessProfileId: 1
      };
      return next();
    }
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    const user = await storage.getUserById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(403).json({ error: "User not found or inactive" });
    }
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      businessProfileId: user.businessProfileId
    };
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
}
function validatePassword(password) {
  const errors = [];
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }
  return {
    isValid: errors.length === 0,
    errors
  };
}
function securityHeaders(req, res, next) {
  res.removeHeader("X-Powered-By");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
}

// server/routes.ts
init_schema();
init_db();
init_schema();
import { z as z2 } from "zod";
import { eq as eq7, count as count7, sum as sum3, inArray as inArray5 } from "drizzle-orm";
import bcrypt2 from "bcrypt";

// server/openai-fixed.ts
import OpenAI from "openai";
var openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "default_key"
});
async function generateAIEstimate(request) {
  try {
    const workDetails = request.additionalNotes || request.serviceType || "Service project";
    const prompt = `Create a professional estimate title and description for this project:

${workDetails}

Requirements:
- Focus ONLY on the specific work described above
- Write professional, confident content that builds trust
- Explain what will be accomplished and its value
- NO pricing, costs, rates, line items, or dollar amounts
- Return only title and description in JSON format

{
  "title": "Professional project title",
  "description": "Detailed explanation of the work and its value"
}`;
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 600,
      temperature: 0.3
    });
    const result = JSON.parse(response.choices[0].message.content || "{}");
    if (!result.title || !result.description) {
      throw new Error("Invalid AI response");
    }
    return {
      title: result.title,
      description: result.description
    };
  } catch (error) {
    console.error("AI generation error:", error);
    throw new Error("Failed to generate estimate content");
  }
}
async function generateSocialContent(request) {
  return { content: "Social content generation not implemented" };
}
async function polishText(text2, fieldType, businessType, businessName) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "user",
        content: `Polish this ${fieldType} text for a ${businessType} business called ${businessName}:

${text2}

Make it professional and engaging while keeping the core meaning.`
      }],
      max_tokens: 300,
      temperature: 0.5
    });
    return response.choices[0].message.content || text2;
  } catch (error) {
    console.error("Polish text error:", error);
    return text2;
  }
}

// server/ai-estimate-generator.ts
import OpenAI2 from "openai";
var openai2 = new OpenAI2({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "default_key"
});
async function generateEstimateFromFieldNotes(request) {
  try {
    const customerType = request.propertyType;
    const tone = request.estimatePreferences?.tone || "professional";
    const detailLevel = request.estimatePreferences?.detailLevel || "detailed";
    const contextPrompt = buildContextualPrompt(request, customerType, tone, detailLevel);
    const response = await openai2.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: getSystemPrompt(customerType, tone)
        },
        {
          role: "user",
          content: contextPrompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 2500,
      temperature: 0.4
    });
    const result = JSON.parse(response.choices[0].message.content || "{}");
    if (!result.title || !result.projectDescription || !result.scopeOfWork || !result.warrantiesAndBenefits) {
      throw new Error("Invalid AI response format");
    }
    return {
      title: result.title,
      projectDescription: result.projectDescription,
      scopeOfWork: result.scopeOfWork,
      warrantiesAndBenefits: result.warrantiesAndBenefits,
      metadata: {
        processingTimestamp: (/* @__PURE__ */ new Date()).toISOString(),
        customerType,
        tone,
        painPointsIdentified: result.painPointsIdentified || [],
        keySellingPoints: result.keySellingPoints || []
      }
    };
  } catch (error) {
    console.error("AI estimate generation error:", error);
    throw new Error("Failed to generate estimate content from field notes");
  }
}
function getSystemPrompt(customerType, tone) {
  const basePrompt = `You are a professional service business expert who transforms technician field notes into compelling, client-ready estimates. Your expertise spans residential and commercial service industries including landscaping, plumbing, electrical, HVAC, cleaning, and construction.`;
  const customerSpecificGuidance = customerType === "residential" ? `RESIDENTIAL CUSTOMER APPROACH:
       - Use emotional intelligence - address homeowner concerns about safety, family, property value
       - Explain benefits in terms of comfort, peace of mind, and home improvement
       - Use accessible language while maintaining professionalism
       - Focus on quality, reliability, and warranty protection
       - Address common homeowner pain points: disruption, mess, timeline, durability` : `COMMERCIAL CUSTOMER APPROACH:
       - Use direct, business-focused language emphasizing efficiency and ROI
       - Highlight compliance, productivity gains, and operational benefits
       - Include relevant regulations, codes, and industry standards
       - Focus on minimal business disruption and professional execution
       - Emphasize liability protection and insurance considerations`;
  const toneGuidance = {
    professional: "Use authoritative, expert language that builds confidence and trust",
    friendly: "Use warm, approachable language while maintaining professionalism",
    technical: "Use precise technical terminology appropriate for knowledgeable clients"
  }[tone];
  return `${basePrompt}

${customerSpecificGuidance}

TONE GUIDANCE: ${toneGuidance}

CORE EXPERTISE:
- Transform rough field observations into polished sales content
- Identify and address customer pain points from context clues
- Build value propositions that justify professional service pricing
- Create clear, actionable scope descriptions that prevent misunderstandings
- Leverage industry knowledge to demonstrate expertise and professionalism`;
}
function buildContextualPrompt(request, customerType, tone, detailLevel) {
  const painPointGuidance = customerType === "residential" ? "Common residential pain points to address: safety concerns, family disruption, property damage risk, aesthetic appearance, long-term durability, maintenance requirements" : "Common commercial pain points to address: business disruption, employee safety, regulatory compliance, operational efficiency, cost management, liability exposure";
  return `Transform these field notes into a professional estimate with these sections:

FIELD NOTES TO TRANSFORM:
"${request.fieldNotes}"

PROJECT CONTEXT:
- Service Type: ${request.serviceType}
- Customer: ${request.customerContext.firstName} ${request.customerContext.lastName}
- Property Type: ${customerType}
- Address: ${request.customerContext.address || "Not specified"}
- Additional Customer Notes: ${request.customerContext.notes || "None"}

BUSINESS CONTEXT:
- Company: ${request.businessContext.businessName}
- Specializations: ${request.businessContext.specializations?.join(", ") || "General services"}
- Warranties Available: ${request.businessContext.warranties || "Standard warranty applies"}
- Insurance: ${request.businessContext.insuranceInfo || "Fully licensed and insured"}

PAIN POINT AWARENESS:
${painPointGuidance}

DETAIL LEVEL: ${detailLevel} - ${detailLevel === "basic" ? "concise but complete" : detailLevel === "detailed" ? "thorough explanations" : "comprehensive with technical details"}

Generate a JSON response with this exact structure:
{
  "title": "Professional estimate title that captures the project scope and value",
  "projectDescription": "Compelling paragraph describing the project, its importance, and expected outcomes. Address customer pain points and build confidence in your expertise.",
  "scopeOfWork": "Detailed breakdown of exactly what work will be performed, materials used, and process followed. Use bullet points or numbered lists for clarity. Demonstrate technical knowledge and thoroughness.",
  "warrantiesAndBenefits": "Final paragraph covering warranties, guarantees, insurance coverage, and why choosing your company provides value and peace of mind. Include relevant certifications or special qualifications.",
  "painPointsIdentified": ["list of customer pain points you identified from context"],
  "keySellingPoints": ["list of key value propositions that differentiate this service"]
}

REQUIREMENTS:
- NO pricing, costs, rates, or dollar amounts anywhere
- Use specific technical details from field notes to demonstrate expertise
- Address the identified customer type's primary concerns
- Build trust through professional language and industry knowledge
- Create content that helps win the job by showing value and expertise`;
}

// server/routes.ts
import OpenAI4 from "openai";

// server/google-calendar.ts
import { google } from "googleapis";
var GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
var GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
var REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "https://app.tulboxx.com/oauth2callback";
var oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  REDIRECT_URI
);
var calendar = google.calendar({ version: "v3", auth: oauth2Client });
var GoogleCalendarService = class {
  accessToken = null;
  setAccessToken(token) {
    this.accessToken = token;
    oauth2Client.setCredentials({ access_token: token });
  }
  // Generate OAuth URL for user authorization
  getAuthUrl() {
    const scopes = ["https://www.googleapis.com/auth/calendar"];
    return oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes
    });
  }
  // Exchange authorization code for access token
  async getAccessToken(code) {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    if (tokens.access_token) {
      this.accessToken = tokens.access_token;
      return tokens.access_token;
    }
    throw new Error("Failed to obtain access token");
  }
  // Create a calendar event from a job
  async createJobEvent(job) {
    if (!this.accessToken) {
      throw new Error("No access token available. Please authorize first.");
    }
    try {
      const event = {
        summary: `${job.title} - ${job.customer.firstName} ${job.customer.lastName}`,
        description: job.description || `Job for ${job.customer.firstName} ${job.customer.lastName}`,
        location: `${job.customer.address || ""}, ${job.customer.city || ""}, ${job.customer.state || ""}`.trim().replace(/^,\s*|,\s*$/g, ""),
        start: {
          dateTime: job.scheduledDate ? new Date(job.scheduledDate).toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
          timeZone: "America/New_York"
          // Default timezone - could be made configurable
        },
        end: {
          dateTime: job.scheduledDate ? new Date(new Date(job.scheduledDate).getTime() + 2 * 60 * 60 * 1e3).toISOString() : new Date(Date.now() + 2 * 60 * 60 * 1e3).toISOString(),
          timeZone: "America/New_York"
        },
        colorId: this.getJobColorId(job.status)
      };
      const response = await calendar.events.insert({
        calendarId: "primary",
        requestBody: event
      });
      return response.data.id || null;
    } catch (error) {
      console.error("Error creating calendar event:", error);
      throw error;
    }
  }
  // Update an existing calendar event
  async updateJobEvent(eventId, job) {
    if (!this.accessToken) {
      throw new Error("No access token available. Please authorize first.");
    }
    try {
      const event = {
        summary: `${job.title} - ${job.customer.firstName} ${job.customer.lastName}`,
        description: job.description || `Job for ${job.customer.firstName} ${job.customer.lastName}`,
        location: `${job.customer.address || ""}, ${job.customer.city || ""}, ${job.customer.state || ""}`.trim().replace(/^,\s*|,\s*$/g, ""),
        start: {
          dateTime: job.scheduledDate ? new Date(job.scheduledDate).toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
          timeZone: "America/New_York"
        },
        end: {
          dateTime: job.scheduledDate ? new Date(new Date(job.scheduledDate).getTime() + 2 * 60 * 60 * 1e3).toISOString() : new Date(Date.now() + 2 * 60 * 60 * 1e3).toISOString(),
          timeZone: "America/New_York"
        },
        colorId: this.getJobColorId(job.status)
      };
      await calendar.events.update({
        calendarId: "primary",
        eventId,
        requestBody: event
      });
    } catch (error) {
      console.error("Error updating calendar event:", error);
      throw error;
    }
  }
  // Delete a calendar event
  async deleteJobEvent(eventId) {
    if (!this.accessToken) {
      throw new Error("No access token available. Please authorize first.");
    }
    try {
      await calendar.events.delete({
        calendarId: "primary",
        eventId
      });
    } catch (error) {
      console.error("Error deleting calendar event:", error);
      throw error;
    }
  }
  // Get color ID based on job status
  getJobColorId(status) {
    switch (status) {
      case "scheduled":
        return "9";
      // Blue
      case "in_progress":
        return "5";
      // Yellow
      case "completed":
        return "10";
      // Green
      case "cancelled":
        return "11";
      // Red
      default:
        return "1";
    }
  }
  // Sync all scheduled jobs to calendar
  async syncAllJobs(jobs2) {
    if (!this.accessToken) {
      throw new Error("No access token available. Please authorize first.");
    }
    const scheduledJobs = jobs2.filter(
      (job) => job.scheduledDate && (job.status === "scheduled" || job.status === "in_progress")
    );
    for (const job of scheduledJobs) {
      try {
        if (job.calendarEventId) {
          await this.updateJobEvent(job.calendarEventId, job);
        } else {
          const eventId = await this.createJobEvent(job);
        }
      } catch (error) {
        console.error(`Failed to sync job ${job.id}:`, error);
      }
    }
  }
};
var googleCalendarService = new GoogleCalendarService();

// server/scheduling-ai.ts
import OpenAI3 from "openai";

// server/google-maps.ts
var GoogleMapsService = class {
  apiKey;
  constructor() {
    this.apiKey = process.env.GOOGLE_API_KEY || "";
  }
  /**
   * Get travel times between multiple locations using Distance Matrix API
   */
  async getDistanceMatrix(origins, destinations) {
    if (!this.apiKey) {
      console.warn("Google Maps API key not configured, using fallback estimates");
      return this.getFallbackTravelTimes(origins, destinations);
    }
    try {
      const originsParam = origins.join("|");
      const destinationsParam = destinations.join("|");
      const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(originsParam)}&destinations=${encodeURIComponent(destinationsParam)}&units=metric&key=${this.apiKey}`;
      console.log("Google Maps API call:", url);
      const response = await fetch(url);
      const data = await response.json();
      console.log("Google Maps API response:", JSON.stringify(data, null, 2));
      if (data.status !== "OK") {
        console.error("Google Maps API error:", data.status, data.error_message);
        throw new Error(`Google Maps API error: ${data.status}`);
      }
      const results = [];
      data.rows.forEach((row, originIndex) => {
        row.elements.forEach((element, destIndex) => {
          results.push({
            origin: origins[originIndex],
            destination: destinations[destIndex],
            duration: element.duration?.value || 1800,
            // Default 30 min
            distance: element.distance?.value || 1e4,
            // Default 10km
            status: element.status
          });
        });
      });
      return results;
    } catch (error) {
      console.error("Distance Matrix API failed:", error);
      return this.getFallbackTravelTimes(origins, destinations);
    }
  }
  /**
   * Geocode an address to get coordinates
   */
  async geocodeAddress(address) {
    if (!this.apiKey) {
      console.warn("Google Maps API key not configured, geocoding unavailable");
      return null;
    }
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.apiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.status !== "OK" || !data.results.length) {
        throw new Error(`Geocoding failed: ${data.status}`);
      }
      const result = data.results[0];
      return {
        address,
        coordinates: {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng
        },
        formattedAddress: result.formatted_address,
        placeId: result.place_id
      };
    } catch (error) {
      console.error("Geocoding failed:", error);
      return null;
    }
  }
  /**
   * Batch geocode multiple addresses
   */
  async batchGeocode(addresses) {
    const results = await Promise.all(
      addresses.map((address) => this.geocodeAddress(address))
    );
    return results;
  }
  /**
   * Fallback travel time estimation when API is unavailable
   */
  getFallbackTravelTimes(origins, destinations) {
    const results = [];
    origins.forEach((origin) => {
      destinations.forEach((destination) => {
        const estimatedDuration = origin === destination ? 0 : 1800;
        const estimatedDistance = origin === destination ? 0 : 15e3;
        results.push({
          origin,
          destination,
          duration: estimatedDuration,
          distance: estimatedDistance,
          status: "FALLBACK_ESTIMATE"
        });
      });
    });
    return results;
  }
  /**
   * Calculate estimated travel time between two coordinates (straight-line distance approximation)
   */
  calculateEstimatedTravelTime(origin, destination, speedKmH = 40) {
    const distance = this.calculateDistance(origin, destination);
    const timeHours = distance / speedKmH;
    return Math.round(timeHours * 3600);
  }
  /**
   * Calculate straight-line distance between two coordinates (Haversine formula)
   */
  calculateDistance(coord1, coord2) {
    const R = 6371;
    const dLat = this.toRad(coord2.lat - coord1.lat);
    const dLng = this.toRad(coord2.lng - coord1.lng);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(this.toRad(coord1.lat)) * Math.cos(this.toRad(coord2.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  toRad(degrees) {
    return degrees * (Math.PI / 180);
  }
};
var googleMapsService = new GoogleMapsService();

// server/scheduling-ai.ts
var openai3 = new OpenAI3({ apiKey: process.env.OPENAI_API_KEY });
async function optimizeScheduleWithAI(request) {
  try {
    const { storage: storage2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
    const businessProfile = await storage2.getBusinessProfile();
    const addresses = request.jobs.map(
      (job) => job.address || `${job.customer.address}, ${job.customer.city}, ${job.customer.state}`
    );
    const startingAddress = request.startLocation?.address || (businessProfile ? `${businessProfile.address}, ${businessProfile.city}, ${businessProfile.state}` : "123 Business St, Peoria, IL 61604");
    console.log("Getting travel times for addresses:", addresses);
    console.log("Starting from business address:", startingAddress);
    const allAddresses = [startingAddress, ...addresses];
    const travelTimes = await googleMapsService.getDistanceMatrix(allAddresses, allAddresses);
    console.log("Travel times from Google Maps:", travelTimes);
    const travelTimeMatrix = {};
    travelTimes.forEach((tt) => {
      const key = `${tt.origin}|${tt.destination}`;
      travelTimeMatrix[key] = Math.round(tt.duration / 60);
    });
    const jobsData = request.jobs.map((job) => ({
      id: job.id,
      title: job.title,
      serviceType: job.serviceType,
      estimatedDuration: job.estimatedDuration || 120,
      // Default 2 hours
      priority: job.status === "urgent" ? "high" : "normal",
      address: job.address || `${job.customer.address}, ${job.customer.city}, ${job.customer.state}`,
      coordinates: {
        lat: job.latitude ? parseFloat(job.latitude.toString()) : null,
        lng: job.longitude ? parseFloat(job.longitude.toString()) : null
      },
      customerName: `${job.customer.firstName} ${job.customer.lastName}`,
      notes: job.notes
    }));
    const prompt = `You are an expert field service scheduler. Optimize the daily route for technician ${request.technician.firstName} ${request.technician.lastName} on ${request.date}.

Work constraints:
- Work day: ${request.workDayStart} to ${request.workDayEnd}
- Technician role: ${request.technician.role}
${request.startLocation ? `- Start location: ${request.startLocation.address}` : "- Start from first job location"}

Jobs to schedule:
${JSON.stringify(jobsData, null, 2)}

Real travel times from Google Maps (in minutes):
${Object.entries(travelTimeMatrix).map(([key, time]) => {
      const [origin, destination] = key.split("|");
      return `${origin} \u2192 ${destination}: ${time} minutes`;
    }).join("\n")}

CRITICAL: You MUST use the EXACT travel times provided above from Google Maps. DO NOT estimate or guess travel times.

For driveTimeToJob values, use the exact minutes from the travel time matrix above.
For totalDriveTime, sum up all the actual travel times between consecutive jobs.

Please optimize for:
1. Minimal total drive time using ONLY the real Google Maps data above
2. Logical geographic clustering  
3. Service type efficiency (similar services together when possible)
4. Customer priority and urgency

Return a JSON object with this exact structure:
{
  "technicianId": ${request.technician.id},
  "date": "${request.date}",
  "totalDriveTime": <sum_of_actual_drive_times_from_google_maps>,
  "totalWorkTime": <sum_of_all_job_durations>,
  "optimizedJobs": [
    {
      "jobId": <job_id>,
      "scheduledStartTime": "<HH:MM format>",
      "scheduledEndTime": "<HH:MM format>",
      "driveTimeToJob": <EXACT_minutes_from_google_maps_matrix_above>,
      "estimatedDuration": <job_duration_minutes>,
      "sequence": <1_based_order>,
      "coordinates": {"lat": <latitude>, "lng": <longitude>},
      "address": "<full_address>"
    }
  ],
  "warnings": ["<any scheduling conflicts or concerns>"],
  "suggestions": ["<optimization recommendations>"]
}

REMEMBER: driveTimeToJob must be the EXACT value from the Google Maps travel times above, not an estimate.`;
    const bestRoute = optimizeRouteStrategies(jobsData, startingAddress, travelTimeMatrix, request.workDayStart);
    const optimizedJobs = bestRoute.jobs;
    let totalDriveTime = bestRoute.totalDriveTime;
    const totalWorkTime = bestRoute.totalWorkTime;
    const result = {
      technicianId: request.technician.id,
      date: request.date,
      totalDriveTime,
      totalWorkTime,
      optimizedJobs,
      warnings: totalDriveTime > 120 ? ["High total drive time - consider rescheduling some jobs"] : [],
      suggestions: [
        "Route optimized using real Google Maps travel times",
        optimizedJobs.length > 0 ? `Includes return trip to business address (${Math.round(travelTimeMatrix[`${optimizedJobs[optimizedJobs.length - 1]?.address}|${startingAddress}`] || 20)} minutes)` : "No jobs to optimize"
      ]
    };
    console.log("Final optimized result with real drive times:", JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error("AI scheduling optimization failed:", error);
    return createFallbackSchedule(request);
  }
}
function createFallbackSchedule(request) {
  const jobs2 = request.jobs;
  const startTime = parseTime(request.workDayStart);
  let currentTime = startTime;
  const optimizedJobs = jobs2.map((job, index2) => {
    const duration = job.estimatedDuration || 120;
    const startTimeStr = formatTime(currentTime);
    currentTime += duration + 30;
    return {
      jobId: job.id,
      scheduledStartTime: startTimeStr,
      scheduledEndTime: formatTime(currentTime - 30),
      driveTimeToJob: index2 === 0 ? 0 : 30,
      estimatedDuration: duration,
      sequence: index2 + 1,
      coordinates: {
        lat: job.latitude ? parseFloat(job.latitude.toString()) : 0,
        lng: job.longitude ? parseFloat(job.longitude.toString()) : 0
      },
      address: job.address || `${job.customer.address}, ${job.customer.city}`
    };
  });
  return {
    technicianId: request.technician.id,
    date: request.date,
    totalDriveTime: jobs2.length * 30,
    totalWorkTime: jobs2.reduce((sum4, job) => sum4 + (job.estimatedDuration || 120), 0),
    optimizedJobs,
    warnings: ["Using fallback scheduling - AI optimization unavailable"],
    suggestions: ["Consider adding GPS coordinates to jobs for better route optimization"]
  };
}
function parseTime(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}
function formatTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}
function optimizeRouteStrategies(jobs2, startingAddress, travelTimeMatrix, workDayStart) {
  if (jobs2.length === 0) {
    return { jobs: [], totalDriveTime: 0, totalWorkTime: 0 };
  }
  const strategies = [
    generateNearestNeighborRoute(jobs2, startingAddress, travelTimeMatrix),
    generateFarthestFirstRoute(jobs2, startingAddress, travelTimeMatrix),
    generateGeographicClusterRoute(jobs2, startingAddress, travelTimeMatrix),
    generateOptimalReturnRoute(jobs2, startingAddress, travelTimeMatrix)
  ];
  let bestRoute = null;
  let bestScore = Infinity;
  for (const route of strategies) {
    const score = evaluateRouteQuality(route, startingAddress, travelTimeMatrix);
    console.log(`Route strategy scored: ${score.total} (drive: ${score.driveTime}, return: ${score.returnTime}, logic: ${score.geographicLogic})`);
    if (score.total < bestScore) {
      bestScore = score.total;
      bestRoute = route;
    }
  }
  const workDayStartMinutes = parseTime(workDayStart);
  const scheduledJobs = applyTimingToRoute(bestRoute || strategies[0], workDayStartMinutes, travelTimeMatrix, startingAddress);
  return {
    jobs: scheduledJobs.jobs,
    totalDriveTime: scheduledJobs.totalDriveTime,
    totalWorkTime: scheduledJobs.totalWorkTime
  };
}
function generateNearestNeighborRoute(jobs2, startingAddress, travelTimeMatrix) {
  const remaining = [...jobs2];
  const route = [];
  let currentLocation = startingAddress;
  while (remaining.length > 0) {
    let bestIndex = 0;
    let shortestTime = Infinity;
    remaining.forEach((job, index2) => {
      const travelKey = `${currentLocation}|${job.address}`;
      const driveTime = travelTimeMatrix[travelKey] || 30;
      if (driveTime < shortestTime) {
        shortestTime = driveTime;
        bestIndex = index2;
      }
    });
    route.push(remaining[bestIndex]);
    currentLocation = remaining[bestIndex].address;
    remaining.splice(bestIndex, 1);
  }
  return route;
}
function generateFarthestFirstRoute(jobs2, startingAddress, travelTimeMatrix) {
  const remaining = [...jobs2];
  const route = [];
  let farthestIndex = 0;
  let longestTime = 0;
  remaining.forEach((job, index2) => {
    const travelKey = `${startingAddress}|${job.address}`;
    const driveTime = travelTimeMatrix[travelKey] || 30;
    if (driveTime > longestTime) {
      longestTime = driveTime;
      farthestIndex = index2;
    }
  });
  route.push(remaining[farthestIndex]);
  let currentLocation = remaining[farthestIndex].address;
  remaining.splice(farthestIndex, 1);
  while (remaining.length > 0) {
    let bestIndex = 0;
    let shortestTime = Infinity;
    remaining.forEach((job, index2) => {
      const travelKey = `${currentLocation}|${job.address}`;
      const driveTime = travelTimeMatrix[travelKey] || 30;
      if (driveTime < shortestTime) {
        shortestTime = driveTime;
        bestIndex = index2;
      }
    });
    route.push(remaining[bestIndex]);
    currentLocation = remaining[bestIndex].address;
    remaining.splice(bestIndex, 1);
  }
  return route;
}
function generateGeographicClusterRoute(jobs2, startingAddress, travelTimeMatrix) {
  const clusters = identifyGeographicClusters(jobs2, startingAddress, travelTimeMatrix);
  const orderedClusters = clusters.sort((a, b) => {
    const aDistance = Math.min(...a.map((job) => {
      const key = `${startingAddress}|${job.address}`;
      return travelTimeMatrix[key] || 30;
    }));
    const bDistance = Math.min(...b.map((job) => {
      const key = `${startingAddress}|${job.address}`;
      return travelTimeMatrix[key] || 30;
    }));
    return aDistance - bDistance;
  });
  const route = [];
  for (const cluster of orderedClusters) {
    const clusterRoute = generateNearestNeighborRoute(cluster, route.length > 0 ? route[route.length - 1].address : startingAddress, travelTimeMatrix);
    route.push(...clusterRoute);
  }
  return route;
}
function generateOptimalReturnRoute(jobs2, startingAddress, travelTimeMatrix) {
  let closestToBaseIndex = 0;
  let shortestReturnTime = Infinity;
  jobs2.forEach((job, index2) => {
    const returnKey = `${job.address}|${startingAddress}`;
    const returnTime = travelTimeMatrix[returnKey] || 20;
    if (returnTime < shortestReturnTime) {
      shortestReturnTime = returnTime;
      closestToBaseIndex = index2;
    }
  });
  const endJob = jobs2[closestToBaseIndex];
  const remaining = jobs2.filter((_, index2) => index2 !== closestToBaseIndex);
  const route = generateNearestNeighborRoute(remaining, startingAddress, travelTimeMatrix);
  route.push(endJob);
  return route;
}
function identifyGeographicClusters(jobs2, startingAddress, travelTimeMatrix) {
  if (jobs2.length <= 2) return [jobs2];
  const clusters = [];
  const remaining = [...jobs2];
  while (remaining.length > 0) {
    const cluster = [remaining[0]];
    const seedJob = remaining[0];
    remaining.splice(0, 1);
    for (let i = remaining.length - 1; i >= 0; i--) {
      const job = remaining[i];
      const travelKey = `${seedJob.address}|${job.address}`;
      const travelTime = travelTimeMatrix[travelKey] || 30;
      if (travelTime <= 15) {
        cluster.push(job);
        remaining.splice(i, 1);
      }
    }
    clusters.push(cluster);
  }
  return clusters;
}
function evaluateRouteQuality(route, startingAddress, travelTimeMatrix) {
  let totalDriveTime = 0;
  let geographicLogicPenalty = 0;
  if (route.length > 0) {
    const firstJobKey = `${startingAddress}|${route[0].address}`;
    totalDriveTime += travelTimeMatrix[firstJobKey] || 30;
  }
  for (let i = 0; i < route.length - 1; i++) {
    const travelKey = `${route[i].address}|${route[i + 1].address}`;
    const driveTime = travelTimeMatrix[travelKey] || 30;
    totalDriveTime += driveTime;
    if (driveTime > 25) {
      geographicLogicPenalty += driveTime * 0.5;
    }
  }
  let returnTime = 0;
  if (route.length > 0) {
    const returnKey = `${route[route.length - 1].address}|${startingAddress}`;
    returnTime = travelTimeMatrix[returnKey] || 20;
  }
  return {
    total: totalDriveTime + returnTime + geographicLogicPenalty,
    driveTime: totalDriveTime,
    returnTime,
    geographicLogic: geographicLogicPenalty
  };
}
function applyTimingToRoute(route, workDayStartMinutes, travelTimeMatrix, startingAddress) {
  const jobs2 = [];
  let currentTime = workDayStartMinutes;
  let currentLocation = startingAddress;
  let totalDriveTime = 0;
  let totalWorkTime = 0;
  for (let i = 0; i < route.length; i++) {
    const job = route[i];
    const travelKey = `${currentLocation}|${job.address}`;
    const driveTime = travelTimeMatrix[travelKey] || 30;
    currentTime += driveTime;
    totalDriveTime += driveTime;
    const startTime = formatTime(currentTime);
    currentTime += job.estimatedDuration;
    totalWorkTime += job.estimatedDuration;
    const endTime = formatTime(currentTime);
    jobs2.push({
      jobId: job.id,
      scheduledStartTime: startTime,
      scheduledEndTime: endTime,
      driveTimeToJob: driveTime,
      estimatedDuration: job.estimatedDuration,
      sequence: i + 1,
      coordinates: job.coordinates,
      address: job.address
    });
    currentLocation = job.address;
  }
  if (route.length > 0) {
    const returnKey = `${currentLocation}|${startingAddress}`;
    const returnTime = travelTimeMatrix[returnKey] || 20;
    totalDriveTime += returnTime;
  }
  return { jobs: jobs2, totalDriveTime, totalWorkTime };
}
async function estimateJobDuration(jobDescription, serviceType) {
  try {
    const response = await openai3.chat.completions.create({
      model: "gpt-4o",
      messages: [{
        role: "user",
        content: `As a field service expert, estimate the duration in minutes for this job:
        
Service Type: ${serviceType}
Description: ${jobDescription}

Consider setup, work time, and cleanup. Return only a JSON object:
{"estimatedMinutes": <number>, "confidence": "high|medium|low", "factors": ["<key factors affecting duration>"]}`
      }],
      response_format: { type: "json_object" }
    });
    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.estimatedMinutes || 120;
  } catch (error) {
    console.error("Duration estimation failed:", error);
    return 120;
  }
}

// server/pdf-generator.ts
init_storage();
import puppeteer from "puppeteer";
async function generateEstimatePDF(req, res) {
  try {
    const { id } = req.params;
    const estimateId = parseInt(id);
    const estimate = await storage.getEstimate(estimateId);
    if (!estimate) {
      return res.status(404).json({ error: "Estimate not found" });
    }
    const customer = await storage.getCustomer(estimate.customerId);
    const businessProfile = await storage.getBusinessProfile();
    const pdfBuffer = await generateEstimatePDF_Internal(estimate, customer, businessProfile);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="estimate-${estimateId}.pdf"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).json({
      error: "Failed to generate PDF",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
async function generateEstimatePDF_Internal(estimate, customer, businessProfile) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  try {
    const page = await browser.newPage();
    const html = generateEstimateHTML(estimate, customer, businessProfile);
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "0.5in",
        right: "0.5in",
        bottom: "0.5in",
        left: "0.5in"
      }
    });
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
function generateEstimateHTML(estimate, customer, businessProfile) {
  const formatDate = (date2) => {
    if (!date2) return "N/A";
    return new Date(date2).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };
  const formatCurrency2 = (amount) => {
    if (!amount) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount);
  };
  let lineItems = [];
  try {
    lineItems = estimate.items ? JSON.parse(estimate.items) : [];
  } catch (e) {
    console.warn("Could not parse estimate items:", e);
  }
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Estimate ${estimate.estimateNumber || `EST-${estimate.id}`}</title>
      <style>
        body {
          font-family: 'Helvetica', Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
          line-height: 1.4;
        }
        .header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 40px;
          border-bottom: 2px solid #0066cc;
          padding-bottom: 20px;
        }
        .company-info {
          flex: 1;
        }
        .company-name {
          font-size: 24px;
          font-weight: bold;
          color: #0066cc;
          margin-bottom: 10px;
        }
        .company-details {
          font-size: 12px;
          color: #666;
        }
        .estimate-info {
          text-align: right;
          flex: 1;
        }
        .estimate-title {
          font-size: 24px;
          font-weight: bold;
          color: #0066cc;
          margin-bottom: 20px;
        }
        .prepared-for {
          font-size: 10px;
          font-weight: bold;
          color: #666;
          margin-bottom: 5px;
        }
        .customer-name {
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .customer-details {
          font-size: 12px;
          color: #666;
        }
        .estimate-details {
          font-size: 11px;
          color: #666;
          margin-top: 15px;
        }
        .description-section {
          margin-bottom: 30px;
        }
        .section-title {
          font-size: 16px;
          font-weight: bold;
          color: #0066cc;
          margin-bottom: 15px;
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
        }
        .description-text {
          font-size: 12px;
          line-height: 1.6;
          margin-bottom: 20px;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        .items-table th {
          background-color: #f8f9fa;
          border: 1px solid #ddd;
          padding: 12px 8px;
          text-align: left;
          font-size: 12px;
          font-weight: bold;
          color: #333;
        }
        .items-table td {
          border: 1px solid #ddd;
          padding: 10px 8px;
          font-size: 11px;
        }
        .items-table .amount-col {
          text-align: right;
        }
        .totals-section {
          float: right;
          width: 300px;
          margin-top: 20px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        .total-row.final {
          font-weight: bold;
          font-size: 16px;
          border-bottom: 3px double #0066cc;
          color: #0066cc;
        }
        .footer {
          margin-top: 60px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          font-size: 10px;
          color: #666;
          text-align: center;
        }
        .terms {
          margin-top: 40px;
          font-size: 10px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-info">
          <div class="company-name">${businessProfile?.businessName || "Dunlap Excavating & Landscaping"}</div>
          <div class="company-details">
            ${businessProfile?.phone || "(309) 555-0123"} | ${businessProfile?.email || "mike@dunlapexcavating.com"}<br>
            ${businessProfile?.address || "11222 N Tuscany Ridge Ct"}<br>
            ${businessProfile?.city || "Dunlap"}, ${businessProfile?.state || "IL"} ${businessProfile?.zipCode || "61525"}
          </div>
        </div>
        <div class="estimate-info">
          <div class="estimate-title">ESTIMATE</div>
          <div class="prepared-for">PREPARED FOR:</div>
          <div class="customer-name">${customer?.firstName || ""} ${customer?.lastName || ""}</div>
          <div class="customer-details">
            ${customer?.email ? `${customer.email}<br>` : ""}
            ${customer?.phone ? `${customer.phone}<br>` : ""}
            ${customer?.address ? `${customer.address}<br>` : ""}
            ${customer?.city && customer?.state ? `${customer.city}, ${customer.state} ${customer?.zipCode || ""}` : ""}
          </div>
          <div class="estimate-details">
            Estimate #${estimate.estimateNumber || `EST-${estimate.id}`}<br>
            Date: ${formatDate(estimate.createdAt)}<br>
            Valid Until: ${formatDate(estimate.validUntil) || "Jun 05, 2025"}
          </div>
        </div>
      </div>

      ${estimate.description ? `
        <div class="description-section">
          <div class="section-title">Project Description</div>
          <div class="description-text">${estimate.description}</div>
        </div>
      ` : ""}

      ${lineItems.length > 0 ? `
        <div class="section-title">Items & Services</div>
        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 50%;">Description</th>
              <th style="width: 15%; text-align: center;">Qty</th>
              <th style="width: 17.5%; text-align: right;">Rate</th>
              <th style="width: 17.5%; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${lineItems.map((item) => `
              <tr>
                <td>${item.description || ""}</td>
                <td style="text-align: center;">${item.quantity || 1}</td>
                <td class="amount-col">${formatCurrency2(item.rate || 0)}</td>
                <td class="amount-col">${formatCurrency2(item.amount || 0)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      ` : ""}

      <div class="totals-section">
        <div class="total-row final">
          <span>Total Amount:</span>
          <span>${formatCurrency2(estimate.totalAmount)}</span>
        </div>
      </div>

      <div style="clear: both;"></div>

      <div class="terms">
        <strong>Terms & Conditions:</strong><br>
        This estimate is valid for 30 days from the date above. Work will commence upon signed approval and required deposit. 
        All work will be performed in accordance with local building codes and industry standards. 
        Additional charges may apply for work beyond the scope outlined in this estimate.
      </div>

      <div class="footer">
        Thank you for choosing ${businessProfile?.businessName || "Dunlap Excavating & Landscaping"} for your project needs.
      </div>
    </body>
    </html>
  `;
}

// server/simple-auth.ts
import bcrypt from "bcrypt";
import jwt2 from "jsonwebtoken";
var JWT_SECRET2 = process.env.JWT_SECRET || "tulboxx-dev-secret-key";
var SALT_ROUNDS = 12;
var betaUsers = /* @__PURE__ */ new Map();
var DEMO_USER = {
  id: "demo",
  email: "demo@tulboxx.com",
  firstName: "Demo",
  lastName: "User",
  businessName: "Demo Excavating Co.",
  isDemo: true
};
async function registerUser(email, password, firstName, lastName, businessName) {
  try {
    for (const user of betaUsers.values()) {
      if (user.email === email) {
        throw new Error("User already exists");
      }
    }
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const newUser = {
      id: userId,
      email,
      passwordHash,
      firstName,
      lastName,
      businessName,
      createdAt: /* @__PURE__ */ new Date()
    };
    betaUsers.set(userId, newUser);
    const token = jwt2.sign({ userId: newUser.id }, JWT_SECRET2, { expiresIn: "7d" });
    return {
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        businessName: newUser.businessName
      }
    };
  } catch (error) {
    throw error;
  }
}
async function loginUser(email, password) {
  try {
    let user;
    for (const u of betaUsers.values()) {
      if (u.email === email) {
        user = u;
        break;
      }
    }
    if (!user) {
      throw new Error("Invalid credentials");
    }
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new Error("Invalid credentials");
    }
    const token = jwt2.sign({ userId: user.id }, JWT_SECRET2, { expiresIn: "7d" });
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        businessName: user.businessName
      }
    };
  } catch (error) {
    throw error;
  }
}
function getDemoLogin() {
  return {
    token: "demo-token",
    user: DEMO_USER
  };
}

// server/data-seeder.ts
init_db();
init_schema();
var DataSeeder = class {
  async seedDatabase(config = {}) {
    const {
      clearExisting = false,
      createSampleData = false,
      businessName = "Your Business",
      ownerName = "Business Owner",
      ownerEmail = "owner@yourbusiness.com"
    } = config;
    try {
      if (clearExisting) {
        await this.clearAllData();
      }
      if (createSampleData) {
        await this.createSampleData(businessName, ownerName, ownerEmail);
      }
      return { success: true, message: "Database seeded successfully" };
    } catch (error) {
      console.error("Error seeding database:", error);
      return { success: false, error: error.message };
    }
  }
  async clearAllData() {
    await db.delete(leadPipelineNotes);
    await db.delete(leadPipelineEntries);
    await db.delete(leadPipelineStages);
    await db.delete(payments);
    await db.delete(timeEntries);
    await db.delete(documents);
    await db.delete(invoices);
    await db.delete(estimates);
    await db.delete(jobs);
    await db.delete(customers);
    await db.delete(employees);
    await db.delete(businessProfiles);
    console.log("All existing data cleared");
  }
  async createSampleData(businessName, ownerName, ownerEmail) {
    const [businessProfile] = await db.insert(businessProfiles).values({
      businessName,
      ownerFirstName: ownerName.split(" ")[0] || "Business",
      ownerLastName: ownerName.split(" ")[1] || "Owner",
      email: ownerEmail,
      phone: "(555) 123-4567",
      address: "123 Business Street",
      city: "Business City",
      state: "BC",
      zipCode: "12345",
      website: "www.yourbusiness.com",
      description: "Professional service business",
      logoUrl: null,
      primaryColor: "#3B82F6",
      secondaryColor: "#1E40AF"
    }).returning();
    const [employee] = await db.insert(employees).values({
      firstName: ownerName.split(" ")[0] || "Business",
      lastName: ownerName.split(" ")[1] || "Owner",
      email: ownerEmail,
      phone: "(555) 123-4567",
      role: "owner",
      position: "Owner/Manager",
      hourlyRate: 75,
      isActive: true,
      businessProfileId: businessProfile.id
    }).returning();
    const [customer] = await db.insert(customers).values({
      firstName: "Sample",
      lastName: "Customer",
      email: "customer@example.com",
      phone: "(555) 987-6543",
      address: "456 Customer Lane",
      city: "Customer City",
      state: "CC",
      zipCode: "54321",
      propertyType: "residential",
      preferredContactMethod: "phone",
      notes: "Initial sample customer for testing"
    }).returning();
    const [job] = await db.insert(jobs).values({
      customerId: customer.id,
      title: "Sample Project",
      description: "Initial sample project for demonstration",
      status: "completed",
      serviceType: "consultation",
      priority: "medium",
      estimatedValue: 1500,
      actualCost: 1400,
      scheduledDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1e3),
      // 7 days ago
      completedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1e3),
      // 2 days ago
      address: "456 Customer Lane, Customer City, CC 54321"
    }).returning();
    const [estimate] = await db.insert(estimates).values({
      customerId: customer.id,
      jobId: job.id,
      estimateNumber: "EST-001",
      title: "Sample Project Estimate",
      description: "Professional estimate for sample project",
      status: "accepted",
      subtotal: 1400,
      taxRate: 0.08,
      taxAmount: 112,
      totalAmount: 1512,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3),
      // 30 days from now
      items: [
        {
          description: "Professional consultation and planning",
          quantity: 8,
          rate: 125,
          amount: 1e3
        },
        {
          description: "Project materials and supplies",
          quantity: 1,
          rate: 400,
          amount: 400
        }
      ],
      terms: "Payment due within 30 days of acceptance"
    }).returning();
    const [invoice] = await db.insert(invoices).values({
      customerId: customer.id,
      jobId: job.id,
      estimateId: estimate.id,
      invoiceNumber: "INV-001",
      title: "Sample Project Invoice",
      description: "Invoice for completed sample project",
      status: "paid",
      subtotal: 1400,
      taxRate: 0.08,
      taxAmount: 112,
      totalAmount: 1512,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3),
      paidAt: /* @__PURE__ */ new Date(),
      items: [
        {
          description: "Professional consultation and planning",
          quantity: 8,
          rate: 125,
          amount: 1e3
        },
        {
          description: "Project materials and supplies",
          quantity: 1,
          rate: 400,
          amount: 400
        }
      ],
      notes: "Thank you for your business!"
    }).returning();
    await db.insert(payments).values({
      invoiceId: invoice.id,
      amount: 1512,
      method: "bank_transfer",
      status: "completed",
      transactionId: "TXN-001",
      paidAt: /* @__PURE__ */ new Date(),
      notes: "Payment received via bank transfer"
    });
    await db.insert(timeEntries).values({
      employeeId: employee.id,
      jobId: job.id,
      startTime: new Date(Date.now() - 8 * 60 * 60 * 1e3),
      // 8 hours ago
      endTime: new Date(Date.now() - 1 * 60 * 60 * 1e3),
      // 1 hour ago
      hoursWorked: 7,
      description: "Completed sample project work",
      hourlyRate: 75,
      totalAmount: 525,
      isBreakDeducted: true,
      breakDuration: 60
      // 1 hour break
    });
    console.log("Sample data created successfully");
  }
  async getDataStats() {
    const stats = {
      customers: await db.select().from(customers).then((rows) => rows.length),
      jobs: await db.select().from(jobs).then((rows) => rows.length),
      estimates: await db.select().from(estimates).then((rows) => rows.length),
      invoices: await db.select().from(invoices).then((rows) => rows.length),
      employees: await db.select().from(employees).then((rows) => rows.length),
      timeEntries: await db.select().from(timeEntries).then((rows) => rows.length),
      payments: await db.select().from(payments).then((rows) => rows.length)
    };
    return stats;
  }
};
var dataSeeder = new DataSeeder();

// server/deployment-manager.ts
var DeploymentManager = class {
  /**
   * Prepare for production deployment
   * Removes all demo data and prepares clean database
   */
  async prepareForProduction() {
    try {
      console.log("Starting production deployment preparation...");
      await dataSeeder.clearAllData();
      console.log("Demo data cleared successfully");
      console.log("Database is now clean and ready for production deployment");
      return {
        success: true,
        message: "Production deployment ready - all demo data removed",
        nextSteps: [
          "Deploy application to production",
          "Use data seeder to create initial business data",
          "Set up beta testing accounts"
        ]
      };
    } catch (error) {
      console.error("Error preparing for production:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to prepare for production deployment"
      };
    }
  }
  /**
   * Set up beta testing environment
   * Creates sample data for beta testers
   */
  async setupBetaTesting(businesses) {
    try {
      console.log("Setting up beta testing environment...");
      const results = [];
      for (const business of businesses) {
        const result = await dataSeeder.seedDatabase({
          createSampleData: true,
          businessName: business.businessName,
          ownerName: business.ownerName,
          ownerEmail: business.ownerEmail
        });
        results.push({
          business: business.businessName,
          result
        });
      }
      console.log(`Beta testing setup complete for ${businesses.length} businesses`);
      return {
        success: true,
        message: "Beta testing environment ready",
        businesses: results
      };
    } catch (error) {
      console.error("Error setting up beta testing:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to setup beta testing environment"
      };
    }
  }
  /**
   * Get deployment status and data statistics
   */
  async getDeploymentStatus() {
    try {
      const stats = await dataSeeder.getDataStats();
      const hasData = Object.values(stats).some((count10) => count10 > 0);
      return {
        hasData,
        dataStats: stats,
        deploymentReady: !hasData,
        recommendation: hasData ? "Clear demo data before production deployment" : "Ready for production deployment"
      };
    } catch (error) {
      console.error("Error getting deployment status:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};
var deploymentManager = new DeploymentManager();

// server/deployment-checklist.ts
var DEPLOYMENT_CHECKLIST = [
  // Preparation Phase
  {
    id: "demo-backup",
    name: "Backup Demo Data",
    description: "Create backup of current demo data for reference",
    completed: false,
    required: true,
    category: "preparation"
  },
  {
    id: "environment-check",
    name: "Environment Variables",
    description: "Verify all production environment variables are set",
    completed: false,
    required: true,
    category: "preparation"
  },
  {
    id: "api-keys-verify",
    name: "API Keys Verification",
    description: "Test OpenAI API key and other external services",
    completed: false,
    required: true,
    category: "preparation"
  },
  // Data Management Phase
  {
    id: "clear-demo-data",
    name: "Clear Demo Data",
    description: "Remove all demo customers, jobs, estimates, and invoices",
    completed: false,
    required: true,
    category: "data"
  },
  {
    id: "setup-beta-accounts",
    name: "Setup Beta Testing Accounts",
    description: "Create accounts for 2-4 beta testers with sample data",
    completed: false,
    required: false,
    category: "data"
  },
  {
    id: "seed-production-data",
    name: "Seed Production Data",
    description: "Install fresh data structure for production use",
    completed: false,
    required: true,
    category: "data"
  },
  // Testing Phase
  {
    id: "workflow-testing",
    name: "Core Workflow Testing",
    description: "Test estimate creation, job management, and invoicing",
    completed: false,
    required: true,
    category: "testing"
  },
  {
    id: "ai-features-test",
    name: "AI Features Testing",
    description: "Verify AI scheduling and estimate generation",
    completed: false,
    required: true,
    category: "testing"
  },
  {
    id: "mobile-responsiveness",
    name: "Mobile Responsiveness",
    description: "Test on mobile devices for field worker usability",
    completed: false,
    required: true,
    category: "testing"
  },
  // Production Phase
  {
    id: "deploy-to-production",
    name: "Deploy to Production",
    description: "Deploy application to production environment",
    completed: false,
    required: true,
    category: "production"
  },
  {
    id: "monitoring-setup",
    name: "Setup Monitoring",
    description: "Configure error tracking and performance monitoring",
    completed: false,
    required: true,
    category: "production"
  },
  {
    id: "beta-user-onboarding",
    name: "Beta User Onboarding",
    description: "Provide access and training to beta testers",
    completed: false,
    required: false,
    category: "production"
  }
];
var DeploymentChecker = class {
  checklist = [...DEPLOYMENT_CHECKLIST];
  markCompleted(stepId) {
    const step = this.checklist.find((s) => s.id === stepId);
    if (step) {
      step.completed = true;
    }
  }
  getProgress() {
    const required = this.checklist.filter((s) => s.required);
    const completed = required.filter((s) => s.completed);
    return {
      completed: completed.length,
      total: required.length,
      percentage: Math.round(completed.length / required.length * 100)
    };
  }
  getStepsByCategory(category) {
    return this.checklist.filter((s) => s.category === category);
  }
  isReadyForProduction() {
    const required = this.checklist.filter((s) => s.required);
    return required.every((s) => s.completed);
  }
  getNextSteps() {
    return this.checklist.filter((s) => !s.completed && s.required).slice(0, 3);
  }
};
var deploymentChecker = new DeploymentChecker();

// server/routes.ts
var paginationSchema = z2.object({
  page: z2.string().optional().default("1").transform(Number),
  limit: z2.string().optional().default("50").transform(Number),
  search: z2.string().optional()
});
async function registerRoutes(app2) {
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName, businessName } = req.body;
      if (!email || !password || !firstName || !lastName || !businessName) {
        return res.status(400).json({ message: "All fields are required" });
      }
      const user = await registerUser(email, password, firstName, lastName, businessName);
      res.status(201).json({ message: "User registered successfully", user });
    } catch (error) {
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      const result = await loginUser(email, password);
      res.json(result);
    } catch (error) {
      res.status(401).json({ message: error.message || "Login failed" });
    }
  });
  app2.get("/api/auth/me", authenticateUser, async (req, res) => {
    res.json({ user: req.user });
  });
  app2.post("/api/auth/demo", async (req, res) => {
    const result = getDemoLogin();
    res.json(result);
  });
  app2.use(securityHeaders);
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const registerData = z2.object({
        businessName: z2.string(),
        ownerFirstName: z2.string(),
        ownerLastName: z2.string(),
        email: z2.string().email(),
        password: z2.string(),
        phone: z2.string(),
        businessType: z2.string(),
        address: z2.string().optional(),
        city: z2.string().optional(),
        state: z2.string().optional(),
        zipCode: z2.string().optional()
      }).parse(req.body);
      const existingUser = await storage.getUserByEmail(registerData.email);
      if (existingUser) {
        return res.status(400).send("User already exists with this email");
      }
      const passwordValidation = validatePassword(registerData.password);
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          error: "Password does not meet security requirements",
          details: passwordValidation.errors
        });
      }
      const saltRounds = 14;
      const passwordHash = await bcrypt2.hash(registerData.password, saltRounds);
      const businessProfile = await storage.createBusinessProfile({
        businessName: registerData.businessName,
        businessType: registerData.businessType,
        ownerName: `${registerData.ownerFirstName} ${registerData.ownerLastName}`,
        phone: registerData.phone,
        email: registerData.email,
        address: registerData.address || "",
        city: registerData.city || "",
        state: registerData.state || "",
        zipCode: registerData.zipCode || "",
        preferredEstimateStyle: "line_items"
      });
      const user = await storage.createUser({
        email: registerData.email,
        passwordHash,
        businessProfileId: businessProfile.id,
        role: "owner",
        isActive: true
      });
      const token = generateToken(user.id, user.email, user.role, user.businessProfileId);
      res.status(201).json({
        message: "User created successfully",
        userId: user.id,
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          businessProfileId: user.businessProfileId,
          isActive: user.isActive
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({
        error: error instanceof Error ? error.message : "Registration failed"
      });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const loginData = z2.object({
        email: z2.string().email(),
        password: z2.string()
      }).parse(req.body);
      const user = await storage.getUserByEmail(loginData.email);
      if (!user) {
        return res.status(401).send("Invalid email or password");
      }
      const isValidPassword = await bcrypt2.compare(loginData.password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).send("Invalid email or password");
      }
      await storage.updateUserLastLogin(user.id);
      const token = generateToken(user.id, user.email, user.role, user.businessProfileId);
      const userWithoutPassword = {
        id: user.id,
        email: user.email,
        role: user.role,
        businessProfileId: user.businessProfileId,
        isActive: user.isActive
      };
      res.json({
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({
        error: error instanceof Error ? error.message : "Login failed"
      });
    }
  });
  app2.get("/api/customers", authenticateUser, async (req, res) => {
    try {
      const { page, limit, search } = req.query;
      if (page || limit || search) {
        const { page: pageNum, limit: limitNum, search: searchTerm } = paginationSchema.parse(req.query);
        const result = await customerService.getCustomers({
          page: pageNum,
          limit: limitNum,
          search: searchTerm
        });
        res.json(result);
      } else {
        const customers2 = await storage.getCustomers();
        res.json(customers2);
      }
    } catch (error) {
      handleServiceError(error, res);
    }
  });
  app2.get("/api/customers/:id", authenticateUser, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: "Invalid customer ID" });
      }
      const customer = await customerService.getCustomer(id);
      res.json({ success: true, data: customer });
    } catch (error) {
      handleServiceError(error, res);
    }
  });
  app2.post("/api/customers", authenticateUser, async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await customerService.createCustomer(customerData);
      res.status(201).json({ success: true, data: customer, message: "Customer created successfully" });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          validationErrors: error.errors
        });
      }
      handleServiceError(error, res);
    }
  });
  app2.put("/api/customers/:id", authenticateUser, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: "Invalid customer ID" });
      }
      const customerData = insertCustomerSchema.partial().parse(req.body);
      const customer = await customerService.updateCustomer(id, customerData);
      res.json({ success: true, data: customer, message: "Customer updated successfully" });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          validationErrors: error.errors
        });
      }
      handleServiceError(error, res);
    }
  });
  app2.patch("/api/customers/:id", authenticateUser, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: "Invalid customer ID" });
      }
      const customerData = insertCustomerSchema.partial().parse(req.body);
      const customer = await customerService.updateCustomer(id, customerData);
      res.json({ success: true, data: customer, message: "Customer updated successfully" });
    } catch (error) {
      console.error(`[PATCH /api/customers/${req.params.id}] Error:`, error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          validationErrors: error.errors
        });
      }
      handleServiceError(error, res);
    }
  });
  app2.delete("/api/customers/:id", authenticateUser, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: "Invalid customer ID" });
      }
      await customerService.deleteCustomer(id);
      res.json({ success: true, message: "Customer deleted successfully" });
    } catch (error) {
      handleServiceError(error, res);
    }
  });
  app2.get("/api/jobs", authenticateUser, async (req, res) => {
    try {
      const { page, limit, search } = req.query;
      if (page || limit || search) {
        const { page: pageNum, limit: limitNum, search: searchTerm } = paginationSchema.parse(req.query);
        const result = await jobService.getJobs({
          page: pageNum,
          limit: limitNum,
          search: searchTerm
        });
        res.json(result);
      } else {
        const jobs2 = await storage.getJobs();
        res.json(jobs2);
      }
    } catch (error) {
      handleServiceError(error, res);
    }
  });
  app2.get("/api/jobs/:id", authenticateUser, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: "Invalid job ID" });
      }
      const job = await jobService.getJob(id);
      res.json({ success: true, data: job });
    } catch (error) {
      handleServiceError(error, res);
    }
  });
  app2.post("/api/jobs", authenticateUser, async (req, res) => {
    try {
      const jobData = insertJobSchema.parse(req.body);
      const job = await jobService.createJob(jobData);
      res.status(201).json({ success: true, data: job, message: "Job created successfully" });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          validationErrors: error.errors
        });
      }
      handleServiceError(error, res);
    }
  });
  app2.put("/api/jobs/:id", authenticateUser, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: "Invalid job ID" });
      }
      const jobData = insertJobSchema.partial().parse(req.body);
      const job = await jobService.updateJob(id, jobData);
      res.json({ success: true, data: job, message: "Job updated successfully" });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          validationErrors: error.errors
        });
      }
      handleServiceError(error, res);
    }
  });
  app2.delete("/api/jobs/:id", authenticateUser, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: "Invalid job ID" });
      }
      await jobService.deleteJob(id);
      res.json({ success: true, message: "Job deleted successfully" });
    } catch (error) {
      handleServiceError(error, res);
    }
  });
  app2.get("/api/dashboard/today-schedule", authenticateUser, async (req, res) => {
    try {
      const jobs2 = await jobService.getTodaySchedule();
      res.json(jobs2);
    } catch (error) {
      handleServiceError(error, res);
    }
  });
  app2.get("/api/dashboard/recent-jobs", authenticateUser, async (req, res) => {
    try {
      const jobs2 = await storage.getJobs();
      const recentJobs = jobs2.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);
      res.json(recentJobs);
    } catch (error) {
      handleServiceError(error, res);
    }
  });
  app2.get("/api/dashboard/stats-optimized", authenticateUser, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      handleServiceError(error, res);
    }
  });
  app2.get("/api/estimates", authenticateUser, async (req, res) => {
    try {
      const estimates2 = await storage.getEstimates();
      res.json(estimates2);
    } catch (error) {
      handleServiceError(error, res);
    }
  });
  app2.get("/api/invoices", async (req, res) => {
    try {
      const invoices2 = await storage.getInvoices();
      res.json(invoices2);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });
  app2.get("/api/invoices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const invoice = await storage.getInvoice(id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });
  app2.post("/api/invoices", async (req, res) => {
    try {
      const validatedData = insertInvoiceSchema.parse(req.body);
      const newInvoice = await storage.createInvoice(validatedData);
      res.status(201).json(newInvoice);
    } catch (error) {
      console.error("Error creating invoice:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid invoice data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });
  app2.patch("/api/invoices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertInvoiceSchema.partial().parse(req.body);
      const updatedInvoice = await storage.updateInvoice(id, validatedData);
      if (!updatedInvoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(updatedInvoice);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid invoice data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update invoice" });
    }
  });
  app2.delete("/api/invoices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteInvoice(id);
      if (!deleted) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete invoice" });
    }
  });
  app2.post("/api/invoices/:id/send", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedInvoice = await storage.updateInvoice(id, {
        status: "sent",
        sentAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      if (!updatedInvoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(updatedInvoice);
    } catch (error) {
      res.status(500).json({ message: "Failed to send invoice" });
    }
  });
  app2.get("/api/payments", async (req, res) => {
    try {
      const payments2 = await storage.getPayments();
      res.json(payments2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });
  app2.get("/api/payments/invoice/:invoiceId", async (req, res) => {
    try {
      const invoiceId = parseInt(req.params.invoiceId);
      const payments2 = await storage.getPaymentsByInvoice(invoiceId);
      res.json(payments2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });
  app2.post("/api/payments", async (req, res) => {
    try {
      const newPayment = await storage.createPayment(req.body);
      res.status(201).json(newPayment);
    } catch (error) {
      console.error("Payment creation error:", error);
      res.status(500).json({ message: "Failed to create payment" });
    }
  });
  app2.get("/api/recurring-billing", async (req, res) => {
    try {
      const billings = await storage.getRecurringBilling();
      res.json(billings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recurring billing" });
    }
  });
  app2.get("/api/recurring-billing/customer/:customerId", async (req, res) => {
    try {
      const customerId = parseInt(req.params.customerId);
      const billings = await storage.getRecurringBillingByCustomer(customerId);
      res.json(billings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recurring billing" });
    }
  });
  app2.post("/api/recurring-billing", async (req, res) => {
    try {
      const validatedData = req.body;
      const newBilling = await storage.createRecurringBilling(validatedData);
      res.status(201).json(newBilling);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid recurring billing data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create recurring billing" });
    }
  });
  app2.patch("/api/recurring-billing/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = req.body;
      const updatedBilling = await storage.updateRecurringBilling(id, validatedData);
      if (!updatedBilling) {
        return res.status(404).json({ message: "Recurring billing not found" });
      }
      res.json(updatedBilling);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid recurring billing data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update recurring billing" });
    }
  });
  app2.get("/api/estimates", async (req, res) => {
    try {
      const estimates2 = await storage.getEstimates();
      res.json(estimates2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch estimates" });
    }
  });
  app2.get("/api/estimates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const estimate = await storage.getEstimate(id);
      if (!estimate) {
        return res.status(404).json({ message: "Estimate not found" });
      }
      res.json(estimate);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch estimate" });
    }
  });
  app2.post("/api/estimates", async (req, res) => {
    try {
      const processedBody = { ...req.body };
      console.log("Before conversion:", processedBody.validUntil, typeof processedBody.validUntil);
      if (processedBody.validUntil) {
        processedBody.validUntil = new Date(processedBody.validUntil);
        console.log("After conversion:", processedBody.validUntil, typeof processedBody.validUntil);
      }
      if (processedBody.sentAt) {
        processedBody.sentAt = new Date(processedBody.sentAt);
      }
      if (processedBody.respondedAt) {
        processedBody.respondedAt = new Date(processedBody.respondedAt);
      }
      const estimateData = {
        ...processedBody,
        estimateNumber: processedBody.estimateNumber || `EST-${Date.now().toString().slice(-6)}`,
        type: processedBody.type || "original",
        version: processedBody.version || 1
      };
      const estimate = insertEstimateSchema.parse(estimateData);
      const newEstimate = await storage.createEstimate(estimate);
      res.status(201).json(newEstimate);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid estimate data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create estimate" });
    }
  });
  app2.put("/api/estimates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const estimate = insertEstimateSchema.partial().parse(req.body);
      const updatedEstimate = await storage.updateEstimate(id, estimate);
      if (!updatedEstimate) {
        return res.status(404).json({ message: "Estimate not found" });
      }
      res.json(updatedEstimate);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid estimate data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update estimate" });
    }
  });
  app2.patch("/api/estimates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const estimate = insertEstimateSchema.partial().parse(req.body);
      const updatedEstimate = await storage.updateEstimate(id, estimate);
      if (!updatedEstimate) {
        return res.status(404).json({ message: "Estimate not found" });
      }
      res.json(updatedEstimate);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid estimate data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update estimate" });
    }
  });
  app2.delete("/api/estimates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteEstimate(id);
      if (!deleted) {
        return res.status(404).json({ message: "Estimate not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete estimate" });
    }
  });
  app2.get("/api/estimates/:id/pdf", generateEstimatePDF);
  app2.get("/api/invoices", async (req, res) => {
    try {
      const invoices2 = await storage.getInvoices();
      res.json(invoices2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });
  app2.get("/api/invoices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const invoice = await storage.getInvoice(id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });
  app2.post("/api/invoices", async (req, res) => {
    try {
      const invoice = insertInvoiceSchema.parse(req.body);
      const newInvoice = await storage.createInvoice(invoice);
      res.status(201).json(newInvoice);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid invoice data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });
  app2.put("/api/invoices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const invoice = insertInvoiceSchema.partial().parse(req.body);
      const updatedInvoice = await storage.updateInvoice(id, invoice);
      if (!updatedInvoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(updatedInvoice);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid invoice data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update invoice" });
    }
  });
  app2.patch("/api/invoices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const invoice = insertInvoiceSchema.partial().parse(req.body);
      const updatedInvoice = await storage.updateInvoice(id, invoice);
      if (!updatedInvoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(updatedInvoice);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid invoice data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update invoice" });
    }
  });
  app2.delete("/api/invoices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteInvoice(id);
      if (!deleted) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete invoice" });
    }
  });
  app2.get("/api/communications", async (req, res) => {
    try {
      const communications2 = await storage.getCommunications();
      res.json(communications2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch communications" });
    }
  });
  app2.post("/api/communications", async (req, res) => {
    try {
      const communication = insertCommunicationSchema.parse(req.body);
      const newCommunication = await storage.createCommunication(communication);
      res.status(201).json(newCommunication);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid communication data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create communication" });
    }
  });
  app2.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });
  app2.get("/api/dashboard/stats-optimized", authenticateUser, async (req, res) => {
    try {
      const [
        { totalCustomers },
        { activeJobs },
        { pendingEstimates },
        { totalRevenue }
      ] = await Promise.all([
        db.select({ totalCustomers: count7() }).from(contacts).then((r) => r[0]),
        db.select({ activeJobs: count7() }).from(jobs).where(inArray5(jobs.status, ["scheduled", "in_progress"])).then((r) => r[0]),
        db.select({ pendingEstimates: count7() }).from(estimates).where(inArray5(estimates.status, ["draft", "sent"])).then((r) => r[0]),
        db.select({ totalRevenue: sum3(invoices.totalAmount) }).from(invoices).where(eq7(invoices.status, "paid")).then((r) => r[0])
      ]);
      res.json({
        totalCustomers: totalCustomers || 0,
        activeJobs: activeJobs || 0,
        pendingEstimates: pendingEstimates || 0,
        totalRevenue: parseFloat(totalRevenue?.toString() || "0")
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });
  app2.get("/api/dashboard/recent-jobs", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      const jobs2 = await storage.getRecentJobs(limit);
      res.json(jobs2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent jobs" });
    }
  });
  app2.get("/api/dashboard/today-schedule", async (req, res) => {
    try {
      const schedule = await storage.getTodaySchedule();
      res.json(schedule);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch today's schedule" });
    }
  });
  app2.get("/api/business-profile", async (req, res) => {
    try {
      const profile = await storage.getBusinessProfile();
      res.json(profile);
    } catch (error) {
      console.error("Error fetching business profile:", error);
      res.status(500).json({ error: "Failed to fetch business profile" });
    }
  });
  app2.post("/api/business-profile", async (req, res) => {
    try {
      const profileData = insertBusinessProfileSchema.parse(req.body);
      const profile = await storage.createBusinessProfile(profileData);
      res.status(201).json(profile);
    } catch (error) {
      console.error("Error creating business profile:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ error: "Invalid profile data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create business profile" });
    }
  });
  app2.put("/api/business-profile", async (req, res) => {
    try {
      const profileData = insertBusinessProfileSchema.partial().parse(req.body);
      const profile = await storage.updateBusinessProfile(profileData);
      if (!profile) {
        return res.status(404).json({ error: "Business profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error updating business profile:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ error: "Invalid profile data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update business profile" });
    }
  });
  app2.post("/api/ai/estimate", async (req, res) => {
    try {
      const request = aiEstimateRequestSchema.parse(req.body);
      const estimate = await generateAIEstimate(request);
      res.json(estimate);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid estimate request", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to generate AI estimate" });
    }
  });
  app2.post("/api/ai/social-content", async (req, res) => {
    try {
      const request = aiSocialContentRequestSchema.parse(req.body);
      const content = await generateSocialContent(request);
      res.json(content);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid social content request", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to generate social content" });
    }
  });
  app2.post("/api/ai/polish-text", async (req, res) => {
    try {
      const { text: text2, fieldType, businessType, businessName } = req.body;
      if (!text2 || !fieldType || !businessType || !businessName) {
        return res.status(400).json({
          error: "Missing required fields: text, fieldType, businessType, businessName"
        });
      }
      const polishedText = await polishText(text2, fieldType, businessType, businessName);
      res.json({ polishedText });
    } catch (error) {
      console.error("Text polish error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to polish text"
      });
    }
  });
  app2.post("/api/ai/field-notes-to-estimate", async (req, res) => {
    try {
      const request = fieldNotesToEstimateSchema.parse(req.body);
      const aiContent = await generateEstimateFromFieldNotes(request);
      const estimateData = {
        customerId: request.customerId,
        jobId: request.jobId,
        title: aiContent.title,
        description: aiContent.projectDescription,
        totalAmount: "0.00",
        // Price to be added separately
        fieldNotes: request.fieldNotes,
        projectDescription: aiContent.projectDescription,
        scopeOfWork: aiContent.scopeOfWork,
        warrantiesAndBenefits: aiContent.warrantiesAndBenefits,
        aiGenerationMetadata: JSON.stringify(aiContent.metadata)
      };
      const newEstimate = await storage.createEstimate(estimateData);
      res.status(201).json({
        estimate: newEstimate,
        aiContent
      });
    } catch (error) {
      console.error("Field notes processing error:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({
          error: "Invalid field notes request",
          details: error.errors
        });
      }
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to process field notes"
      });
    }
  });
  app2.get("/api/calendar/auth-url", async (req, res) => {
    try {
      const authUrl = googleCalendarService.getAuthUrl();
      res.json({ authUrl });
    } catch (error) {
      console.error("Error getting auth URL:", error);
      res.status(500).json({ error: "Failed to get authorization URL" });
    }
  });
  app2.post("/api/calendar/oauth-callback", async (req, res) => {
    try {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({ error: "Authorization code is required" });
      }
      const accessToken = await googleCalendarService.getAccessToken(code);
      res.json({ success: true, message: "Calendar integration authorized successfully" });
    } catch (error) {
      console.error("OAuth callback error:", error);
      res.status(500).json({ error: "Failed to complete authorization" });
    }
  });
  app2.post("/api/calendar/sync-job/:id", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getJob(jobId);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      let eventId;
      if (job.calendarEventId) {
        await googleCalendarService.updateJobEvent(job.calendarEventId, job);
        eventId = job.calendarEventId;
      } else {
        eventId = await googleCalendarService.createJobEvent(job);
        if (eventId) {
          await storage.updateJob(jobId, { calendarEventId: eventId });
        }
      }
      res.json({ success: true, eventId });
    } catch (error) {
      console.error("Error syncing job to calendar:", error);
      res.status(500).json({ error: "Failed to sync job to calendar" });
    }
  });
  app2.post("/api/calendar/sync-all", async (req, res) => {
    try {
      const jobs2 = await storage.getJobs();
      const scheduledJobs = jobs2.filter(
        (job) => job.scheduledDate && (job.status === "scheduled" || job.status === "in_progress")
      );
      let syncedCount = 0;
      const errors = [];
      for (const job of scheduledJobs) {
        try {
          let eventId;
          if (job.calendarEventId) {
            await googleCalendarService.updateJobEvent(job.calendarEventId, job);
            eventId = job.calendarEventId;
          } else {
            eventId = await googleCalendarService.createJobEvent(job);
            if (eventId) {
              await storage.updateJob(job.id, { calendarEventId: eventId });
            }
          }
          if (eventId) syncedCount++;
        } catch (error) {
          errors.push({ jobId: job.id, error: error instanceof Error ? error.message : String(error) });
        }
      }
      res.json({
        success: true,
        syncedCount,
        totalJobs: scheduledJobs.length,
        errors: errors.length > 0 ? errors : void 0
      });
    } catch (error) {
      console.error("Error syncing all jobs:", error);
      res.status(500).json({ error: "Failed to sync jobs to calendar" });
    }
  });
  app2.delete("/api/calendar/job/:id", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getJob(jobId);
      if (!job || !job.calendarEventId) {
        return res.status(404).json({ error: "Job or calendar event not found" });
      }
      await googleCalendarService.deleteJobEvent(job.calendarEventId);
      await storage.updateJob(jobId, { calendarEventId: null });
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing job from calendar:", error);
      res.status(500).json({ error: "Failed to remove job from calendar" });
    }
  });
  app2.get("/api/business-profile", async (req, res) => {
    try {
      const profile = await storage.getBusinessProfile();
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch business profile" });
    }
  });
  app2.post("/api/business-profile", async (req, res) => {
    try {
      const profileData = insertBusinessProfileSchema.parse(req.body);
      const newProfile = await storage.createBusinessProfile(profileData);
      res.status(201).json(newProfile);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create business profile" });
    }
  });
  app2.put("/api/business-profile", async (req, res) => {
    try {
      const profileData = insertBusinessProfileSchema.partial().parse(req.body);
      const updatedProfile = await storage.updateBusinessProfile(profileData);
      if (!updatedProfile) {
        return res.status(404).json({ message: "Business profile not found" });
      }
      res.json(updatedProfile);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update business profile" });
    }
  });
  app2.get("/api/documents", async (req, res) => {
    try {
      const { customerId, jobId, estimateId, invoiceId } = req.query;
      let documents3;
      if (customerId) {
        documents3 = await storage.getDocumentsByCustomer(parseInt(customerId));
      } else if (jobId) {
        documents3 = await storage.getDocumentsByJob(parseInt(jobId));
      } else if (estimateId) {
        documents3 = await storage.getDocumentsByEstimate(parseInt(estimateId));
      } else if (invoiceId) {
        documents3 = await storage.getDocumentsByInvoice(parseInt(invoiceId));
      } else {
        documents3 = await storage.getDocuments();
      }
      res.json(documents3);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });
  app2.get("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocument(id);
      if (!document) {
        res.status(404).json({ message: "Document not found" });
        return;
      }
      res.json(document);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch document" });
    }
  });
  app2.post("/api/documents", async (req, res) => {
    try {
      const documentData = insertDocumentSchema.parse(req.body);
      const newDocument = await storage.createDocument(documentData);
      res.status(201).json(newDocument);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
        return;
      }
      res.status(500).json({ message: "Failed to create document" });
    }
  });
  app2.patch("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const updatedDocument = await storage.updateDocument(id, updates);
      if (!updatedDocument) {
        res.status(404).json({ message: "Document not found" });
        return;
      }
      res.json(updatedDocument);
    } catch (error) {
      res.status(500).json({ message: "Failed to update document" });
    }
  });
  app2.delete("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteDocument(id);
      if (!deleted) {
        res.status(404).json({ message: "Document not found" });
        return;
      }
      res.json({ message: "Document deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete document" });
    }
  });
  app2.get("/api/employees", async (req, res) => {
    try {
      const employees2 = await storage.getEmployees();
      res.json(employees2);
    } catch (error) {
      console.error("Employee fetch error:", error);
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });
  app2.post("/api/employees", async (req, res) => {
    try {
      const employee = insertEmployeeSchema.parse(req.body);
      const newEmployee = await storage.createEmployee(employee);
      res.status(201).json(newEmployee);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid employee data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create employee" });
    }
  });
  app2.patch("/api/employees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const cleanedData = { ...req.body };
      if (cleanedData.hourlyRate === "") cleanedData.hourlyRate = null;
      if (cleanedData.overtimeRate === "") cleanedData.overtimeRate = null;
      const employee = insertEmployeeSchema.partial().parse(cleanedData);
      const updatedEmployee = await storage.updateEmployee(id, employee);
      if (!updatedEmployee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(updatedEmployee);
    } catch (error) {
      console.error("Employee update error:", error);
      if (error instanceof z2.ZodError) {
        console.log("Validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid employee data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update employee" });
    }
  });
  app2.get("/api/work-orders", async (req, res) => {
    try {
      const workOrders2 = await storage.getWorkOrders();
      res.json(workOrders2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch work orders" });
    }
  });
  app2.get("/api/work-orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const workOrder = await storage.getWorkOrder(id);
      if (!workOrder) {
        return res.status(404).json({ message: "Work order not found" });
      }
      res.json(workOrder);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch work order" });
    }
  });
  app2.post("/api/work-orders", async (req, res) => {
    try {
      const workOrderData = req.body;
      const workOrder = {
        title: workOrderData.title,
        description: workOrderData.description || null,
        customer_id: parseInt(workOrderData.customerId),
        job_id: parseInt(workOrderData.jobId),
        status: workOrderData.status || "scheduled",
        priority: workOrderData.priority || "normal",
        assigned_technician_id: workOrderData.assignedTechnicianId ? parseInt(workOrderData.assignedTechnicianId) : null,
        estimate_id: workOrderData.estimateId ? parseInt(workOrderData.estimateId) : null,
        scheduled_start_date: workOrderData.scheduledStartDate ? new Date(workOrderData.scheduledStartDate) : null,
        scheduled_end_date: workOrderData.scheduledEndDate ? new Date(workOrderData.scheduledEndDate) : null
      };
      const newWorkOrder = await storage.createWorkOrder(workOrder);
      res.status(201).json(newWorkOrder);
    } catch (error) {
      console.error("Work order creation error:", error);
      res.status(500).json({ message: "Failed to create work order", error: error instanceof Error ? error.message : String(error) });
    }
  });
  app2.post("/api/work-orders/from-estimate/:estimateId", async (req, res) => {
    try {
      const estimateId = parseInt(req.params.estimateId);
      const workOrder = await storage.createWorkOrderFromEstimate(estimateId);
      res.status(201).json(workOrder);
    } catch (error) {
      res.status(500).json({ message: "Failed to create work order from estimate" });
    }
  });
  app2.patch("/api/work-orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const updatedWorkOrder = await storage.updateWorkOrder(id, updates);
      if (!updatedWorkOrder) {
        return res.status(404).json({ message: "Work order not found" });
      }
      res.json(updatedWorkOrder);
    } catch (error) {
      res.status(500).json({ message: "Failed to update work order" });
    }
  });
  app2.get("/api/work-orders/:id/tasks", async (req, res) => {
    try {
      const workOrderId = parseInt(req.params.id);
      const tasks = await storage.getWorkOrderTasks(workOrderId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch work order tasks" });
    }
  });
  app2.post("/api/work-order-tasks", async (req, res) => {
    try {
      const task = insertWorkOrderTaskSchema.parse(req.body);
      const newTask = await storage.createWorkOrderTask(task);
      res.status(201).json(newTask);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create task" });
    }
  });
  app2.patch("/api/work-order-tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const updatedTask = await storage.updateWorkOrderTask(id, updates);
      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(updatedTask);
    } catch (error) {
      res.status(500).json({ message: "Failed to update task" });
    }
  });
  app2.get("/api/time-entries", async (req, res) => {
    try {
      const { employeeId, workOrderId } = req.query;
      let timeEntries2;
      if (employeeId) {
        timeEntries2 = await storage.getTimeEntriesByEmployee(parseInt(employeeId));
      } else if (workOrderId) {
        timeEntries2 = await storage.getTimeEntriesByWorkOrder(parseInt(workOrderId));
      } else {
        timeEntries2 = await storage.getTimeEntries();
      }
      res.json(timeEntries2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch time entries" });
    }
  });
  app2.post("/api/time-entries", async (req, res) => {
    try {
      const timeEntry = insertTimeEntrySchema.parse(req.body);
      const newTimeEntry = await storage.createTimeEntry(timeEntry);
      res.status(201).json(newTimeEntry);
    } catch (error) {
      console.error("Time entry creation error:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid time entry data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create time entry", error: error instanceof Error ? error.message : String(error) });
    }
  });
  app2.patch("/api/time-entries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const timeEntry = insertTimeEntrySchema.partial().parse(req.body);
      const updatedTimeEntry = await storage.updateTimeEntry(id, timeEntry);
      if (!updatedTimeEntry) {
        return res.status(404).json({ message: "Time entry not found" });
      }
      res.json(updatedTimeEntry);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid time entry data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update time entry" });
    }
  });
  app2.get("/api/inventory", async (req, res) => {
    try {
      const inventory = await storage.getInventoryItems();
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });
  app2.get("/api/inventory/low-stock", async (req, res) => {
    try {
      const lowStockItems = await storage.getLowStockItems();
      res.json(lowStockItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch low stock items" });
    }
  });
  app2.post("/api/inventory", async (req, res) => {
    try {
      const item = insertInventoryItemSchema.parse(req.body);
      const newItem = await storage.createInventoryItem(item);
      res.status(201).json(newItem);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid inventory item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create inventory item" });
    }
  });
  app2.get("/api/suppliers", async (req, res) => {
    try {
      const suppliers2 = await storage.getSuppliers();
      res.json(suppliers2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });
  app2.post("/api/suppliers", async (req, res) => {
    try {
      const supplier = insertSupplierSchema.parse(req.body);
      const newSupplier = await storage.createSupplier(supplier);
      res.status(201).json(newSupplier);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid supplier data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create supplier" });
    }
  });
  app2.get("/api/equipment", async (req, res) => {
    try {
      const equipment2 = await storage.getEquipment();
      res.json(equipment2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch equipment" });
    }
  });
  app2.post("/api/equipment", async (req, res) => {
    try {
      const equipmentItem = insertEquipmentSchema.parse(req.body);
      const newEquipment = await storage.createEquipment(equipmentItem);
      res.status(201).json(newEquipment);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid equipment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create equipment" });
    }
  });
  app2.post("/api/schedule/optimize", async (req, res) => {
    try {
      const { technicianId, jobIds, date: date2, workDayStart = "09:00", workDayEnd = "17:00", startLocation } = req.body;
      const technician = await storage.getEmployee(technicianId);
      if (!technician) {
        return res.status(404).json({ message: "Technician not found" });
      }
      const jobs2 = await Promise.all(
        jobIds.map(async (jobId) => {
          const job = await storage.getJob(jobId);
          if (!job) throw new Error(`Job ${jobId} not found`);
          const customer = await storage.getCustomer(job.customerId);
          if (!customer) throw new Error(`Customer for job ${jobId} not found`);
          return { ...job, customer };
        })
      );
      const optimizedSchedule = await optimizeScheduleWithAI({
        technician,
        jobs: jobs2,
        startLocation,
        workDayStart,
        workDayEnd,
        date: date2
      });
      res.json(optimizedSchedule);
    } catch (error) {
      res.status(500).json({ message: "Failed to optimize schedule", error: error instanceof Error ? error.message : String(error) });
    }
  });
  app2.post("/api/schedule/estimate-duration", async (req, res) => {
    try {
      const { jobDescription, serviceType } = req.body;
      const estimatedDuration = await estimateJobDuration(jobDescription, serviceType);
      res.json({ estimatedMinutes: estimatedDuration });
    } catch (error) {
      res.status(500).json({ message: "Failed to estimate duration", error: error instanceof Error ? error.message : String(error) });
    }
  });
  app2.post("/api/schedule/geocode", async (req, res) => {
    try {
      const { address } = req.body;
      const result = await googleMapsService.geocodeAddress(address);
      if (!result) {
        return res.status(404).json({ message: "Address not found" });
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to geocode address", error: error instanceof Error ? error.message : String(error) });
    }
  });
  app2.post("/api/schedule/travel-times", async (req, res) => {
    try {
      const { origins, destinations } = req.body;
      const travelTimes = await googleMapsService.getDistanceMatrix(origins, destinations);
      res.json(travelTimes);
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate travel times", error: error instanceof Error ? error.message : String(error) });
    }
  });
  app2.post("/api/schedule/apply-optimization", async (req, res) => {
    try {
      const { optimizedJobs, technicianId, date: date2, totalDriveTime, totalWorkTime } = req.body;
      const updatedJobs = await Promise.all(
        optimizedJobs.map(async (optimizedJob) => {
          const startDateTime = /* @__PURE__ */ new Date(`${date2}T${optimizedJob.scheduledStartTime}`);
          const endDateTime = /* @__PURE__ */ new Date(`${date2}T${optimizedJob.scheduledEndTime}`);
          return await storage.updateJob(optimizedJob.jobId, {
            scheduledStartTime: startDateTime,
            scheduledEndTime: endDateTime,
            estimatedDuration: optimizedJob.estimatedDuration,
            status: "scheduled"
          });
        })
      );
      console.log(`Route assigned to technician ${technicianId} for ${date2}`);
      console.log(`Total drive time: ${totalDriveTime} minutes, Total work time: ${totalWorkTime} minutes`);
      res.json({
        message: "Schedule optimization applied and route assigned to technician",
        updatedJobs,
        routeAssigned: {
          technicianId,
          date: date2,
          totalDriveTime,
          totalWorkTime,
          jobCount: optimizedJobs.length
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to apply optimization", error: error instanceof Error ? error.message : String(error) });
    }
  });
  app2.get("/api/employee-permissions/:employeeId", async (req, res) => {
    try {
      const employeeId = parseInt(req.params.employeeId);
      const permissions3 = await storage.getEmployeePermissions(employeeId);
      res.json(permissions3);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch employee permissions", error: error.message });
    }
  });
  app2.post("/api/employee-permissions", async (req, res) => {
    try {
      const result = insertEmployeePermissionsSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid request body", errors: result.error.issues });
      }
      const permissions3 = await storage.createEmployeePermissions(result.data);
      res.status(201).json(permissions3);
    } catch (error) {
      res.status(500).json({ message: "Failed to create permissions", error: error.message });
    }
  });
  app2.put("/api/employee-permissions/:employeeId", async (req, res) => {
    try {
      const employeeId = parseInt(req.params.employeeId);
      const result = insertEmployeePermissionsSchema.partial().safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid request body", errors: result.error.issues });
      }
      const permissions3 = await storage.updateEmployeePermissions(employeeId, result.data);
      res.json(permissions3);
    } catch (error) {
      res.status(500).json({ message: "Failed to update permissions", error: error.message });
    }
  });
  app2.post("/api/ai/polish-text", async (req, res) => {
    try {
      const { text: text2, fieldType, businessType, businessName } = req.body;
      const polishedText = await polishText(text2, fieldType, businessType, businessName);
      res.json({ polishedText });
    } catch (error) {
      console.error("Text polish error:", error);
      res.status(500).json({
        error: "Failed to polish text",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/ai/generate-estimate", async (req, res) => {
    try {
      const { serviceType, propertySize, location, additionalNotes, pricingMethod } = req.body;
      const basicEstimate = await generateAIEstimate({
        serviceType,
        propertySize: propertySize || "standard",
        location: location || "general",
        additionalNotes: additionalNotes || ""
      });
      if (pricingMethod === "line_items") {
        const lineItemsPrompt = `Based on this job: "${serviceType}", create detailed line items for a professional estimate. 

Generate realistic line items with:
- Specific descriptions of work/materials
- Appropriate quantities 
- Market-rate pricing
- Professional terminology

Respond with JSON in this format:
{
  "title": "string",
  "description": "string", 
  "lineItems": [
    {
      "description": "string",
      "quantity": number,
      "rate": number
    }
  ]
}`;
        const openai5 = new OpenAI4({ apiKey: process.env.OPENAI_API_KEY });
        const response = await openai5.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are a professional estimator who creates detailed, accurate line item estimates for service businesses."
            },
            {
              role: "user",
              content: lineItemsPrompt
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.7
        });
        const lineItemData = JSON.parse(response.choices[0].message.content || "{}");
        res.json({
          title: lineItemData.title || basicEstimate.title,
          description: lineItemData.description || basicEstimate.description,
          lineItems: lineItemData.lineItems || []
        });
      } else {
        res.json(basicEstimate);
      }
    } catch (error) {
      console.error("AI estimate generation error:", error);
      res.status(500).json({
        error: "Failed to generate estimate",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/ai/optimize-route", async (req, res) => {
    try {
      const { technicianId, date: date2, jobs: jobs2, startLocation, workDayStart, workDayEnd } = req.body;
      if (!technicianId || !date2 || !jobs2 || !Array.isArray(jobs2)) {
        return res.status(400).json({
          error: "Missing required fields: technicianId, date, and jobs array"
        });
      }
      const technician = await storage.getEmployee(technicianId);
      if (!technician) {
        return res.status(404).json({ error: "Technician not found" });
      }
      const jobsWithCustomers = await Promise.all(
        jobs2.map(async (job) => {
          const customer = await storage.getCustomer(job.customerId || job.id);
          return {
            ...job,
            customer: customer || {
              firstName: "Unknown",
              lastName: "Customer",
              address: job.address || "Address not available"
            }
          };
        })
      );
      const optimizedSchedule = await optimizeScheduleWithAI({
        technician,
        jobs: jobsWithCustomers,
        startLocation: startLocation || {
          lat: 39.7817,
          lng: -89.6501,
          address: "Company Headquarters"
        },
        workDayStart: workDayStart || "08:00",
        workDayEnd: workDayEnd || "17:00",
        date: date2
      });
      res.json(optimizedSchedule);
    } catch (error) {
      console.error("Route optimization error:", error);
      res.status(500).json({
        error: "Failed to optimize route",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/notifications", async (req, res) => {
    try {
      const notifications2 = await storage.getNotifications();
      res.json(notifications2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });
  app2.post("/api/notifications", async (req, res) => {
    try {
      const notification = insertNotificationSchema.parse(req.body);
      const newNotification = await storage.createNotification(notification);
      res.status(201).json(newNotification);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid notification data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create notification" });
    }
  });
  app2.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedNotification = await storage.markNotificationAsRead(id);
      if (!updatedNotification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      res.json(updatedNotification);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });
  app2.delete("/api/notifications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteNotification(id);
      if (!success) {
        return res.status(404).json({ message: "Notification not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete notification" });
    }
  });
  app2.post("/api/notifications/generate", async (req, res) => {
    try {
      const generatedNotifications = await storage.generateBusinessNotifications();
      res.json(generatedNotifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate notifications" });
    }
  });
  app2.get("/api/deployment/status", async (req, res) => {
    try {
      const status = await deploymentManager.getDeploymentStatus();
      const progress = deploymentChecker.getProgress();
      const nextSteps = deploymentChecker.getNextSteps();
      res.json({
        status,
        progress,
        nextSteps,
        isReadyForProduction: deploymentChecker.isReadyForProduction()
      });
    } catch (error) {
      console.error("Deployment status error:", error);
      res.status(500).json({ message: "Failed to get deployment status" });
    }
  });
  app2.post("/api/deployment/clear-demo-data", async (req, res) => {
    try {
      console.log("CLEARING DEMO DATA FOR PRODUCTION DEPLOYMENT");
      await deploymentManager.prepareForProduction();
      deploymentChecker.markCompleted("clear-demo-data");
      res.json({
        message: "Demo data cleared successfully",
        status: "ready_for_production_data"
      });
    } catch (error) {
      console.error("Failed to clear demo data:", error);
      res.status(500).json({ message: "Failed to clear demo data" });
    }
  });
  app2.post("/api/deployment/setup-beta", async (req, res) => {
    try {
      const { businesses } = req.body;
      if (!businesses || !Array.isArray(businesses)) {
        return res.status(400).json({
          message: "Businesses array required for beta setup"
        });
      }
      await deploymentManager.setupBetaTesting(businesses);
      deploymentChecker.markCompleted("setup-beta-accounts");
      res.json({
        message: "Beta testing environment setup successfully",
        betaBusinesses: businesses.length
      });
    } catch (error) {
      console.error("Failed to setup beta testing:", error);
      res.status(500).json({ message: "Failed to setup beta testing" });
    }
  });
  app2.post("/api/deployment/seed-production", async (req, res) => {
    try {
      const { businessName, ownerName, ownerEmail } = req.body;
      await dataSeeder.seedDatabase({
        clearExisting: false,
        // Already cleared in prepare step
        createSampleData: true,
        businessName: businessName || "Your Business",
        ownerName: ownerName || "Business Owner",
        ownerEmail: ownerEmail || "owner@business.com"
      });
      deploymentChecker.markCompleted("seed-production-data");
      res.json({
        message: "Production data seeded successfully",
        businessName
      });
    } catch (error) {
      console.error("Failed to seed production data:", error);
      res.status(500).json({ message: "Failed to seed production data" });
    }
  });
  app2.get("/api/deployment/data-stats", async (req, res) => {
    try {
      const stats = await dataSeeder.getDataStats();
      res.json(stats);
    } catch (error) {
      console.error("Failed to get data stats:", error);
      res.status(500).json({ message: "Failed to get data statistics" });
    }
  });
  app2.post("/api/deployment/checklist/:stepId/complete", async (req, res) => {
    try {
      const { stepId } = req.params;
      deploymentChecker.markCompleted(stepId);
      res.json({
        message: `Step ${stepId} marked as completed`,
        progress: deploymentChecker.getProgress()
      });
    } catch (error) {
      console.error("Failed to update checklist:", error);
      res.status(500).json({ message: "Failed to update checklist" });
    }
  });
  app2.get("/api/deployment/checklist/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const steps = deploymentChecker.getStepsByCategory(category);
      res.json(steps);
    } catch (error) {
      console.error("Failed to get checklist category:", error);
      res.status(500).json({ message: "Failed to get checklist category" });
    }
  });
  app2.get("/api/lead-pipeline/stages", async (req, res) => {
    try {
      const stages = await storage.getLeadPipelineStages();
      res.json(stages);
    } catch (error) {
      console.error("Error fetching pipeline stages:", error);
      res.status(500).json({ message: "Failed to fetch pipeline stages" });
    }
  });
  app2.post("/api/lead-pipeline/stages", async (req, res) => {
    try {
      const stage = await storage.createLeadPipelineStage(req.body);
      res.status(201).json(stage);
    } catch (error) {
      console.error("Error creating pipeline stage:", error);
      res.status(500).json({ message: "Failed to create pipeline stage" });
    }
  });
  app2.get("/api/lead-pipeline/entries", async (req, res) => {
    try {
      const entries = await storage.getLeadPipelineEntries();
      res.json(entries);
    } catch (error) {
      console.error("Error fetching pipeline entries:", error);
      res.status(500).json({ message: "Failed to fetch pipeline entries" });
    }
  });
  app2.post("/api/lead-pipeline/entries", async (req, res) => {
    try {
      const entry = await storage.createLeadPipelineEntry(req.body);
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error creating pipeline entry:", error);
      res.status(500).json({ message: "Failed to create pipeline entry" });
    }
  });
  app2.post("/api/lead-pipeline/entries/bulk-update-stage", async (req, res) => {
    try {
      const { leadIds, stageId } = req.body;
      if (!Array.isArray(leadIds) || leadIds.length === 0) {
        return res.status(400).json({ message: "leadIds must be a non-empty array" });
      }
      if (!stageId) {
        return res.status(400).json({ message: "stageId is required" });
      }
      const updatedEntries = await storage.bulkUpdateLeadStage(leadIds, stageId);
      res.json({
        message: `${updatedEntries.length} leads updated successfully`,
        updatedEntries
      });
    } catch (error) {
      console.error("Error bulk updating lead stages:", error);
      res.status(500).json({ message: "Failed to bulk update lead stages" });
    }
  });
  app2.post("/api/lead-pipeline/entries/bulk-delete", async (req, res) => {
    try {
      const { leadIds } = req.body;
      if (!Array.isArray(leadIds) || leadIds.length === 0) {
        return res.status(400).json({ message: "leadIds must be a non-empty array" });
      }
      const deletedCount = await storage.bulkDeleteLeads(leadIds);
      res.json({
        message: `${deletedCount} leads deleted successfully`,
        deletedCount
      });
    } catch (error) {
      console.error("Error bulk deleting leads:", error);
      res.status(500).json({ message: "Failed to bulk delete leads" });
    }
  });
  app2.put("/api/lead-pipeline/entries/:id", async (req, res) => {
    try {
      const entryId = parseInt(req.params.id);
      const entry = await storage.updateLeadPipelineEntry(entryId, req.body);
      res.json(entry);
    } catch (error) {
      console.error("Error updating pipeline entry:", error);
      res.status(500).json({ message: "Failed to update pipeline entry" });
    }
  });
  app2.patch("/api/lead-pipeline/entries/:id", async (req, res) => {
    try {
      const entryId = parseInt(req.params.id);
      const entry = await storage.updateLeadPipelineEntry(entryId, req.body);
      res.json(entry);
    } catch (error) {
      console.error("Error updating pipeline entry:", error);
      res.status(500).json({ message: "Failed to update pipeline entry" });
    }
  });
  app2.get("/api/lead-pipeline/entries/:leadId/notes", async (req, res) => {
    try {
      const leadId = parseInt(req.params.leadId);
      const notes = await storage.getLeadNotes(leadId);
      res.json(notes);
    } catch (error) {
      console.error("Error fetching lead notes:", error);
      res.status(500).json({ message: "Failed to fetch lead notes" });
    }
  });
  app2.get("/api/lead-pipeline/notes-count", async (req, res) => {
    try {
      const notesCounts = await storage.getLeadNotesCount();
      res.json(notesCounts);
    } catch (error) {
      console.error("Error fetching notes counts:", error);
      res.status(500).json({ message: "Failed to fetch notes counts" });
    }
  });
  app2.post("/api/lead-pipeline/entries/:leadId/notes", async (req, res) => {
    try {
      const leadId = parseInt(req.params.leadId);
      const noteData = insertLeadNoteSchema.parse({
        ...req.body,
        leadPipelineEntryId: leadId
      });
      const note = await storage.createLeadNote(noteData);
      res.status(201).json(note);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid note data", errors: error.errors });
      }
      console.error("Error creating lead note:", error);
      res.status(500).json({ message: "Failed to create lead note" });
    }
  });
  app2.patch("/api/lead-notes/:id", async (req, res) => {
    try {
      const noteId = parseInt(req.params.id);
      const updateData = insertLeadNoteSchema.partial().parse(req.body);
      const note = await storage.updateLeadNote(noteId, updateData);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      res.json(note);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid note data", errors: error.errors });
      }
      console.error("Error updating lead note:", error);
      res.status(500).json({ message: "Failed to update lead note" });
    }
  });
  app2.delete("/api/lead-notes/:id", async (req, res) => {
    try {
      const noteId = parseInt(req.params.id);
      const success = await storage.deleteLeadNote(noteId);
      if (!success) {
        return res.status(404).json({ message: "Note not found" });
      }
      res.json({ message: "Note deleted successfully" });
    } catch (error) {
      console.error("Error deleting lead note:", error);
      res.status(500).json({ message: "Failed to delete lead note" });
    }
  });
  app2.get("/api/project-updates", async (req, res) => {
    try {
      const updates = await projectUpdateService.getAllProjectUpdates();
      res.json(updates);
    } catch (error) {
      handleServiceError(error, res);
    }
  });
  app2.get("/api/project-updates/:contactId", async (req, res) => {
    try {
      const contactId = parseInt(req.params.contactId);
      if (isNaN(contactId)) {
        return res.status(400).json({ message: "Invalid contact ID" });
      }
      const updates = await projectUpdateService.getProjectUpdatesForContact(contactId);
      res.json(updates);
    } catch (error) {
      handleServiceError(error, res);
    }
  });
  app2.post("/api/project-updates", async (req, res) => {
    try {
      const updateData = insertProjectUpdateSchema.parse(req.body);
      const update = await projectUpdateService.createProjectUpdate(updateData);
      res.status(201).json(update);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid project update data", errors: error.errors });
      }
      handleServiceError(error, res);
    }
  });
  app2.put("/api/project-updates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid update ID" });
      }
      const updateData = insertProjectUpdateSchema.partial().parse(req.body);
      const update = await projectUpdateService.updateProjectUpdate(id, updateData);
      res.json(update);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid project update data", errors: error.errors });
      }
      handleServiceError(error, res);
    }
  });
  app2.delete("/api/project-updates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid update ID" });
      }
      await projectUpdateService.deleteProjectUpdate(id);
      res.json({ message: "Project update deleted successfully" });
    } catch (error) {
      handleServiceError(error, res);
    }
  });
  app2.get("/api/employees/:id/schedule", async (req, res) => {
    try {
      const employeeId = parseInt(req.params.id);
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate) : /* @__PURE__ */ new Date();
      const end = endDate ? new Date(endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3);
      const schedule = await storage.getEmployeeSchedule(employeeId, start, end);
      res.json(schedule);
    } catch (error) {
      console.error("Error fetching employee schedule:", error);
      res.status(500).json({ message: "Failed to fetch employee schedule" });
    }
  });
  app2.get("/api/employees/available", async (req, res) => {
    try {
      const { date: date2, startTime, endTime } = req.query;
      if (!date2) {
        return res.status(400).json({ message: "Date parameter is required" });
      }
      const targetDate = new Date(date2);
      const availableEmployees = await storage.getAvailableEmployees(
        targetDate,
        startTime,
        endTime
      );
      res.json(availableEmployees);
    } catch (error) {
      console.error("Error fetching available employees:", error);
      res.status(500).json({ message: "Failed to fetch available employees" });
    }
  });
  app2.post("/api/jobs/:id/assign", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const { employeeId, assignedBy } = req.body;
      if (!employeeId) {
        return res.status(400).json({ message: "Employee ID is required" });
      }
      const updatedJob = await storage.assignJobToEmployee(jobId, employeeId, assignedBy);
      if (!updatedJob) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(updatedJob);
    } catch (error) {
      console.error("Error assigning job to employee:", error);
      res.status(500).json({ message: "Failed to assign job to employee" });
    }
  });
  app2.post("/api/employees/:id/availability", async (req, res) => {
    try {
      const employeeId = parseInt(req.params.id);
      const { date: date2, isAvailable, startTime, endTime, notes } = req.body;
      if (!date2) {
        return res.status(400).json({ message: "Date is required" });
      }
      const targetDate = new Date(date2);
      const availability = await storage.setEmployeeAvailability(employeeId, targetDate, {
        employeeId,
        date: targetDate,
        isAvailable,
        startTime,
        endTime,
        notes
      });
      res.status(201).json(availability);
    } catch (error) {
      console.error("Error setting employee availability:", error);
      res.status(500).json({ message: "Failed to set employee availability" });
    }
  });
  app2.get("/api/employees/:id/availability", async (req, res) => {
    try {
      const employeeId = parseInt(req.params.id);
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate) : /* @__PURE__ */ new Date();
      const end = endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3);
      const availability = await storage.getEmployeeAvailability(employeeId, start, end);
      res.json(availability);
    } catch (error) {
      console.error("Error fetching employee availability:", error);
      res.status(500).json({ message: "Failed to fetch employee availability" });
    }
  });
  app2.patch("/api/employees/:id/availability-status", async (req, res) => {
    try {
      const employeeId = parseInt(req.params.id);
      const { isAvailable } = req.body;
      if (typeof isAvailable !== "boolean") {
        return res.status(400).json({ message: "isAvailable must be a boolean" });
      }
      const updatedEmployee = await storage.updateEmployeeAvailabilityStatus(employeeId, isAvailable);
      if (!updatedEmployee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(updatedEmployee);
    } catch (error) {
      console.error("Error updating employee availability status:", error);
      res.status(500).json({ message: "Failed to update employee availability status" });
    }
  });
  app2.get("/api/employees/:id/can-assign-jobs", async (req, res) => {
    try {
      const employeeId = parseInt(req.params.id);
      const canAssign = await storage.canEmployeeAssignJobs(employeeId);
      res.json({ canAssign });
    } catch (error) {
      console.error("Error checking employee job assignment permissions:", error);
      res.status(500).json({ message: "Failed to check permissions" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/routes/contacts.ts
init_db();
init_schema();
import express2 from "express";
import { eq as eq9, and as and5, or as or7, ilike as ilike6, desc as desc8, sql, count as count8 } from "drizzle-orm";
import { z as z3 } from "zod";
import { fromZodError } from "zod-validation-error";

// server/rbac.ts
init_db();
import { eq as eq8 } from "drizzle-orm";
import { permissions as dbPermissionsSchema } from "@/shared/schema";
var defaultRoleGrants = {
  ["manager" /* MANAGER */]: {
    // Financial Access
    canViewRevenue: false,
    // Managers typically don't see full company revenue unless overridden
    canViewProfitMargins: false,
    // Sensitive, usually Owner only unless overridden
    canViewEmployeeWages: false,
    // Sensitive
    canViewJobCosts: true,
    // Essential for managing jobs
    canEditPricing: true,
    // For estimates and job adjustments
    canAccessFinancialReports: false,
    // Access to operational reports, not full financials unless overridden
    // Employee Management
    canViewAllEmployees: true,
    canEditEmployeeInfo: true,
    canManageSchedules: true,
    canApproveTimeEntries: true,
    canViewPerformanceMetrics: true,
    // Team/operational metrics
    // Customer & Job Management
    canViewAllCustomers: true,
    canEditCustomerInfo: true,
    canCreateAssignJobs: true,
    canAccessPaymentHistory: true,
    // For customer service and job management
    canManageEstimatesInvoices: true,
    // CRUD operations
    // System Administration
    canManageUserRoles: false,
    // Cannot change roles (especially to Owner) or manage permissions table
    canAccessSystemSettings: false,
    // Limited to operational settings they manage
    canExportData: true,
    // Operational data like job lists, customer lists
    canManageIntegrations: false
    // Typically Owner
  },
  ["field_tech" /* FIELD_TECH */]: {
    // Field techs have very limited access by default. Most permissions are false.
    // Their access is primarily to *their assigned* jobs, handled by business logic + role check.
    canViewRevenue: false,
    canViewProfitMargins: false,
    canViewEmployeeWages: false,
    canViewJobCosts: false,
    canEditPricing: false,
    canAccessFinancialReports: false,
    canViewAllEmployees: false,
    // Should only see their own info or team members on a job
    canEditEmployeeInfo: false,
    // Can edit their own profile basics
    canManageSchedules: false,
    // Views their own schedule
    canApproveTimeEntries: false,
    // Submits their own time entries
    canViewPerformanceMetrics: false,
    // Perhaps their own individual metrics if implemented
    canViewAllCustomers: false,
    // Only customers related to their assigned jobs
    canEditCustomerInfo: false,
    canCreateAssignJobs: false,
    canAccessPaymentHistory: false,
    canManageEstimatesInvoices: false,
    canManageUserRoles: false,
    canAccessSystemSettings: false,
    canExportData: false,
    canManageIntegrations: false
  },
  ["bookkeeper" /* BOOKKEEPER */]: {
    // Financial Access
    canViewRevenue: true,
    canViewProfitMargins: true,
    // Essential for financial reconciliation
    canViewEmployeeWages: true,
    // For payroll processing
    canViewJobCosts: true,
    // For accurate bookkeeping
    canEditPricing: false,
    // Bookkeepers don't set prices
    canAccessFinancialReports: true,
    // Core function
    // Employee Management (Limited)
    canViewAllEmployees: false,
    // Only data needed for payroll, not full employee management
    canEditEmployeeInfo: false,
    canManageSchedules: false,
    canApproveTimeEntries: false,
    // Processes approved time entries
    canViewPerformanceMetrics: false,
    // Customer & Job Management (View for context)
    canViewAllCustomers: true,
    // For invoicing and payment context
    canEditCustomerInfo: false,
    // View-only usually
    canCreateAssignJobs: false,
    canAccessPaymentHistory: true,
    // Core function
    canManageEstimatesInvoices: true,
    // Primarily managing invoices, viewing estimates
    // System Administration
    canManageUserRoles: false,
    canAccessSystemSettings: false,
    canExportData: true,
    // Financial data exports for accounting software
    canManageIntegrations: false
    // Typically not
  }
};
async function userHasPermission(userContext, permissionKey) {
  if (!userContext) {
    console.warn("RBAC: userHasPermission called with undefined userContext.");
    return false;
  }
  if (userContext.role === "owner" /* OWNER */) {
    return true;
  }
  if (userContext.dbPermissions && userContext.dbPermissions[permissionKey] !== void 0) {
    return !!userContext.dbPermissions[permissionKey];
  }
  const roleDefaultPermissions = defaultRoleGrants[userContext.role];
  if (roleDefaultPermissions && roleDefaultPermissions[permissionKey] !== void 0) {
    return !!roleDefaultPermissions[permissionKey];
  }
  return false;
}
function authorize(requiredPermissions) {
  return async (req, res, next) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: No user session." });
    }
    const permissionsToCheck = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
    if (permissionsToCheck.length === 0) {
      console.warn("RBAC: authorize middleware called with empty permissions array.");
      return next();
    }
    for (const perm of permissionsToCheck) {
      if (await userHasPermission(user, perm)) {
        return next();
      }
    }
    return res.status(403).json({ message: "Forbidden: Insufficient permissions." });
  };
}
function authorizeRole(requiredRoles) {
  return (req, res, next) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: No user session." });
    }
    const rolesToCheck = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    if (rolesToCheck.includes(user.role)) {
      return next();
    }
    return res.status(403).json({ message: `Forbidden: Role '${user.role}' is not authorized for this resource.` });
  };
}

// server/routes/contacts.ts
var router = express2.Router();
var updateContactSchema = insertContactSchema.partial().extend({
  // Ensure certain fields cannot be updated via this general PATCH
  // status: z.undefined().optional(), // Status changes should be through specific actions like convert-to-customer
  // convertedAt: z.undefined().optional(),
});
var getEmployeeIdFromRequest = (req) => {
  const user = req.user;
  return user?.employeeId;
};
router.get("/", authorize(["canViewAllCustomers"]), async (req, res, next) => {
  try {
    const {
      search,
      contactType,
      // 'lead', 'customer', or undefined for all
      leadSource,
      page = "1",
      pageSize = "15"
    } = req.query;
    const pageNumber = parseInt(page, 10);
    const limit = parseInt(pageSize, 10);
    const offset = (pageNumber - 1) * limit;
    const conditions = [];
    if (contactType === "lead") {
      conditions.push(eq9(contacts.status, "lead"));
    } else if (contactType === "customer") {
      conditions.push(eq9(contacts.status, "customer"));
    }
    if (leadSource) {
      conditions.push(eq9(contacts.leadSource, leadSource));
    }
    if (search) {
      const searchString = `%${search.toLowerCase()}%`;
      conditions.push(
        or7(
          ilike6(contacts.firstName, searchString),
          ilike6(contacts.lastName, searchString),
          ilike6(contacts.email, searchString),
          ilike6(contacts.phone, searchString),
          // A raw SQL way to search concatenated first and last name
          sql`lower(concat(${contacts.firstName}, ' ', ${contacts.lastName})) like ${searchString}`
        )
      );
    }
    const combinedCondition = conditions.length > 0 ? and5(...conditions) : void 0;
    const data = await db.select().from(contacts).where(combinedCondition).orderBy(desc8(contacts.createdAt)).limit(limit).offset(offset);
    const totalResult = await db.select({ totalCount: count8() }).from(contacts).where(combinedCondition);
    const totalCount = totalResult[0]?.totalCount || 0;
    res.json({ data, totalCount });
  } catch (error) {
    next(error);
  }
});
router.post("/", authorize(["canEditCustomerInfo", "canCreateAssignJobs"]), async (req, res, next) => {
  try {
    const payload = { ...req.body, status: req.body.status || "lead" };
    const validatedData = insertContactSchema.parse(payload);
    const newContactArray = await db.insert(contacts).values(validatedData).returning();
    if (newContactArray.length === 0) {
      return res.status(500).json({ message: "Failed to create contact" });
    }
    res.status(201).json(newContactArray[0]);
  } catch (error) {
    if (error instanceof z3.ZodError) {
      return res.status(400).json({ message: "Validation failed", errors: fromZodError(error).details });
    }
    next(error);
  }
});
router.get("/:id", authorize(["canViewAllCustomers"]), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid contact ID" });
    }
    const contactArray = await db.select().from(contacts).where(eq9(contacts.id, id)).limit(1);
    if (contactArray.length === 0) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.json(contactArray[0]);
  } catch (error) {
    next(error);
  }
});
router.patch("/:id", authorize(["canEditCustomerInfo"]), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid contact ID" });
    }
    const { status, convertedAt, createdAt, ...restOfBody } = req.body;
    if (status || convertedAt || createdAt) {
    }
    const validatedData = updateContactSchema.parse(restOfBody);
    if (Object.keys(validatedData).length === 0) {
      return res.status(400).json({ message: "No valid fields provided for update." });
    }
    const updatedContactArray = await db.update(contacts).set(validatedData).where(eq9(contacts.id, id)).returning();
    if (updatedContactArray.length === 0) {
      return res.status(404).json({ message: "Contact not found or no changes made" });
    }
    res.json(updatedContactArray[0]);
  } catch (error) {
    if (error instanceof z3.ZodError) {
      return res.status(400).json({ message: "Validation failed", errors: fromZodError(error).details });
    }
    next(error);
  }
});
router.delete("/:id", authorizeRole(["owner" /* OWNER */, "manager" /* MANAGER */]), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid contact ID" });
    }
    const result = await db.delete(contacts).where(eq9(contacts.id, id)).returning({ id: contacts.id });
    if (result.length === 0) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
router.patch("/:id/convert-to-customer", authorize(["canEditCustomerInfo"]), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid contact ID" });
    }
    const updatedContactArray = await db.update(contacts).set({ status: "customer", convertedAt: /* @__PURE__ */ new Date() }).where(and5(eq9(contacts.id, id), eq9(contacts.status, "lead"))).returning();
    if (updatedContactArray.length === 0) {
      const existing = await db.select({ status: contacts.status }).from(contacts).where(eq9(contacts.id, id)).limit(1);
      if (existing.length === 0) return res.status(404).json({ message: "Lead not found" });
      if (existing[0].status === "customer") return res.status(400).json({ message: "Contact is already a customer" });
      return res.status(400).json({ message: "Failed to convert lead. It might not be a lead or does not exist." });
    }
    res.json(updatedContactArray[0]);
  } catch (error) {
    next(error);
  }
});
router.get("/:id/activities", authorize(["canViewAllCustomers"]), async (req, res, next) => {
  try {
    const contactId = parseInt(req.params.id, 10);
    if (isNaN(contactId)) {
      return res.status(400).json({ message: "Invalid contact ID" });
    }
    const activities = await db.select().from(contactActivities).where(eq9(contactActivities.contactId, contactId)).orderBy(desc8(contactActivities.createdAt));
    res.json(activities);
  } catch (error) {
    next(error);
  }
});
router.post("/:id/activities", authorize(["canEditCustomerInfo"]), async (req, res, next) => {
  try {
    const contactId = parseInt(req.params.id, 10);
    if (isNaN(contactId)) {
      return res.status(400).json({ message: "Invalid contact ID" });
    }
    const contactExists = await db.select({ id: contacts.id }).from(contacts).where(eq9(contacts.id, contactId)).limit(1);
    if (contactExists.length === 0) {
      return res.status(404).json({ message: "Contact not found" });
    }
    const employeeId = getEmployeeIdFromRequest(req);
    const payload = {
      ...req.body,
      contactId,
      createdBy: employeeId
      // Set createdBy if employeeId is available
    };
    if (employeeId === void 0) {
      delete payload.createdBy;
    }
    const validatedData = insertContactActivitySchema.parse(payload);
    const newActivityArray = await db.insert(contactActivities).values(validatedData).returning();
    if (newActivityArray.length === 0) {
      return res.status(500).json({ message: "Failed to create activity" });
    }
    res.status(201).json(newActivityArray[0]);
  } catch (error) {
    if (error instanceof z3.ZodError) {
      return res.status(400).json({ message: "Validation failed", errors: fromZodError(error).details });
    }
    next(error);
  }
});
var contacts_default = router;

// server/routes/estimates.ts
init_db();
init_schema();
import express3 from "express";
import { eq as eq10, and as and6, or as or8, ilike as ilike7, desc as desc9, count as count9 } from "drizzle-orm";
import { z as z5 } from "zod";
import { fromZodError as fromZodError3 } from "zod-validation-error";

// server/services/ai-estimate-generator.ts
import OpenAI5 from "openai";
import { z as z4 } from "zod";
import { fromZodError as fromZodError2 } from "zod-validation-error";
var OPENAI_API_KEY = process.env.OPENAI_API_KEY;
var ESTIMATE_GENERATION_MODEL = "gpt-4o";
var LINE_ITEM_POLISH_MODEL = "gpt-4o";
if (!OPENAI_API_KEY) {
  console.warn(
    "OPENAI_API_KEY is not set. AI Estimate Generator will not function."
  );
}
var openai4 = OPENAI_API_KEY ? new OpenAI5({ apiKey: OPENAI_API_KEY }) : null;
var BusinessContextSchema = z4.object({
  businessName: z4.string().min(1, "Business name is required"),
  serviceType: z4.string().min(1, "Primary service type is required"),
  // e.g., "Landscaping", "Plumbing", "HVAC Repair"
  specialties: z4.array(z4.string()).optional().default([]),
  // e.g., ["Residential Lawn Care", "Commercial Irrigation"]
  defaultWarranty: z4.string().optional().default("Standard 1-year warranty on labor."),
  defaultTerms: z4.string().optional().default("Payment due upon completion. 50% deposit required for projects over $1000.")
  // Potentially add more fields like typical pricing structure (e.g., "per hour", "flat rate")
});
var CustomerContextSchema = z4.object({
  customerType: z4.enum(["residential", "commercial"]),
  customerName: z4.string().optional(),
  propertyInfo: z4.string().optional(),
  // e.g., "Single-family home, 2000 sq ft", "Office building, 3 floors"
  specificRequests: z4.string().optional()
  // Any specific requests from the customer mentioned in notes
});
var GenerateDraftEstimateRequestSchema = z4.object({
  fieldNotes: z4.string().min(20, "Field notes must be at least 20 characters long"),
  businessContext: BusinessContextSchema,
  customerContext: CustomerContextSchema
});
var PolishLineItemRequestSchema = z4.object({
  lineItemDescription: z4.string().min(5, "Line item description is too short"),
  customerType: z4.enum(["residential", "commercial"]),
  serviceType: z4.string().min(1, "Service type is required")
});
function getToneGuide(customerType) {
  if (customerType === "residential") {
    return "Warm, empathetic, and trust-building. Focus on peace-of-mind, safety, and convenience. Avoid overly technical jargon. Explain benefits clearly.";
  } else {
    return "Direct, concise, and professional. Focus on ROI, efficiency, timelines, and compliance. Use clear, professional language. Metrics and quantifiable benefits are valued.";
  }
}
function constructSystemPrompt(serviceType, customerType) {
  const toneGuide = getToneGuide(customerType);
  return `You are an expert estimator for a ${serviceType} company. Your task is to transform unstructured field notes into a professionally structured estimate.
The target audience is a ${customerType} client.
Adhere to the following tone: ${toneGuide}
You MUST return a valid JSON object matching the specified output format. Do not include any explanatory text before or after the JSON.
The JSON output should include: executiveSummary (string), scopeOfWork (array of strings), lineItems (array of objects with id, description, quantity, unit), projectTimeline (string, optional), warrantyInformation (string, optional), termsAndConditions (string, optional), notesForCustomer (string, optional).
For lineItems, infer quantity and unit if possible from the notes, otherwise default quantity to 1 and unit to 'item' or 'service'. Do NOT invent prices or rates; set rate and amount to 0 for all line items.
Ensure descriptions are clear and action-oriented.
If the notes are too vague or insufficient to create a meaningful estimate, reflect this in the executiveSummary and provide minimal line items.
Generate unique string IDs for each line item (e.g., "li-1", "li-2").
The scopeOfWork should be a list of distinct tasks or service components.
The executiveSummary should be a brief overview of the proposed work, highlighting key benefits for the ${customerType} client.
Base warrantyInformation on common practices for ${serviceType} or the provided default.
Base termsAndConditions on common practices or the provided default.
If a projectTimeline is not clearly inferable, state that it will be confirmed upon project initiation or omit it.
`;
}
function constructUserPrompt(fieldNotes, businessContext, customerContext) {
  return `
Field Notes:
---
${fieldNotes}
---

Business Context:
- Business Name: ${businessContext.businessName}
- Primary Service: ${businessContext.serviceType}
- Specialties: ${businessContext.specialties.join(", ") || "N/A"}
- Default Warranty: ${businessContext.defaultWarranty}
- Default Terms: ${businessContext.defaultTerms}

Customer Context:
- Customer Type: ${customerContext.customerType}
- Customer Name (if known): ${customerContext.customerName || "N/A"}
- Property Info (if known): ${customerContext.propertyInfo || "N/A"}
- Specific Customer Requests: ${customerContext.specificRequests || "N/A"}

Output Instructions:
- Generate a structured estimate in the specified JSON format.
- Derive clear line items from the field notes. Maximum of 10-15 line items unless notes are extremely detailed.
- Use present tense action verbs for line item descriptions (e.g., "Install new faucet", "Repair leaking pipe").
- If materials are mentioned, include them in the line item descriptions or as separate line items.
- Ensure executiveSummary is tailored to the customer type.
- Provide a realistic scopeOfWork based on the notes.
- If notes mention phases or distinct parts of a job, try to reflect that in the line items or scope.
- Do not invent information not present or reasonably inferable from the notes.
- All monetary values (rate, amount, subtotal, etc.) in the output JSON must be 0.
`;
}
async function generateDraftEstimate(request) {
  if (!openai4) {
    throw new Error("OpenAI API key not configured. AI features are disabled.");
  }
  try {
    GenerateDraftEstimateRequestSchema.parse(request);
  } catch (error) {
    if (error instanceof z4.ZodError) {
      throw new Error(`Invalid request for draft estimate: ${fromZodError2(error).message}`);
    }
    throw error;
  }
  const { fieldNotes, businessContext, customerContext } = request;
  const systemPrompt = constructSystemPrompt(businessContext.serviceType, customerContext.customerType);
  const userPrompt = constructUserPrompt(fieldNotes, businessContext, customerContext);
  try {
    const completion = await openai4.chat.completions.create({
      model: ESTIMATE_GENERATION_MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3,
      // Lower temperature for more factual, less creative output
      max_tokens: 2e3
      // Adjust as needed based on typical estimate length
    });
    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("AI returned an empty response.");
    }
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse AI JSON response:", content);
      throw new Error("AI returned an invalid JSON format. Raw response logged.");
    }
    const structuredEstimate = {
      datePrepared: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      // Today's date
      businessInfo: {
        name: businessContext.businessName
      },
      executiveSummary: parsedContent.executiveSummary || "Summary to be generated.",
      scopeOfWork: Array.isArray(parsedContent.scopeOfWork) ? parsedContent.scopeOfWork : ["Scope to be detailed."],
      lineItems: (Array.isArray(parsedContent.lineItems) ? parsedContent.lineItems : []).map((item, index2) => ({
        id: item.id || `li-${Date.now()}-${index2}`,
        // Ensure ID exists
        description: item.description || "Line item description needed.",
        quantity: typeof item.quantity === "number" && item.quantity > 0 ? item.quantity : 1,
        unit: item.unit || "item",
        rate: 0,
        // Always 0 from AI
        amount: 0
        // Always 0 from AI
      })),
      projectTimeline: parsedContent.projectTimeline,
      warrantyInformation: parsedContent.warrantyInformation || businessContext.defaultWarranty,
      termsAndConditions: parsedContent.termsAndConditions || businessContext.defaultTerms,
      notesForCustomer: parsedContent.notesForCustomer,
      aiConfidenceScore: completion.choices[0]?.finish_reason === "stop" ? 0.85 : 0.5,
      // Basic confidence
      rawAiResponse: process.env.NODE_ENV === "development" ? content : void 0
      // Only include raw in dev
    };
    const validUntilDate = /* @__PURE__ */ new Date();
    validUntilDate.setDate(validUntilDate.getDate() + 30);
    structuredEstimate.validUntil = validUntilDate.toISOString().split("T")[0];
    return structuredEstimate;
  } catch (error) {
    console.error("Error calling OpenAI API for estimate generation:", error);
    if (error.response) {
      console.error("OpenAI API Error Details:", error.response.data);
    }
    throw new Error(`AI estimate generation failed: ${error.message}`);
  }
}
async function polishLineItem(request) {
  if (!openai4) {
    throw new Error("OpenAI API key not configured. AI features are disabled.");
  }
  try {
    PolishLineItemRequestSchema.parse(request);
  } catch (error) {
    if (error instanceof z4.ZodError) {
      throw new Error(`Invalid request for polishing line item: ${fromZodError2(error).message}`);
    }
    throw error;
  }
  const { lineItemDescription, customerType, serviceType } = request;
  const toneGuide = getToneGuide(customerType);
  const systemPrompt = `You are an expert copywriter specializing in service estimates for ${serviceType} businesses.
Your task is to polish the given line item description to be clear, concise, persuasive, and professional.
The target audience is a ${customerType} client.
Adhere to the following tone: ${toneGuide}
Focus on action verbs and clearly state the service or item. Avoid jargon where possible for residential clients.
Return ONLY the polished line item description as a single string, with no extra formatting or explanation.`;
  const userPrompt = `Original line item description:
---
${lineItemDescription}
---
Polish this description.`;
  try {
    const completion = await openai4.chat.completions.create({
      model: LINE_ITEM_POLISH_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.5,
      // Moderate temperature for some creativity but still factual
      max_tokens: 150
      // Line items are usually short
    });
    const polishedDescription = completion.choices[0]?.message?.content?.trim();
    if (!polishedDescription) {
      throw new Error("AI returned an empty response for polishing.");
    }
    return polishedDescription;
  } catch (error) {
    console.error("Error calling OpenAI API for line item polishing:", error);
    throw new Error(`AI line item polishing failed: ${error.message}`);
  }
}

// server/services/pdf-generator.ts
import puppeteer2 from "puppeteer";
import { format } from "date-fns";
function tryParseJSON(jsonString, defaultValue) {
  if (!jsonString) return defaultValue;
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("Failed to parse JSON string:", e, jsonString);
    return defaultValue;
  }
}
function getFormattedDate(dateInput) {
  if (!dateInput) return "N/A";
  try {
    return format(new Date(dateInput), "MMMM dd, yyyy");
  } catch {
    return "Invalid Date";
  }
}
function formatCurrency(amount) {
  if (amount === null || amount === void 0 || amount === "") return "$0.00";
  const num = parseFloat(String(amount));
  if (isNaN(num)) return "$0.00";
  return `$${num.toFixed(2)}`;
}
function generateHtmlForPdf(estimate, businessProfile, parsedLineItems, customerFullName, customerAddress) {
  const companyLogoHtml = businessProfile.logoUrl ? `<img src="${businessProfile.logoUrl}" alt="${businessProfile.businessName} Logo" style="max-height: 80px; max-width: 200px; margin-bottom: 20px;" />` : `<h1 style="font-size: 28px; color: #333; margin-bottom: 10px;">${businessProfile.businessName}</h1>`;
  const businessAddress = `${businessProfile.address || ""}<br />
    ${businessProfile.city || ""}, ${businessProfile.state || ""} ${businessProfile.zipCode || ""}`.trim();
  const subtotal = parsedLineItems.reduce((sum4, item) => sum4 + item.quantity * item.rate, 0);
  const discountAmount = parseFloat(String(estimate.discountAmount || 0));
  const taxAmount = parseFloat(String(estimate.taxAmount || 0));
  const totalAmount = parseFloat(String(estimate.totalAmount || 0));
  const depositAmount = parseFloat(String(estimate.depositAmount || 0));
  let credentialsHtml = "";
  if (estimate.includeLicense && businessProfile.licenseNumbers) {
    credentialsHtml += `<p style="font-size: 9px; margin-top: 3px;">License(s): ${businessProfile.licenseNumbers}</p>`;
  }
  if (estimate.includeInsurance && businessProfile.insuranceInfo) {
    credentialsHtml += `<p style="font-size: 9px; margin-top: 3px;">Insurance: ${businessProfile.insuranceInfo}</p>`;
  }
  if (estimate.includeCerts && businessProfile.certifications) {
    credentialsHtml += `<p style="font-size: 9px; margin-top: 3px;">Certifications: ${businessProfile.certifications}</p>`;
  }
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Estimate ${estimate.estimateNumber || estimate.id}</title>
        <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 0; color: #333; font-size: 11px; line-height: 1.5; }
            .container { padding: 40px; }
            .header, .footer { text-align: center; }
            .header { border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
            .footer { border-top: 1px solid #eee; padding-top: 20px; margin-top: 40px; font-size: 9px; color: #777; }
            .company-details p, .customer-details p { margin: 0 0 3px 0; }
            .estimate-info { text-align: right; }
            .estimate-info h2 { font-size: 24px; color: #FB923C; margin: 0 0 5px 0; text-transform: uppercase; }
            .estimate-info p { margin: 0 0 3px 0; }
            .grid-container { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
            .section-title { font-size: 16px; font-weight: bold; color: #FB923C; margin-top: 30px; margin-bottom: 10px; border-bottom: 1px solid #FB923C; padding-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f9f9f9; font-weight: bold; }
            .line-items td.description { width: 50%; }
            .line-items td.number { text-align: right; width: 12%; }
            .pricing-summary { margin-top: 30px; width: 50%; margin-left: auto; }
            .pricing-summary td { border: none; padding: 5px 0; }
            .pricing-summary td.label { font-weight: bold; }
            .pricing-summary td.value { text-align: right; }
            .pricing-summary tr.total td { font-size: 14px; font-weight: bold; border-top: 2px solid #333; padding-top: 10px; }
            .terms, .notes { margin-top: 30px; font-size: 10px; white-space: pre-wrap; }
            .signature-section { margin-top: 50px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
            .signature-box { border-top: 1px solid #333; padding-top: 10px; }
            .signature-box p { margin: 0; font-size: 10px; }
            .signature-box .date { margin-top: 30px; }
            .logo-container { text-align: left; }
            .watermark {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 72px;
              color: rgba(0, 0, 0, 0.08);
              font-weight: bold;
              z-index: -1;
              pointer-events: none;
            }
        </style>
    </head>
    <body>
        <div class="container">
            ${estimate.status === "draft" ? '<div class="watermark">DRAFT</div>' : ""}
            ${estimate.status === "rejected" ? '<div class="watermark">REJECTED</div>' : ""}
            ${estimate.status === "expired" ? '<div class="watermark">EXPIRED</div>' : ""}

            <div class="grid-container">
                <div class="company-details logo-container">
                    ${companyLogoHtml}
                    <p><strong>${businessProfile.businessName}</strong></p>
                    <p>${businessAddress.replace("<br />", "<br>")}</p>
                    <p>Phone: ${businessProfile.phone || "N/A"}</p>
                    <p>Email: ${businessProfile.email || "N/A"}</p>
                    ${businessProfile.website ? `<p>Website: ${businessProfile.website}</p>` : ""}
                </div>
                <div class="estimate-info">
                    <h2>Estimate</h2>
                    <p><strong>Estimate #:</strong> ${estimate.estimateNumber || `EST-${estimate.id}`}</p>
                    <p><strong>Date Prepared:</strong> ${getFormattedDate(estimate.createdAt)}</p>
                    ${estimate.validUntil ? `<p><strong>Valid Until:</strong> ${getFormattedDate(estimate.validUntil)}</p>` : ""}
                </div>
            </div>

            <div class="section-title">Customer Information</div>
            <div class="customer-details">
                <p><strong>To:</strong> ${customerFullName}</p>
                <p>${customerAddress.replace("<br />", "<br>")}</p>
            </div>

            <div class="section-title">Project Details</div>
            <p><strong>${estimate.title || "Project Estimate"}</strong></p>
            ${estimate.description ? `<p style="font-size: 10px; white-space: pre-wrap;">${estimate.description}</p>` : ""}

            <div class="section-title">Line Items</div>
            <table class="line-items">
                <thead>
                    <tr>
                        <th class="description">Description</th>
                        <th>Qty</th>
                        <th>Unit</th>
                        <th class="number">Rate</th>
                        <th class="number">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${parsedLineItems.map((item) => `
                        <tr>
                            <td class="description">${item.description}</td>
                            <td>${item.quantity}</td>
                            <td>${item.unit}</td>
                            <td class="number">${formatCurrency(item.rate)}</td>
                            <td class="number">${formatCurrency(item.amount)}</td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>

            <table class="pricing-summary">
                <tbody>
                    <tr>
                        <td class="label">Subtotal:</td>
                        <td class="value">${formatCurrency(subtotal)}</td>
                    </tr>
                    ${discountAmount > 0 ? `
                        <tr>
                            <td class="label">Discount:</td>
                            <td class="value">-${formatCurrency(discountAmount)}</td>
                        </tr>` : ""}
                    ${taxAmount > 0 ? `
                        <tr>
                            <td class="label">Tax (${(estimate.taxRate || 0).toFixed(2)}%):</td>
                            <td class="value">${formatCurrency(taxAmount)}</td>
                        </tr>` : ""}
                    <tr class="total">
                        <td class="label">Total:</td>
                        <td class="value">${formatCurrency(totalAmount)}</td>
                    </tr>
                    ${depositAmount > 0 ? `
                        <tr>
                            <td class="label" style="font-size: 12px;">Deposit Due:</td>
                            <td class="value" style="font-size: 12px;">${formatCurrency(depositAmount)}</td>
                        </tr>` : ""}
                </tbody>
            </table>
            
            ${estimate.notesForCustomer ? `
                <div class="section-title notes">Notes for Customer</div>
                <p class="notes">${estimate.notesForCustomer}</p>
            ` : ""}

            ${estimate.termsAndConditions ? `
                <div class="section-title terms">Terms & Conditions</div>
                <p class="terms">${estimate.termsAndConditions}</p>
            ` : ""}

            <div class="signature-section">
                <div class="signature-box">
                    <p>Customer Signature:</p>
                    <div style="height: 60px; border-bottom: 1px solid #ccc; margin-bottom: 5px;">
                        ${estimate.customerSignatureUrl ? `<img src="${estimate.customerSignatureUrl}" alt="Customer Signature" style="max-height: 50px; display: block; margin-top: 5px;" />` : ""}
                    </div>
                    <p class="date">Date:</p>
                </div>
                <div class="signature-box">
                    <p>${businessProfile.businessName} Representative:</p>
                     <div style="height: 60px; border-bottom: 1px solid #ccc; margin-bottom: 5px;">
                        ${estimate.companySignatureUrl ? `<img src="${estimate.companySignatureUrl}" alt="Company Signature" style="max-height: 50px; display: block; margin-top: 5px;" />` : ""}
                    </div>
                    <p class="date">Date:</p>
                </div>
            </div>

            <div class="footer">
                <p>Thank you for your business!</p>
                ${credentialsHtml}
                <p>${businessProfile.businessName} | ${businessAddress.replace("<br />", " ")} | Phone: ${businessProfile.phone} | Email: ${businessProfile.email}</p>
            </div>
        </div>
    </body>
    </html>
  `;
}
async function generateEstimatePdf(estimateData, businessProfileData, customerData) {
  if (!process.env.CHROME_PATH && process.env.NODE_ENV === "production") {
    console.warn("CHROME_PATH environment variable is not set. PDF generation might fail in production.");
  }
  let browser;
  try {
    const parsedLineItems = tryParseJSON(estimateData.items, []);
    const customerFullName = customerData.fullName || "Valued Customer";
    const customerAddress = `${customerData.addressLine1 || ""}<br />${customerData.cityStateZip || ""}`.trim();
    const htmlContent = generateHtmlForPdf(estimateData, businessProfileData, parsedLineItems, customerFullName, customerAddress);
    const launchOptions = {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
    };
    if (process.env.CHROME_PATH) {
      launchOptions.executablePath = process.env.CHROME_PATH;
    }
    browser = await puppeteer2.launch(launchOptions);
    const page = await browser.newPage();
    await page.emulateMediaType("screen");
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    const pdfOptions = {
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        right: "20mm",
        bottom: "20mm",
        left: "20mm"
      }
    };
    const pdfBuffer = await page.pdf(pdfOptions);
    return pdfBuffer;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error(`PDF generation failed: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// server/routes/estimates.ts
var router2 = express3.Router();
var updateEstimateSchema = insertEstimateSchema.partial().omit({
  status: true,
  sentAt: true,
  respondedAt: true,
  jobId: true,
  // Job linking should be explicit
  estimateNumber: true,
  // Usually not changed after creation
  version: true
  // Versioning handled by creating new estimates for revisions/change orders
});
router2.post("/ai/generate-draft", authorize(["canManageEstimatesInvoices"]), async (req, res, next) => {
  try {
    const validatedRequest = GenerateDraftEstimateRequestSchema.parse(req.body);
    const draftEstimate = await generateDraftEstimate(validatedRequest);
    res.status(200).json(draftEstimate);
  } catch (error) {
    if (error instanceof z5.ZodError) {
      return res.status(400).json({ message: "Validation failed for AI draft request", errors: fromZodError3(error).details });
    }
    console.error("AI Draft Generation Error:", error);
    next(error);
  }
});
router2.post("/ai/polish-line-item", authorize(["canManageEstimatesInvoices"]), async (req, res, next) => {
  try {
    const validatedRequest = PolishLineItemRequestSchema.parse(req.body);
    const polishedDescription = await polishLineItem(validatedRequest);
    res.status(200).json({ polishedDescription });
  } catch (error) {
    if (error instanceof z5.ZodError) {
      return res.status(400).json({ message: "Validation failed for AI polish request", errors: fromZodError3(error).details });
    }
    console.error("AI Polish Line Item Error:", error);
    next(error);
  }
});
router2.post("/", authorize(["canManageEstimatesInvoices"]), async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (payload.items && typeof payload.items !== "string") {
      payload.items = JSON.stringify(payload.items);
    } else if (!payload.items) {
      payload.items = JSON.stringify([]);
    }
    if (!payload.estimateNumber) {
      payload.estimateNumber = `EST-${Date.now().toString().slice(-6)}`;
    }
    payload.version = payload.version || 1;
    payload.status = payload.status || "draft";
    const validatedData = insertEstimateSchema.parse(payload);
    const newEstimateArray = await db.insert(estimates).values(validatedData).returning();
    if (newEstimateArray.length === 0) {
      return res.status(500).json({ message: "Failed to create estimate" });
    }
    res.status(201).json(newEstimateArray[0]);
  } catch (error) {
    if (error instanceof z5.ZodError) {
      return res.status(400).json({ message: "Validation failed", errors: fromZodError3(error).details });
    }
    next(error);
  }
});
router2.get("/", authorize(["canManageEstimatesInvoices"]), async (req, res, next) => {
  try {
    const {
      customerId,
      jobId,
      status,
      search,
      page = "1",
      pageSize = "15"
    } = req.query;
    const pageNumber = parseInt(page, 10);
    const limit = parseInt(pageSize, 10);
    const offset = (pageNumber - 1) * limit;
    const conditions = [];
    if (customerId) conditions.push(eq10(estimates.customerId, parseInt(customerId, 10)));
    if (jobId) conditions.push(eq10(estimates.jobId, parseInt(jobId, 10)));
    if (status) conditions.push(eq10(estimates.status, status));
    if (search) {
      const searchString = `%${search.toLowerCase()}%`;
      conditions.push(
        or8(
          ilike7(estimates.title, searchString),
          ilike7(estimates.description, searchString),
          ilike7(estimates.estimateNumber, searchString)
        )
      );
    }
    const combinedCondition = conditions.length > 0 ? and6(...conditions) : void 0;
    const data = await db.select().from(estimates).where(combinedCondition).orderBy(desc9(estimates.createdAt)).limit(limit).offset(offset);
    const totalResult = await db.select({ totalCount: count9() }).from(estimates).where(combinedCondition);
    const totalCount = totalResult[0]?.totalCount || 0;
    res.json({ data, totalCount });
  } catch (error) {
    next(error);
  }
});
router2.get("/:id/pdf", authorize(["canManageEstimatesInvoices"]), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid estimate ID" });
    const estimateArr = await db.select().from(estimates).where(eq10(estimates.id, id)).limit(1);
    if (estimateArr.length === 0) return res.status(404).json({ message: "Estimate not found" });
    const estimate = estimateArr[0];
    const bpArr = await db.select().from(businessProfiles).limit(1);
    if (bpArr.length === 0) return res.status(500).json({ message: "Business profile not configured" });
    const businessProfile = bpArr[0];
    const custArr = await db.select().from(contacts).where(eq10(contacts.id, estimate.customerId)).limit(1);
    const customer = custArr[0];
    const customerData = customer ? {
      fullName: `${customer.firstName} ${customer.lastName}`.trim(),
      addressLine1: customer.address || "",
      cityStateZip: `${customer.city || ""}, ${customer.state || ""} ${customer.zipCode || ""}`.trim()
    } : { fullName: "Valued Customer", addressLine1: "", cityStateZip: "" };
    const pdfBuffer = await generateEstimatePdf(estimate, businessProfile, customerData);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="estimate-${estimate.estimateNumber || estimate.id}.pdf"`
    );
    res.send(pdfBuffer);
  } catch (error) {
    console.error("PDF generation error:", error);
    next(error);
  }
});
router2.get("/:id", authorize(["canManageEstimatesInvoices"]), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid estimate ID" });
    const estimateArray = await db.select().from(estimates).where(eq10(estimates.id, id)).limit(1);
    if (estimateArray.length === 0) {
      return res.status(404).json({ message: "Estimate not found" });
    }
    res.json(estimateArray[0]);
  } catch (error) {
    next(error);
  }
});
router2.patch("/:id", authorize(["canManageEstimatesInvoices"]), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid estimate ID" });
    const payload = { ...req.body };
    if (payload.items && typeof payload.items !== "string") {
      payload.items = JSON.stringify(payload.items);
    }
    const validatedData = updateEstimateSchema.parse(payload);
    if (Object.keys(validatedData).length === 0) {
      return res.status(400).json({ message: "No valid fields provided for update." });
    }
    const updatedEstimateArray = await db.update(estimates).set(validatedData).where(eq10(estimates.id, id)).returning();
    if (updatedEstimateArray.length === 0) {
      return res.status(404).json({ message: "Estimate not found or no changes applied" });
    }
    res.json(updatedEstimateArray[0]);
  } catch (error) {
    if (error instanceof z5.ZodError) {
      return res.status(400).json({ message: "Validation failed", errors: fromZodError3(error).details });
    }
    next(error);
  }
});
router2.delete("/:id", authorizeRole(["owner" /* OWNER */, "manager" /* MANAGER */]), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid estimate ID" });
    const result = await db.delete(estimates).where(eq10(estimates.id, id)).returning({ id: estimates.id });
    if (result.length === 0) {
      return res.status(404).json({ message: "Estimate not found" });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
router2.patch("/:id/send", authorize(["canManageEstimatesInvoices"]), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid estimate ID" });
    const updatedEstimateArray = await db.update(estimates).set({ status: "sent", sentAt: /* @__PURE__ */ new Date() }).where(and6(eq10(estimates.id, id), or8(eq10(estimates.status, "draft"), eq10(estimates.status, "revised")))).returning();
    if (updatedEstimateArray.length === 0) {
      return res.status(404).json({ message: "Estimate not found or not in a sendable state (e.g., already sent/approved)." });
    }
    res.json(updatedEstimateArray[0]);
  } catch (error) {
    next(error);
  }
});
router2.patch("/:id/approve", authorize(["canManageEstimatesInvoices"]), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid estimate ID" });
    const updatedEstimateArray = await db.update(estimates).set({ status: "approved", respondedAt: /* @__PURE__ */ new Date() }).where(and6(eq10(estimates.id, id), eq10(estimates.status, "sent"))).returning();
    if (updatedEstimateArray.length === 0) {
      return res.status(404).json({ message: "Estimate not found or not in an approvable state (e.g., not sent)." });
    }
    res.json(updatedEstimateArray[0]);
  } catch (error) {
    next(error);
  }
});
router2.patch("/:id/reject", authorize(["canManageEstimatesInvoices"]), async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid estimate ID" });
    const updatedEstimateArray = await db.update(estimates).set({ status: "rejected", respondedAt: /* @__PURE__ */ new Date() }).where(and6(eq10(estimates.id, id), eq10(estimates.status, "sent"))).returning();
    if (updatedEstimateArray.length === 0) {
      return res.status(404).json({ message: "Estimate not found or not in a rejectable state (e.g., not sent)." });
    }
    res.json(updatedEstimateArray[0]);
  } catch (error) {
    next(error);
  }
});
router2.post("/:id/convert-to-job", authorize(["canCreateAssignJobs"]), async (req, res, next) => {
  try {
    const estimateId = parseInt(req.params.id, 10);
    if (isNaN(estimateId)) return res.status(400).json({ message: "Invalid estimate ID" });
    const estimateArray = await db.select().from(estimates).where(eq10(estimates.id, estimateId)).limit(1);
    if (estimateArray.length === 0) {
      return res.status(404).json({ message: "Estimate not found" });
    }
    const estimateData = estimateArray[0];
    if (estimateData.status !== "approved") {
      return res.status(400).json({ message: "Estimate must be approved before converting to a job." });
    }
    if (estimateData.jobId) {
      return res.status(400).json({ message: "Estimate already converted to a job (ID: " + estimateData.jobId + ")." });
    }
    const jobPayload = {
      customerId: estimateData.customerId,
      title: estimateData.title || `Job for Estimate ${estimateData.estimateNumber}`,
      description: estimateData.description || `Work as per estimate ${estimateData.estimateNumber}`,
      status: "pending",
      // Default status for new jobs
      serviceType: estimateData.aiGenerationMetadata ? JSON.parse(estimateData.aiGenerationMetadata).serviceType : "general",
      // Placeholder, improve service type mapping
      estimatedValue: estimateData.totalAmount,
      // Map totalAmount to estimatedValue
      // scheduledDate, assignedTechnicianId, etc., can be set later or passed in req.body
      ...req.body
      // Allow overriding or adding job-specific fields from request
    };
    const newJobArray = await db.insert(jobs).values(jobPayload).returning();
    if (newJobArray.length === 0) {
      return res.status(500).json({ message: "Failed to create job from estimate" });
    }
    const newJob = newJobArray[0];
    await db.update(estimates).set({ jobId: newJob.id }).where(eq10(estimates.id, estimateId));
    res.status(201).json(newJob);
  } catch (error) {
    if (error instanceof z5.ZodError) {
      return res.status(400).json({ message: "Job data validation failed", errors: fromZodError3(error).details });
    }
    next(error);
  }
});
var estimates_default = router2;

// server/index.ts
var app = express4();
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      // unsafe-eval needed for Vite dev
      connectSrc: ["'self'", "ws:", "wss:", "https:"]
    }
  },
  crossOriginEmbedderPolicy: false
  // Needed for some development tools
}));
app.use(cors({
  origin: process.env.NODE_ENV === "production" ? [process.env.REPLIT_URL || "https://*.replit.app", "https://*.replit.dev"] : ["http://localhost:5000", "http://127.0.0.1:5000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
var limiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 100,
  // Limit each IP to 100 requests per windowMs
  message: { error: "Too many requests from this IP, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting in development, configure for production proxy
  skip: process.env.NODE_ENV === "development" ? () => true : void 0,
  trustProxy: process.env.NODE_ENV === "production"
});
var authLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 5,
  // Limit auth attempts
  message: { error: "Too many authentication attempts, please try again later." },
  skipSuccessfulRequests: true,
  skip: process.env.NODE_ENV === "development" ? () => true : void 0,
  trustProxy: process.env.NODE_ENV === "production"
});
app.use("/api/", limiter);
app.use("/api/auth/", authLimiter);
app.use(express4.json({ limit: "50mb" }));
app.use(express4.urlencoded({ extended: false, limit: "50mb" }));
app.use("/api/contacts", contacts_default);
app.use("/api/estimates", estimates_default);
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
app.get("/design-mockup.html", (req, res) => {
  res.sendFile("design-mockup.html", { root: "." });
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();

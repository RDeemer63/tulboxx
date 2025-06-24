// archived/shared/legacy_schema_definitions.ts
// This file contains definitions for database tables that are considered legacy
// and have been superseded by newer structures in the main schema.ts file.
// These definitions are preserved for historical reference and to understand
// past data structures during any potential data migration or analysis.
// Do NOT use these definitions for new development.

import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  decimal,
  varchar,
  // index, // Not typically needed for archived definitions unless for context
} from "drizzle-orm/pg-core";
// Import 'relations' if any legacy relations specific to these tables need to be documented.
// For simplicity, focusing on table structure.
// import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Placeholder types for referenced tables that are assumed to be defined in the active schema.ts
// This avoids re-defining active tables in this legacy file.
// Actual foreign key constraints in the database would still point to the active tables.
const customers = pgTable("contacts", { id: serial("id").primaryKey() }); // Simplified placeholder
const jobs = pgTable("jobs", { id: serial("id").primaryKey() }); // Simplified placeholder
const employees = pgTable("employees", { id: serial("id").primaryKey() }); // Simplified placeholder

/*
 * --------------------------------------------------------------------------
 * Legacy 'estimates' Table Definition
 * --------------------------------------------------------------------------
 * Status: LEGACY - Superseded by 'modern_estimates' table.
 * Reason: The 'modern_estimates' table provides a more structured and extensible
 *         approach to managing estimates, including better support for line items,
 *         versioning, and templates. The 'items' field in this legacy table
 *         was often a JSON string, which is less queryable and harder to maintain.
 * Action: Data from this table should have been migrated to 'modern_estimates'.
 *         This definition is for reference only.
 */
export const estimates = pgTable("estimates", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id, { onDelete: 'cascade' }).notNull(),
  jobId: integer("job_id").references(() => jobs.id, { onDelete: 'set null' }),
  parentEstimateId: integer("parent_estimate_id").references(() => estimates.id, { onDelete: 'set null' }), // Self-reference for versioning
  estimateNumber: text("estimate_number"),
  title: text("title").notNull(),
  description: text("description"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  type: varchar("type", { length: 50 }).notNull().default("original"),
  version: integer("version").notNull().default(1),
  changeReason: text("change_reason"),
  validUntil: timestamp("valid_until"),
  sentAt: timestamp("sent_at"),
  respondedAt: timestamp("responded_at"),
  items: text("items"), // Often stored as a JSON string in legacy system
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).default("0"),
  discountType: varchar("discount_type", { length: 20 }).default("none"), // e.g., "none", "percentage", "fixed"
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).default("0"),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0"),
  taxRate: decimal("tax_rate", { precision: 5, scale: 4 }).default("0"), // e.g., 0.08 for 8%
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0"),
  depositType: varchar("deposit_type", { length: 20 }).default("none"), // e.g., "none", "percentage", "fixed"
  depositValue: decimal("deposit_value", { precision: 10, scale: 2 }).default("0"),
  depositAmount: decimal("deposit_amount", { precision: 10, scale: 2 }).default("0"),
  customerSignatureUrl: text("customer_signature_url"),
  companySignatureUrl: text("company_signature_url"),
  includeLicense: boolean("include_license").default(false),
  includeInsurance: boolean("include_insurance").default(false),
  includeCerts: boolean("include_certs").default(false),
  termsAndConditions: text("terms_and_conditions"),
  notesForCustomer: text("notes_for_customer"),
  fieldNotes: text("field_notes"),
  projectDescription: text("project_description"),
  scopeOfWork: text("scope_of_work"),
  warrantiesAndBenefits: text("warranties_and_benefits"),
  aiGenerationMetadata: text("ai_generation_metadata"), // For estimates generated or assisted by AI
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

/**
 * LEGACY Zod schema for inserting into the old 'estimates' table.
 * Superseded by 'insertModernEstimateSchema'.
 */
export const insertEstimateSchema = createInsertSchema(estimates, {
  // Override default Zod types if necessary, e.g., for numbers from strings
  totalAmount: z.union([z.string(), z.number()]).transform(val => String(val)),
  subtotal: z.union([z.string(), z.number()]).optional().transform(val => val !== undefined ? String(val) : undefined),
  discountValue: z.union([z.string(), z.number()]).optional().transform(val => val !== undefined ? String(val) : undefined),
  discountAmount: z.union([z.string(), z.number()]).optional().transform(val => val !== undefined ? String(val) : undefined),
  taxRate: z.union([z.string(), z.number()]).optional().transform(val => val !== undefined ? String(val) : undefined),
  taxAmount: z.union([z.string(), z.number()]).optional().transform(val => val !== undefined ? String(val) : undefined),
  depositValue: z.union([z.string(), z.number()]).optional().transform(val => val !== undefined ? String(val) : undefined),
  depositAmount: z.union([z.string(), z.number()]).optional().transform(val => val !== undefined ? String(val) : undefined),
}).omit({
  id: true, // Usually auto-generated
  createdAt: true, // Usually set by DB
  updatedAt: true, // Usually set by DB
});

/**
 * LEGACY TypeScript type for selecting from the old 'estimates' table.
 * Superseded by 'ModernEstimate'.
 */
export type Estimate = typeof estimates.$inferSelect;

/**
 * LEGACY TypeScript type for inserting into the old 'estimates' table.
 * Superseded by 'InsertModernEstimate'.
 */
export type InsertEstimate = z.infer<typeof insertEstimateSchema>;


/*
 * --------------------------------------------------------------------------
 * Legacy 'permissions' Table Definition
 * --------------------------------------------------------------------------
 * Status: LEGACY - Superseded by the 'users.role' field and potentially a more
 *         granular RBAC system if 'employeePermissions' is also being phased out
 *         or refined. This table represents an older, very granular approach to permissions.
 * Reason: Modern RBAC often relies on roles with associated permissions rather than
 *         assigning numerous boolean flags directly to each employee/user.
 *         The 'users' table now has a 'role' field, and the 'employeePermissions'
 *         table might be a more current granular system if still in use.
 * Action: This table structure is preserved for reference. New permission checks
 *         should use the role-based system.
 */
export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").references(() => employees.id, { onDelete: 'cascade' }).notNull(),
  canViewRevenue: boolean("can_view_revenue").default(false).notNull(),
  canViewProfitMargins: boolean("can_view_profit_margins").default(false).notNull(),
  canViewEmployeeWages: boolean("can_view_employee_wages").default(false).notNull(),
  canViewJobCosts: boolean("can_view_job_costs").default(false).notNull(),
  canEditPricing: boolean("can_edit_pricing").default(false).notNull(),
  canAccessFinancialReports: boolean("can_access_financial_reports").default(false).notNull(),
  canViewAllEmployees: boolean("can_view_all_employees").default(false).notNull(),
  canEditEmployeeInfo: boolean("can_edit_employee_info").default(false).notNull(),
  canManageSchedules: boolean("can_manage_schedules").default(false).notNull(),
  canApproveTimeEntries: boolean("can_approve_time_entries").default(false).notNull(),
  canViewPerformanceMetrics: boolean("can_view_performance_metrics").default(false).notNull(),
  canViewAllCustomers: boolean("can_view_all_customers").default(false).notNull(),
  canEditCustomerInfo: boolean("can_edit_customer_info").default(false).notNull(),
  canCreateAssignJobs: boolean("can_create_assign_jobs").default(false).notNull(),
  canAccessPaymentHistory: boolean("can_access_payment_history").default(false).notNull(),
  canManageEstimatesInvoices: boolean("can_manage_estimates_invoices").default(false).notNull(),
  canManageUserRoles: boolean("can_manage_user_roles").default(false).notNull(), // This indicates a shift towards roles
  canAccessSystemSettings: boolean("can_access_system_settings").default(false).notNull(),
  canExportData: boolean("can_export_data").default(false).notNull(),
  canManageIntegrations: boolean("can_manage_integrations").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
});

/**
 * LEGACY Zod schema for inserting into the old 'permissions' table.
 */
export const insertPermissionsSchema = createInsertSchema(permissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

/**
 * LEGACY TypeScript type for selecting from the old 'permissions' table.
 */
export type Permission = typeof permissions.$inferSelect;

/**
 * LEGACY TypeScript type for inserting into the old 'permissions' table.
 */
export type InsertPermission = z.infer<typeof insertPermissionsSchema>;

// Add other legacy table definitions here as they are identified and archived.
// Example:
// /*
//  * --------------------------------------------------------------------------
//  * Legacy 'another_old_table' Table Definition
//  * --------------------------------------------------------------------------
//  * Status: LEGACY - Superseded by 'new_table_structure'.
//  * Reason: ...
//  * Action: ...
//  */
// export const anotherOldTable = pgTable("another_old_table", {
//   // ...fields
// });
// export type AnotherOldTableType = typeof anotherOldTable.$inferSelect;
// export type InsertAnotherOldTableType = typeof anotherOldTable.$inferInsert;

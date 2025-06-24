import {
  pgTable,
  text,
  varchar,
  timestamp,
  pgEnum,
  uuid,
  integer,
  jsonb,
  date,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Import schemas from other files to define relationships
import { businessProfiles } from "./business-profile-schema";
import { users, contacts } from "./schema"; // Assuming these are in the main schema file

// =================================================================
// Enums for Database Constraints
// =================================================================

export const leadSourceEnum = pgEnum("lead_source_enum", [
  "Website",
  "Referral",
  "Social Media",
  "Walk-up",
  "Advertisement",
  "Other",
]);

export const leadStageEnum = pgEnum("lead_stage_enum", [
  "New",
  "Contacted",
  "Qualified",
  "Proposal",
  "Won",
  "Lost",
]);

export const leadEventTypeEnum = pgEnum("lead_event_type_enum", [
  "note",
  "call_log",
  "email_sent",
  "meeting_log",
  "status_change",
  "estimate_created",
  "file_upload",
]);

// =================================================================
// Leads Table Definition
// =================================================================

export const leads = pgTable(
  "leads",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    businessProfileId: integer("business_profile_id")
      .references(() => businessProfiles.id, { onDelete: "cascade" })
      .notNull(),
    leadName: varchar("lead_name", { length: 128 }).notNull(),
    phone: varchar("phone", { length: 20 }),
    email: varchar("email", { length: 128 }),
    serviceType: varchar("service_type", { length: 100 }),
    source: leadSourceEnum("source").default("Other"),
    stage: leadStageEnum("stage").default("New").notNull(),
    notes: text("notes"),
    followUpDate: date("follow_up_date"),
    assignedTo: varchar("assigned_to").references(() => users.id, {
      onDelete: "set null",
    }),
    originContactId: integer("origin_contact_id").references(() => contacts.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    // Add indexes for frequently queried columns
    stageIdx: index("leads_stage_idx").on(table.stage),
    sourceIdx: index("leads_source_idx").on(table.source),
    assignedToIdx: index("leads_assigned_to_idx").on(table.assignedTo),
    businessProfileIdx: index("leads_business_profile_idx").on(
      table.businessProfileId
    ),
  })
);

// =================================================================
// Lead Events (Timeline) Table Definition
// =================================================================

export const leadEvents = pgTable(
  "lead_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    leadId: uuid("lead_id")
      .references(() => leads.id, { onDelete: "cascade" })
      .notNull(),
    type: leadEventTypeEnum("type").notNull(),
    content: text("content").notNull(),
    meta: jsonb("meta").$type<{
      fromStage?: z.infer<typeof leadStageEnum.enum>;
      toStage?: z.infer<typeof leadStageEnum.enum>;
      fileName?: string;
      estimateId?: string;
    }>(),
    createdBy: varchar("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    leadIdIdx: index("lead_events_lead_id_idx").on(table.leadId),
  })
);

// =================================================================
// Drizzle ORM Relations
// =================================================================

export const leadsRelations = relations(leads, ({ one, many }) => ({
  businessProfile: one(businessProfiles, {
    fields: [leads.businessProfileId],
    references: [businessProfiles.id],
  }),
  assignedToUser: one(users, {
    fields: [leads.assignedTo],
    references: [users.id],
  }),
  originContact: one(contacts, {
    fields: [leads.originContactId],
    references: [contacts.id],
  }),
  events: many(leadEvents),
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

// =================================================================
// Zod Schemas for Validation
// =================================================================

export const insertLeadSchema = createInsertSchema(leads, {
  // Add specific Zod refinements for validation
  leadName: z.string().min(2, "Lead name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address.").optional().or(z.literal("")),
  phone: z.string().optional(),
  followUpDate: z.string().date("Invalid date format.").optional().nullable(),
}).omit({
  // Omit fields that are auto-generated or managed by the system
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeadEventSchema = createInsertSchema(leadEvents, {
  content: z.string().min(1, "Event content cannot be empty."),
}).omit({
  id: true,
  createdAt: true,
});

export const selectLeadSchema = createSelectSchema(leads);
export const selectLeadEventSchema = createSelectSchema(leadEvents);

// =================================================================
// TypeScript Types
// =================================================================

export type Lead = z.infer<typeof selectLeadSchema>;
export type InsertLead = z.infer<typeof insertLeadSchema>;

export type LeadEvent = z.infer<typeof selectLeadEventSchema>;
export type InsertLeadEvent = z.infer<typeof insertLeadEventSchema>;

export type LeadSource = z.infer<typeof leadSourceEnum.enum>;
export type LeadStage = z.infer<typeof leadStageEnum.enum>;
export type LeadEventType = z.infer<typeof leadEventTypeEnum.enum>;

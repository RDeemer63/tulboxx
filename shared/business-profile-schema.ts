import {
  pgTable,
  serial,
  text,
  varchar,
  boolean,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./schema"; // Assuming users table is in the main schema file

// =================================================================
// Drizzle ORM Table Definition
// =================================================================

export const businessProfiles = pgTable("business_profiles", {
  id: serial("id").primaryKey(),

  // --- Company Info ---
  businessName: varchar("business_name", { length: 128 }).notNull(),
  ownerName: varchar("owner_name", { length: 128 }),
  email: varchar("email", { length: 128 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  website: varchar("website", { length: 255 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  zipCode: varchar("zip_code", { length: 20 }),
  yearFounded: integer("year_founded"),
  businessStructure: varchar("business_structure", { length: 50 }),
  serviceArea: text("service_area"),
  companyTagline: varchar("company_tagline", { length: 255 }),
  companyBio: text("company_bio"),
  businessType: varchar("business_type", { length: 100 }), // e.g., "Landscaping", "Plumbing"
  serviceSpecialties: text("service_specialties"),
  uniqueSellingPoints: text("unique_selling_points"),

  // --- Branding ---
  logoUrl: text("logo_url"),
  primaryColor: varchar("primary_color", { length: 10 }), // e.g., '#0070D2'
  accentColor: varchar("accent_color", { length: 10 }), // e.g., '#FF8C00'

  // --- Legal Info ---
  licenseNumbers: text("license_numbers"),
  insuranceInfo: text("insurance_info"),
  certifications: text("certifications"),
  legalFooterText: text("legal_footer_text"),
  defaultEstimateTerms: text("default_estimate_terms"),
  defaultInvoiceTerms: text("default_invoice_terms"),

  // --- AI Preferences ---
  brandVoice: varchar("brand_voice", { length: 50 }), // e.g., "Professional", "Friendly"
  communicationStyle: varchar("communication_style", { length: 50 }), // e.g., "Concise", "Detailed"
  targetCustomers: text("target_customers"), // Description of ideal customer
  aiEstimateGeneration: boolean("ai_estimate_generation").default(true),
  aiSocialMediaGeneration: boolean("ai_social_media_generation").default(false),

  // --- Timestamps ---
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// =================================================================
// Drizzle ORM Relations
// =================================================================

export const businessProfilesRelations = relations(
  businessProfiles,
  ({ many }) => ({
    // A business profile can have multiple users (employees)
    users: many(users),
  })
);

// =================================================================
// Zod Schemas for Validation
// =================================================================

export const insertBusinessProfileSchema = createInsertSchema(businessProfiles, {
  // Add specific Zod refinements for validation
  email: z.string().email("Please enter a valid email address."),
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters."),
  website: z.string().url("Please enter a valid URL.").optional().or(z.literal("")),
  yearFounded: z
    .number()
    .int()
    .min(1800)
    .max(new Date().getFullYear())
    .optional(),
  primaryColor: z.string().regex(/^#([0-9a-f]{3}){1,2}$/i, "Invalid hex color.").optional(),
  accentColor: z.string().regex(/^#([0-9a-f]{3}){1,2}$/i, "Invalid hex color.").optional(),
}).omit({
  // Omit fields that are auto-generated or managed by the system
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectBusinessProfileSchema = createSelectSchema(businessProfiles);

// =================================================================
// TypeScript Types
// =================================================================

export type BusinessProfile = z.infer<typeof selectBusinessProfileSchema>;
export type InsertBusinessProfile = z.infer<typeof insertBusinessProfileSchema>;

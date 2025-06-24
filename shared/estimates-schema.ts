import { z } from 'zod';

export const EstimateStatusEnum = z.enum([
  "draft",
  "sent",
  "approved",
  "declined",
  "archived",
  "converted",
  "revision",
  "superseded", // Indicates this estimate was replaced by a newer version
]);
export type EstimateStatusEnumType = z.infer<typeof EstimateStatusEnum>;

export const EstimateTypeEnum = z.enum([
  "simple",   // A single total price
  "detailed", // Itemized line items
]);
export type EstimateTypeEnumType = z.infer<typeof EstimateTypeEnum>;

export const TemplateVisibilityEnum = z.enum([
  "private",          // Only visible to the creator
  "public",           // Visible to all users in the system (if applicable, e.g., global templates)
  "shared_with_team", // Visible to users within the same organization/team
]);
export type TemplateVisibilityEnumType = z.infer<typeof TemplateVisibilityEnum>;

// It can also be useful to have these as const arrays for direct use in Drizzle's pgEnum or other places
export const ESTIMATE_STATUSES = ["draft", "sent", "approved", "declined", "archived", "converted", "revision", "superseded"] as const;
export const ESTIMATE_TYPES = ["simple", "detailed"] as const;
export const TEMPLATE_VISIBILITIES = ["private", "public", "shared_with_team"] as const;

/**
 * Enumerates where an estimate originated.  Useful for analytics and
 * permission logic.  _Backward-compatible_: if a source is not supplied it
 * defaults to `"direct"`.
 */
export const EstimateSourceEnum = z.enum([
  "lead",        // Generated from a lead-capture record
  "direct",      // Entered manually / ad-hoc
  "repeat",      // Generated for a repeat customer / follow-up work
  "template",    // Created from an internal template
  "ai_draft",    // Auto-generated via AI assistant
]);
export type EstimateSourceEnumType = z.infer<typeof EstimateSourceEnum>;
export const ESTIMATE_SOURCES = [
  "lead",
  "direct",
  "repeat",
  "template",
  "ai_draft",
] as const;

/**
 * Common payment-terms presets surfaced to users when sending an estimate /
 * invoice.  Values match wording that appears on PDF outputs.
 */
export const PaymentTermsEnum = z.enum([
  "due_on_receipt",
  "net_7",
  "net_15",
  "net_30",
  "net_45",
  "net_60",
  "custom",
]);
export type PaymentTermsEnumType = z.infer<typeof PaymentTermsEnum>;
export const PAYMENT_TERMS = [
  "due_on_receipt",
  "net_7",
  "net_15",
  "net_30",
  "net_45",
  "net_60",
  "custom",
] as const;

/**
 * Standardised line-item categories for consistent reporting and margin
 * analysis.  Custom user categories can be layered on later via a separate
 * table but core ones live here for dashboards.
 */
export const LineItemCategoryEnum = z.enum([
  "labor",
  "materials",
  "equipment",
  "permit",
  "subcontractor",
  "other",
]);
export type LineItemCategoryEnumType = z.infer<typeof LineItemCategoryEnum>;
export const LINE_ITEM_CATEGORIES = [
  "labor",
  "materials",
  "equipment",
  "permit",
  "subcontractor",
  "other",
] as const;

/**
 * Tracks how an estimate was signed.  Allows future filtering / reporting and
 * can help with legal audits.
 */
export const SignatureMethodEnum = z.enum([
  "in_person",
  "email_link",
  "mobile_app",
  "uploaded_scan",
]);
export type SignatureMethodEnumType = z.infer<typeof SignatureMethodEnum>;
export const SIGNATURE_METHODS = [
  "in_person",
  "email_link",
  "mobile_app",
  "uploaded_scan",
] as const;

/**
 * Captures the reason a new estimate version was created.  This enables
 * accurate audit logs and helps future analytics on scope creep.
 */
export const VersionReasonEnum = z.enum([
  "scope_change",
  "pricing_update",
  "client_request",
  "internal_revision",
  "other",
]);
export type VersionReasonEnumType = z.infer<typeof VersionReasonEnum>;
export const VERSION_REASONS = [
  "scope_change",
  "pricing_update",
  "client_request",
  "internal_revision",
  "other",
] as const;

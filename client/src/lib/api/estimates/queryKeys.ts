// client/src/lib/api/estimates/queryKeys.ts

/**
 * Centralized React Query keys for the Estimates module.
 *
 * Using a structured approach for query keys ensures consistency,
 * helps prevent collisions, and makes cache invalidation more predictable and targeted.
 *
 * Each key is an array, typically starting with the domain name (e.g., 'estimates'),
 * followed by a more specific identifier (e.g., 'list', 'detail'), and then any
 * dynamic parameters like IDs or filter objects.
 *
 * The `as const` assertion is used to provide TypeScript with the exact tuple type,
 * which is beneficial for type-safe usage with React Query's `queryKey` and
 * invalidation/mutation functions.
 *
 * The `filters` objects passed to list/kanban keys should ideally be stable
 * (e.g., keys sorted alphabetically) if they are constructed dynamically,
 * to ensure React Query treats them as the same key when the filter values are identical.
 * For more complex filter objects, consider serializing them into a stable string.
 */

// Base domain keys
const ESTIMATES_DOMAIN = 'estimates' as const;
const ESTIMATE_TEMPLATES_DOMAIN = 'estimateTemplates' as const;

// Type for filter objects (can be expanded for more type safety based on API params)
// Ideally, this would align with Zod schemas used for API query parameter validation.
type FilterParams = Record<string, any>;

export const estimateQueryKeys = {
  // --- Modern Estimates ---

  /**
   * Key for all lists of estimates.
   * Includes filters for granular caching.
   * Example: estimateQueryKeys.list({ status: 'draft', page: 1 })
   */
  list: (filters: FilterParams = {}) => [ESTIMATES_DOMAIN, 'list', filters] as const,

  /**
   * Key for estimates grouped by stage for Kanban view (if applicable).
   * Includes filters.
   * Example: estimateQueryKeys.kanban({ search: 'Fence Repair' })
   */
  kanban: (filters: FilterParams = {}) => [ESTIMATES_DOMAIN, 'kanban', filters] as const,

  /**
   * Key for a single estimate's detail.
   * Example: estimateQueryKeys.detail('estimate-uuid-123')
   */
  detail: (estimateId: string) => [ESTIMATES_DOMAIN, 'detail', estimateId] as const,

  /**
   * Key for line items associated with a specific estimate.
   * Note: Line items are often fetched as part of `estimateQueryKeys.detail(estimateId)`,
   * but having a separate key can be useful for targeted updates or if line items
   * can be fetched/mutated independently.
   * Example: estimateQueryKeys.lineItems('estimate-uuid-123')
   */
  lineItems: (estimateId: string) => [ESTIMATES_DOMAIN, 'detail', estimateId, 'lineItems'] as const,
  
  /**
   * Key for events associated with a specific estimate.
   * Example: estimateQueryKeys.events('estimate-uuid-123')
   */
  events: (estimateId: string) => [ESTIMATES_DOMAIN, 'detail', estimateId, 'events'] as const,

  /**
   * Key for estimate statistics.
   * Example: estimateQueryKeys.stats()
   */
  stats: () => [ESTIMATES_DOMAIN, 'stats'] as const,

  // --- Estimate Templates ---

  /**
   * Key for all lists of estimate templates.
   * Includes filters.
   * Example: estimateQueryKeys.templatesList({ visibility: 'public' })
   */
  templatesList: (filters: FilterParams = {}) =>
    [ESTIMATE_TEMPLATES_DOMAIN, 'list', filters] as const,

  /**
   * Key for a single estimate template's detail.
   * Example: estimateQueryKeys.templateDetail('template-uuid-456')
   */
  templateDetail: (templateId: string) =>
    [ESTIMATE_TEMPLATES_DOMAIN, 'detail', templateId] as const,

  // --- Helper for invalidating all estimate-related data ---
  // Useful after major changes or for broad refetches.
  allEstimates: () => [ESTIMATES_DOMAIN] as const,
  allTemplates: () => [ESTIMATE_TEMPLATES_DOMAIN] as const,
};

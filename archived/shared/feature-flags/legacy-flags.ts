// archived/shared/feature-flags/legacy-flags.ts

/**
 * Legacy Feature Flags Documentation
 *
 * This file documents feature flags that were historically used within the Tulboxx CRM
 * to manage the transition from older systems/modules to newer ones, or for features
 * that have since become permanently enabled and stable.
 *
 * These flags are now considered **DEPRECATED**. This means:
 * 1. They should always be treated as **ENABLED** in any remaining conditional logic.
 * 2. All `FeatureFlagGuard` components or `useFeatureFlag` hook usages conditional
 *    on these flags should be **REMOVED**, and the guarded content should be
 *    rendered unconditionally.
 * 3. These flag keys will eventually be removed from the active `FeatureFlagKey` enum
 *    and the database `feature_flags` table in a future cleanup pass.
 *
 * The definitions here are for historical reference, to understand past development
 * phases, and to guide the removal of related conditional code.
 */

import { FeatureFlagKey } from "../../../shared/feature-flags-schema"; // Adjusted path for archive

interface LegacyFlagDocumentation {
  key: FeatureFlagKey;
  originalDescription: string;
  deprecatedOn: string; // Date or version when deprecation was decided
  reasonForDeprecation: string;
  impactOnCodebase: string; // Guidance on how to treat existing code using this flag
  currentEffectiveState: true; // Deprecated flags are always effectively true
}

export const LEGACY_FEATURE_FLAGS: LegacyFlagDocumentation[] = [
  {
    key: FeatureFlagKey.NEW_LEADS_MODULE,
    originalDescription: "Enables the new V2 Leads module and navigation.",
    deprecatedOn: "2025-06-20", // Placeholder date, update with actual
    reasonForDeprecation:
      "The V2 Leads module has been stable for a significant period and is now the standard, permanently enabled interface for lead management. The previous leads system (if any) is fully retired.",
    impactOnCodebase:
      "All `FeatureFlagGuard` components and `useFeatureFlag(FeatureFlagKey.NEW_LEADS_MODULE)` hook usages should be removed. The components/routes previously guarded by this flag should now be rendered unconditionally as they represent the default application behavior.",
    currentEffectiveState: true,
  },
  {
    key: FeatureFlagKey.MOBILE_OPTIMIZATIONS,
    originalDescription:
      "Enables specific UI/UX enhancements for mobile devices.",
    deprecatedOn: "2025-06-20", // Placeholder date, update with actual
    reasonForDeprecation:
      "Mobile optimizations are now a core part of the application's responsive design and are permanently active. There is no longer a need to toggle these enhancements off.",
    impactOnCodebase:
      "Any conditional logic or styling (`useFeatureFlag(FeatureFlagKey.MOBILE_OPTIMIZATIONS)`) that toggled mobile-specific UI elements should be simplified. The mobile-optimized versions of components should now be the default or only versions. Remove the flag checks.",
    currentEffectiveState: true,
  },
  // Add other flags here as they become deprecated.
  // Example:
  // {
  //   key: FeatureFlagKey.OLD_FEATURE_X,
  //   originalDescription: "Enabled the experimental feature X.",
  //   deprecatedOn: "YYYY-MM-DD",
  //   reasonForDeprecation: "Feature X was either integrated fully, replaced, or removed.",
  //   impactOnCodebase: "Remove all guards and conditional logic related to OLD_FEATURE_X.",
  //   currentEffectiveState: true,
  // },
];

// Helper function (optional, for use in development or debugging if needed)
export function getLegacyFlagDocumentation(
  key: FeatureFlagKey,
): LegacyFlagDocumentation | undefined {
  return LEGACY_FEATURE_FLAGS.find((flagDoc) => flagDoc.key === key);
}

console.info(
  `[Legacy Flags Info] Loaded ${LEGACY_FEATURE_FLAGS.length} deprecated feature flag definitions. These are considered always ON. Please remove associated conditional code.`,
);

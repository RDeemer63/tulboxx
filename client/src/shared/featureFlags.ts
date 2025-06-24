// Proper feature flags module for TULBOXX

/**
 * Defines the keys for all client-side feature flags in Tulboxx.
 * This provides type safety and autocompletion when checking features.
 */
export type FeatureFlagKey =
  | 'useNewJobScheduler'
  | 'enableSignatureModal'
  | 'enableMockMode'
  | 'showCashflowOverlay'
  // --- New UX / DX flags ---
  | 'showMockModeIndicator'
  | 'enableErrorBoundary'
  | 'enableNewToastSystem'
  | 'enableLoadingSpinner';

/**
 * Default configuration for client-side feature flags.
 * This object serves as the source of truth for the default state of each feature.
 * In a more advanced setup, these values could be overridden by a remote config service
 * or user-specific settings from a database.
 */
/**
 * Runtime-mutable map of feature flags.  **Do not mutate directly** – use
 * {@link setFeatureFlag} or {@link toggleFeature} so that changes are
 * persisted to localStorage.
 */
export const featureFlags: Record<FeatureFlagKey, boolean> = {
  // --- In-Progress & Upcoming Features ---
  useNewJobScheduler: true,   // Defaulting to true to allow development on the new scheduler
  showCashflowOverlay: false, // This feature is not yet ready for users

  // --- Core Functionality Toggles ---
  enableSignatureModal: true, // The e-signature flow is a critical part of the estimate module

  // --- Developer/Debugging Flags ---
  enableMockMode: true,          // Essential for allowing frontend development without a live backend

  // --- New UX / DX Toggles (added Jun-2025) ---
  showMockModeIndicator: true,   // Show coloured pill + toggle
  enableErrorBoundary: true,     // Wrap app in <ErrorBoundary>
  enableNewToastSystem: true,    // shadcn/ui toast provider
  enableLoadingSpinner: true,    // Blue-Steel spinner component
};

/**
 * A simple utility to check if a feature is enabled.
 * This function centralizes the logic for checking flags, making it easy to
 * expand later (e.g., to check for overrides from localStorage or a remote service).
 *
 * @param key The feature flag to check.
 * @returns {boolean} True if the feature is enabled, false otherwise.
 */
export const isFeatureEnabled = (key: FeatureFlagKey): boolean => {
  // For now, it just reads from the default configuration object.
  // The `?? false` handles cases where a key might be missing, ensuring a safe fallback.
  return featureFlags[key] ?? false;
};

/**
 * An array of all feature flag keys, useful for iterating over all flags (e.g., in a debug panel).
 */
export const ALL_FEATURE_KEYS = Object.keys(featureFlags) as FeatureFlagKey[];

/* ------------------------------------------------------------------
 * Runtime overrides  &  persistence helpers
 * ------------------------------------------------------------------ */

const LS_KEY = 'tulboxx_feature_flags';

// Load user overrides from localStorage (fail-safe parse)
try {
  const raw = localStorage.getItem(LS_KEY);
  if (raw) {
    const saved: Partial<Record<FeatureFlagKey, boolean>> = JSON.parse(raw);
    Object.entries(saved).forEach(([k, v]) => {
      if (k in featureFlags && typeof v === 'boolean') {
        featureFlags[k as FeatureFlagKey] = v;
      }
    });
  }
} catch {
  // ignore parse errors – fall back to defaults
}

/**
 * Persist the current in-memory flag map to localStorage
 */
function persist() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(featureFlags));
  } catch {
    /* silently ignore – storage might be unavailable (private mode) */
  }
}

/**
 * Set a feature flag to a specific value (and persist the change).
 */
export function setFeatureFlag(key: FeatureFlagKey, value: boolean): void {
  featureFlags[key] = value;
  persist();
}

/**
 * Convenience helper – toggles the given flag on/off.
 * Returns the new value.
 */
export function toggleFeature(key: FeatureFlagKey): boolean {
  const newVal = !featureFlags[key];
  setFeatureFlag(key, newVal);
  return newVal;
}

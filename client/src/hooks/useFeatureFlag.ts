// client/src/hooks/useFeatureFlag.ts
import { useQuery } from '@tanstack/react-query';
import {
  FeatureFlagKey,
  isFeatureEnabled as getClientSideFeatureState,
} from '../../shared/featureFlags';
import {
  FeatureFlagStatus,
  FEATURE_FLAG_STATUS,
} from '../../../shared/feature-flags-schema'; // path relative to this file

// Define the expected shape of the server's response for feature flags
// ServerFeatureFlagKey enum (from server) and FeatureFlagKey enum (shared, used by client)
// should have matching string values for the same conceptual flags.
type ServerFeatureFlagsResponse = Partial<Record<FeatureFlagKey, boolean>>;

/**
 * API function to fetch feature flag states from the server.
 * This function is intended to be used by the useServerFeatureFlags hook.
 */
const fetchServerFeatureFlags = async (): Promise<ServerFeatureFlagsResponse> => {
  // In a real application, your API client (e.g., Axios instance, or a wrapper around fetch)
  // would handle base URLs, authentication tokens, and default headers.
  // For this example, a direct fetch is used.
  const response = await fetch('/api/feature-flags'); // Ensure this matches your API route
  
  if (!response.ok) {
    // Log a warning but don't necessarily break the app; fallback will be used by useFeatureFlag.
    // The error will be caught by React Query and can be handled in useServerFeatureFlags or useFeatureFlag.
    const errorBody = await response.text().catch(() => 'Could not read error body');
    console.warn(
      `[API] Failed to fetch server feature flags. Status: ${response.status} ${response.statusText}. Body: ${errorBody}`
    );
    throw new Error(`Failed to fetch server feature flags. Status: ${response.statusText || response.status}`);
  }

  try {
    const data = await response.json();
    // Optional: Validate data structure if needed, though type assertion is common here.
    return data as ServerFeatureFlagsResponse;
  } catch (e) {
    console.error("[API] Failed to parse server feature flags JSON response.", e);
    throw new Error("Invalid JSON response from server feature flags endpoint.");
  }
};

// React Query keys for server-side feature flags
const featureFlagsQueryKeys = {
  allServerConfig: () => ['feature-flags', 'server-config'] as const,
};

/**
 * Internal hook to fetch and cache server-side feature flag configurations.
 * This data is fetched once and cached, with stale-while-revalidate behavior.
 */
const useServerFeatureFlags = () => {
  return useQuery<ServerFeatureFlagsResponse, Error>({
    queryKey: featureFlagsQueryKeys.allServerConfig(),
    queryFn: fetchServerFeatureFlags,
    staleTime: 5 * 60 * 1000, // Cache server-fetched flags for 5 minutes
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchInterval: 15 * 60 * 1000, // Optional: Refetch periodically in the background (e.g., every 15 mins)
    retry: 2, // Retry failed requests up to 2 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff for retries
    // Errors are handled by the hook consuming this (useFeatureFlag), allowing fallback.
  });
};

/**
 * React hook to determine if a specific feature flag is enabled.
 * It prioritizes server-side configuration if available and successfully fetched.
 * If server data is unavailable (loading, error), or if the specific flag is not
 * returned by the server, it falls back to the client-side configuration
 * (localStorage override -> environment variables -> default values).
 *
 * @param key The FeatureFlagKey enum member representing the feature flag.
 * @returns A boolean indicating whether the feature is enabled.
 *
 * @example
 * const isNewEstimatesModuleEnabled = useFeatureFlag(FeatureFlagKey.NEW_ESTIMATES_MODULE);
 * if (isNewEstimatesModuleEnabled) {
 *   // Render new estimates module
 * }
 */
export const useFeatureFlag = (key: FeatureFlagKey): boolean => {
  /* ------------------------------------------------------------------
   * Fast-path for DEPRECATED flags
   * ------------------------------------------------------------------
   * Flags marked as `deprecated` are considered **always on**. We bypass
   * all network calls and client-side checks to avoid unnecessary work
   * and encourage removal of conditional code that still references them.
   * ------------------------------------------------------------------ */
  if (FEATURE_FLAG_STATUS[key] === FeatureFlagStatus.deprecated) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn(
        `[useFeatureFlag] Flag "${key}" is marked as DEPRECATED. ` +
          'It will always resolve to TRUE. Please remove any guard logic ' +
          'checking this flag.'
      );
    }
    return true;
  }

  // Only fetch server flags for non-deprecated keys
  const { data: serverFlags, isLoading, isError, error } = useServerFeatureFlags();

  // During initial load of server flags or if an error occurs fetching them,
  // fall back to the client-side determination. This ensures:
  // 1. UI doesn't flicker or wait unnecessarily if client-side config is sufficient for initial render.
  // 2. Resilience if the server endpoint for flags is down or returns an error.
  // 3. Client-only flags (not exposed by server) work as defined client-side.
  
  if (isLoading && !serverFlags) { // Only rely on client-side if serverFlags are not yet available from cache
    // While server flags are loading for the first time (no cached data), use the client-side determination.
    return getClientSideFeatureState(key);
  }

  if (isError) {
    // If there was an error fetching server flags, log it (React Query also logs) and use client-side determination.
    if (import.meta.env.DEV) { // Vite uses import.meta.env for environment variables
      // console.warn(`[useFeatureFlag] Error fetching server flags for "${key}", falling back to client-side. Error: ${error?.message}`);
    }
    return getClientSideFeatureState(key);
  }

  // If server flags are successfully fetched (or available from cache):
  if (serverFlags) {
    if (typeof serverFlags[key] === 'boolean') {
      // Server provided a specific state for this flag, use it.
      return serverFlags[key]!;
    } else {
      // Server data is available, but this specific flag was not included in the server's response.
      // This means the server doesn't have an opinion/override for this flag, or it's not client-exposable from server.
      // Fall back to client-side determination.
      if (import.meta.env.DEV) {
        // This log can be noisy if many flags are client-only. Enable if needed for debugging.
        // console.log(`[useFeatureFlag] Flag "${key}" not found in server response (or not a boolean), using client-side config.`);
      }
      return getClientSideFeatureState(key);
    }
  }
  
  // Default fallback if serverFlags is unexpectedly null/undefined after loading without error.
  // This case should be rare with React Query's handling but acts as a safeguard.
  if (import.meta.env.DEV) {
    // console.warn(`[useFeatureFlag] Server flags data is unexpectedly null/undefined for "${key}" after loading without error, using client-side config.`);
  }
  return getClientSideFeatureState(key);
};

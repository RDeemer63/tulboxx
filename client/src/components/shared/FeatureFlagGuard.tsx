import React from 'react';
import { FeatureFlagKey, isFeatureEnabled } from '@/shared/featureFlags';

interface FeatureFlagGuardProps {
  /**
   * The feature flag to check
   */
  feature: FeatureFlagKey;
  
  /**
   * The content to render if the feature is enabled
   */
  children: React.ReactNode;
  
  /**
   * Optional fallback UI to show when the feature is disabled
   * If not provided, nothing will be rendered when the feature is disabled
   */
  fallback?: React.ReactNode;
}

/**
 * A component that conditionally renders its children based on whether
 * a specified feature flag is enabled.
 * 
 * Example:
 * ```tsx
 * <FeatureFlagGuard feature="enableNewJobScheduler" fallback={<LegacyScheduler />}>
 *   <NewJobScheduler />
 * </FeatureFlagGuard>
 * ```
 */
export const FeatureFlagGuard: React.FC<FeatureFlagGuardProps> = ({ 
  feature, 
  children, 
  fallback = null 
}) => {
  const isEnabled = isFeatureEnabled(feature);
  
  return isEnabled ? <>{children}</> : <>{fallback}</>;
};

/**
 * A higher-order component (HOC) that wraps a component with a feature flag check.
 * 
 * Example:
 * ```tsx
 * const NewSchedulerWithFlag = withFeatureFlag(NewScheduler, {
 *   feature: 'enableNewJobScheduler',
 *   fallback: LegacyScheduler
 * });
 * ```
 */
export function withFeatureFlag<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    feature: FeatureFlagKey;
    fallback?: React.ComponentType<P>;
  }
): React.FC<P> {
  return (props: P) => (
    <FeatureFlagGuard 
      feature={options.feature} 
      fallback={options.fallback ? <options.fallback {...props} /> : null}
    >
      <Component {...props} />
    </FeatureFlagGuard>
  );
}

export default FeatureFlagGuard;

import React from 'react';
import { Redirect, useLocation } from 'wouter';
import { useAuth, Permission, Role } from '@/contexts/auth-context';
import { Loader2 } from 'lucide-react';
import { useOnboardingGating } from '@/hooks/use-onboarding';
import { toast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  /** Child components to render if authentication passes */
  children: React.ReactNode;
  
  /** Required permissions to access this route (any one is sufficient) */
  requiredPermissions?: Permission[];
  
  /** Required role to access this route (any one is sufficient) */
  requiredRoles?: Role[];
  
  /** Where to redirect unauthenticated users */
  redirectTo?: string;
  
  /** Where to redirect if authenticated but without permission */
  fallbackPath?: string;
  
  /** Message to show while loading */
  loadingMessage?: string;

  /** Whether onboarding must be complete before accessing this route */
  requireOnboarding?: boolean;
}

/**
 * Protects a route by requiring authentication and optionally specific permissions or roles.
 * 
 * Usage:
 * ```tsx
 * <Route path="/leads">
 *   <ProtectedRoute requiredPermissions={['view_leads']}>
 *     <LeadsPage />
 *   </ProtectedRoute>
 * </Route>
 * ```
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions,
  requiredRoles,
  redirectTo = '/login',
  fallbackPath = '/dashboard',
  loadingMessage = 'Loading...',
  requireOnboarding = true,
}) => {
  const { isAuthenticated, isLoading, user, hasPermission, hasRole } = useAuth();
  const [location] = useLocation();
  const { isGated, reason } = useOnboardingGating();
  
  // Certain routes must bypass onboarding gating (e.g., onboarding itself)
  const ONBOARDING_BYPASS_ROUTES = ['/onboarding', '/login', '/register'];

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">{loadingMessage}</p>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Preserve the intended destination to redirect back after login
    const returnPath = typeof window !== 'undefined' ? window.location.pathname : '/';
    
    // Store the return path in session storage
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('returnPath', returnPath);
    }
    
    return <Redirect to={redirectTo} />;
  }
  
  // Redirect to onboarding if profile incomplete and gating enabled
  if (
    requireOnboarding &&
    isAuthenticated &&
    isGated &&
    !ONBOARDING_BYPASS_ROUTES.includes(location)
  ) {
    // Show toast once
    toast.info({
      title: 'Finish setting up your business profile',
      description: reason ?? 'Complete onboarding to unlock all features.',
    });
    return <Redirect to="/onboarding" />;
  }
  
  // Check permissions if specified
  if (requiredPermissions && requiredPermissions.length > 0) {
    const hasRequiredPermission = requiredPermissions.some(permission => 
      hasPermission(permission)
    );
    
    if (!hasRequiredPermission) {
      console.warn(
        `User ${user?.id} lacks required permissions: ${requiredPermissions.join(', ')}`
      );
      return <Redirect to={fallbackPath} />;
    }
  }
  
  // Check roles if specified
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => 
      hasRole(role)
    );
    
    if (!hasRequiredRole) {
      console.warn(
        `User ${user?.id} lacks required roles: ${requiredRoles.join(', ')}`
      );
      return <Redirect to={fallbackPath} />;
    }
  }
  
  // User is authenticated and has required permissions/roles
  return <>{children}</>;
};

/**
 * Higher-order component wrapper for the ProtectedRoute component.
 * Useful when you need to protect a component outside a Route declaration.
 * 
 * Usage:
 * ```tsx
 * const ProtectedLeadsPage = withProtection(LeadsPage, {
 *   requiredPermissions: ['view_leads']
 * });
 * ```
 */
export const withProtection = <P extends {}>(
  Component: React.ComponentType<P>,
  options: Omit<ProtectedRouteProps, 'children'>
) => {
  const WithProtection = (props: P) => (
    <ProtectedRoute {...options}>
      <Component {...props} />
    </ProtectedRoute>
  );
  
  // Set display name for debugging purposes
  const displayName = Component.displayName || Component.name || 'Component';
  WithProtection.displayName = `withProtection(${displayName})`;
  
  return WithProtection;
};

export default ProtectedRoute;

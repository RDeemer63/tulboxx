import React, { Suspense, useState } from "react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { captureException } from "@/lib/sentry";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useProgress } from "@/hooks/use-progress";

// Component Types
interface AppLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  mobileNavbar: React.ReactNode;
  onboardingProgress?: number; // 0-100
}

/**
 * Main application layout component
 * 
 * Provides the overall structure for the application with:
 * - Sidebar navigation for desktop
 * - Bottom navigation for mobile
 * - Main content area with lazy loading support
 * - Onboarding progress indicator (when applicable)
 */
export function AppLayout({
  children,
  sidebar,
  mobileNavbar,
  onboardingProgress,
}: AppLayoutProps) {
  const { theme } = useTheme();
  const [location] = useLocation();
  const { isLoaded, loadingProgress } = useProgress();
  const isDashboard = location === "/" || location === "/dashboard";
  
  // Show progress bar only if:
  // 1. There's explicit onboarding progress or
  // 2. Page is still loading initial data
  const showProgress = onboardingProgress !== undefined || !isLoaded;
  const progressValue = onboardingProgress ?? loadingProgress;
  
  return (
    <div className={cn(
      "flex flex-col h-screen w-screen overflow-hidden",
      theme === "dark" ? "bg-slate-900 text-white" : "bg-gray-50 text-slate-900"
    )}>
      {/* Onboarding or Loading Progress Indicator */}
      {showProgress && (
        <div className="absolute top-0 left-0 right-0 z-50">
          <ProgressBar 
            value={progressValue} 
            className={cn(
              "h-1 rounded-none",
              onboardingProgress !== undefined ? "bg-primary" : "bg-blue-600"
            )}
          />
        </div>
      )}
    
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar - Hidden on Mobile */}
        <aside className="hidden lg:block w-64 border-r flex-shrink-0 overflow-y-auto h-screen"
               style={{ borderColor: theme === "dark" ? "#334155" : "#e2e8f0" }}>
          {sidebar}
        </aside>
        
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Main Content Area with Suspense for Lazy Loading */}
          <div className="flex-1 overflow-y-auto">
            <Suspense fallback={
              <div className="flex items-center justify-center h-full w-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            }>
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </Suspense>
          </div>
          
          {/* Mobile Navigation - Hidden on Desktop */}
          <div className="lg:hidden border-t flex-shrink-0"
               style={{ borderColor: theme === "dark" ? "#334155" : "#e2e8f0" }}>
            {mobileNavbar}
          </div>
        </main>
      </div>
    </div>
  );
}

/**
 * Error boundary for the main content area
 * Captures React rendering errors and sends them to Sentry
 */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    captureException(error, `React Error Boundary: ${errorInfo.componentStack}`);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <p className="mb-6 text-slate-600 dark:text-slate-400">
            We've been notified and are working to fix the issue.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppLayout;

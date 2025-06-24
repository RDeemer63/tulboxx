import React, { Suspense } from "react";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import PageLoader from "@/components/shared/PageLoader";
import AppInitializer from "@/components/shared/AppInitializer";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider } from "@/contexts/user-context";
import { AuthProvider } from "@/contexts/auth-context";
import { ThemeProvider } from "@/contexts/theme-context";
import { withProtection, ProtectedRoute } from "@/components/auth/ProtectedRoute";
import "@/lib/dev-auth"; // Ensure authentication state for development
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Onboarding from "@/pages/onboarding";
import Dashboard from "@/pages/dashboard";
import Customers from "@/pages/customers";
import Pipeline from "@/pages/pipeline";
import Jobs from "@/pages/jobs";
import Estimates from "@/pages/estimates";
import Invoices from "@/pages/invoices";
import Schedule from "@/pages/schedule-new";
import Calendar from "@/pages/calendar-production";
import Profile from "@/pages/profile";

import SocialMedia from "@/pages/social-media";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import Documents from "@/pages/documents";
import Photos from "@/pages/photos";
import WorkOrders from "@/pages/work-orders";
import Employees from "@/pages/employees";
import TimeTracking from "@/pages/time-tracking";
import EstimatePreviewPage from "@/pages/estimate-preview";
import FieldNotesToEstimate from "@/pages/field-notes-estimate";
import MobileDashboard from "@/pages/mobile-dashboard";
import MobileJobs from "@/pages/mobile-jobs";
import MobileTimeTracking from "@/pages/mobile-time-tracking";
// New navigation components
import NavigationDrawer from "@/components/navigation/NavigationDrawer";
import MobileTabBar from "@/components/navigation/MobileTabBar";
/* ----------  Mock API (dev only) ------------- */
import { initializeMockApi } from "@/lib/mock-api";
import { isMockApiEnabled, setApiMode } from "@/lib/api-config";
/* ----------  Dev-only Mock Mode Indicator ------------- */
import { MockModeIndicator } from "@/components/shared/MockModeIndicator";
/* ---------  Auth protected wrappers ------------- */
const ProtectedDashboard = withProtection(Dashboard, {});
const ProtectedCustomers = withProtection(Customers, {});
const ProtectedPipeline = withProtection(Pipeline, {});
const ProtectedJobs = withProtection(Jobs, {});
const ProtectedEstimates = withProtection(Estimates, {});
const ProtectedInvoices = withProtection(Invoices, {});
const ProtectedSchedule = withProtection(Schedule, {});
const ProtectedCalendar = withProtection(Calendar, {});
const ProtectedProfile = withProtection(Profile, {});
const ProtectedSocialMedia = withProtection(SocialMedia, {});
const ProtectedReports = withProtection(Reports, {});
const ProtectedSettings = withProtection(Settings, {});
const ProtectedDocuments = withProtection(Documents, {});
const ProtectedPhotos = withProtection(Photos, {});
const ProtectedWorkOrders = withProtection(WorkOrders, {});
const ProtectedEmployees = withProtection(Employees, {});
const ProtectedTimeTracking = withProtection(TimeTracking, {});
const ProtectedMobileDashboard = withProtection(MobileDashboard, {});
const ProtectedMobileJobs = withProtection(MobileJobs, {});
const ProtectedMobileTime = withProtection(MobileTimeTracking, {});
const ProtectedEstimatePreview = withProtection(EstimatePreviewPage, {});
const ProtectedFieldNotesEstimate = withProtection(FieldNotesToEstimate, {});

/* ----------  V2 navigation ------------- */
import V2Router from "@/components/navigation/v2-router";
import V2NavigationWrapper, {
  getIsV2NavigationEnabled,
} from "@/components/navigation/v2-navigation";

// Enable mock API when in development mode (fail-safe)
try {
  initializeMockApi();
} catch (err) {
  // eslint-disable-next-line no-console
  console.error("Failed to initialise mock API:", err);
  // Ensure we fall back to real API in case mocks blow up
  setApiMode("live");
}

/* ------------------------------------------------------------------ */
/* ------------------------------------------------------------------ */

function Router() {
  const [location] = useLocation();
  const isV2 = getIsV2NavigationEnabled();
  const isDashboard = location === "/" || location === "/dashboard";
  
  /* ----------  V2 NAVIGATION BRANCH ---------- */
  if (isV2) {
    return (
      <ProtectedRoute>
      <div className="flex h-screen bg-gray-50 dark:bg-slate-900">
        {/* V2 sidebar / mobile nav wrapper */}
        <V2NavigationWrapper />

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4">
            <V2Router />
          </main>
        </div>
      </div>
      </ProtectedRoute>
    );
  }

  /* ----------  LEGACY (V1) NAVIGATION BRANCH ---------- */
  return (
    <div className={`flex h-screen ${isDashboard ? 'bg-gray-50 dark:bg-slate-900' : 'bg-gray-50 dark:bg-slate-900'}`}>
      <NavigationDrawer />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Navigation Header */}
        <div className={`lg:hidden ${isDashboard ? 'bg-white/80 dark:bg-slate-900 border-gray-200 dark:border-slate-700' : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700'} border-b px-4 py-3 flex items-center justify-between`}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-sm">
              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <span className={`text-xl font-extrabold tracking-tight ${isDashboard ? 'text-orange-500' : 'text-gray-900 dark:text-orange-500'}`}>TULBOXX</span>
          </div>
          <div className="w-10"></div>
        </div>
        
        <main className={`flex-1 overflow-y-auto ${isDashboard ? '' : 'p-4'}`}>
          <Switch>
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            {/* Public onboarding route (not gated) */}
            <Route path="/onboarding" component={Onboarding} />
            <Route path="/" component={ProtectedDashboard} />
            <Route path="/dashboard" component={ProtectedDashboard} />
            <Route path="/mobile" component={ProtectedMobileDashboard} />
            <Route path="/mobile/jobs" component={ProtectedMobileJobs} />
            <Route path="/mobile/time" component={ProtectedMobileTime} />
            <Route path="/customers" component={ProtectedCustomers} />
            <Route path="/pipeline" component={ProtectedPipeline} />
            <Route path="/jobs" component={ProtectedJobs} />
            <Route path="/estimates" component={ProtectedEstimates} />
            <Route path="/estimates/:id" component={ProtectedEstimatePreview} />
            <Route path="/field-notes-estimate" component={ProtectedFieldNotesEstimate} />
            <Route path="/invoices" component={ProtectedInvoices} />
            <Route path="/schedule" component={ProtectedSchedule} />
            <Route path="/calendar" component={ProtectedCalendar} />
            <Route path="/work-orders" component={ProtectedWorkOrders} />
            <Route path="/employees" component={ProtectedEmployees} />
            <Route path="/time-tracking" component={ProtectedTimeTracking} />

            <Route path="/social-media" component={ProtectedSocialMedia} />
            <Route path="/profile" component={ProtectedProfile} />
            <Route path="/reports" component={ProtectedReports} />
            <Route path="/photos" component={ProtectedPhotos} />
            <Route path="/documents" component={ProtectedDocuments} />
            <Route path="/settings" component={ProtectedSettings} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
      {/* Mobile Tab Bar (fixed bottom) */}
      <MobileTabBar />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="dark">
          <UserProvider>
            <TooltipProvider>
              <AppInitializer>
                <Toaster />
                <ErrorBoundary>
                  <Suspense fallback={<PageLoader />}>
                    <Router />
                  </Suspense>
                </ErrorBoundary>
                {/* Dev-only helper: Toggle between Mock and Real API */}
                {import.meta.env.DEV && <MockModeIndicator />}
              </AppInitializer>
            </TooltipProvider>
          </UserProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

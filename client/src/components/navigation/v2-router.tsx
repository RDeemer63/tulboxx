import { Switch, Route, Redirect } from "wouter";
import React, { useState } from "react"; // Added React for FC and ReactNode

// --- V1 Page Component Imports ---\n// These are the page components from your existing application (App.tsx)
// Assuming they are correctly exported from their respective files within @/pages
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Customers from "@/pages/customers";
import Pipeline from "@/pages/pipeline";
import Jobs from "@/pages/jobs";
import Estimates from "@/pages/estimates";
import EstimatePreviewPage from "@/pages/estimate-preview"; // V1 Estimate Preview
import FieldNotesToEstimate from "@/pages/field-notes-estimate";
import Invoices from "@/pages/invoices";
import Schedule from "@/pages/schedule-new"; // Assuming schedule-new is the one to use
import Calendar from "@/pages/calendar-production"; // Assuming calendar-production is the one to use
import WorkOrders from "@/pages/work-orders";
import Employees from "@/pages/employees";
import TimeTracking from "@/pages/time-tracking";
import SocialMedia from "@/pages/social-media";
import Profile from "@/pages/profile"; // V1 Profile
import Reports from "@/pages/reports";
import Photos from "@/pages/photos";
import Documents from "@/pages/documents";
import Settings from "@/pages/settings"; // V1 Settings
import MobileDashboard from "@/pages/mobile-dashboard";
import MobileJobs from "@/pages/mobile-jobs";
import MobileTimeTracking from "@/pages/mobile-time-tracking";
import NotFound from "@/pages/not-found";

// ----- V2 Real Module Imports -----\n

import LeadsListComponent from "@/components/leads/leads-list";
import AddLeadModal from "@/components/leads/add-lead-modal";
import ViewEditLeadDrawer from "@/components/leads/view-edit-lead-drawer";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequestJson, invalidateQueries } from "@/lib/queryClient";
import type { InsertContact, Contact } from "@shared/schema";

// ----- V2 Estimates Imports (New) -----\n

import ModernEstimatesPage from "@/pages/modern-estimates/index";
import EstimateDetailPage from "@/pages/modern-estimates/[id]";

// ----- Admin Page Imports -----\n

import FeatureFlagsAdminPage from "@/pages/admin/feature-flags";

// ----- Feature Flag Imports -----\n

import FeatureFlagGuard from '@/components/shared/FeatureFlagGuard';
import { FeatureFlagKey } from '@shared/feature-flags-schema';

// ----- Auth Context Import -----\n
import { useAuth } from '@/contexts/AuthContext';


// --- Feature Flag Utility ---\n

const V2_NAVIGATION_FLAG_KEY = 'tulboxx_nav_v2_enabled';
const V2_NAVIGATION_QUERY_PARAM = 'nav_v2';

const getIsV2NavigationEnabled = (): boolean => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    if (params.has(V2_NAVIGATION_QUERY_PARAM)) {
      return params.get(V2_NAVIGATION_QUERY_PARAM) === 'true';
    }
    return localStorage.getItem(V2_NAVIGATION_FLAG_KEY) === 'true';
  }
  return false; // Default to V1 navigation if window is not defined
};

// --- V2 Placeholder Components ---\n

const PlaceholderComponent = ({ name, path }: { name: string; path: string }) => (
  <div style={{ padding: '20px', border: '2px solid #fb923c', margin: '10px', borderRadius: '8px', backgroundColor: '#fff7ed' }}>
    <h2 style={{ color: '#f97316', marginTop: 0 }}>{name} Module (V2)</h2>
    <p>This is a placeholder for the new <strong>{name.toLowerCase()}</strong> module.</p>
    <p>Current Path: <code>{path}</code></p>
    <p><em>(Content for this module will be built in subsequent phases.)</em></p>
  </div>
);

const JobsModulePlaceholder = () => <PlaceholderComponent name="Jobs & Scheduling" path="/modern-jobs" />;
const WorkSessionModulePlaceholder = () => <PlaceholderComponent name="Work Session (Field)" path="/modern-work" />;
const BillingModulePlaceholder = () => <PlaceholderComponent name="Billing & Invoices" path="/modern-billing" />;
const InsightsModulePlaceholder = () => <PlaceholderComponent name="Insights & Reports" path="/modern-insights" />;

const SettingsV2Placeholder = () => <PlaceholderComponent name="Settings Dashboard (V2)" path="/modern-settings" />;
const ProfileV2Placeholder = () => <PlaceholderComponent name="Business Profile (V2)" path="/modern-settings/profile" />; 
const EmployeesV2Placeholder = () => <PlaceholderComponent name="Employees (V2)" path="/modern-settings/employees" />;


// Conceptual component for the offline mode toggle UI
const OfflineModeSettingsUIToggle: React.FC = () => (
  <div style={{ marginTop: '20px', padding: '15px', borderTop: '1px solid #e0e0e0', backgroundColor: '#f9f9f9' }}>
    <h4 style={{ marginTop: '0', marginBottom: '10px', fontSize: '1.1em', color: '#333' }}>Offline Mode Configuration</h4>
    <label htmlFor="offline-mode-toggle-checkbox" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
      <input type="checkbox" id="offline-mode-toggle-checkbox" style={{ marginRight: '8px' }} />
      <span>Enable Offline Data Sync & Access</span>
    </label>
    <p style={{ fontSize: '0.9em', color: '#555', marginTop: '8px' }}>
      Allows you to access and manage essential data even when you're not connected to the internet. Changes will sync automatically when you're back online.
    </p>
  </div>
);

// The component rendered for the /modern-settings/application route, now including Offline Mode settings
const AppSettingsV2Placeholder = () => {
  return (
    <div style={{ padding: '20px', margin: '10px' }}> {/* Main page container */}
      {/* Using a structure similar to PlaceholderComponent for the title part */}
      <div style={{ border: '2px solid #fb923c', borderRadius: '8px', backgroundColor: '#fff7ed', padding: '20px', marginBottom: '20px' }}>
        <h2 style={{ color: '#f97316', marginTop: 0 }}>Application Settings (V2)</h2>
        <p>Manage global application settings, integrations, and preferences.</p>
        <p>Current Path: <code>/modern-settings/application</code></p>
      </div>

      {/* Other application settings could go here */}
      <div style={{padding: '15px', border: '1px dashed #ccc', borderRadius: '4px', marginBottom: '20px'}}>
        <h4 style={{marginTop:0}}>General Settings</h4>
        <p>Placeholder for general app settings like date format, currency, etc.</p>
      </div>

      {/* Guarded Offline Mode Settings Section */}
      <FeatureFlagGuard
        feature={FeatureFlagKey.OFFLINE_MODE_SUPPORT} 
        fallback={
          <div style={{ marginTop: '20px', padding: '15px', borderTop: '1px solid #e0e0e0', backgroundColor: '#f0f0f0' }}>
            <h4 style={{ marginTop: '0', marginBottom: '10px', fontSize: '1.1em', color: '#777' }}>Offline Mode Configuration</h4>
            <p style={{ color: '#777' }}>Offline mode support is currently unavailable. This feature will allow you to use the app without an active internet connection.</p>
          </div>
        }
      >
        <OfflineModeSettingsUIToggle />
      </FeatureFlagGuard>
      
      {/* More application settings could follow */}
       <div style={{padding: '15px', border: '1px dashed #ccc', borderRadius: '4px', marginTop: '20px'}}>
        <h4 style={{marginTop:0}}>Integration Settings</h4>
        <p>Placeholder for third-party integration settings.</p>
      </div>
    </div>
  );
};
// Using existing NotFound for V2 as well, or create a specific NotFoundV2Placeholder if needed later
// const NotFoundV2Placeholder = () => <PlaceholderComponent name="Not Found (V2)" path="N/A" />;\n


// ------------------------------------------------------------------
// Leads Module Wrapper – handles modal states (placeholders for now)
// ------------------------------------------------------------------

const LeadsModule: React.FC = () => {
  const queryClient = useQueryClient();
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [drawerLeadId, setDrawerLeadId] = useState<number | null>(null);

  // --- Mutations ---\n

  const addLeadMutation = useMutation({
    mutationFn: async (payload: InsertContact) =>
      apiRequestJson<Contact>("POST", "/api/contacts", payload),
    onSuccess: () => {
      // refresh leads & dashboards
      invalidateQueries.lead();
      setAddModalOpen(false);
    },
    onError: (err: unknown) => {
      // Basic error handling – log and surface minimal feedback
      console.error("Failed to create lead:", err);
      alert(
        err instanceof Error
          ? `Failed to create lead: ${err.message}`
          : "Failed to create lead. Please try again."
      );
    },
  });

  // Handlers
  const handleAddLeadClick = () => {
    setAddModalOpen(true);
  };

  const handleViewLeadDetails = (leadId: number) => {
    setDrawerLeadId(leadId);
  };

  const handleEditLead = (lead: any) => {
    // open drawer in edit mode – the drawer itself handles editing
    setDrawerLeadId(lead.id);
  };

  return (
    <>
      <LeadsListComponent
        onAddLeadClick={handleAddLeadClick}
        onViewLeadDetails={handleViewLeadDetails}
        onEditLead={handleEditLead}
      />
      {/* Future: render real modals based on isAddModalOpen, viewLeadId, editLead */}
      <AddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={(data) => addLeadMutation.mutateAsync(data)}
      />
      <ViewEditLeadDrawer
        isOpen={drawerLeadId !== null}
        leadId={drawerLeadId}
        onClose={() => setDrawerLeadId(null)}
      />
    </>
  );
};

// --- Protected Route Component ---
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return <p>Loading authentication...</p>; // Or a proper loading spinner component
  }

  if (!user || user.role !== 'admin') {
    // console.warn('[ProtectedRoute] Access denied. User not admin or not logged in. Redirecting to home.');
    return <Redirect to="/" />;
  }

  return <>{children}</>;
};

// --- Wrapper for EstimateDetailPage to include V2 PDF Guard ---
const GuardedEstimateDetailPageWrapper: React.FC<{ params: { id: string } }> = ({ params }) => {
  // Placeholder for where the V2 PDF button would be in EstimateDetailPage
  // In a real scenario, EstimateDetailPage.tsx itself would contain this FeatureFlagGuard.
  const EstimateV2PdfButtonPlaceholder: React.FC = () => (
    <button style={{ 
      padding: '8px 12px', 
      background: '#0070D2', // Using a primary color
      color: 'white',
      border: 'none', 
      borderRadius: '4px', 
      cursor: 'pointer',
      fontSize: '0.9em',
      marginTop: '10px'
    }}>
      Generate V2 PDF (Advanced)
    </button>
  );
  
  const FallbackV1PdfMessage: React.FC = () => (
    <div style={{ marginTop: '10px' }}>
      <button style={{ 
        padding: '8px 12px', 
        background: '#6c757d', // A muted color for standard button
        color: 'white',
        border: 'none', 
        borderRadius: '4px', 
        cursor: 'pointer',
        fontSize: '0.9em',
      }}>
        Generate Standard PDF
      </button>
      <p style={{ fontSize: '0.8em', color: '#6c757d', marginTop: '5px' }}>
        (New V2 PDF format coming soon!)
      </p>
    </div>
  );

  return (
    <>
      {/* Render the main EstimateDetailPage content */}
      <EstimateDetailPage params={params} /> 
      
      {/* Simulate a section within EstimateDetailPage that has the V2 PDF button */}
      <div style={{ marginTop: '20px', padding: '15px', borderTop: '1px solid #e0e0e0', backgroundColor: '#f9f9f9' }}>
        <h4 style={{ marginTop: '0', marginBottom: '10px', fontSize: '1.1em', color: '#333' }}>Document Options:</h4>
        <FeatureFlagGuard
          feature={FeatureFlagKey.ESTIMATE_PDF_V2} // Assuming this key exists
          fallback={<FallbackV1PdfMessage />}
        >
          <EstimateV2PdfButtonPlaceholder />
        </FeatureFlagGuard>
      </div>
    </>
  );
};


// --- Main Router with Feature Flag Logic ---\n

const V2Router = () => {
  const isV2Enabled = getIsV2NavigationEnabled();

  return (
    <Switch>
      {/* Common authentication routes, accessible regardless of navigation version */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      {isV2Enabled ? (
        <>
          {/* V2 Core Application Routes */}
          <Route path="/" component={LeadsModule} /> {/* Default V2 to Leads */}
          <Route path="/modern-leads" component={LeadsModule} />
          <Route path="/modern-estimates" component={ModernEstimatesPage} />
          <Route path="/modern-estimates/:id" component={GuardedEstimateDetailPageWrapper} />
          <Route path="/modern-jobs" component={() => (
            <FeatureFlagGuard
              feature={FeatureFlagKey.JOBS_MODULE}
              fallback={
                <div style={{ padding: '20px', textAlign: 'center', border: '1px dashed #ccc', margin: '10px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                  <h3 style={{ color: '#555' }}>Jobs & Scheduling - Coming Soon!</h3>
                  <p style={{ color: '#777' }}>This module is currently under development and will be available soon.</p>
                </div>
              }
            >
              <JobsModulePlaceholder />
            </FeatureFlagGuard>
          )} />
          <Route path="/modern-work" component={() => (
            <FeatureFlagGuard
              feature={FeatureFlagKey.SCHEDULING_BETA}
              fallback={
                <div style={{ padding: '20px', textAlign: 'center', border: '1px dashed #ccc', margin: '10px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                  <h3 style={{ color: '#555' }}>Advanced Scheduling (Beta) - Coming Soon!</h3>
                  <p style={{ color: '#777' }}>The new Work Session and Scheduling features are currently under development and will be available soon.</p>
                </div>
              }
            >
              <WorkSessionModulePlaceholder />
            </FeatureFlagGuard>
          )} />
          <Route path="/modern-billing" component={() => (
            <FeatureFlagGuard
              feature={FeatureFlagKey.BILLING_MODULE}
              fallback={
                <div style={{ padding: '20px', textAlign: 'center', border: '1px dashed #ccc', margin: '10px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                  <h3 style={{ color: '#555' }}>Billing & Invoicing - Coming Soon!</h3>
                  <p style={{ color: '#777' }}>This module is currently under development and will be available soon.</p>
                </div>
              }
            >
              <BillingModulePlaceholder />
            </FeatureFlagGuard>
          )} />
          <Route path="/modern-insights" component={InsightsModulePlaceholder} />
          
          {/* V2 Settings and other secondary routes */}
          <Route path="/modern-settings" component={SettingsV2Placeholder} />
          <Route path="/modern-settings/profile" component={ProfileV2Placeholder} /> 
          <Route path="/modern-settings/employees" component={EmployeesV2Placeholder} />
          <Route path="/modern-settings/application" component={AppSettingsV2Placeholder} />
          
          {/* Admin Routes - V2 Only */}
          <Route path="/admin/feature-flags">
            <ProtectedRoute>
              <FeatureFlagsAdminPage />
            </ProtectedRoute>
          </Route>
          
          {/* Fallback for V2 - Can use existing NotFound or a V2 specific one */}
          <Route component={NotFound} /> 
        </>
      ) : (
        <>
          {/* V1 Core Application Routes */}
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/mobile" component={MobileDashboard} />
          <Route path="/mobile/jobs" component={MobileJobs} />
          <Route path="/mobile/time" component={MobileTimeTracking} />
          <Route path="/customers" component={Customers} />
          <Route path="/pipeline" component={Pipeline} />
          <Route path="/jobs" component={Jobs} />
          <Route path="/estimates" component={Estimates} />
          <Route path="/estimates/:id" component={EstimatePreviewPage} /> {/* V1 Estimate Preview */}
          <Route path="/field-notes-estimate" component={FieldNotesToEstimate} />
          <Route path="/invoices" component={Invoices} />
          <Route path="/schedule" component={Schedule} />
          <Route path="/calendar" component={Calendar} />
          <Route path="/work-orders" component={WorkOrders} />
          <Route path="/employees" component={Employees} />
          <Route path="/time-tracking" component={TimeTracking} />

          <Route path="/social-media" component={SocialMedia} />
          <Route path="/profile" component={Profile} /> {/* V1 Profile */}
          <Route path="/reports" component={Reports} />
          <Route path="/photos" component={Photos} />
          <Route path="/documents" component={Documents} />
          <Route path="/settings" component={Settings} /> {/* V1 Settings */}
          
          {/* Fallback for V1 */}
          <Route component={NotFound} />
        </>
      )}
    </Switch>
  );
};

export default V2Router;

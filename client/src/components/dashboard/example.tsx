import React from "react";
import { MiniDashboard, MetricConfig } from "./mini-dashboard";
import {
  leadsDashboardMetrics,
  leadsDashboardQuery,
  LeadsDashboardStats,
} from "./metrics-providers";
import { apiRequestJson } from "@/lib/queryClient"; // Assuming this is your API helper
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Target, TrendingUp, DollarSign } from "lucide-react";

// =================================================================
// Example Usage File for MiniDashboard Component
//
// This file demonstrates how to implement the MiniDashboard component
// on a module-specific page (e.g., the Leads page).
//
// This is for documentation and example purposes only and is not
// intended to be directly part of the application's routing.
// =================================================================

// Create a mock query client for the example to work in isolation
const queryClient = new QueryClient();

// --- Mock API Function ---
// In a real application, this would be an actual API call.
// Here, we simulate a successful API response for the leads dashboard.
const mockLeadsApi = (): Promise<LeadsDashboardStats> => {
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          totalLeads: 124,
          newLeadsThisWeek: 12,
          conversionRate: 27.5,
          estimatedPipelineValue: 152300,
          averageLeadValue: 1228,
        }),
      1000 // Simulate 1-second network delay
    )
  );
};

// --- Example Page Component ---

/**
 * A simplified example of what a "Leads" page component might look like,
 * featuring the MiniDashboard at the top.
 */
const LeadsPageExample = () => {
  // Custom metric configuration for demonstration purposes
  const customLeadsMetrics: MetricConfig<LeadsDashboardStats>[] = [
    {
      id: "totalLeads",
      label: "Total Leads",
      icon: <Target className="h-5 w-5 text-blue-500" />,
      getValue: (data) => data.totalLeads,
      getTrend: (data) => `${data.newLeadsThisWeek} new this week`,
      size: "lg", // Demonstrate using a larger size
    },
    {
      id: "conversionRate",
      label: "Conversion Rate",
      icon: <TrendingUp className="h-5 w-5 text-green-500" />,
      getValue: (data) => data.conversionRate,
      format: (value) => `${Number(value).toFixed(1)}%`,
    },
    {
      id: "pipelineValue",
      label: "Pipeline Value",
      icon: <DollarSign className="h-5 w-5 text-gray-500" />,
      getValue: (data) => data.estimatedPipelineValue,
      format: (value) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(Number(value)),
    },
  ];

  return (
    <QueryClientProvider client={queryClient}>
      <div className="p-8 bg-slate-100 dark:bg-slate-900 min-h-screen space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            Leads Module
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            This page demonstrates various implementations of the MiniDashboard.
          </p>
        </header>

        {/* --- Example 1: Standard Implementation --- */}
        <div>
          <h2 className="text-xl font-semibold mb-2 text-slate-700 dark:text-slate-300">
            Standard Mini-Dashboard
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            This is the default usage, pulling its configuration from the
            centralized metrics providers. It is collapsible by default.
          </p>
          <MiniDashboard
            title="Leads Overview"
            metrics={leadsDashboardMetrics}
            queryKey={leadsDashboardQuery.queryKey}
            queryFn={mockLeadsApi} // Use mock API for this example
          />
        </div>

        {/* --- Example 2: Non-Collapsible and Initially Collapsed --- */}
        <div>
          <h2 className="text-xl font-semibold mb-2 text-slate-700 dark:text-slate-300">
            Configuration Variations
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                This dashboard is configured to be non-collapsible.
              </p>
              <MiniDashboard
                title="Static Overview"
                metrics={leadsDashboardMetrics.slice(0, 2)} // Show fewer metrics
                queryKey={["leads", "dashboard", "static"]}
                queryFn={mockLeadsApi}
                collapsible={false} // Variation
              />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                This dashboard starts in a collapsed state.
              </p>
              <MiniDashboard
                title="Collapsed by Default"
                metrics={leadsDashboardMetrics.slice(0, 2)}
                queryKey={["leads", "dashboard", "collapsed"]}
                queryFn={mockLeadsApi}
                initiallyCollapsed={true} // Variation
              />
            </div>
          </div>
        </div>

        {/* --- Example 3: Custom Metrics and Formatting --- */}
        <div>
          <h2 className="text-xl font-semibold mb-2 text-slate-700 dark:text-slate-300">
            Custom Metrics Implementation
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            This example shows how to define custom metrics and formatting
            directly on the page, overriding the default providers.
          </p>
          <MiniDashboard
            title="Custom Leads Dashboard"
            metrics={customLeadsMetrics} // Using custom metric config
            queryKey={["leads", "dashboard", "custom"]}
            queryFn={mockLeadsApi}
          />
        </div>

        {/* --- Example 4: Loading and Error States --- */}
        <div>
          <h2 className="text-xl font-semibold mb-2 text-slate-700 dark:text-slate-300">
            State Handling
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                This dashboard demonstrates the loading state.
              </p>
              <MiniDashboard
                title="Loading State"
                metrics={leadsDashboardMetrics}
                queryKey={["leads", "dashboard", "loading"]}
                // This query will never resolve, keeping it in a loading state
                queryFn={() => new Promise(() => {})}
              />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                This dashboard demonstrates the error state.
              </p>
              <MiniDashboard
                title="Error State"
                metrics={leadsDashboardMetrics}
                queryKey={["leads", "dashboard", "error"]}
                // This query will always reject, triggering the error state
                queryFn={() => Promise.reject(new Error("Failed to fetch data from API."))}
                queryOptions={{ retry: false }} // Disable retries for the example
              />
            </div>
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
};

export default LeadsPageExample;

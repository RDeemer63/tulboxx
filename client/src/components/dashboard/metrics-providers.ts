import React from "react";
import {
  Users,
  Target,
  TrendingUp,
  FileText,
  CheckCircle2,
  Briefcase,
  Calendar,
  Wrench,
  DollarSign,
  AlertTriangle,
  Receipt,
} from "lucide-react";

import { apiRequestJson, queryKeys } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";
import type { MetricConfig } from "./mini-dashboard";

// =================================================================
// Type Definitions for Dashboard API Responses
// These interfaces define the expected shape of data from the backend.
// =================================================================

export interface LeadsDashboardStats {
  totalLeads: number;
  newLeadsThisWeek: number;
  conversionRate: number; // as a percentage, e.g., 25.5 for 25.5%
  estimatedPipelineValue: number;
  averageLeadValue: number;
}

export interface EstimatesDashboardStats {
  pendingEstimates: number;
  pendingValue: number;
  winRate: number; // as a percentage
  averageValue: number;
  sentThisMonth: number;
}

export interface JobsDashboardStats {
  activeJobs: number;
  upcomingJobs: number;
  completedThisWeek: number;
  totalValueActive: number;
}

export interface BillingDashboardStats {
  outstandingInvoices: number;
  outstandingValue: number;
  overdueInvoices: number;
  overdueValue: number;
  revenueThisMonth: number;
  revenueYTD: number;
}

// =================================================================
// Leads Dashboard Provider
// =================================================================

/**
 * Metric configurations for the Leads module mini-dashboard.
 */
export const leadsDashboardMetrics: MetricConfig<LeadsDashboardStats>[] = [
  {
    id: "totalLeads",
    label: "Total Active Leads",
    icon: <Target className="h-5 w-5 text-blue-500" />,
    getValue: (data) => data.totalLeads,
    getTrend: (data) => `${data.newLeadsThisWeek} new this week`,
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
    format: (value) => formatCurrency(value),
  },
  {
    id: "avgLeadValue",
    label: "Average Lead Value",
    icon: <DollarSign className="h-5 w-5 text-gray-500" />,
    getValue: (data) => data.averageLeadValue,
    format: (value) => formatCurrency(value),
  },
];

/**
 * Query configuration for fetching leads dashboard data.
 */
export const leadsDashboardQuery = {
  queryKey: queryKeys.dashboard.leads,
  queryFn: () =>
    apiRequestJson<LeadsDashboardStats>("/api/leads/dashboard-stats"),
};

// =================================================================
// Estimates Dashboard Provider
// =================================================================

/**
 * Metric configurations for the Estimates module mini-dashboard.
 */
export const estimatesDashboardMetrics: MetricConfig<EstimatesDashboardStats>[] =
  [
    {
      id: "pendingEstimates",
      label: "Pending Estimates",
      icon: <FileText className="h-5 w-5 text-yellow-500" />,
      getValue: (data) => data.pendingEstimates,
      getTrend: (data) => `${formatCurrency(data.pendingValue)}`,
    },
    {
      id: "winRate",
      label: "Estimate Win Rate",
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      getValue: (data) => data.winRate,
      format: (value) => `${Number(value).toFixed(1)}%`,
    },
    {
      id: "averageValue",
      label: "Average Estimate Value",
      icon: <DollarSign className="h-5 w-5 text-gray-500" />,
      getValue: (data) => data.averageValue,
      format: (value) => formatCurrency(value),
    },
    {
      id: "sentThisMonth",
      label: "Sent This Month",
      icon: <Calendar className="h-5 w-5 text-blue-500" />,
      getValue: (data) => data.sentThisMonth,
    },
  ];

/**
 * Query configuration for fetching estimates dashboard data.
 */
export const estimatesDashboardQuery = {
  queryKey: queryKeys.dashboard.estimates,
  queryFn: () =>
    apiRequestJson<EstimatesDashboardStats>("/api/estimates/dashboard-stats"),
};

// =================================================================
// Jobs Dashboard Provider
// =================================================================

/**
 * Metric configurations for the Jobs module mini-dashboard.
 */
export const jobsDashboardMetrics: MetricConfig<JobsDashboardStats>[] = [
  {
    id: "activeJobs",
    label: "Active Jobs",
    icon: <Briefcase className="h-5 w-5 text-blue-500" />,
    getValue: (data) => data.activeJobs,
    getTrend: (data) => `${formatCurrency(data.totalValueActive)} in progress`,
  },
  {
    id: "upcomingJobs",
    label: "Upcoming Jobs",
    icon: <Calendar className="h-5 w-5 text-gray-500" />,
    getValue: (data) => data.upcomingJobs,
    getTrend: (data) => "in the next 7 days",
  },
  {
    id: "completedThisWeek",
    label: "Completed This Week",
    icon: <Wrench className="h-5 w-5 text-green-500" />,
    getValue: (data) => data.completedThisWeek,
  },
];

/**
 * Query configuration for fetching jobs dashboard data.
 */
export const jobsDashboardQuery = {
  queryKey: queryKeys.dashboard.jobs,
  queryFn: () =>
    apiRequestJson<JobsDashboardStats>("/api/jobs/dashboard-stats"),
};

// =================================================================
// Billing Dashboard Provider
// =================================================================

/**
 * Metric configurations for the Billing module mini-dashboard.
 */
export const billingDashboardMetrics: MetricConfig<BillingDashboardStats>[] = [
  {
    id: "outstandingValue",
    label: "Outstanding Invoices",
    icon: <Receipt className="h-5 w-5 text-yellow-500" />,
    getValue: (data) => data.outstandingValue,
    format: (value) => formatCurrency(value),
    getTrend: (data) => `${data.outstandingInvoices} invoices`,
  },
  {
    id: "overdueValue",
    label: "Overdue Invoices",
    icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
    getValue: (data) => data.overdueValue,
    format: (value) => formatCurrency(value),
    getTrend: (data) => `${data.overdueInvoices} invoices overdue`,
  },
  {
    id: "revenueThisMonth",
    label: "Revenue This Month",
    icon: <DollarSign className="h-5 w-5 text-green-500" />,
    getValue: (data) => data.revenueThisMonth,
    format: (value) => formatCurrency(value),
  },
  {
    id: "revenueYTD",
    label: "Revenue (YTD)",
    icon: <TrendingUp className="h-5 w-5 text-green-500" />,
    getValue: (data) => data.revenueYTD,
    format: (value) => formatCurrency(value),
  },
];

/**
 * Query configuration for fetching billing dashboard data.
 */
export const billingDashboardQuery = {
  queryKey: queryKeys.dashboard.billing,
  queryFn: () =>
    apiRequestJson<BillingDashboardStats>("/api/billing/dashboard-stats"),
};

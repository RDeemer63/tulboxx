import React, { useState, useMemo } from "react";
import {
  Users,
  TrendingUp,
  FileText,
  Clock,
  BarChart2,
  PieChart,
} from "lucide-react";

import { useLeads } from "@/contexts/leads-context";
import {
  useFilteredLeads,
  useNewLeadsCount,
  useLeadsByStage,
  useLeadConversionRate,
  useTopLeadSources,
  useAverageTimeInStage,
  type TimeRange,
} from "@/hooks/analytics/leads";

// Import Blue Steel UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { MiniMetricCard } from "@/components/dashboard/MiniMetricCard";
import { MiniBarChart } from "@/components/dashboard/MiniBarChart";
import { MiniDonutChart } from "@/components/dashboard/MiniDonutChart";

/**
 * A dashboard component specifically for displaying key metrics and analytics
 * for the Leads module. It follows the layout and specifications from the
 * approved wireframe.
 */
export const LeadsMiniDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("This Week");

  // --- Data Fetching and Processing ---
  const {
    leads: allLeads,
    isLoading,
    isError,
    refetchLeads,
  } = useLeads();

  // 1. Filter leads based on the selected time range
  const filteredLeads = useFilteredLeads(allLeads, timeRange);

  // 2. Calculate metrics using the filtered data
  const { count: newLeadsCount, trend: newLeadsTrend } = useNewLeadsCount(
    allLeads,
    timeRange
  );
  const leadsByStage = useLeadsByStage(filteredLeads);
  const conversionRate = useLeadConversionRate(filteredLeads);
  const topLeadSources = useTopLeadSources(filteredLeads);
  const avgTimeToProposal = useAverageTimeInStage(
    filteredLeads,
    "Qualified",
    "Proposal"
  );

  // --- Render Logic ---

  const renderContent = () => {
    if (isLoading) {
      return <DashboardSkeleton />;
    }

    if (isError) {
      return (
        <Alert variant="destructive">
          <AlertTitle>Failed to Load Metrics</AlertTitle>
          <AlertDescription>
            There was an error fetching lead data. Please try refreshing.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Top Row: Key Metrics */}
        <MiniMetricCard
          title="New Leads"
          value={newLeadsCount}
          isLoading={false}
          isError={false}
          icon={<Users className="h-5 w-5" />}
          trendValue={newLeadsTrend}
          trendLabel={`vs last ${timeRange === "This Week" ? "week" : "month"}`}
        />
        <MiniMetricCard
          title="Lead to Estimate Conversion Rate"
          value={`${conversionRate}%`}
          isLoading={false}
          isError={false}
          icon={<TrendingUp className="h-5 w-5" />}
          trendLabel="of leads became estimates"
        />
        <MiniMetricCard
          title="Avg. Time to Proposal"
          value={avgTimeToProposal !== null ? `${avgTimeToProposal} days` : "N/A"}
          isLoading={false}
          isError={false}
          icon={<Clock className="h-5 w-5" />}
          trendLabel="from Qualified stage"
        />

        {/* Bottom Row: Charts */}
        <div className="md:col-span-2 lg:col-span-3">
          <MiniBarChart
            title="Leads by Stage"
            description={`Current distribution of leads created ${timeRange.toLowerCase()}.`}
            data={leadsByStage}
            isLoading={false}
            isError={false}
            className="h-full"
          />
        </div>
        <div className="md:col-span-2 lg:col-span-3">
          <MiniDonutChart
            title="Top Lead Sources"
            description={`Source breakdown for leads created ${timeRange.toLowerCase()}.`}
            data={topLeadSources}
            isLoading={false}
            isError={false}
            className="h-full"
          />
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5" />
            Leads Dashboard
          </CardTitle>
          <CardDescription>
            Key metrics for your sales pipeline.
          </CardDescription>
        </div>
        <Select
          value={timeRange}
          onValueChange={(value: TimeRange) => setTimeRange(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="This Week">This Week</SelectItem>
            <SelectItem value="This Month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
};

// --- Skeleton Component for Loading State ---

const DashboardSkeleton = () => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
    <Skeleton className="h-28 w-full" />
    <Skeleton className="h-28 w-full" />
    <Skeleton className="h-28 w-full" />
    <Skeleton className="h-64 w-full md:col-span-2 lg:col-span-3" />
    <Skeleton className="h-64 w-full md:col-span-2 lg:col-span-3" />
  </div>
);

export default LeadsMiniDashboard;

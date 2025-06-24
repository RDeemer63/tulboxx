import React from "react";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";

import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Types for metric data and configuration
export interface MetricConfig<T = any> {
  /**
   * Unique identifier for this metric
   */
  id: string;
  
  /**
   * Human-readable label for the metric
   */
  label: string;
  
  /**
   * Icon component to display with the metric
   */
  icon?: React.ReactNode;
  
  /**
   * Function to extract the value from the fetched data
   * @param data The data returned from the query
   */
  getValue: (data: T) => string | number;
  
  /**
   * Optional format function to convert the raw value to a display value
   * @param value The raw value from getValue
   */
  format?: (value: string | number) => string;
  
  /**
   * Optional color for the metric (can be a Tailwind class or CSS color)
   */
  color?: string;
  
  /**
   * Function to calculate the change/trend for this metric
   * @param data The data returned from the query
   */
  getTrend?: (data: T) => string;
  
  /**
   * Optional link to more detailed information about this metric
   */
  link?: string;

  /**
   * Size of the card (defaults to "md")
   */
  size?: "sm" | "md" | "lg";
}

export interface MiniDashboardProps<T = any> {
  /**
   * Title for the mini-dashboard
   */
  title?: string;
  
  /**
   * Metrics to display in this mini-dashboard
   */
  metrics: MetricConfig<T>[];
  
  /**
   * Query key for fetching data
   */
  queryKey: string[];
  
  /**
   * Function that returns the data needed for this dashboard
   */
  queryFn: () => Promise<T>;
  
  /**
   * Optional additional query options
   */
  queryOptions?: Omit<UseQueryOptions<T>, "queryKey" | "queryFn">;

  /**
   * Whether the dashboard is collapsible
   * @default true
   */
  collapsible?: boolean;
  
  /**
   * Additional className for the container
   */
  className?: string;

  /**
   * Whether the dashboard should be initially collapsed
   * @default false
   */
  initiallyCollapsed?: boolean;
}

/**
 * MiniDashboard component that displays key metrics for a specific module.
 * 
 * This component can be placed at the top of any module page (Leads, Estimates, Jobs, etc.)
 * and will display the most important metrics for that module.
 * 
 * @example
 * ```tsx
 * <MiniDashboard
 *   title="Leads Overview"
 *   metrics={[
 *     {
 *       id: "totalLeads",
 *       label: "Total Leads",
 *       icon: <Users className="h-4 w-4" />,
 *       getValue: (data) => data.totalLeads,
 *       getTrend: (data) => data.leadsTrend,
 *     },
 *     // ... more metrics
 *   ]}
 *   queryKey={["leads", "dashboard"]}
 *   queryFn={() => apiRequestJson("/api/leads/dashboard")}
 * />
 * ```
 */
export function MiniDashboard<T>({
  title,
  metrics,
  queryKey,
  queryFn,
  queryOptions,
  collapsible = true,
  initiallyCollapsed = false,
  className,
}: MiniDashboardProps<T>) {
  const [isCollapsed, setIsCollapsed] = React.useState(initiallyCollapsed);
  
  const { data, isLoading, error } = useQuery<T>({
    queryKey,
    queryFn,
    ...queryOptions,
  });

  // Function to handle collapse toggle
  const toggleCollapse = () => {
    if (collapsible) {
      setIsCollapsed((prev) => !prev);
    }
  };

  if (error) {
    return (
      <div className={cn("bg-destructive/10 p-4 rounded-lg", className)}>
        <div className="text-sm text-destructive">
          Failed to load dashboard metrics. Please try refreshing the page.
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm", 
        isCollapsed ? "max-h-16" : "max-h-none",
        className
      )}
    >
      {/* Header */}
      <div 
        className={cn(
          "px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700",
          collapsible && "cursor-pointer"
        )}
        onClick={toggleCollapse}
      >
        <div className="font-medium text-slate-800 dark:text-slate-200">
          {title || "Overview"}
        </div>
        {collapsible && (
          <Button size="sm" variant="ghost" className="p-0 h-6 w-6">
            {isCollapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Dashboard Content */}
      {!isCollapsed && (
        <div className="p-4">
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {data &&
                metrics.map((metric) => {
                  const value = metric.getValue(data);
                  const formattedValue = metric.format ? metric.format(value) : value;
                  const trend = metric.getTrend ? metric.getTrend(data) : undefined;

                  return (
                    <StatCard
                      key={metric.id}
                      value={formattedValue}
                      label={metric.label}
                      icon={metric.icon}
                      changeValue={undefined} // We use the trend string instead
                      subValue={trend}
                      size={metric.size || "md"}
                    />
                  );
                })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MiniDashboard;

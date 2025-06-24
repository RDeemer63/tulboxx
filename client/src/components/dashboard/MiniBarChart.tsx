import * as React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { AlertTriangle, BarChart2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { type LeadStage, leadStageEnum } from "../../../shared/leads-schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

// =================================================================
// Configuration
// =================================================================

/**
 * Defines the color palette for each lead stage, ensuring consistency
 * with the Kanban board and other UI elements.
 */
const STAGE_COLORS: Record<LeadStage, string> = {
  New: "#3B82F6", // blue-500
  Contacted: "#F59E0B", // amber-500
  Qualified: "#8B5CF6", // violet-500
  Proposal: "#10B981", // emerald-500
  Won: "#22C55E", // green-500
  Lost: "#EF4444", // red-500
};

// =================================================================
// Component Props
// =================================================================

export interface MiniBarChartProps {
  /** The title of the chart card. */
  title: string;
  /** A brief description of what the chart represents. */
  description: string;
  /**
   * The data to be displayed, as a map of lead stages to their counts.
   * Example: `new Map([['New', 10], ['Contacted', 5]])`
   */
  data: Map<LeadStage, number> | null | undefined;
  /** A boolean to indicate if the data is currently loading. */
  isLoading: boolean;
  /** A boolean to indicate if there was an error fetching the data. */
  isError: boolean;
  /** An optional callback function to retry fetching data on error. */
  onRetry?: () => void;
  /** Additional CSS classes for custom styling. */
  className?: string;
}

// =================================================================
// Main Component
// =================================================================

/**
 * A compact, responsive bar chart component designed for mini-dashboards.
 * It visualizes data distributions, such as leads per stage, and handles
 * loading, error, and empty states gracefully.
 */
export const MiniBarChart: React.FC<MiniBarChartProps> = ({
  title,
  description,
  data,
  isLoading,
  isError,
  onRetry,
  className,
}) => {
  // --- Data Transformation ---
  // Recharts' stacked bar chart works best with data in this format: `[{ name: 'Leads', New: 10, Contacted: 5, ... }]`
  const chartData = React.useMemo(() => {
    if (!data) return [];
    const singleEntry: { name: string; [key: string]: number | string } = {
      name: "Leads",
    };
    leadStageEnum.enumValues.forEach((stage) => {
      singleEntry[stage] = data.get(stage) || 0;
    });
    return [singleEntry];
  }, [data]);

  // --- State-based Rendering ---

  // Loading State
  if (isLoading) {
    return (
      <Card className={cn("h-full", className)}>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Error State
  if (isError) {
    return (
      <Card className={cn("h-full", className)}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="h-48">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Could not load chart data.
              {onRetry && (
                <Button
                  variant="link"
                  className="p-0 h-auto mt-2"
                  onClick={onRetry}
                >
                  Try again
                </Button>
              )}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Empty State
  if (!data || data.size === 0) {
    return (
      <Card className={cn("h-full", className)}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex h-48 items-center justify-center">
          <div className="text-center text-sm text-muted-foreground">
            <BarChart2 className="mx-auto h-8 w-8 text-slate-400 dark:text-slate-500" />
            <p className="mt-2">No data available for this period.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // --- Main Chart Render ---

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              stroke="hsl(var(--border) / 0.5)"
            />
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" hide />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                borderColor: "hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
            />
            <Legend
              iconSize={10}
              wrapperStyle={{
                fontSize: "12px",
                paddingTop: "16px",
              }}
            />
            {leadStageEnum.enumValues.map((stage) => (
              <Bar
                key={stage}
                dataKey={stage}
                stackId="a"
                fill={STAGE_COLORS[stage]}
                radius={[4, 4, 4, 4]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default MiniBarChart;

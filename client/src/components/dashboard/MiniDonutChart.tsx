import * as React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { AlertTriangle, PieChart as PieChartIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

// =================================================================
// Configuration
// =================================================================

/**
 * A consistent, visually appealing color palette for chart segments.
 * These colors are chosen to work well in both light and dark modes.
 */
const CHART_COLORS = [
  "#0070D2", // Blue Steel Primary
  "#F59E0B", // Accent Orange
  "#10B981", // Success Green
  "#8B5CF6", // Violet
  "#3B82F6", // Lighter Blue
  "#F97316", // Brighter Orange
];

// =================================================================
// Component Props
// =================================================================

export interface DonutChartDataPoint {
  name: string;
  value: number;
}

export interface MiniDonutChartProps {
  /** The title of the chart card. */
  title: string;
  /** A brief description of what the chart represents. */
  description: string;
  /**
   * The data to be displayed in the chart.
   * An array of objects, each with a `name` and a `value`.
   */
  data: DonutChartDataPoint[] | null | undefined;
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
 * A compact, responsive donut chart component for mini-dashboards.
 * It visualizes proportional data (e.g., top lead sources) and includes
 * built-in states for loading, errors, and empty data.
 */
export const MiniDonutChart: React.FC<MiniDonutChartProps> = ({
  title,
  description,
  data,
  isLoading,
  isError,
  onRetry,
  className,
}) => {
  // --- Custom Label Renderer for Percentages ---
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const RADIAN = Math.PI / 180;
    // Position the label slightly inside the slice for a clean look
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Only render the label if the percentage is significant enough to not clutter the chart
    if (percent * 100 < 5) {
      return null;
    }

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-xs font-bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // --- State-based Rendering ---

  if (isLoading) {
    return (
      <Card className={cn("h-full", className)}>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <Skeleton className="h-48 w-48 rounded-full" />
        </CardContent>
      </Card>
    );
  }

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

  if (!data || data.length === 0) {
    return (
      <Card className={cn("h-full", className)}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex h-48 items-center justify-center">
          <div className="text-center text-sm text-muted-foreground">
            <PieChartIcon className="mx-auto h-8 w-8 text-slate-400 dark:text-slate-500" />
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
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                borderColor: "hsl(var(--border))",
                borderRadius: "var(--radius)",
              }}
              formatter={(value: number, name: string) => [value, name]}
            />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              nameKey="name"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Legend
              iconSize={10}
              wrapperStyle={{
                fontSize: "12px",
                paddingTop: "16px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default MiniDonutChart;

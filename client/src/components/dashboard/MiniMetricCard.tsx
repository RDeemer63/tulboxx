import * as React from "react";
import { TrendingUp, TrendingDown, RefreshCw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

/**
 * Props for the MiniMetricCard component.
 */
export interface MiniMetricCardProps {
  /** The title or label for the metric. */
  title: string;
  /** The main value of the metric. Can be a number or a string. */
  value: string | number | null | undefined;
  /** A boolean to indicate if the data is currently loading. */
  isLoading: boolean;
  /** A boolean to indicate if there was an error fetching the data. */
  isError: boolean;
  /** An optional icon component to display next to the title. */
  icon?: React.ReactNode;
  /** An optional numeric value to indicate a trend (positive or negative). */
  trendValue?: number;
  /** An optional label to provide context for the trend (e.g., "vs last week"). */
  trendLabel?: string;
  /** An optional function to format the display value. */
  formatValue?: (value: string | number) => string;
  /** An optional callback function to retry fetching data on error. */
  onRetry?: () => void;
  /** An optional callback for when the card is clicked. */
  onClick?: () => void;
  /** Additional CSS classes for custom styling. */
  className?: string;
}

/**
 * A reusable card component for displaying a single key metric.
 * It handles loading, error, and empty states, and can display a trend indicator.
 */
export const MiniMetricCard: React.FC<MiniMetricCardProps> = ({
  title,
  value,
  isLoading,
  isError,
  icon,
  trendValue,
  trendLabel,
  formatValue,
  onRetry,
  onClick,
  className,
}) => {
  // --- Loading State ---
  if (isLoading) {
    return (
      <Card className={cn("p-4", className)}>
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-1/2 mt-2" />
      </Card>
    );
  }

  // --- Error State ---
  if (isError) {
    return (
      <Card
        className={cn(
          "p-4 flex flex-col items-center justify-center text-center h-full",
          className
        )}
      >
        <AlertCircle className="h-6 w-6 text-destructive mb-2" />
        <p className="text-sm font-medium text-destructive">Metric Error</p>
        <p className="text-xs text-muted-foreground">Could not load data.</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="mt-3">
            <RefreshCw className="mr-2 h-3 w-3" />
            Retry
          </Button>
        )}
      </Card>
    );
  }

  // --- Data & Empty State ---
  const hasData = value !== null && value !== undefined && value !== "";
  const formattedValue = hasData
    ? formatValue
      ? formatValue(value)
      : value
    : "-";

  const hasTrend = typeof trendValue === "number";
  const trendDirection =
    hasTrend && trendValue > 0
      ? "up"
      : hasTrend && trendValue < 0
      ? "down"
      : "neutral";

  const TrendIcon =
    trendDirection === "up"
      ? TrendingUp
      : trendDirection === "down"
      ? TrendingDown
      : null;

  const trendColor =
    trendDirection === "up"
      ? "text-green-600 dark:text-green-400"
      : trendDirection === "down"
      ? "text-red-600 dark:text-red-400"
      : "text-muted-foreground";

  return (
    <Card
      className={cn(
        "transition-shadow hover:shadow-md",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formattedValue}</div>
        {hasTrend ? (
          <div className="flex items-center text-xs">
            {TrendIcon && <TrendIcon className={cn("h-4 w-4 mr-1", trendColor)} />}
            <span className={trendColor}>
              {trendValue}% {trendLabel}
            </span>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            {hasData ? trendLabel || " " : "No data available"}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

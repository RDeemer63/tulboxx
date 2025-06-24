import * as React from "react";
import { IconType } from "react-icons";
import { TrendingDown, TrendingUp, Minus, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Possible trend directions for a stat card
 */
type TrendDirection = "up" | "down" | "neutral";

/**
 * Size variants for the stat card
 */
type StatCardSize = "sm" | "md" | "lg";

/**
 * Properties for the StatCard component
 */
export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The main stat value to display
   */
  value: string | number;
  
  /**
   * The label for the stat
   */
  label: string;
  
  /**
   * Optional icon to display with the stat
   */
  icon?: React.ReactNode;
  
  /**
   * Optional percentage change value
   */
  changeValue?: number;
  
  /**
   * Optional label for the period of comparison (e.g., "vs last month")
   */
  changePeriod?: string;
  
  /**
   * Optional sub-text to display below the main value
   */
  subValue?: string;
  
  /**
   * Size variant for the card
   * @default "md"
   */
  size?: StatCardSize;
  
  /**
   * Whether the card is in a loading state
   * @default false
   */
  loading?: boolean;
  
  /**
   * Whether to hide the trend indicator
   * @default false
   */
  hideTrend?: boolean;
}

/**
 * A component for displaying a metric with optional trending indicators.
 * Used in dashboards and mini-stat sections.
 */
export function StatCard({
  value,
  label,
  icon,
  changeValue,
  changePeriod,
  subValue,
  size = "md",
  loading = false,
  hideTrend = false,
  className,
  ...props
}: StatCardProps) {
  // Format numeric values with commas for better readability
  const formattedValue = React.useMemo(() => {
    if (typeof value === "number") {
      return new Intl.NumberFormat().format(value);
    }
    return value;
  }, [value]);

  // Determine the trend direction
  const trend: TrendDirection = React.useMemo(() => {
    if (changeValue === undefined || changeValue === 0) return "neutral";
    return changeValue > 0 ? "up" : "down";
  }, [changeValue]);

  // Prepare the trend icon based on direction
  const TrendIcon = {
    up: TrendingUp,
    down: TrendingDown,
    neutral: Minus,
  }[trend];

  // Determine text color for the trend
  const trendColorClass = {
    up: "text-green-600 dark:text-green-400",
    down: "text-red-600 dark:text-red-400",
    neutral: "text-muted-foreground",
  }[trend];

  // Size-specific classes
  const sizeClasses = {
    sm: {
      card: "p-3",
      value: "text-xl",
      label: "text-xs",
      icon: "h-5 w-5",
    },
    md: {
      card: "p-4",
      value: "text-2xl",
      label: "text-sm",
      icon: "h-6 w-6",
    },
    lg: {
      card: "p-5",
      value: "text-3xl",
      label: "text-sm",
      icon: "h-8 w-8",
    },
  }[size];

  return (
    <Card className={cn("overflow-hidden", className)} {...props}>
      <CardContent className={cn("p-0", sizeClasses.card)}>
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            {/* Label */}
            <p className={cn("text-muted-foreground", sizeClasses.label)}>
              {label}
            </p>

            {/* Main value with loading state */}
            <div className="flex items-center gap-2">
              {loading ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span className={cn("font-bold", sizeClasses.value)}>
                    Loading...
                  </span>
                </div>
              ) : (
                <h3
                  className={cn(
                    "font-bold tracking-tight",
                    sizeClasses.value
                  )}
                >
                  {formattedValue}
                </h3>
              )}
            </div>

            {/* Optional sub value */}
            {subValue && (
              <p className="text-xs text-muted-foreground">{subValue}</p>
            )}

            {/* Change percentage display */}
            {!loading && changeValue !== undefined && !hideTrend && (
              <div className="flex items-center mt-1">
                <TrendIcon
                  className={cn("h-3 w-3 mr-1", trendColorClass)}
                  aria-hidden="true"
                />
                <span
                  className={cn("text-xs font-medium", trendColorClass)}
                >
                  {changeValue > 0 ? "+" : ""}
                  {changeValue}%
                </span>
                {changePeriod && (
                  <span className="text-xs text-muted-foreground ml-1">
                    {changePeriod}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Optional icon */}
          {icon && (
            <div className="rounded-md bg-primary/10 p-2">
              <div className={cn("text-primary", sizeClasses.icon)}>
                {icon}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default StatCard;

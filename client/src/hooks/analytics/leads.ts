import { useMemo } from "react";
import { startOfWeek, startOfMonth, differenceInDays } from "date-fns";
import {
  type Lead,
  type LeadEvent,
  type LeadStage,
  type LeadSource,
} from "../../shared/leads-schema";

// =================================================================
// Type Definitions
// =================================================================

export type TimeRange = "This Week" | "This Month";

// =================================================================
// Utility Functions
// =================================================================

/**
 * Gets the start date for a given time range.
 * @param range - The time range ('This Week' or 'This Month').
 * @returns The start date of the range.
 */
export const getStartDateForRange = (range: TimeRange): Date => {
  const now = new Date();
  if (range === "This Week") {
    // `startOfWeek` considers Sunday as the first day of the week by default.
    return startOfWeek(now);
  }
  if (range === "This Month") {
    return startOfMonth(now);
  }
  // Fallback to the beginning of time (or a reasonable default)
  return new Date(0);
};

// =================================================================
// Base Hook for Filtering
// =================================================================

/**
 * A memoized hook to filter leads based on a selected time range.
 * This serves as a foundational hook for other analytical hooks.
 * @param allLeads - An array of all lead objects.
 * @param range - The time range to filter by.
 * @returns A memoized array of leads created within the specified range.
 */
export const useFilteredLeads = (
  allLeads: Lead[],
  range: TimeRange
): Lead[] => {
  return useMemo(() => {
    const startDate = getStartDateForRange(range);
    return allLeads.filter(
      (lead) => new Date(lead.createdAt) >= startDate
    );
  }, [allLeads, range]);
};

// =================================================================
// Analytical Hooks for Mini-Dashboard
// =================================================================

/**
 * Calculates the number of new leads within the time range and a trend.
 * @param allLeads - An array of all lead objects.
 * @param range - The time range to analyze.
 * @returns An object with the count and trend percentage.
 */
export const useNewLeadsCount = (allLeads: Lead[], range: TimeRange) => {
  const currentPeriodLeads = useFilteredLeads(allLeads, range);

  const previousPeriodStartDate = useMemo(() => {
    const now = new Date();
    if (range === "This Week") {
      return startOfWeek(new Date(now.setDate(now.getDate() - 7)));
    }
    return startOfMonth(new Date(now.setMonth(now.getMonth() - 1)));
  }, [range]);
  
  const previousPeriodEndDate = useMemo(() => getStartDateForRange(range), [range]);

  const previousPeriodLeadsCount = useMemo(() => {
    return allLeads.filter(lead => {
      const leadDate = new Date(lead.createdAt);
      return leadDate >= previousPeriodStartDate && leadDate < previousPeriodEndDate;
    }).length;
  }, [allLeads, previousPeriodStartDate, previousPeriodEndDate]);

  const trend = useMemo(() => {
    if (previousPeriodLeadsCount === 0) {
      return currentPeriodLeads.length > 0 ? 100 : 0; // Infinite growth if previous was 0
    }
    return Math.round(
      ((currentPeriodLeads.length - previousPeriodLeadsCount) / previousPeriodLeadsCount) * 100
    );
  }, [currentPeriodLeads.length, previousPeriodLeadsCount]);

  return {
    count: currentPeriodLeads.length,
    trend, // e.g., 15 for +15%
  };
};

/**
 * Groups leads by their current stage.
 * @param leads - An array of lead objects (usually pre-filtered).
 * @returns A map where keys are stages and values are the count of leads in that stage.
 */
export const useLeadsByStage = (leads: Lead[]) => {
  return useMemo(() => {
    const stageCounts = new Map<LeadStage, number>();
    leads.forEach((lead) => {
      stageCounts.set(lead.stage, (stageCounts.get(lead.stage) || 0) + 1);
    });
    return stageCounts;
  }, [leads]);
};

/**
 * Calculates the lead-to-estimate conversion rate.
 * @param leads - An array of lead objects (usually pre-filtered).
 * @returns The conversion rate as a percentage.
 */
export const useLeadConversionRate = (leads: Lead[]) => {
  return useMemo(() => {
    if (leads.length === 0) return 0;
    const convertedCount = leads.filter((lead) =>
      lead.events?.some((event) => event.type === "estimate_created")
    ).length;
    return Math.round((convertedCount / leads.length) * 100);
  }, [leads]);
};

/**
 * Analyzes and returns the top lead sources.
 * @param leads - An array of lead objects (usually pre-filtered).
 * @param topN - The number of top sources to return before grouping into "Other".
 * @returns An array of objects suitable for a chart, e.g., [{ name: 'Website', value: 10 }].
 */
export const useTopLeadSources = (leads: Lead[], topN = 4) => {
  return useMemo(() => {
    if (leads.length === 0) return [];

    const sourceCounts = new Map<LeadSource, number>();
    leads.forEach((lead) => {
      const source = lead.source || "Other";
      sourceCounts.set(source, (sourceCounts.get(source) || 0) + 1);
    });

    const sortedSources = Array.from(sourceCounts.entries()).sort(
      (a, b) => b[1] - a[1]
    );

    if (sortedSources.length <= topN) {
      return sortedSources.map(([name, value]) => ({ name, value }));
    }

    const topSources = sortedSources
      .slice(0, topN)
      .map(([name, value]) => ({ name, value }));
    const otherCount = sortedSources
      .slice(topN)
      .reduce((sum, [, count]) => sum + count, 0);

    return [...topSources, { name: "Other", value: otherCount }];
  }, [leads, topN]);
};

/**
 * Calculates the average time a lead spends between two specified stages.
 * @param leads - An array of lead objects (usually pre-filtered).
 * @param fromStage - The starting stage.
 * @param toStage - The ending stage.
 * @returns The average time in days, or null if no data is available.
 */
export const useAverageTimeInStage = (
  leads: Lead[],
  fromStage: LeadStage,
  toStage: LeadStage
) => {
  return useMemo(() => {
    const durations: number[] = [];

    leads.forEach((lead) => {
      const events = lead.events || [];
      const fromEvent = events.find(
        (e) =>
          e.type === "status_change" && e.meta?.toStage === fromStage
      );
      const toEvent = events.find(
        (e) => e.type === "status_change" && e.meta?.toStage === toStage
      );

      if (fromEvent && toEvent) {
        const fromDate = new Date(fromEvent.createdAt);
        const toDate = new Date(toEvent.createdAt);
        if (toDate > fromDate) {
          durations.push(differenceInDays(toDate, fromDate));
        }
      }
    });

    if (durations.length === 0) return null;

    const totalDays = durations.reduce((sum, duration) => sum + duration, 0);
    return Math.round(totalDays / durations.length);
  }, [leads, fromStage, toStage]);
};

import React, { useMemo } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { PlusCircle, GripVertical } from "lucide-react";

import { type Lead, type LeadStage } from "../../../shared/leads-schema";
import { cn } from "@/lib/utils";
import { LeadCard } from "./lead-card";

// Import Blue Steel UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

// --- Component Props ---

interface KanbanColumnProps {
  /**
   * The stage this column represents (e.g., "New", "Qualified").
   */
  stage: LeadStage;
  /**
   * An array of lead objects to be displayed in this column.
   */
  leads: Lead[];
  /**
   * A boolean indicating if the data for this column is currently loading.
   */
  isLoading?: boolean;
}

// --- Main Kanban Column Component ---

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  stage,
  leads,
  isLoading = false,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: stage,
    data: { type: "column", stage },
  });

  // Memoize the array of lead IDs for the SortableContext to prevent unnecessary re-renders.
  const leadIds = useMemo(() => leads.map((lead) => lead.id), [leads]);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex h-full w-80 flex-shrink-0 flex-col rounded-lg bg-slate-100/50 dark:bg-slate-800/50",
        isOver
          ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
          : "ring-0"
      )}
    >
      {/* Column Header */}
      <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 rounded-t-lg flex-shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100">
            {stage}
          </h2>
          <Badge variant="secondary">{isLoading ? "..." : leads.length}</Badge>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <PlusCircle className="h-5 w-5 text-slate-500" />
        </Button>
      </header>

      {/* Column Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <SortableContext
            items={leadIds}
            strategy={verticalListSortingStrategy}
          >
            {isLoading ? (
              // Loading State: Show skeleton cards
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-36 w-full" />
              </div>
            ) : leads.length > 0 ? (
              // Data Loaded: Render lead cards
              leads.map((lead) => <LeadCard key={lead.id} lead={lead} />)
            ) : (
              // Empty State: Show a placeholder message
              <div className="flex h-48 flex-col items-center justify-center rounded-md border-2 border-dashed border-slate-300 dark:border-slate-700 p-4 text-center">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  No leads in this stage.
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Drag a lead here to update its status.
                </p>
              </div>
            )}
          </SortableContext>
        </div>
      </ScrollArea>
    </div>
  );
};

KanbanColumn.displayName = "KanbanColumn";

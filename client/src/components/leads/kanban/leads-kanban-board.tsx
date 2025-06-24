import React, { useState, useMemo, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";

import { useLeads } from "@/contexts/leads-context";
import { type Lead, leadStageEnum } from "../../../shared/leads-schema";
import { KanbanColumn } from "./kanban-column";
import { LeadCard } from "./lead-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

// The order of stages for display in the Kanban board
const orderedStages = leadStageEnum.enumValues;

export const LeadsKanbanBoard: React.FC = () => {
  const { leads, isLoading, isError, updateLeadStage } = useLeads();
  const [activeLead, setActiveLead] = useState<Lead | null>(null);

  // Group leads by their stage for rendering in columns
  const leadsByStage = useMemo(() => {
    const grouped = new Map<typeof orderedStages[number], Lead[]>();
    orderedStages.forEach((stage) => grouped.set(stage, []));
    leads.forEach((lead) => {
      if (grouped.has(lead.stage)) {
        grouped.get(lead.stage)!.push(lead);
      }
    });
    return grouped;
  }, [leads]);

  // Configure sensors for dnd-kit (pointer for mouse/touch, keyboard for accessibility)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        // Require a small movement before a drag starts
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // --- Drag and Drop Handlers ---

  const handleDragStart = useCallback((event: DragStartEvent) => {
    if (event.active.data.current?.type === "Lead") {
      setActiveLead(event.active.data.current.lead);
    }
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveLead(null);
      const { active, over } = event;

      // If dropped over a valid droppable area
      if (over && active.id !== over.id) {
        const activeLeadId = active.id as string;
        const newStage = over.data.current?.stage as
          | typeof orderedStages[number]
          | undefined;

        if (newStage) {
          const originalLead = leads.find((l) => l.id === activeLeadId);
          if (originalLead && originalLead.stage !== newStage) {
            // Trigger optimistic update via the context
            updateLeadStage(activeLeadId, newStage);
          }
        }
      }
    },
    [leads, updateLeadStage]
  );

  // --- Render Logic ---

  if (isError) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load leads. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading && leads.length === 0) {
    return (
      <div className="flex gap-4 p-4 overflow-x-auto">
        {orderedStages.map((stage) => (
          <div key={stage} className="w-80 flex-shrink-0">
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-32 w-full mb-4" />
            <Skeleton className="h-28 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!isLoading && leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <h2 className="text-2xl font-semibold">No leads yet!</h2>
        <p className="mt-2 text-slate-500">
          Click the "Add Lead" button to get started.
        </p>
        <Button className="mt-4">
          <Plus className="mr-2 h-4 w-4" /> Add Your First Lead
        </Button>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex h-full gap-4 p-4 overflow-x-auto">
          {orderedStages.map((stage) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              leads={leadsByStage.get(stage) || []}
              isLoading={isLoading}
            />
          ))}
        </div>

        <DragOverlay>
          {activeLead ? <LeadCard lead={activeLead} /> : null}
        </DragOverlay>
      </DndContext>

      {/* Floating Action Button for mobile */}
      <div className="absolute bottom-6 right-6 md:hidden">
        <Button size="icon" className="h-14 w-14 rounded-full shadow-lg">
          <Plus className="h-6 w-6" />
          <span className="sr-only">Add Lead</span>
        </Button>
      </div>
    </div>
  );
};

export default LeadsKanbanBoard;

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { differenceInDays, formatDistanceToNowStrict } from "date-fns";
import {
  Phone,
  MessageSquareText,
  FileText,
  GripVertical,
  AlertTriangle,
  CheckCircle,
  Loader2,
  DollarSign,
  MapPin,
  Tag,
} from "lucide-react";

import { type Lead } from "../../../shared/leads-schema";
import { useLeads } from "@/contexts/leads-context";
import { cn, formatCurrency } from "@/lib/utils";

// Import Blue Steel UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

// --- Helper Functions & Configuration ---

/**
 * Determines the visual indicator for lead aging.
 * @param lastUpdated - The date the lead was last updated.
 * @returns An object with Tailwind CSS classes and a label.
 */
const getAgingIndicatorProps = (lastUpdated: Date) => {
  const daysOld = differenceInDays(new Date(), lastUpdated);
  if (daysOld <= 2) {
    return {
      className: "border-l-green-500",
      label: "New",
    };
  }
  if (daysOld <= 7) {
    return {
      className: "border-l-yellow-500",
      label: "Aging",
    };
  }
  return {
    className: "border-l-red-500",
    label: "Needs Attention",
  };
};

/**
 * Maps sync status to a specific icon and color for visual feedback.
 */
const syncStatusMap: Record<
  Lead["syncStatus"],
  { icon: React.ElementType; color: string; tooltip: string }
> = {
  synced: {
    icon: CheckCircle,
    color: "text-green-500",
    tooltip: "Synced with server",
  },
  pending: {
    icon: Loader2,
    color: "text-yellow-500 animate-spin",
    tooltip: "Pending sync",
  },
  error: {
    icon: AlertTriangle,
    color: "text-red-500",
    tooltip: "Sync error",
  },
};

// --- Component Props ---

interface LeadCardProps {
  lead: Lead;
  // The useSortable hook is managed in the parent KanbanColumn
}

// --- Main Lead Card Component ---

export const LeadCard: React.FC<LeadCardProps> = React.memo(({ lead }) => {
  const { selectLead } = useLeads();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id, data: { lead } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
  };

  const agingProps = getAgingIndicatorProps(new Date(lead.updatedAt));
  const SyncStatusIcon = syncStatusMap[lead.syncStatus]?.icon;

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card's main onClick from firing
  };

  const handleCreateEstimate = (e: React.MouseEvent) => {
    handleActionClick(e);
    // TODO: Implement navigation or modal opening for estimate creation
    console.log(`Create estimate for lead: ${lead.id}`);
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div ref={setNodeRef} style={style} {...attributes}>
        <Card
          className={cn(
            "mb-4 cursor-pointer shadow-sm hover:shadow-lg transition-shadow duration-200 border-l-4",
            agingProps.className,
            isDragging && "shadow-2xl ring-2 ring-primary"
          )}
          onClick={() => selectLead(lead.id)}
        >
          <CardHeader className="flex flex-row items-start justify-between p-3">
            <CardTitle className="text-base font-semibold leading-tight">
              {lead.leadName}
            </CardTitle>
            <div
              className="cursor-grab p-1 text-slate-400 hover:text-slate-600"
              {...listeners}
            >
              <GripVertical className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0 text-sm text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2 mb-2">
              {lead.serviceType && (
                <Badge variant="secondary">{lead.serviceType}</Badge>
              )}
              {lead.source && <Badge variant="outline">{lead.source}</Badge>}
            </div>

            {lead.notes && (
              <p className="text-xs line-clamp-2 mb-3">{lead.notes}</p>
            )}

            <Separator className="my-2" />

            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>
                Updated{" "}
                {formatDistanceToNowStrict(new Date(lead.updatedAt), {
                  addSuffix: true,
                })}
              </span>
              <div className="flex items-center gap-2">
                {SyncStatusIcon && (
                  <Tooltip>
                    <TooltipTrigger>
                      <SyncStatusIcon
                        className={cn(
                          "h-4 w-4",
                          syncStatusMap[lead.syncStatus]?.color
                        )}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      {syncStatusMap[lead.syncStatus]?.tooltip}
                    </TooltipContent>
                  </Tooltip>
                )}
                {lead.estimatedValue && (
                  <div className="flex items-center font-semibold">
                    <DollarSign className="h-4 w-4 mr-1" />
                    {formatCurrency(lead.estimatedValue)}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 flex items-center justify-end space-x-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      handleActionClick(e);
                      window.location.href = `tel:${lead.phone}`;
                    }}
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Call {lead.phone}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      handleActionClick(e);
                      window.location.href = `sms:${lead.phone}`;
                    }}
                  >
                    <MessageSquareText className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Text {lead.phone}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-primary hover:text-primary"
                    onClick={handleCreateEstimate}
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Create Estimate</TooltipContent>
              </Tooltip>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
});

LeadCard.displayName = "LeadCard";

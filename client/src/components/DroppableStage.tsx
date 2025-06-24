import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit2, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { SortableLeadCard } from "./SortableLeadCard";
import type { LeadPipelineStage, LeadPipelineEntry } from "@shared/schema";

interface DroppableStageProps {
  stage: LeadPipelineStage;
  entries: LeadPipelineEntry[];
  stageValue: number;
  onViewDetails: (entry: LeadPipelineEntry) => void;
  onEditStage: (stage: LeadPipelineStage) => void;
  onDeleteStage: (id: number) => void;
  allEntries?: LeadPipelineEntry[]; // All entries for this stage (before limiting)
  maxVisible?: number; // Maximum number of visible entries
  selectedLeads?: number[];
  onSelectChange?: (leadId: number, selected: boolean) => void;
}

export function DroppableStage({
  stage,
  entries,
  stageValue,
  onViewDetails,
  onEditStage,
  onDeleteStage,
  allEntries = entries,
  maxVisible = 5,
  selectedLeads = [],
  onSelectChange,
}: DroppableStageProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { setNodeRef, isOver } = useDroppable({
    id: `stage-${stage.id}`,
  });

  const displayedEntries = isExpanded ? allEntries : entries.slice(0, maxVisible);
  const hiddenCount = Math.max(0, allEntries.length - maxVisible);
  const shouldShowExpandButton = allEntries.length > maxVisible;

  return (
    <Card className={`w-80 flex-shrink-0 ${isOver ? 'ring-2 ring-blue-500' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: stage.color }}
            />
            <div>
              <CardTitle className="text-lg">{stage.name}</CardTitle>
              <CardDescription className="text-xs">
                {entries.length} leads • ${stageValue.toLocaleString()} weighted
              </CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onEditStage(stage)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Stage
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDeleteStage(stage.id)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Stage
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent 
        ref={setNodeRef}
        className={`space-y-3 transition-all duration-300 ease-in-out ${isOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`} 
        style={{ minHeight: '200px' }}
      >
        <SortableContext items={displayedEntries.map(e => e.id.toString())} strategy={verticalListSortingStrategy}>
          {displayedEntries.map((entry) => (
            <SortableLeadCard 
              key={entry.id} 
              entry={entry}
              onViewDetails={onViewDetails}
              isSelected={selectedLeads.includes(entry.id)}
              onSelectChange={onSelectChange}
            />
          ))}
        </SortableContext>
        
        {shouldShowExpandButton && (
          <div className="text-center pt-2">
            <Button
              variant="ghost" 
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Show {hiddenCount} More
                </>
              )}
            </Button>
          </div>
        )}
        
        {allEntries.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8 text-sm">
            No leads in this stage
          </div>
        )}
      </CardContent>
    </Card>
  );
}
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { LeadCard, Lead } from './LeadCard'; // Assuming LeadCard and Lead type are exported from LeadCard.tsx

interface StageColumnProps {
  id: string; // Corresponds to the stage ID (e.g., 'new', 'contacted')
  title: string; // Display title for the stage (e.g., 'New Leads')
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onCallClick: (lead: Lead) => void;
  onEditClick: (lead: Lead) => void;
  onWinClick: (lead: Lead) => void;
  onLoseClick: (lead: Lead) => void;
  onStageChange: (lead: Lead, newStage: string) => void;
}

export const StageColumn: React.FC<StageColumnProps> = ({
  id,
  title,
  leads,
  onLeadClick,
  onCallClick,
  onEditClick,
  onWinClick,
  onLoseClick,
  onStageChange,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-72 sm:w-80 bg-gray-50 dark:bg-slate-800 rounded-lg shadow-md p-4 mr-4 last:mr-0 transition-colors
        ${isOver ? 'ring-2 ring-primary/50 bg-primary/5 dark:bg-primary/10' : ''}`}
    >
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 border-b pb-2 border-gray-200 dark:border-slate-700">
        {title} <span className="text-gray-500 dark:text-gray-400">({leads.length})</span>
      </h3>
      <div className="min-h-[100px]">
        {/* Minimum height keeps a visible drop zone even when empty */}
        {leads.length === 0 ? (
          <p className="text-sm text-muted-foreground italic py-4 text-center">
            No leads
          </p>
        ) : (
          leads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onClick={onLeadClick}
              onCallClick={onCallClick}
              onEditClick={onEditClick}
              onWinClick={onWinClick}
              onLoseClick={onLoseClick}
              onStageChange={onStageChange}
            />
          ))
        )}
      </div>
    </div>
  );
};

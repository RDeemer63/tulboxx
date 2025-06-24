import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DropAnimation,
  defaultDropAnimation,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
import { Loader2, PlusCircle, Search } from 'lucide-react';

import { LeadCard, Lead } from '@/components/leads/LeadCard';
import { LeadDrawer } from '@/components/leads/LeadDrawer';
import { StageColumn } from '@/components/leads/StageColumn';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useLeadsApi } from '@/lib/api/leads';

const dropAnimation: DropAnimation = {
  ...defaultDropAnimation,
  dragSourceOpacity: 0.5,
};

const initialStages = ['new', 'contacted', 'estimate_sent', 'won', 'lost'];

const LeadsPage: React.FC = () => {

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { getLeadsByStage, createLead, updateLead, deleteLead, moveToStage, markAsWon, markAsLost, setFollowUp, clearFollowUp, logCall, logEmail, logText, logMeeting, logEstimate } = useLeadsApi();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const { data: leadsByStage, isLoading, isError, error } = useQuery({
    queryKey: ['leadsByStage', searchQuery],
    queryFn: () => getLeadsByStage({ search: searchQuery }),
  });

  const updateLeadStageMutation = useMutation({
    mutationFn: ({ leadId, newStage }: { leadId: string; newStage: string }) => moveToStage({ id: leadId, stage: newStage }),
    onMutate: async ({ leadId, newStage }) => {
      await queryClient.cancelQueries({ queryKey: ['leadsByStage'] });
      const previousLeads = queryClient.getQueryData<Record<string, Lead[]>>(['leadsByStage', searchQuery]);

      queryClient.setQueryData<Record<string, Lead[]>>(['leadsByStage', searchQuery], (old) => {
        if (!old) return old;

        const newLeadsByStage = { ...old };
        let draggedLead: Lead | undefined;
        let oldStage: string | undefined;

        // Find the lead and its old stage
        for (const stageKey in newLeadsByStage) {
          const index = newLeadsByStage[stageKey].findIndex(lead => lead.id === leadId);
          if (index !== -1) {
            draggedLead = { ...newLeadsByStage[stageKey][index], stage: newStage };
            newLeadsByStage[stageKey] = newLeadsByStage[stageKey].filter(lead => lead.id !== leadId);
            oldStage = stageKey;
            break;
          }
        }

        // Add the lead to the new stage
        if (draggedLead && newLeadsByStage[newStage]) {
          newLeadsByStage[newStage] = [...newLeadsByStage[newStage], draggedLead];
        }

        return newLeadsByStage;
      });

      return { previousLeads };
    },
    onError: (err, variables, context) => {
      toast({
        title: 'Error updating lead stage',
        description: err.message || 'Failed to move lead.',
        variant: 'destructive',
      });
      if (context?.previousLeads) {
        queryClient.setQueryData(['leadsByStage', searchQuery], context.previousLeads);
      }
    },
    onSuccess: () => {
      toast({
        title: 'Lead Updated',
        description: 'Stage updated successfully.',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['leadsByStage'] });
      queryClient.invalidateQueries({ queryKey: ['leadStats'] });
    },
  });

  const handleCreateNewLead = () => {
    setEditingLead(null);
    setIsDrawerOpen(true);
  };

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    setIsDrawerOpen(true);
  };

  const handleLeadDrawerSuccess = () => {
    setIsDrawerOpen(false);
    setEditingLead(null);
    queryClient.invalidateQueries({ queryKey: ['leadsByStage'] });
    queryClient.invalidateQueries({ queryKey: ['leadStats'] });
  };

  const handleLeadDrawerClose = () => {
    setIsDrawerOpen(false);
    setEditingLead(null);
  };

  const handleStageChange = (lead: Lead, newStage: string) => {
    updateLeadStageMutation.mutate({ leadId: lead.id, newStage });
  };

  const handleWinLead = (lead: Lead) => {
    markAsWon({ id: lead.id, userId: 'current_user_id', convertToJob: false }) // Placeholder userId
      .then(() => {
        toast({ title: 'Lead Won', description: `${lead.fullName} marked as won.` });
        queryClient.invalidateQueries({ queryKey: ['leadsByStage'] });
        queryClient.invalidateQueries({ queryKey: ['leadStats'] });
      })
      .catch(err => {
        toast({ title: 'Error', description: err.message || 'Failed to mark lead as won.', variant: 'destructive' });
      });
  };

  const handleLoseLead = (lead: Lead) => {
    markAsLost({ id: lead.id, userId: 'current_user_id' }) // Placeholder userId
      .then(() => {
        toast({ title: 'Lead Lost', description: `${lead.fullName} marked as lost.` });
        queryClient.invalidateQueries({ queryKey: ['leadsByStage'] });
        queryClient.invalidateQueries({ queryKey: ['leadStats'] });
      })
      .catch(err => {
        toast({ title: 'Error', description: err.message || 'Failed to mark lead as lost.', variant: 'destructive' });
      });
  };

  const handleCallLead = (lead: Lead) => {
    // In a real app, this would trigger a call action (e.g., tel: link or softphone integration)
    // For now, just log it and show a toast
    logCall({ id: lead.id, notes: 'Called from Kanban board', userId: 'current_user_id' }) // Placeholder userId
      .then(() => {
        toast({ title: 'Call Logged', description: `Logged a call for ${lead.fullName}.` });
        queryClient.invalidateQueries({ queryKey: ['lead', lead.id, 'events'] });
      })
      .catch(err => {
        toast({ title: 'Error', description: err.message || 'Failed to log call.', variant: 'destructive' });
      });
  };

  const findLead = (id: string) => {
    for (const stageKey of initialStages) {
      const leadsInStage = leadsByStage?.[stageKey];
      if (leadsInStage) {
        const lead = leadsInStage.find(l => l.id === id);
        if (lead) return lead;
      }
    }
    return undefined;
  };

  const handleDragStart = (event: any) => {
    setActiveDragId(event.active.id);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (!over) return;

    const draggedLeadId = active.id as string;
    const newStage = over.id as string;

    const draggedLead = findLead(draggedLeadId);

    if (draggedLead && draggedLead.stage !== newStage) {
      updateLeadStageMutation.mutate({ leadId: draggedLeadId, newStage });
    }
  };

  const activeLead = activeDragId ? findLead(activeDragId) : null;

  if (isLoading) {
    return (
      <div className="flex h-full overflow-x-auto space-x-4 p-4">
        {initialStages.map(stage => (
          <div
            key={stage}
            className="w-80 bg-gray-50 dark:bg-slate-800 rounded-lg p-4 animate-pulse"
          >
            <div className="h-4 w-2/3 bg-gray-200 dark:bg-slate-700 rounded mb-4" />
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="h-20 bg-gray-200 dark:bg-slate-700 rounded mb-3" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full text-destructive">
        Error: {error?.message || 'Failed to load leads.'}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Leads Kanban</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              className="pl-9 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={handleCreateNewLead}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Lead
          </Button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto flex space-x-4 pb-4">
          {initialStages.map((stageKey) => (
            <SortableContext
              key={stageKey}
              id={stageKey}
              items={leadsByStage?.[stageKey]?.map(lead => lead.id) || []}
              strategy={verticalListSortingStrategy}
            >
              <StageColumn
                id={stageKey}
                title={stageKey.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                leads={leadsByStage?.[stageKey] || []}
                onLeadClick={() => {}} // Will be handled by LeadCard's internal onClick
                onCallClick={handleCallLead}
                onEditClick={handleEditLead}
                onWinClick={handleWinLead}
                onLoseClick={handleLoseLead}
                onStageChange={handleStageChange}
              />
            </SortableContext>
          ))}
        </div>

        {createPortal(
          <DragOverlay dropAnimation={dropAnimation}>
            {activeLead ? (
              <LeadCard
                lead={activeLead}
                isDraggable // Indicate it's being dragged
              />
            ) : null}
          </DragOverlay>,
          document.body
        )}
      </DndContext>

      <LeadDrawer
        isOpen={isDrawerOpen}
        onClose={handleLeadDrawerClose}
        initialData={editingLead}
        onSuccess={handleLeadDrawerSuccess}
      />
    </div>
  );
};

export default LeadsPage;

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { Lead } from '@/components/leads/LeadCard'; // Re-using the Lead type

// Define API base URL
const API_BASE_URL = '/api/leads';

// Helper function for API calls
async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'An API error occurred');
  }
  return response.json();
}

export function useLeadsApi() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // --- Queries ---

  // Get all leads with pagination, filtering, and search
  const getLeads = async (params: {
    page?: number;
    limit?: number;
    search?: string;
    stage?: string | string[];
    source?: string | string[];
    serviceType?: string | string[];
    assignedTo?: string;
    hasFollowUp?: boolean;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  }) => {
    const queryParams = new URLSearchParams();
    for (const key in params) {
      const value = (params as any)[key];
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(item => queryParams.append(key, item));
        } else {
          queryParams.append(key, String(value));
        }
      }
    }
    const url = `${API_BASE_URL}?${queryParams.toString()}`;
    return fetcher<{ data: Lead[]; pagination: { total: number; page: number; limit: number; pages: number } }>(url);
  };

  // Get leads grouped by stage for Kanban view
  const getLeadsByStage = async (params: {
    search?: string;
    source?: string | string[];
    serviceType?: string | string[];
    assignedTo?: string;
  }) => {
    const queryParams = new URLSearchParams();
    for (const key in params) {
      const value = (params as any)[key];
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(item => queryParams.append(key, item));
        } else {
          queryParams.append(key, String(value));
        }
      }
    }
    const url = `${API_BASE_URL}/kanban?${queryParams.toString()}`;
    return fetcher<{ data: Record<string, Lead[]> }>(url);
  };

  // Get a single lead by ID with events
  const getLead = async (id: string) => {
    const url = `${API_BASE_URL}/${id}`;
    return fetcher<{ data: { lead: Lead; events: any[] } }>(url);
  };

  // Get lead events for timeline
  const getLeadEvents = async (leadId: string) => {
    const url = `${API_BASE_URL}/${leadId}/timeline`; // Assuming this endpoint exists
    return fetcher<{ data: any[] }>(url);
  };

  // Get leads with upcoming follow-ups
  const getUpcomingFollowUps = async (days: number = 7) => {
    const url = `${API_BASE_URL}/follow-ups/upcoming?days=${days}`;
    return fetcher<{ data: Lead[] }>(url);
  };

  // Get leads with overdue follow-ups
  const getOverdueFollowUps = async () => {
    const url = `${API_BASE_URL}/follow-ups/overdue`;
    return fetcher<{ data: Lead[] }>(url);
  };

  // Get lead statistics
  const getLeadStats = async () => {
    const url = `${API_BASE_URL}/stats`;
    return fetcher<{ data: any }>(url);
  };

  // Find potential duplicate leads
  const findPotentialDuplicates = async (phone: string, email?: string) => {
    const queryParams = new URLSearchParams();
    if (phone) queryParams.append('phone', phone);
    if (email) queryParams.append('email', email);
    const url = `${API_BASE_URL}/duplicates?${queryParams.toString()}`; // Assuming this endpoint exists
    return fetcher<Lead[]>(url);
  };

  // --- Mutations ---

  // Create a new lead
  const createLeadMutation = useMutation({
    mutationFn: async (newLead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
      const url = API_BASE_URL;
      return fetcher<{ data: Lead; hasDuplicates?: boolean; duplicates?: Lead[] }>(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leadsByStage'] });
      queryClient.invalidateQueries({ queryKey: ['leadStats'] });
    },
    onError: (error) => {
      toast({
        title: 'Error creating lead',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update a lead
  const updateLeadMutation = useMutation({
    mutationFn: async ({ id, updatedLead }: { id: string; updatedLead: Partial<Lead> }) => {
      const url = `${API_BASE_URL}/${id}`;
      return fetcher<{ data: Lead; hasDuplicates?: boolean; duplicates?: Lead[] }>(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedLead),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leadsByStage'] });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['leadStats'] });
    },
    onError: (error) => {
      toast({
        title: 'Error updating lead',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete a lead
  const deleteLeadMutation = useMutation({
    mutationFn: async (id: string) => {
      const url = `${API_BASE_URL}/${id}`;
      return fetcher<{ success: boolean }>(url, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leadsByStage'] });
      queryClient.invalidateQueries({ queryKey: ['leadStats'] });
    },
    onError: (error) => {
      toast({
        title: 'Error deleting lead',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Add a note to a lead
  const addNoteMutation = useMutation({
    mutationFn: async ({ id, note }: { id: string; note: string }) => {
      const url = `${API_BASE_URL}/${id}/note`;
      return fetcher<{ success: boolean }>(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note }),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id, 'events'] });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id] });
    },
    onError: (error) => {
      toast({
        title: 'Error adding note',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Log a call with a lead
  const logCallMutation = useMutation({
    mutationFn: async ({ id, notes, duration, outcome }: { id: string; notes: string; duration?: number; outcome?: string }) => {
      const url = `${API_BASE_URL}/${id}/call`;
      return fetcher<{ success: boolean }>(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes, duration, outcome }),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id, 'events'] });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['leadsByStage'] }); // Stage might change to 'contacted'
    },
    onError: (error) => {
      toast({
        title: 'Error logging call',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Log an email with a lead
  const logEmailMutation = useMutation({
    mutationFn: async ({ id, direction, subject, emailContent }: { id: string; direction: 'sent' | 'received'; subject: string; emailContent?: string }) => {
      const url = `${API_BASE_URL}/${id}/email`;
      return fetcher<{ success: boolean }>(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction, subject, emailContent }),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id, 'events'] });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['leadsByStage'] }); // Stage might change to 'contacted'
    },
    onError: (error) => {
      toast({
        title: 'Error logging email',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Log a text message with a lead
  const logTextMutation = useMutation({
    mutationFn: async ({ id, direction, message }: { id: string; direction: 'sent' | 'received'; message: string }) => {
      const url = `${API_BASE_URL}/${id}/text`;
      return fetcher<{ success: boolean }>(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction, message }),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id, 'events'] });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['leadsByStage'] }); // Stage might change to 'contacted'
    },
    onError: (error) => {
      toast({
        title: 'Error logging text',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Log a meeting with a lead
  const logMeetingMutation = useMutation({
    mutationFn: async ({ id, summary, date, duration, attendees }: { id: string; summary: string; date: Date; duration?: number; attendees?: string[] }) => {
      const url = `${API_BASE_URL}/${id}/meeting`;
      return fetcher<{ success: boolean }>(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary, date, duration, attendees }),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id, 'events'] });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['leadsByStage'] }); // Stage might change to 'contacted'
    },
    onError: (error) => {
      toast({
        title: 'Error logging meeting',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Log an estimate sent to a lead
  const logEstimateMutation = useMutation({
    mutationFn: async ({ id, estimateId, amount }: { id: string; estimateId: string | number; amount: number }) => {
      const url = `${API_BASE_URL}/${id}/estimate`;
      return fetcher<{ success: boolean }>(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estimateId, amount }),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id, 'events'] });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['leadsByStage'] }); // Stage might change to 'estimate_sent'
    },
    onError: (error) => {
      toast({
        title: 'Error logging estimate',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Set or update follow-up date
  const setFollowUpMutation = useMutation({
    mutationFn: async ({ id, followUpDate }: { id: string; followUpDate: Date }) => {
      const url = `${API_BASE_URL}/${id}/follow-up`;
      return fetcher<{ data: Lead }>(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followUpDate }),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['upcomingFollowUps'] });
      queryClient.invalidateQueries({ queryKey: ['overdueFollowUps'] });
      queryClient.invalidateQueries({ queryKey: ['leadStats'] });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id, 'events'] });
    },
    onError: (error) => {
      toast({
        title: 'Error setting follow-up',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Clear follow-up date
  const clearFollowUpMutation = useMutation({
    mutationFn: async (id: string) => {
      const url = `${API_BASE_URL}/${id}/follow-up`;
      return fetcher<{ data: Lead }>(url, {
        method: 'DELETE',
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lead', variables] });
      queryClient.invalidateQueries({ queryKey: ['upcomingFollowUps'] });
      queryClient.invalidateQueries({ queryKey: ['overdueFollowUps'] });
      queryClient.invalidateQueries({ queryKey: ['leadStats'] });
      queryClient.invalidateQueries({ queryKey: ['lead', variables, 'events'] });
    },
    onError: (error) => {
      toast({
        title: 'Error clearing follow-up',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Move a lead to a different stage
  const moveToStageMutation = useMutation({
    mutationFn: async ({ id, stage, notes }: { id: string; stage: string; notes?: string }) => {
      const url = `${API_BASE_URL}/${id}/stage`;
      return fetcher<{ data: Lead }>(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage, notes }),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leadsByStage'] });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id, 'events'] });
      queryClient.invalidateQueries({ queryKey: ['leadStats'] });
    },
    onError: (error) => {
      toast({
        title: 'Error moving lead to new stage',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mark a lead as won
  const markAsWonMutation = useMutation({
    mutationFn: async ({ id, convertToJob, jobData }: { id: string; convertToJob?: boolean; jobData?: any }) => {
      const url = `${API_BASE_URL}/${id}/win`;
      return fetcher<{ data: Lead; jobId?: string; convertedToJob: boolean }>(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ convertToJob, jobData }),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leadsByStage'] });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id, 'events'] });
      queryClient.invalidateQueries({ queryKey: ['leadStats'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] }); // If converted to job
    },
    onError: (error) => {
      toast({
        title: 'Error marking lead as won',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Mark a lead as lost
  const markAsLostMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const url = `${API_BASE_URL}/${id}/loss`;
      return fetcher<{ data: Lead }>(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leadsByStage'] });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id, 'events'] });
      queryClient.invalidateQueries({ queryKey: ['leadStats'] });
    },
    onError: (error) => {
      toast({
        title: 'Error marking lead as lost',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Assign a lead to a user
  const assignLeadMutation = useMutation({
    mutationFn: async ({ id, assignedToUserId }: { id: string; assignedToUserId: string }) => {
      const url = `${API_BASE_URL}/${id}/assign`;
      return fetcher<{ data: Lead }>(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedToUserId }),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leadsByStage'] });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['lead', variables.id, 'events'] });
    },
    onError: (error) => {
      toast({
        title: 'Error assigning lead',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Bulk update lead stages
  const bulkUpdateStageMutation = useMutation({
    mutationFn: async ({ ids, stage, notes }: { ids: string[]; stage: string; notes?: string }) => {
      const url = `${API_BASE_URL}/bulk/stage`;
      return fetcher<{ data: { results: any[]; errors: any[] } }>(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, stage, notes }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leadsByStage'] });
      queryClient.invalidateQueries({ queryKey: ['leadStats'] });
    },
    onError: (error) => {
      toast({
        title: 'Error updating lead stages',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Bulk assign leads
  const bulkAssignMutation = useMutation({
    mutationFn: async ({ ids, assignedToUserId }: { ids: string[]; assignedToUserId: string }) => {
      const url = `${API_BASE_URL}/bulk/assign`;
      return fetcher<{ data: { results: any[]; errors: any[] } }>(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, assignedToUserId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leadsByStage'] });
    },
    onError: (error) => {
      toast({
        title: 'Error assigning leads',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Bulk delete leads
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const url = `${API_BASE_URL}/bulk/delete`;
      return fetcher<{ data: { results: any[]; errors: any[] } }>(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leadsByStage'] });
      queryClient.invalidateQueries({ queryKey: ['leadStats'] });
    },
    onError: (error) => {
      toast({
        title: 'Error deleting leads',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    // Query functions
    getLeads,
    getLeadsByStage,
    getLead,
    getLeadEvents,
    getUpcomingFollowUps,
    getOverdueFollowUps,
    getLeadStats,
    findPotentialDuplicates,

    // Mutation functions with their results
    createLead: createLeadMutation.mutateAsync,
    updateLead: updateLeadMutation.mutateAsync,
    deleteLead: deleteLeadMutation.mutateAsync,
    addNote: addNoteMutation.mutateAsync,
    logCall: logCallMutation.mutateAsync,
    logEmail: logEmailMutation.mutateAsync,
    logText: logTextMutation.mutateAsync,
    logMeeting: logMeetingMutation.mutateAsync,
    logEstimate: logEstimateMutation.mutateAsync,
    setFollowUp: setFollowUpMutation.mutateAsync,
    clearFollowUp: clearFollowUpMutation.mutateAsync,
    moveToStage: moveToStageMutation.mutateAsync,
    markAsWon: markAsWonMutation.mutateAsync,
    markAsLost: markAsLostMutation.mutateAsync,
    assignLead: assignLeadMutation.mutateAsync,
    bulkUpdateStage: bulkUpdateStageMutation.mutateAsync,
    bulkAssign: bulkAssignMutation.mutateAsync,
    bulkDelete: bulkDeleteMutation.mutateAsync,

    // Mutation states
    isCreatingLead: createLeadMutation.isPending,
    isUpdatingLead: updateLeadMutation.isPending,
    isDeletingLead: deleteLeadMutation.isPending,
    // Add more mutation states as needed
  };
}

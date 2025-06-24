import React, {
  createContext,
  useState,
  useContext,
  useMemo,
  useCallback,
} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  type Lead,
  type InsertLead,
  type LeadStage,
  type LeadSource,
} from "../../shared/leads-schema";
import { apiRequestJson, queryKeys } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import { captureException } from "../lib/sentry";

// =================================================================
// Type Definitions
// =================================================================

interface LeadsFilter {
  stage?: LeadStage;
  source?: LeadSource;
  searchTerm?: string;
  assignedTo?: string;
}

interface PaginationState {
  page: number;
  limit: number;
}

interface LeadsState {
  leads: Lead[];
  totalCount: number;
  isLoading: boolean;
  isError: boolean;
  filters: LeadsFilter;
  pagination: PaginationState;
  selectedLeadId: string | null;
}

interface LeadsContextType extends LeadsState {
  // Actions
  addLead: (data: InsertLead) => Promise<Lead>;
  updateLead: (id: string, data: Partial<InsertLead>) => Promise<Lead>;
  updateLeadStage: (leadId: string, newStage: LeadStage) => void;
  deleteLead: (id:string) => Promise<void>;
  selectLead: (id: string | null) => void;
  setFilters: (filters: Partial<LeadsFilter>) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  refetchLeads: () => void;
  // Computed
  selectedLead: Lead | undefined;
  pageCount: number;
}

// =================================================================
// Context Creation
// =================================================================

const LeadsContext = createContext<LeadsContextType | undefined>(undefined);

// =================================================================
// Provider Component
// =================================================================

export const LeadsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // --- State Management ---
  const [filters, setFilters] = useState<LeadsFilter>({});
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, limit: 20 });
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  // --- Data Fetching with React Query ---
  const leadsQueryKey = useMemo(
    () => [queryKeys.leads.list, { ...filters, ...pagination }],
    [filters, pagination]
  );

  const {
    data: leadsData,
    isLoading,
    isError,
    refetch: refetchLeads,
  } = useQuery<{ data: Lead[]; totalCount: number }>({
    queryKey: leadsQueryKey,
    queryFn: () => {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...filters,
      });
      return apiRequestJson("GET", `/api/leads?${params.toString()}`);
    },
    placeholderData: (previousData) => previousData,
  });

  // --- Mutations ---

  const addLeadMutation = useMutation({
    mutationFn: (newLead: InsertLead) =>
      apiRequestJson<Lead>("POST", "/api/leads", newLead),
    onSuccess: (newLead) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.leads.list] });
      toast.success({ title: "Lead Created", description: `Lead "${newLead.leadName}" has been successfully created.` });
    },
    onError: (error) => {
      captureException(error, "addLeadMutation");
      toast.error({ title: "Creation Failed", description: error.message });
    },
  });

  const updateLeadMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertLead> }) =>
      apiRequestJson<Lead>("PUT", `/api/leads/${id}`, data),
    onSuccess: (updatedLead) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.leads.list] });
      queryClient.setQueryData([queryKeys.leads.detail, updatedLead.id], updatedLead);
      toast.success({ title: "Lead Updated", description: "Changes have been saved." });
    },
    onError: (error) => {
      captureException(error, "updateLeadMutation");
      toast.error({ title: "Update Failed", description: error.message });
    },
  });

  const updateLeadStageMutation = useMutation({
    mutationFn: ({ leadId, newStage }: { leadId: string; newStage: LeadStage }) =>
      apiRequestJson<Lead>("PUT", `/api/leads/${leadId}`, { stage: newStage }),
    onMutate: async ({ leadId, newStage }) => {
      // Optimistic Update Logic
      await queryClient.cancelQueries({ queryKey: leadsQueryKey });
      const previousLeadsData = queryClient.getQueryData<{ data: Lead[]; totalCount: number }>(leadsQueryKey);
      
      if (previousLeadsData) {
        queryClient.setQueryData(leadsQueryKey, {
          ...previousLeadsData,
          data: previousLeadsData.data.map((lead) =>
            lead.id === leadId ? { ...lead, stage: newStage } : lead
          ),
        });
      }
      return { previousLeadsData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousLeadsData) {
        queryClient.setQueryData(leadsQueryKey, context.previousLeadsData);
      }
      captureException(err, "updateLeadStageMutation");
      toast.error({ title: "Stage Update Failed", description: "Could not update lead stage. Reverting." });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.leads.list] });
    },
  });
  
  const deleteLeadMutation = useMutation({
    mutationFn: (id: string) => apiRequestJson("DELETE", `/api/leads/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.leads.list] });
      toast.success({ title: "Lead Deleted", description: "The lead has been permanently removed." });
    },
    onError: (error) => {
      captureException(error, "deleteLeadMutation");
      toast.error({ title: "Deletion Failed", description: error.message });
    },
  });

  // --- Context Actions ---

  const handleSetFilters = useCallback((newFilters: Partial<LeadsFilter>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page on filter change
  }, []);

  const handleSetPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const handleSetLimit = useCallback((limit: number) => {
    setPagination({ page: 1, limit });
  }, []);

  // --- Computed Values ---

  const selectedLead = useMemo(
    () => leadsData?.data.find((lead) => lead.id === selectedLeadId),
    [leadsData, selectedLeadId]
  );
  
  const pageCount = useMemo(
    () => Math.ceil((leadsData?.totalCount || 0) / pagination.limit),
    [leadsData?.totalCount, pagination.limit]
  );

  // --- Context Value ---

  const value: LeadsContextType = {
    leads: leadsData?.data || [],
    totalCount: leadsData?.totalCount || 0,
    isLoading,
    isError,
    filters,
    pagination,
    selectedLeadId,
    selectedLead,
    pageCount,
    addLead: (data) => addLeadMutation.mutateAsync(data),
    updateLead: (id, data) => updateLeadMutation.mutateAsync({ id, data }),
    updateLeadStage: (leadId, newStage) => updateLeadStageMutation.mutate({ leadId, newStage }),
    deleteLead: (id) => deleteLeadMutation.mutateAsync(id),
    selectLead: setSelectedLeadId,
    setFilters: handleSetFilters,
    setPage: handleSetPage,
    setLimit: handleSetLimit,
    refetchLeads,
  };

  return (
    <LeadsContext.Provider value={value}>{children}</LeadsContext.Provider>
  );
};

// =================================================================
// Custom Hook
// =================================================================

/**
 * `useLeads`
 *
 * A custom hook to access the LeadsContext. This should be used by any
 * component within the LeadsProvider to interact with leads data and state.
 *
 * @returns The context value, providing access to leads, state, and actions.
 */
export const useLeads = (): LeadsContextType => {
  const context = useContext(LeadsContext);
  if (context === undefined) {
    throw new Error("useLeads must be used within a LeadsProvider");
  }
  return context;
};

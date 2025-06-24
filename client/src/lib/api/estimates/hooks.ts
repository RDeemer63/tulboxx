import { useQuery, useMutation, useQueryClient, InfiniteData, QueryKey } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import * as api from './api';
import { estimateQueryKeys } from './queryKeys';
import {
  ModernEstimate,
  EstimateLineItem,
  EstimateTemplate,
  EstimateEvent,
  EstimateStatsResponse,
  PaginatedResponse,
  ListEstimateParams,
  CreateEstimatePayload,
  UpdateEstimatePayload,
  ApproveEstimatePayload,
  DeclineEstimatePayload,
  ConvertToJobPayload,
  LineItemPayload,
  LineItemOrderPayload,
  BulkLineItemPayload,
  TemplatePayload,
  SaveAsTemplatePayload,
  CreateFromTemplatePayload,
  AIGeneratePayload,
  EstimateDetailResponse,
  ListTemplateParams
} from './api';

// --- Helper Types ---
type OptimisticUpdateContext<TData> = { previousData?: TData | InfiniteData<PaginatedResponse<TData>> };

// --- Core Estimate Hooks ---

/**
 * Hook to fetch a paginated list of estimates.
 */
export const useGetEstimates = (params: ListEstimateParams = {}, options?: any) => {
  return useQuery<PaginatedResponse<ModernEstimate>, Error>({
    queryKey: estimateQueryKeys.list(params),
    queryFn: () => api.getEstimates(params),
    placeholderData: (previousData) => previousData,
    ...options,
  });
};

/**
 * Hook to fetch estimates grouped by stage for Kanban view.
 */
export const useGetEstimatesByStage = (params: Omit<ListEstimateParams, 'page' | 'limit' | 'status'> = {}, options?: any) => {
  return useQuery<Record<string, ModernEstimate[]>, Error>({
    queryKey: estimateQueryKeys.kanban(params),
    queryFn: async () => {
      const response = await api.getEstimatesByStage(params);
      return response.data; // The API returns { data: Record<string, ModernEstimate[]> }
    },
    placeholderData: (previousData) => previousData,
    ...options,
  });
};


/**
 * Hook to fetch a single estimate by its ID, including line items and events.
 */
export const useGetEstimateById = (estimateId: string | undefined, options?: any) => {
  return useQuery<EstimateDetailResponse, Error>({
    queryKey: estimateQueryKeys.detail(estimateId!),
    queryFn: () => api.getEstimateById(estimateId!),
    enabled: !!estimateId, // Only run query if estimateId is provided
    ...options,
  });
};

/**
 * Hook to create a new estimate.
 */
export const useCreateEstimate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<ModernEstimate, Error, CreateEstimatePayload, OptimisticUpdateContext<ModernEstimate>>({
    mutationFn: api.createEstimate,
    onMutate: async (newEstimatePayload) => {
      await queryClient.cancelQueries({ queryKey: estimateQueryKeys.list() });
      const previousEstimates = queryClient.getQueryData<PaginatedResponse<ModernEstimate>>(estimateQueryKeys.list());
      
      // Optimistically add to the list (simplified: assumes it goes to the first page)
      // A more robust solution might involve updating the specific page or just invalidating.
      // For now, we'll rely on invalidation in onSettled.
      
      toast({ title: 'Creating estimate...', description: 'Please wait.' });
      return { previousData: previousEstimates };
    },
    onSuccess: (data) => {
      toast({ title: 'Estimate Created', description: `Estimate "${data.title || data.estimateNumber}" created successfully.` });
    },
    onError: (error, _newEstimate, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(estimateQueryKeys.list(), context.previousData);
      }
      toast({
        title: 'Error Creating Estimate',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: estimateQueryKeys.list() });
      queryClient.invalidateQueries({ queryKey: estimateQueryKeys.kanban() });
      queryClient.invalidateQueries({ queryKey: estimateQueryKeys.stats() });
    },
  });
};

/**
 * Hook to update an existing estimate.
 */
export const useUpdateEstimate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    ModernEstimate, 
    Error, 
    { id: string; payload: UpdateEstimatePayload }, 
    OptimisticUpdateContext<ModernEstimate>
  >({
    mutationFn: ({ id, payload }) => api.updateEstimate(id, payload),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: estimateQueryKeys.detail(id) });
      const previousEstimate = queryClient.getQueryData<EstimateDetailResponse>(estimateQueryKeys.detail(id));
      
      if (previousEstimate) {
        queryClient.setQueryData<EstimateDetailResponse>(estimateQueryKeys.detail(id), {
          ...previousEstimate,
          ...payload, // Optimistically update the estimate details
          updatedAt: new Date().toISOString(), // Optimistically set updatedAt
        });
      }
      toast({ title: 'Updating estimate...', description: 'Please wait.' });
      return { previousData: previousEstimate };
    },
    onSuccess: (data) => {
      toast({ title: 'Estimate Updated', description: `Estimate "${data.title || data.estimateNumber}" updated successfully.` });
    },
    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(estimateQueryKeys.detail(variables.id), context.previousData);
      }
      toast({
        title: 'Error Updating Estimate',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    },
    onSettled: (data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: estimateQueryKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: estimateQueryKeys.list() });
      queryClient.invalidateQueries({ queryKey: estimateQueryKeys.kanban() });
      queryClient.invalidateQueries({ queryKey: estimateQueryKeys.stats() });
    },
  });
};

/**
 * Hook to delete an estimate.
 */
export const useDeleteEstimate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, Error, string, OptimisticUpdateContext<ModernEstimate>>({
    mutationFn: api.deleteEstimate,
    onMutate: async (estimateId) => {
      await queryClient.cancelQueries({ queryKey: estimateQueryKeys.list() });
      // More complex optimistic update would remove from paginated list.
      // For simplicity, we rely on invalidation.
      toast({ title: 'Deleting estimate...', description: 'Please wait.' });
      return {}; 
    },
    onSuccess: (_data, estimateId) => {
      toast({ title: 'Estimate Deleted', description: `Estimate successfully deleted.` });
    },
    onError: (error) => {
      toast({
        title: 'Error Deleting Estimate',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    },
    onSettled: (_data, _error, estimateId) => {
      queryClient.invalidateQueries({ queryKey: estimateQueryKeys.list() });
      queryClient.invalidateQueries({ queryKey: estimateQueryKeys.kanban() });
      queryClient.invalidateQueries({ queryKey: estimateQueryKeys.detail(estimateId) }); // Invalidate detail if user was on it
      queryClient.invalidateQueries({ queryKey: estimateQueryKeys.stats() });
    },
  });
};


// --- Estimate Workflow Hooks ---

/**
 * Hook to send an estimate.
 */
export const useSendEstimate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation<ModernEstimate, Error, string, OptimisticUpdateContext<ModernEstimate>>({
    mutationFn: api.sendEstimate,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: estimateQueryKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: estimateQueryKeys.list() });
      queryClient.invalidateQueries({ queryKey: estimateQueryKeys.kanban() });
      toast({ title: 'Estimate Sent', description: `Estimate "${data.title || data.estimateNumber}" has been sent.` });
    },
    onError: (error) => {
      toast({ title: 'Error Sending Estimate', description: error.message, variant: 'destructive' });
    },
  });
};

/**
 * Hook to approve an estimate.
 */
export const useApproveEstimate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation<ModernEstimate, Error, { id: string; payload?: ApproveEstimatePayload }, OptimisticUpdateContext<ModernEstimate>>({
    mutationFn: ({ id, payload }) => api.approveEstimate(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: estimateQueryKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: estimateQueryKeys.list() });
      queryClient.invalidateQueries({ queryKey: estimateQueryKeys.kanban() });
      toast({ title: 'Estimate Approved', description: `Estimate "${data.title || data.estimateNumber}" has been approved.` });
    },
    onError: (error) => {
      toast({ title: 'Error Approving Estimate', description: error.message, variant: 'destructive' });
    },
  });
};

/**
 * Hook to decline an estimate.
 */
export const useDeclineEstimate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation<ModernEstimate, Error, { id: string; payload?: DeclineEstimatePayload }, OptimisticUpdateContext<ModernEstimate>>({
    mutationFn: ({ id, payload }) => api.declineEstimate(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: estimateQueryKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: estimateQueryKeys.list() });
      queryClient.invalidateQueries({ queryKey: estimateQueryKeys.kanban() });
      toast({ title: 'Estimate Declined', description: `Estimate "${data.title || data.estimateNumber}" has been declined.` });
    },
    onError: (error) => {
      toast({ title: 'Error Declining Estimate', description: error.message, variant: 'destructive' });
    },
  });
};

/**
 * Hook to archive an estimate.
 */
export const useArchiveEstimate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation<ModernEstimate, Error, string, OptimisticUpdateContext<ModernEstimate>>({
    mutationFn: api.archiveEstimate,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: estimateQueryKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: estimateQueryKeys.list() });
      queryClient.invalidateQueries({ queryKey: estimateQueryKeys.kanban() });
      toast({ title: 'Estimate Archived', description: `Estimate "${data.title || data.estimateNumber}" has been archived.` });
    },
    onError: (error) => {
      toast({ title: 'Error Archiving Estimate', description: error.message, variant: 'destructive' });
    },
  });
};

/**
 * Hook to convert an estimate to a job.
 */
export const useConvertToJob = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation<
    { estimate: ModernEstimate; job: any }, 
    Error, 
    { id: string; payload?: ConvertToJobPayload }, 
    OptimisticUpdateContext<ModernEstimate>
  >({
    mutationFn: ({ id, payload }) => api.convertToJob(id, payload),
    onSuccess: ({ estimate, job }) => {
      queryClient.invalidateQueries({ queryKey: estimateQueryKeys.detail(estimate.id) });
      queryClient.invalidateQueries({ queryKey: estimateQueryKeys.list() });
      queryClient.invalidateQueries({ queryKey: estimateQueryKeys.kanban() });
      queryClient.invalidateQueries({ queryKey: ['jobs'] }); // Invalidate jobs list
      toast({ title: 'Estimate Converted', description: `Estimate "${estimate.title || estimate.estimateNumber}" converted to Job #${job.id}.` });
    },
    onError: (error) => {
      toast({ title: 'Error Converting Estimate', description: error.message, variant: 'destructive' });
    },
  });
};

/**
 * Hook to create a new version of an estimate.
 */
export const useVersionEstimate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation<ModernEstimate, Error, string, OptimisticUpdateContext<ModernEstimate>>({
    mutationFn: api.versionEstimate,
    onSuccess: (newVersion, originalEstimateId) => {
      queryClient.invalidateQueries({ queryKey: estimateQueryKeys.detail(originalEstimateId) }); // Invalidate original
      queryClient.invalidateQueries({ queryKey: estimateQueryKeys.detail(newVersion.id) });    // Invalidate new version
      queryClient.invalidateQueries({ queryKey: estimateQueryKeys.list() });
      queryClient.invalidateQueries({ queryKey: estimateQueryKeys.kanban() });
      toast({ title: 'New Version Created', description: `New version "${newVersion.title || newVersion.estimateNumber}" created.` });
    },
    onError: (error) => {
      toast({ title: 'Error Creating New Version', description: error.message, variant: 'destructive' });
    },
  });
};

/**
 * Hook to fetch events for a specific estimate.
 */
export const useGetEstimateEvents = (estimateId: string | undefined, options?: any) => {
  // Define a more specific query key for events if needed, or rely on detail invalidation
  const eventsQueryKey = [ESTIMATES_DOMAIN, 'detail', estimateId, 'events'] as const;
  return useQuery<EstimateEvent[], Error>({
    queryKey: eventsQueryKey,
    queryFn: () => api.getEstimateEvents(estimateId!),
    enabled: !!estimateId,
    ...options,
  });
};

// --- Line Item Hooks ---

/**
 * Hook to add a line item to an estimate.
 */
export const useAddLineItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation<LineItemResponse, Error, { estimateId: string; payload: LineItemPayload }, OptimisticUpdateContext<EstimateDetailResponse>>({
    mutationFn: ({ estimateId, payload }) => api.addLineItem(estimateId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: estimateQueryKeys.detail(variables.estimateId) });
      toast({ title: 'Line Item Added', description: 'Line item successfully added.' });
    },
    onError: (error) => {
      toast({ title: 'Error Adding Line Item', description: error.message, variant: 'destructive' });
    },
  });
};

/**
 * Hook to update a line item.
 */
export const useUpdateLineItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation<
    LineItemResponse, 
    Error, 
    { estimateId: string; itemId: string; payload: Partial<LineItemPayload> }, 
    OptimisticUpdateContext<EstimateDetailResponse>
  >({
    mutationFn: ({ estimateId, itemId, payload }) => api.updateLineItem(estimateId, itemId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: estimateQueryKeys.detail(variables.estimateId) });
      toast({ title: 'Line Item Updated', description: 'Line item successfully updated.' });
    },
    onError: (error) => {
      toast({ title: 'Error Updating Line Item', description: error.message, variant: 'destructive' });
    },
  });
};

/**
 * Hook to delete a line item.
 */
export const useDeleteLineItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation<void, Error, { estimateId: string; itemId: string }, OptimisticUpdateContext<EstimateDetailResponse>>({
    mutationFn: ({ estimateId, itemId }) => api.deleteLineItem(estimateId, itemId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: estimateQueryKeys.detail(variables.estimateId) });
      toast({ title: 'Line Item Deleted', description: 'Line item successfully deleted.' });
    },
    onError: (error) => {
      toast({ title: 'Error Deleting Line Item', description: error.message, variant: 'destructive' });
    },
  });
};

/**
 * Hook to reorder line items.
 */
export const useReorderLineItems = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation<void, Error, { estimateId: string; items: LineItemOrderPayload[] }, OptimisticUpdateContext<EstimateDetailResponse>>({
    mutationFn: ({ estimateId, items }) => api.reorderLineItems(estimateId, items),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: estimateQueryKeys.detail(variables.estimateId) });
      toast({ title: 'Line Items Reordered', description: 'Line item order updated.' });
    },
    onError: (error) => {
      toast({ title: 'Error Reordering Line Items', description: error.message, variant: 'destructive' });
    },
  });
};

/**
 * Hook for bulk updating line items (create, update, delete).
 */
export const useBulkUpdateLineItems = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation<
    { created: LineItemResponse[]; updated: LineItemResponse[]; deleted: string[] },
    Error,
    { estimateId: string; payload: BulkLineItemPayload },
    OptimisticUpdateContext<EstimateDetailResponse>
  >({
    mutationFn: ({ estimateId, payload }) => api.bulkUpdateLineItems(estimateId, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: estimateQueryKeys.detail(variables.estimateId) });
      toast({ title: 'Line Items Updated', description: 'Bulk update successful.' });
    },
    onError: (error) => {
      toast({ title: 'Error Bulk Updating Line Items', description: error.message, variant: 'destructive' });
    },
  });
};


// --- Template Hooks ---

/**
 * Hook to create an estimate template.
 */
export const useCreateTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation<TemplateResponse, Error, TemplatePayload, OptimisticUpdateContext<TemplateResponse>>({
    mutationFn: api.createTemplate,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: estimateQueryKeys.templatesList() });
      toast({ title: 'Template Created', description: `Template "${data.name}" created.` });
    },
    onError: (error) => {
      toast({ title: 'Error Creating Template', description: error.message, variant: 'destructive' });
    },
  });
};

/**
 * Hook to fetch a list of estimate templates.
 */
export const useGetTemplates = (params: ListTemplateParams = {}, options?: any) => {
  return useQuery<PaginatedResponse<TemplateResponse>, Error>({
    queryKey: estimateQueryKeys.templatesList(params),
    queryFn: () => api.getTemplates(params),
    placeholderData: (previousData) => previousData,
    ...options,
  });
};

/**
 * Hook to fetch a single estimate template by ID.
 */
export const useGetTemplateById = (templateId: string | undefined, options?: any) => {
  return useQuery<TemplateResponse, Error>({
    queryKey: estimateQueryKeys.templateDetail(templateId!),
    queryFn: () => api.getTemplateById(templateId!),
    enabled: !!templateId,
    ...options,
  });
};

/**
 * Hook to update an estimate template.
 */
export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation<
    TemplateResponse, 
    Error, 
    { id: string; payload: Partial<TemplatePayload> }, 
    OptimisticUpdateContext<TemplateResponse>
  >({
    mutationFn: ({ id, payload }) => api.updateTemplate(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: estimateQueryKeys.templateDetail(data.id) });
      queryClient.invalidateQueries({ queryKey: estimateQueryKeys.templatesList() });
      toast({ title: 'Template Updated', description: `Template "${data.name}" updated.` });
    },
    onError: (error) => {
      toast({ title: 'Error Updating Template', description: error.message, variant: 'destructive' });
    },
  });
};

/**
 * Hook to delete an estimate template.
 */
export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation<void, Error, string, OptimisticUpdateContext<TemplateResponse>>({
    mutationFn: api.deleteTemplate,
    onSuccess: (_data, templateId) => {
      queryClient.invalidateQueries({ queryKey: estimateQueryKeys.templatesList() });
      queryClient.removeQueries({ queryKey: estimateQueryKeys.templateDetail(templateId) });
      toast({ title: 'Template Deleted', description: 'Template successfully deleted.' });
    },
    onError: (error) => {
      toast({ title: 'Error Deleting Template', description: error.message, variant: 'destructive' });
    },
  });
};

/**
 * Hook to save an estimate as a template.
 */
export const useSaveEstimateAsTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation<
    TemplateResponse, 
    Error, 
    { estimateId: string; payload: SaveAsTemplatePayload },
    OptimisticUpdateContext<TemplateResponse>
  >({
    mutationFn: ({ estimateId, payload }) => api.saveEstimateAsTemplate(estimateId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: estimateQueryKeys.templatesList() });
      toast({ title: 'Saved as Template', description: `Estimate saved as template "${data.name}".` });
    },
    onError: (error) => {
      toast({ title: 'Error Saving as Template', description: error.message, variant: 'destructive' });
    },
  });
};

/**
 * Hook to create an estimate from a template.
 */
export const useCreateEstimateFromTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation<
    EstimateResponse, 
    Error, 
    { templateId: string; payload: CreateFromTemplatePayload },
    OptimisticUpdateContext<ModernEstimate> // New estimate created
  >({
    mutationFn: ({ templateId, payload }) => api.createEstimateFromTemplate(templateId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: estimateQueryKeys.list() });
      queryClient.invalidateQueries({ queryKey: estimateQueryKeys.kanban() });
      queryClient.invalidateQueries({ queryKey: estimateQueryKeys.stats() });
      toast({ title: 'Estimate Created from Template', description: `New estimate "${data.title || data.estimateNumber}" created.` });
    },
    onError: (error) => {
      toast({ title: 'Error Creating from Template', description: error.message, variant: 'destructive' });
    },
  });
};

// --- Statistics Hook ---

/**
 * Hook to fetch estimate statistics.
 */
export const useGetEstimateStats = (options?: any) => {
  return useQuery<EstimateStatsResponse, Error>({
    queryKey: estimateQueryKeys.stats(),
    queryFn: api.getEstimateStats,
    ...options,
  });
};

// --- AI Hook (Placeholder) ---
/**
 * Hook to generate line items using AI.
 */
export const useGenerateAIDraftLineItems = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation<
    LineItemResponse[],
    Error,
    { estimateId: string; payload: AIGeneratePayload },
    OptimisticUpdateContext<EstimateDetailResponse>
  >({
    mutationFn: ({ estimateId, payload }) => api.generateAIDraftLineItems(estimateId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: estimateQueryKeys.detail(variables.estimateId) });
      toast({ title: 'AI Draft Generated', description: 'Line items drafted by AI.' });
    },
    onError: (error) => {
      toast({ title: 'Error with AI Draft', description: error.message, variant: 'destructive' });
    },
  });
};

// --- Offline Support Hooks (Foundation) ---
// These are simplified placeholders. Real offline support would be more complex,
// involving service workers, IndexedDB, and more sophisticated sync logic.

/**
 * Hook to get unsynced estimates (from local storage for now).
 */
export const useGetUnsyncedEstimates = (options?: any) => {
  const queryKey = [ESTIMATES_DOMAIN, 'unsynced'] as const;
  return useQuery<ModernEstimate[], Error>({
    queryKey,
    queryFn: api.getUnsyncedEstimates,
    ...options,
  });
};

/**
 * Hook to mark an estimate as synced.
 */
export const useMarkEstimateSynced = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation<void, Error, string>({
    mutationFn: api.markEstimateSynced,
    onSuccess: (_data, estimateId) => {
      queryClient.invalidateQueries({ queryKey: [ESTIMATES_DOMAIN, 'unsynced'] });
      queryClient.invalidateQueries({ queryKey: estimateQueryKeys.detail(estimateId) }); // Update detail if synced flag is there
      toast({ title: 'Estimate Synced', description: 'Estimate marked as synced.' });
    },
    onError: (error) => {
      toast({ title: 'Error Marking Synced', description: error.message, variant: 'destructive' });
    },
  });
};

/**
 * Hook to save an estimate offline.
 */
export const useSaveEstimateOffline = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation<void, Error, ModernEstimate>({
    mutationFn: api.saveEstimateOffline,
    onSuccess: (_data, estimate) => {
      queryClient.invalidateQueries({ queryKey: [ESTIMATES_DOMAIN, 'unsynced'] });
      // Optimistically update the estimate detail if it's cached to show synced: false
      queryClient.setQueryData<EstimateDetailResponse>(estimateQueryKeys.detail(estimate.id), (old) => 
        old ? { ...old, synced: false, updatedAt: new Date().toISOString() } : undefined
      );
      toast({ title: 'Estimate Saved Offline', description: 'Estimate saved locally for later sync.' });
    },
    onError: (error) => {
      toast({ title: 'Error Saving Offline', description: error.message, variant: 'destructive' });
    },
  });
};

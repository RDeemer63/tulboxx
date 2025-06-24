import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Eye,
  Edit3,
  Send,
  CheckCircle,
  XCircle,
  DollarSign,
  MoreHorizontal,
  PlusCircle,
  Search,
  RefreshCw,
  Trash2,
  FileText,
  Wand2, // For AI Generate
  Copy,   // For Duplicate
  Briefcase, // For Convert to Job
} from 'lucide-react';
import {
  type ModernEstimate,
  type InsertModernEstimate,
  type Contact,
} from '@shared/schema';
import { EstimateStatusEnum } from '@shared/estimates-schema';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { apiRequestJson, apiRequest, queryKeys, invalidateQueries } from '@/lib/queryClient';

// Define a more specific Estimate type for the list, potentially joining customer info
type EstimateListItem = ModernEstimate & {
  customer?: Pick<Contact, 'id' | 'firstName' | 'lastName' | 'email'>; // Optional customer details
};

// Helper for colors – keyed by status for quick lookup
const STATUS_COLORS: Record<EstimateStatusEnum, string> = {
  draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100',
  sent: 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100',
  approved: 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100',
  declined: 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100',
  archived: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100',
  converted: 'bg-purple-100 text-purple-800 dark:bg-purple-700 dark:text-purple-100',
  revision: 'bg-orange-100 text-orange-800 dark:bg-orange-700 dark:text-orange-100',
  superseded: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100',
};

export const ESTIMATE_STATUSES = EstimateStatusEnum.options.map((value) => ({
  value,
  label: value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase()),
  color: STATUS_COLORS[value],
}));

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

  { value: 'draft', label: 'Draft', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100' },
  { value: 'sent', label: 'Sent', color: 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100' },
  { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' },
  onViewEstimateDetails: (estimateId: string) => void; // Callback to view estimate details
  { value: 'expired', label: 'Expired', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100' },
  { value: 'converted_to_job', label: 'Converted to Job', color: 'bg-purple-100 text-purple-800 dark:bg-purple-700 dark:text-purple-100' },
];

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

interface EstimatesListProps {
  onAddEstimateClick: () => void; // Callback to open "Add Estimate" modal/page
  onAiGenerateEstimateClick: () => void; // Callback to open AI generation modal
  onViewEstimateDetails: (estimateId: number) => void; // Callback to view estimate details
  onEditEstimate: (estimate: EstimateListItem) => void; // Callback to edit estimate
}

const EstimatesListComponent: React.FC<EstimatesListProps> = ({
  onAddEstimateClick,
  onAiGenerateEstimateClick,
  onViewEstimateDetails,
  onEditEstimate,
}) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const estimatesQuery = useQuery<{ data: EstimateListItem[]; totalCount: number }, Error>({
    queryKey: ['estimates', debouncedSearchTerm, statusFilter, page, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
      if (statusFilter) params.append('status', statusFilter);
      params.append('page', page.toString());
      params.append('pageSize', pageSize.toString());
      // Assuming API can join customer data or we fetch it separately
      return apiRequestJson<{ data: EstimateListItem[]; totalCount: number }>(
        'GET',
        `/api/estimates?${params.toString()}`
      );
    },
    placeholderData: (previousData) => previousData,
  });

  // --- Mutations ---
  const sendEstimateMutation = useMutation({
    mutationFn: (estimateId: string) =>
      apiRequestJson<ModernEstimate>('PATCH', `/api/estimates/${estimateId}/send`),
    onSuccess: (data) => {
      toast({ title: 'Success', description: `Estimate #${data.estimateNumber} marked as sent.` });
      invalidateQueries.estimate(data.id);
    },
    onError: (error) => toast({ title: 'Error', description: `Failed to send estimate: ${error.message}`, variant: 'destructive' }),
  });

  const approveEstimateMutation = useMutation({
    mutationFn: (estimateId: string) =>
      apiRequestJson<ModernEstimate>('PATCH', `/api/estimates/${estimateId}/approve`),
    onSuccess: (data) => {
      toast({ title: 'Success', description: `Estimate #${data.estimateNumber} marked as approved.` });
      invalidateQueries.estimate(data.id);
    },
    onError: (error) => toast({ title: 'Error', description: `Failed to approve estimate: ${error.message}`, variant: 'destructive' }),
  });

  const rejectEstimateMutation = useMutation({
    mutationFn: (estimateId: string) =>
      apiRequestJson<ModernEstimate>('PATCH', `/api/estimates/${estimateId}/decline`),
    onSuccess: (data) => {
      toast({ title: 'Success', description: `Estimate #${data.estimateNumber} marked as rejected.` });
      invalidateQueries.estimate(data.id);
    },
    onError: (error) => toast({ title: 'Error', description: `Failed to reject estimate: ${error.message}`, variant: 'destructive' }),
  });

  const convertToJobMutation = useMutation({
    mutationFn: (estimateId: string) =>
      apiRequestJson('POST', `/api/estimates/${estimateId}/convert-to-job`), // Assuming API returns the new Job
    onSuccess: (data: any) => { // Replace 'any' with Job type when available
      toast({ title: 'Success', description: `Estimate converted to Job #${data.id}.` });
      invalidateQueries.estimate(data.estimateId); // Assuming estimateId is on the job or returned
      invalidateQueries.job(data.id); // Invalidate new job
    },
    onError: (error) => toast({ title: 'Error', description: `Failed to convert to job: ${error.message}`, variant: 'destructive' }),
  });
  
  const deleteEstimateMutation = useMutation({
    mutationFn: (estimateId: string) => apiRequest('DELETE', `/api/estimates/${estimateId}`),
    onSuccess: (_, estimateId) => {
      toast({ title: 'Success', description: 'Estimate deleted successfully.' });
      queryClient.invalidateQueries({ queryKey: queryKeys.estimates }); // Invalidate the list
    },
    onError: (error) => toast({ title: 'Error', description: `Failed to delete estimate: ${error.message}`, variant: 'destructive' }),
  });

  const handleAction = (action: () => void, mutation?: { isPending: boolean }) => {
    if (mutation?.isPending) return;
    action();
  };

  const totalPages = Math.ceil((estimatesQuery.data?.totalCount || 0) / pageSize);
  const renderPagination = () => {
    if (!estimatesQuery.data || estimatesQuery.data.totalCount <= pageSize) return null;
    // Pagination rendering logic (similar to LeadsListComponent)
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    if (endPage - startPage + 1 < maxPagesToShow) startPage = Math.max(1, endPage - maxPagesToShow + 1);
    for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);

    return (
      <div className="flex items-center justify-center space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || estimatesQuery.isFetching}>Previous</Button>
        {startPage > 1 && (<><Button variant="outline" size="sm" onClick={() => setPage(1)} disabled={estimatesQuery.isFetching}>1</Button>{startPage > 2 && <span className="text-sm">...</span>}</>)}
        {pageNumbers.map(num => (<Button key={num} variant={page === num ? 'default' : 'outline'} size="sm" onClick={() => setPage(num)} disabled={estimatesQuery.isFetching}>{num}</Button>))}
        {endPage < totalPages && (<><Button variant="outline" size="sm" onClick={() => setPage(totalPages)} disabled={estimatesQuery.isFetching}>{totalPages}</Button>{endPage < totalPages -1 && <span className="text-sm">...</span>}</>)}
        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || estimatesQuery.isFetching}>Next</Button>
      </div>
    );
  };

  const getStatusPill = (statusValue?: string | null) => {
    const statusConfig = ESTIMATE_STATUSES.find(s => s.value === statusValue);
    if (!statusConfig) return <Badge variant="outline">{statusValue || 'Unknown'}</Badge>;
    return <span className={cn("px-2 py-1 text-xs font-semibold rounded-full", statusConfig.color)}>{statusConfig.label}</span>;
  };

  return (
    <div className="p-4 md:p-6 bg-white dark:bg-slate-900 shadow-md rounded-lg">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Estimates</h1>
        <div className="flex space-x-2">
          <Button onClick={onAiGenerateEstimateClick} variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10">
            <Wand2 className="mr-2 h-5 w-5" /> AI Generate Estimate
          </Button>
          <Button onClick={onAddEstimateClick} className="bg-orange-500 hover:bg-orange-600 text-white">
            <PlusCircle className="mr-2 h-5 w-5" /> Create New Estimate
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 p-4 border border-slate-200 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-800/30">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by #, title, customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        {/* Use "all" as sentinel to avoid empty-string error in Radix Select */}
        <Select
          value={statusFilter === '' ? 'all' : statusFilter}
          onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {ESTIMATE_STATUSES.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
            variant="outline"
            onClick={() => estimatesQuery.refetch()}
            disabled={estimatesQuery.isFetching}
            className="w-full md:w-auto md:col-span-1 lg:col-auto"
        >
            <RefreshCw className={cn("mr-2 h-4 w-4", estimatesQuery.isFetching && "animate-spin")} />
            Refresh
        </Button>
      </div>

      {estimatesQuery.isLoading && <p className="text-center text-slate-500 dark:text-slate-400 py-4">Loading estimates...</p>}
      {estimatesQuery.isError && <p className="text-center text-red-500 py-4">Error fetching estimates: {estimatesQuery.error.message}</p>}
      
      {estimatesQuery.data && estimatesQuery.data.data.length === 0 && !estimatesQuery.isLoading && (
        <div className="text-center py-10">
          <FileText className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">No estimates found</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Try adjusting your search or filters, or create a new estimate.
          </p>
        </div>
      )}

      {estimatesQuery.data && estimatesQuery.data.data.length > 0 && (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/50">
                <TableHead>Number</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead className="text-right w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estimatesQuery.data.data.map((estimate) => (
                <TableRow key={estimate.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <TableCell className="font-medium text-orange-600 dark:text-orange-400 hover:underline cursor-pointer" onClick={() => onViewEstimateDetails(estimate.id)}>
                    {estimate.estimateNumber || `EST-${estimate.id}`}
                  </TableCell>
                  <TableCell>{estimate.customer ? `${estimate.customer.firstName} ${estimate.customer.lastName}` : 'N/A'}</TableCell>
                  <TableCell className="max-w-xs truncate" title={estimate.title || undefined}>{estimate.title || 'N/A'}</TableCell>
                  <TableCell className="text-right font-mono">${parseFloat(estimate.totalAmount as unknown as string).toFixed(2)}</TableCell>
                  <TableCell>{getStatusPill(estimate.status)}</TableCell>
                  <TableCell>{new Date(estimate.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{estimate.sentAt ? new Date(estimate.sentAt).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell>{estimate.validUntil ? new Date(estimate.validUntil).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Estimate Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewEstimateDetails(estimate.id)}>
                          <Eye className="mr-2 h-4 w-4" /> View/Print
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditEstimate(estimate)}>
                          <Edit3 className="mr-2 h-4 w-4" /> Edit Estimate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {estimate.status === 'draft' && (
                          <DropdownMenuItem onClick={() => handleAction(() => sendEstimateMutation.mutate(estimate.id), sendEstimateMutation)}>
                            <Send className="mr-2 h-4 w-4" /> Mark as Sent
                          </DropdownMenuItem>
                        )}
                        {estimate.status === 'sent' && (
                          <>
                            <DropdownMenuItem onClick={() => handleAction(() => approveEstimateMutation.mutate(estimate.id), approveEstimateMutation)}>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Mark as Approved
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction(() => rejectEstimateMutation.mutate(estimate.id), rejectEstimateMutation)}>
                              <XCircle className="mr-2 h-4 w-4 text-red-500" /> Mark as Rejected
                            </DropdownMenuItem>
                          </>
                        )}
                         {estimate.status === 'approved' && !estimate.jobId && (
                          <DropdownMenuItem onClick={() => handleAction(() => convertToJobMutation.mutate(estimate.id), convertToJobMutation)}>
                            <Briefcase className="mr-2 h-4 w-4 text-blue-500" /> Convert to Job
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => alert(`Duplicating estimate ${estimate.id}`)}>
                          <Copy className="mr-2 h-4 w-4" /> Duplicate Estimate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => window.confirm(`Are you sure you want to delete estimate #${estimate.estimateNumber}?`) && handleAction(() => deleteEstimateMutation.mutate(estimate.id), deleteEstimateMutation)} 
                          className="text-red-600 dark:text-red-500 hover:!bg-red-100 dark:hover:!bg-red-700/50 hover:!text-red-700 dark:hover:!text-red-400"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Estimate
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {renderPagination()}
    </div>
  );
};

export default EstimatesListComponent;

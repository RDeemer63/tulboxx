import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, Link } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  PlusCircle, Filter, RefreshCw, MoreHorizontal, Eye, Edit, Trash2, SendHorizontal, CheckCircle, X, Briefcase, Archive, Copy, ArrowUpDown,
  DollarSign, PackageOpen, Calendar, Users as UsersIcon, AlertTriangle, Loader2, ListOrdered, FileText, FileArchive, FileClock
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge }
from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from '@/components/ui/use-toast';

import { FeatureFlagGuard } from '@/components/shared/FeatureFlagGuard';
import { FEATURES } from '@/shared/featureFlags';
import { useDebounce } from '@/hooks/useDebounce';
import { formatCurrency, cn } from '@/lib/utils';
import { estimateQueryKeys } from '@/lib/api/estimates/queryKeys';
import {
  useGetEstimates, useGetEstimateStats, useCreateEstimate, useUpdateEstimate, useDeleteEstimate,
  useSendEstimate, useApproveEstimate, useDeclineEstimate, useArchiveEstimate, useConvertToJob, useVersionEstimate,
} from '@/lib/api/estimates/hooks';
import type { ModernEstimate, ListEstimateParams, EstimateStatsResponse, CreateEstimatePayload, UpdateEstimatePayload, DeclineEstimatePayload, ApproveEstimatePayload, ConvertToJobPayload } from '@/lib/api/estimates/api';
import { EstimateDrawer } from '@/components/estimates/EstimateDrawer'; // Assuming this component exists
import { ESTIMATE_STATUSES, EstimateStatusEnumType } from '@/shared/estimates-schema';

const STATUS_METADATA: Record<EstimateStatusEnumType, { label: string; color: string; icon: JSX.Element }> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300 border-gray-300 dark:border-slate-600', icon: <FileText className="h-3.5 w-3.5" /> },
  sent: { label: 'Sent', color: 'bg-blue-100 text-blue-700 dark:bg-blue-800/30 dark:text-blue-300 border-blue-300 dark:border-blue-700', icon: <SendHorizontal className="h-3.5 w-3.5" /> },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700 dark:bg-green-800/30 dark:text-green-300 border-green-300 dark:border-green-700', icon: <CheckCircle className="h-3.5 w-3.5" /> },
  declined: { label: 'Declined', color: 'bg-red-100 text-red-700 dark:bg-red-800/30 dark:text-red-300 border-red-300 dark:border-red-700', icon: <X className="h-3.5 w-3.5" /> },
  archived: { label: 'Archived', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-800/30 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700', icon: <FileArchive className="h-3.5 w-3.5" /> },
  converted: { label: 'Converted', color: 'bg-purple-100 text-purple-700 dark:bg-purple-800/30 dark:text-purple-300 border-purple-300 dark:border-purple-700', icon: <Briefcase className="h-3.5 w-3.5" /> },
  revision: { label: 'Revision', color: 'bg-orange-100 text-orange-700 dark:bg-orange-800/30 dark:text-orange-300 border-orange-300 dark:border-orange-700', icon: <Copy className="h-3.5 w-3.5" /> },
  superseded: { label: 'Superseded', color: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600', icon: <FileClock className="h-3.5 w-3.5" /> },
};


const ModernEstimatesPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [statusFilter, setStatusFilter] = useState<EstimateStatusEnumType | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [sortBy, setSortBy] = useState<keyof ModernEstimate | string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingEstimateId, setEditingEstimateId] = useState<string | undefined>(undefined);

  const listParams: ListEstimateParams = useMemo(() => ({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearchTerm,
    status: statusFilter === 'all' ? undefined : statusFilter,
    sortBy,
    sortDirection,
  }), [currentPage, pageSize, debouncedSearchTerm, statusFilter, sortBy, sortDirection]);

  const { data: estimatesData, isLoading: isLoadingEstimates, isError: isEstimatesError, error: estimatesError, refetch: refetchEstimates, isPreviousData } = useGetEstimates(listParams, { keepPreviousData: true });
  const { data: statsData, isLoading: isLoadingStats } = useGetEstimateStats();

  const createEstimateMutation = useCreateEstimate();
  const updateEstimateMutation = useUpdateEstimate(); // Assuming EstimateDrawer handles its own update mutation or calls this
  const deleteEstimateMutation = useDeleteEstimate();
  const sendEstimateMutation = useSendEstimate();
  const approveEstimateMutation = useApproveEstimate();
  const declineEstimateMutation = useDeclineEstimate();
  const archiveEstimateMutation = useArchiveEstimate();
  const convertToJobMutation = useConvertToJob();
  const versionEstimateMutation = useVersionEstimate();
  
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [debouncedSearchTerm, statusFilter]);

  const handleSort = (columnId: keyof ModernEstimate | string) => {
    if (sortBy === columnId) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnId);
      setSortDirection('desc');
    }
  };

  const handleAddNewEstimate = () => {
    setEditingEstimateId(undefined);
    setIsDrawerOpen(true);
  };

  const handleEditEstimate = (estimateId: string) => {
    setEditingEstimateId(estimateId);
    setIsDrawerOpen(true);
  };
  
  const handleDrawerSuccess = (updatedEstimate?: ModernEstimate) => {
    setIsDrawerOpen(false);
    setEditingEstimateId(undefined);
    queryClient.invalidateQueries({ queryKey: estimateQueryKeys.list() });
    queryClient.invalidateQueries({ queryKey: estimateQueryKeys.stats() });
    if (updatedEstimate?.id) {
      queryClient.invalidateQueries({ queryKey: estimateQueryKeys.detail(updatedEstimate.id) });
    }
  };

  const handleDeleteEstimate = (estimateId: string) => {
    if (window.confirm('Are you sure you want to delete this estimate? This action cannot be undone.')) {
      deleteEstimateMutation.mutate(estimateId);
    }
  };

  const handleSendEstimate = (estimateId: string) => sendEstimateMutation.mutate(estimateId);
  const handleApproveEstimate = (estimateId: string) => approveEstimateMutation.mutate({ id: estimateId }); // Basic approval, drawer might handle signature
  const handleDeclineEstimate = (estimateId: string) => declineEstimateMutation.mutate({ id: estimateId }); // Basic decline
  const handleArchiveEstimate = (estimateId: string) => archiveEstimateMutation.mutate(estimateId);
  const handleConvertToJob = (estimateId: string) => convertToJobMutation.mutate({ id: estimateId }); // Basic conversion
  const handleCreateNewVersion = (estimateId: string) => versionEstimateMutation.mutate(estimateId);


  const renderStatsCards = () => {
    if (isLoadingStats) {
      return Array.from({ length: 4 }).map((_, idx) => (
        <Card key={idx} className="shadow-sm">
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-3/4 mb-1" />
            <Skeleton className="h-8 w-1/2" />
          </CardHeader>
        </Card>
      ));
    }
    if (!statsData) return null;

    const stats = [
      { title: 'Total Estimates', value: statsData.totalEstimates, icon: <ListOrdered className="h-5 w-5 text-slate-500" /> },
      { title: 'Approved Value', value: formatCurrency(statsData.approvedValue), icon: <DollarSign className="h-5 w-5 text-slate-500" /> },
      { title: 'Drafts', value: statsData.draftCount, icon: <FileText className="h-5 w-5 text-slate-500" /> },
      { title: 'Sent', value: statsData.sentCount, icon: <SendHorizontal className="h-5 w-5 text-slate-500" /> },
    ];

    return stats.map(stat => (
      <Card key={stat.title} className="shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-300">{stat.title}</CardTitle>
          {stat.icon}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stat.value}</div>
        </CardContent>
      </Card>
    ));
  };
  
  const renderTableContent = () => {
    if (isLoadingEstimates) {
      return Array.from({ length: pageSize }).map((_, rowIndex) => (
        <TableRow key={`skeleton-${rowIndex}`}>
          {Array.from({ length: 7 }).map((_, cellIndex) => (
            <TableCell key={`skeleton-cell-${rowIndex}-${cellIndex}`}><Skeleton className="h-5 w-full" /></TableCell>
          ))}
        </TableRow>
      ));
    }

    if (isEstimatesError) {
      return <TableRow><TableCell colSpan={7}><Alert variant="destructive"><AlertTriangle className="h-4 w-4" /> <AlertTitle>Error</AlertTitle><AlertDescription>{estimatesError?.message || "Failed to load estimates."}</AlertDescription></Alert></TableCell></TableRow>;
    }

    if (!estimatesData?.items || estimatesData.items.length === 0) {
      return <TableRow><TableCell colSpan={7} className="text-center py-10 text-slate-500 dark:text-slate-400">No estimates found.</TableCell></TableRow>;
    }

    return estimatesData.items.map(estimate => {
      const statusMeta = STATUS_METADATA[estimate.status as EstimateStatusEnumType] || STATUS_METADATA.draft;
      return (
        <TableRow key={estimate.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
          <TableCell className="font-medium text-slate-700 dark:text-slate-300">{estimate.estimateNumber}</TableCell>
          <TableCell className="max-w-xs truncate text-slate-800 dark:text-slate-200">{estimate.title}</TableCell>
          <TableCell className="text-slate-600 dark:text-slate-400">{estimate.customerName || estimate.leadName || 'N/A'}</TableCell>
          <TableCell>
            <Badge variant="outline" className={cn("text-xs px-2 py-0.5 border font-semibold", statusMeta.color)}>
              {React.cloneElement(statusMeta.icon, { className: "h-3 w-3 mr-1" })}
              {statusMeta.label}
            </Badge>
          </TableCell>
          <TableCell className="text-slate-600 dark:text-slate-400">{format(new Date(estimate.createdAt), 'MMM d, yyyy')}</TableCell>
          <TableCell className="text-right font-medium text-slate-800 dark:text-slate-200">{formatCurrency(Number(estimate.total || 0))}</TableCell>
          <TableCell className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(`/modern-estimates/${estimate.id}`)}>
                  <Eye className="mr-2 h-4 w-4" /> View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEditEstimate(estimate.id)} disabled={!(estimate.status === 'draft' || estimate.status === 'revision')}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                {estimate.status === 'draft' && (
                  <DropdownMenuItem onClick={() => handleSendEstimate(estimate.id)} disabled={sendEstimateMutation.isPending}>
                    <SendHorizontal className="mr-2 h-4 w-4" /> Send
                  </DropdownMenuItem>
                )}
                 {estimate.status === 'sent' && (
                  <>
                    <DropdownMenuItem onClick={() => handleApproveEstimate(estimate.id)} disabled={approveEstimateMutation.isPending}>
                      <CheckCircle className="mr-2 h-4 w-4" /> Approve
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeclineEstimate(estimate.id)} disabled={declineEstimateMutation.isPending} className="text-destructive focus:text-destructive">
                      <X className="mr-2 h-4 w-4" /> Decline
                    </DropdownMenuItem>
                  </>
                )}
                {estimate.status === 'approved' && !estimate.jobId && (
                   <DropdownMenuItem onClick={() => handleConvertToJob(estimate.id)} disabled={convertToJobMutation.isPending}>
                    <Briefcase className="mr-2 h-4 w-4" /> Convert to Job
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleCreateNewVersion(estimate.id)} disabled={versionEstimateMutation.isPending}>
                  <Copy className="mr-2 h-4 w-4" /> Create New Version
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleArchiveEstimate(estimate.id)} disabled={archiveEstimateMutation.isPending || estimate.status === 'archived'}>
                  <Archive className="mr-2 h-4 w-4" /> Archive
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleDeleteEstimate(estimate.id)} disabled={deleteEstimateMutation.isPending} className="text-destructive focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      );
    });
  };

  return (
    <FeatureFlagGuard feature={FEATURES.NEW_ESTIMATES_MODULE} fallback={<div>Modern Estimates Module not enabled.</div>}>
      <div className="flex flex-col h-full p-4 md:p-6 lg:p-8 space-y-6 bg-slate-50 dark:bg-slate-900">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Modern Estimates</h1>
          <Button onClick={handleAddNewEstimate} size="lg" className="bg-primary hover:bg-primary/90 text-white">
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Estimate
          </Button>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {renderStatsCards()}
        </section>

        <Card className="shadow-lg flex-grow flex flex-col">
          <CardHeader className="border-b border-slate-200 dark:border-slate-700 p-4">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Input
                placeholder="Search by number, title, notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-xs h-9 text-sm rounded-md focus-visible:ring-primary dark:bg-slate-800 dark:border-slate-700"
              />
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as EstimateStatusEnumType | 'all')}
              >
                <SelectTrigger className="w-full sm:w-[180px] h-9 text-sm rounded-md focus:ring-primary dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-800">
                  <SelectItem value="all">All Statuses</SelectItem>
                  {ESTIMATE_STATUSES.map(status => (
                    <SelectItem key={status} value={status} className="capitalize">{status.replace('_', ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={() => refetchEstimates()} className="h-9 w-9 text-slate-600 dark:text-slate-400 dark:border-slate-700 dark:hover:bg-slate-800">
                <RefreshCw className="h-4 w-4" />
                <span className="sr-only">Refresh</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-grow overflow-hidden">
            <div className="overflow-x-auto h-full">
              <Table className="min-w-full">
                <TableHeader className="sticky top-0 bg-slate-100 dark:bg-slate-800 z-10">
                  <TableRow>
                    {['estimateNumber', 'title', 'customerName', 'status', 'createdAt', 'total'].map((headerId) => (
                      <TableHead key={headerId} onClick={() => handleSort(headerId)} className="cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors px-3 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                        <div className="flex items-center">
                          {headerId.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          {sortBy === headerId && <ArrowUpDown className="ml-2 h-3 w-3" />}
                        </div>
                      </TableHead>
                    ))}
                    <TableHead className="text-right px-3 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {renderTableContent()}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="p-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between w-full text-sm text-slate-600 dark:text-slate-400">
              <span>Page {estimatesData?.pagination.currentPage || 1} of {estimatesData?.pagination.totalPages || 1}</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1 || isLoadingEstimates}
                  className="dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={currentPage === estimatesData?.pagination.totalPages || isPreviousData || isLoadingEstimates}
                  className="dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  Next
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>

        <EstimateDrawer
          isOpen={isDrawerOpen}
          onClose={() => { setIsDrawerOpen(false); setEditingEstimateId(undefined); }}
          estimateId={editingEstimateId}
          onSuccess={handleDrawerSuccess}
        />
      </div>
    </FeatureFlagGuard>
  );
};

export default ModernEstimatesPage;

import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  AlertTriangle, ArrowLeft, Briefcase, Calendar, CheckCircle, ChevronDown, Clock, Edit, Eye, FileText,
  Loader2, MoreHorizontal, PackageOpen, SendHorizontal, Settings2, Trash2, Users, X, ListOrdered, EyeOff,
  FileSignature, FilePlus2, Copy, Archive, DollarSign, Percent, MessageSquare, FileArchive, FileUp, FileDown, FileClock
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

import { FeatureFlagGuard } from '@/components/shared/FeatureFlagGuard';
import { FEATURES } from '@/shared/featureFlags';
import { EstimateDrawer } from '@/components/estimates/EstimateDrawer';

import {
  useGetEstimateById,
  useGetEstimateEvents,
  useSendEstimate,
  useApproveEstimate,
  useDeclineEstimate,
  useConvertToJob,
  useArchiveEstimate,
  useVersionEstimate,
  useDeleteEstimate,
} from '@/lib/api/estimates/hooks';
import { estimateQueryKeys } from '@/lib/api/estimates/queryKeys';
import { ModernEstimate, EstimateLineItem, EstimateEvent } from '@/lib/api/estimates/api';
import { formatCurrency, cn } from '@/lib/utils';
import { useUser } from '@/contexts/user-context';

// Status Metadata
const STATUS_METADATA: Record<string, { label: string; color: string; icon: JSX.Element }> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300 border-gray-300 dark:border-slate-600', icon: <FileText className="h-3.5 w-3.5" /> },
  sent: { label: 'Sent', color: 'bg-blue-100 text-blue-700 dark:bg-blue-800/30 dark:text-blue-300 border-blue-300 dark:border-blue-700', icon: <SendHorizontal className="h-3.5 w-3.5" /> },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700 dark:bg-green-800/30 dark:text-green-300 border-green-300 dark:border-green-700', icon: <CheckCircle className="h-3.5 w-3.5" /> },
  declined: { label: 'Declined', color: 'bg-red-100 text-red-700 dark:bg-red-800/30 dark:text-red-300 border-red-300 dark:border-red-700', icon: <X className="h-3.5 w-3.5" /> },
  archived: { label: 'Archived', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-800/30 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700', icon: <FileArchive className="h-3.5 w-3.5" /> },
  converted: { label: 'Converted', color: 'bg-purple-100 text-purple-700 dark:bg-purple-800/30 dark:text-purple-300 border-purple-300 dark:border-purple-700', icon: <Briefcase className="h-3.5 w-3.5" /> },
  revision: { label: 'Revision', color: 'bg-orange-100 text-orange-700 dark:bg-orange-800/30 dark:text-orange-300 border-orange-300 dark:border-orange-700', icon: <Copy className="h-3.5 w-3.5" /> },
  superseded: { label: 'Superseded', color: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600', icon: <FileClock className="h-3.5 w-3.5" /> },
};


const EstimateDetailPage: React.FC = () => {
  const params = useParams();
  const estimateId = params.id;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useUser(); // For potential future RBAC on actions

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  // The drawer will fetch its own data using estimateId, so we only need to pass the ID.
  const [editingEstimateIdForDrawer, setEditingEstimateIdForDrawer] = useState<string | undefined>(undefined);

  const { data: estimate, isLoading, isError, error, refetch } = useGetEstimateById(estimateId);
  const { data: eventsData, isLoading: isLoadingEvents, refetch: refetchEvents } = useGetEstimateEvents(estimateId, { enabled: !!estimateId });

  // Mutations
  const sendMutation = useSendEstimate();
  const approveMutation = useApproveEstimate();
  const declineMutation = useDeclineEstimate();
  const convertToJobMutation = useConvertToJob();
  const archiveMutation = useArchiveEstimate();
  const versionMutation = useVersionEstimate();
  const deleteMutation = useDeleteEstimate();

  const handleEdit = () => {
    if (estimate?.id) {
      setEditingEstimateIdForDrawer(estimate.id);
      setIsDrawerOpen(true);
    }
  };

  const handleWorkflowAction = async (actionFn: () => Promise<any>, successMessage: string, errorMessagePrefix: string) => {
    try {
      const result = await actionFn();
      toast({ title: successMessage, description: result?.message || 'Action completed.' });
      refetch(); // Refetch main estimate data
      refetchEvents(); // Refetch activity events
      queryClient.invalidateQueries({ queryKey: estimateQueryKeys.list() }); // Invalidate list for other views
      queryClient.invalidateQueries({ queryKey: estimateQueryKeys.stats() });
    } catch (err: any) {
      toast({
        title: `${errorMessagePrefix} Failed`,
        description: err.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  // Determine action availability based on estimate status
  const canEdit = estimate?.status === 'draft' || estimate?.status === 'revision';
  const canSend = estimate?.status === 'draft' || estimate?.status === 'revision';
  const canApproveDecline = estimate?.status === 'sent';
  const canConvertToJob = estimate?.status === 'approved' && !estimate.jobId;
  const canCreateNewVersion = estimate && !['draft', 'revision'].includes(estimate.status); // Typically after sent/approved
  const canArchive = estimate && !['draft', 'archived', 'converted', 'superseded'].includes(estimate.status);
  const canDelete = estimate?.status === 'draft' || (estimate?.status === 'archived' && !estimate.jobId);


  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-1/4" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-8 w-1/2 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-10 w-full mb-4" /> {/* TabsList skeleton */}
        <Skeleton className="h-96 w-full" /> {/* TabContent skeleton */}
      </div>
    );
  }

  if (isError || !estimate) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Estimate</AlertTitle>
          <AlertDescription>
            {error?.message || 'Failed to load estimate details. It might not exist or an error occurred.'}
          </AlertDescription>
        </Alert>
        <Button asChild variant="outline">
          <Link href="/modern-estimates"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Estimates</Link>
        </Button>
      </div>
    );
  }
  
  const statusMeta = STATUS_METADATA[estimate.status] || STATUS_METADATA.draft;

  return (
    <FeatureFlagGuard feature={FEATURES.NEW_ESTIMATES_MODULE} fallback={<div>Modern estimates module is not enabled.</div>}>
      <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Button asChild variant="outline" size="sm" className="mb-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
              <Link href="/modern-estimates"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Estimates</Link>
            </Button>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 flex items-center flex-wrap gap-x-3">
              <span>{estimate.title || `Estimate #${estimate.estimateNumber}`}</span>
              <Badge variant="outline" className={cn("text-sm px-2.5 py-1 border font-semibold", statusMeta.color)}>
                {React.cloneElement(statusMeta.icon, { className: "h-4 w-4 mr-1.5" })}
                {statusMeta.label}
              </Badge>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Estimate Number: <span className="font-medium text-slate-700 dark:text-slate-300">{estimate.estimateNumber}</span>
              <span className="mx-2 text-slate-300 dark:text-slate-600">|</span>
              Last Updated: {format(new Date(estimate.updatedAt), "MMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
          <div className="flex space-x-2 shrink-0">
            {canEdit && (
              <Button onClick={handleEdit} variant="outline" className="border-primary text-primary hover:bg-primary/5 dark:hover:bg-primary/10">
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                  Actions <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {canSend && (
                  <DropdownMenuItem onClick={() => handleWorkflowAction(() => sendMutation.mutateAsync(estimate.id), 'Estimate Sent', 'Send Estimate')} disabled={sendMutation.isPending}>
                    {sendMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SendHorizontal className="mr-2 h-4 w-4 text-blue-500" />}
                    Send Estimate
                  </DropdownMenuItem>
                )}
                {canApproveDecline && (
                  <>
                    <DropdownMenuItem onClick={() => handleWorkflowAction(() => approveMutation.mutateAsync({ id: estimate.id }), 'Estimate Approved', 'Approve Estimate')} disabled={approveMutation.isPending}>
                      {approveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4 text-green-500" />}
                      Approve Estimate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleWorkflowAction(() => declineMutation.mutateAsync({ id: estimate.id }), 'Estimate Declined', 'Decline Estimate')} disabled={declineMutation.isPending} className="text-red-600 focus:text-red-700 focus:bg-red-50 dark:focus:bg-red-900/50">
                      {declineMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <X className="mr-2 h-4 w-4" />}
                      Decline Estimate
                    </DropdownMenuItem>
                  </>
                )}
                {canConvertToJob && (
                  <DropdownMenuItem onClick={() => handleWorkflowAction(() => convertToJobMutation.mutateAsync({ id: estimate.id }), 'Converted to Job', 'Convert to Job')} disabled={convertToJobMutation.isPending}>
                    {convertToJobMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Briefcase className="mr-2 h-4 w-4 text-purple-500" />}
                    Convert to Job
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {canCreateNewVersion && (
                  <DropdownMenuItem onClick={() => handleWorkflowAction(() => versionMutation.mutateAsync(estimate.id), 'New Version Created', 'Create New Version')} disabled={versionMutation.isPending}>
                     {versionMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Copy className="mr-2 h-4 w-4 text-orange-500" />}
                    Create New Version
                  </DropdownMenuItem>
                )}
                 {canArchive && (
                  <DropdownMenuItem onClick={() => handleWorkflowAction(() => archiveMutation.mutateAsync(estimate.id), 'Estimate Archived', 'Archive Estimate')} disabled={archiveMutation.isPending}>
                    {archiveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Archive className="mr-2 h-4 w-4 text-yellow-500" />}
                    Archive Estimate
                  </DropdownMenuItem>
                )}
                {canDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => {
                        if (confirm('Are you sure you want to permanently delete this estimate? This action cannot be undone.')) {
                          handleWorkflowAction(() => deleteMutation.mutateAsync(estimate.id), 'Estimate Deleted', 'Delete Estimate');
                        }
                      }} 
                      disabled={deleteMutation.isPending} 
                      className="text-destructive focus:text-destructive focus:bg-destructive/10"
                    >
                      {deleteMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                      Delete Estimate
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 mb-4 border-b border-slate-200 dark:border-slate-700 rounded-none">
            <TabsTrigger value="details" className="data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none border-b-2 border-transparent rounded-none">Details</TabsTrigger>
            <TabsTrigger value="lineItems" className="data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none border-b-2 border-transparent rounded-none">Line Items</TabsTrigger>
            <TabsTrigger value="documents" className="data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none border-b-2 border-transparent rounded-none">Documents</TabsTrigger>
            <TabsTrigger value="preview" className="data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none border-b-2 border-transparent rounded-none">Preview</TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none border-b-2 border-transparent rounded-none">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-6">
            <EstimateDetailsTab estimate={estimate} />
          </TabsContent>
          <TabsContent value="lineItems" className="mt-6">
            <EstimateLineItemsTab estimate={estimate} />
          </TabsContent>
          <TabsContent value="documents" className="mt-6">
            <EstimateDocumentsTab estimate={estimate} />
          </TabsContent>
          <TabsContent value="preview" className="mt-6">
            <EstimatePreviewTab estimate={estimate} />
          </TabsContent>
          <TabsContent value="activity" className="mt-6">
            <EstimateActivityTab events={eventsData || []} isLoading={isLoadingEvents} />
          </TabsContent>
        </Tabs>

        {/* Estimate Drawer for Editing */}
        <EstimateDrawer
          isOpen={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false);
            setEditingEstimateIdForDrawer(undefined);
          }}
          estimateId={editingEstimateIdForDrawer}
          onSuccess={(updatedEstimate) => {
            setIsDrawerOpen(false);
            setEditingEstimateIdForDrawer(undefined);
            queryClient.invalidateQueries({ queryKey: estimateQueryKeys.detail(updatedEstimate.id) });
            queryClient.invalidateQueries({ queryKey: estimateQueryKeys.list() });
            queryClient.invalidateQueries({ queryKey: estimateQueryKeys.stats() });
            refetch(); // Refetch current estimate details
            refetchEvents(); // Refetch events
          }}
        />
      </div>
    </FeatureFlagGuard>
  );
};

// --- Tab Content Components ---

const DetailItem: React.FC<{ label: string; value?: string | number | null | React.ReactNode; className?: string }> = ({ label, value, className }) => (
  <div className={cn("grid grid-cols-3 gap-2 items-start", className)}>
    <dt className="text-sm font-medium text-slate-500 dark:text-slate-400 col-span-1">{label}:</dt>
    <dd className="text-sm text-slate-800 dark:text-slate-200 col-span-2">{value ?? <span className="italic text-slate-400 dark:text-slate-500">N/A</span>}</dd>
  </div>
);

const EstimateDetailsTab: React.FC<{ estimate: ModernEstimate }> = ({ estimate }) => (
  <Card className="shadow-md">
    <CardHeader>
      <CardTitle className="text-xl text-slate-800 dark:text-slate-100">Core Information</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        <DetailItem label="Estimate Title" value={estimate.title} />
        <DetailItem label="Estimate Number" value={estimate.estimateNumber} />
        <DetailItem label="Status" value={<Badge variant="outline" className={cn("font-semibold border", STATUS_METADATA[estimate.status]?.color)}>{STATUS_METADATA[estimate.status]?.label}</Badge>} />
        <DetailItem label="Type" value={<span className="capitalize">{estimate.estimateType}</span>} />
        <DetailItem label="Customer" value={estimate.customerName || (estimate.customerId ? `Customer ID: ${estimate.customerId}` : null)} />
        <DetailItem label="Lead" value={estimate.leadName || (estimate.leadId ? `Lead ID: ${estimate.leadId}` : null)} />
        <DetailItem label="Created At" value={format(new Date(estimate.createdAt), "MMM d, yyyy, h:mm a")} />
        <DetailItem label="Updated At" value={format(new Date(estimate.updatedAt), "MMM d, yyyy, h:mm a")} />
        {estimate.sentAt && <DetailItem label="Sent At" value={format(new Date(estimate.sentAt), "MMM d, yyyy, h:mm a")} />}
        {estimate.approvedAt && <DetailItem label="Approved At" value={format(new Date(estimate.approvedAt), "MMM d, yyyy, h:mm a")} />}
        {estimate.jobId && <DetailItem label="Converted to Job ID" value={estimate.jobId} />}
        {estimate.versionOf && <DetailItem label="Version of Estimate" value={estimate.versionOf} />}
      </div>
      
      {estimate.notes && (
        <div className="pt-4">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Internal Notes:</h3>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-md border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{estimate.notes}</p>
          </div>
        </div>
      )}
    </CardContent>
  </Card>
);

const ItemizedTotalDisplay: React.FC<{ subtotal: number | string | null, tax: number | string | null, total: number | string | null, taxRate: number | string | null }> = ({ subtotal, tax, total, taxRate }) => (
  <div className="mt-6 ml-auto w-full max-w-xs space-y-2 p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
    <div className="flex justify-between text-sm">
      <span className="text-slate-600 dark:text-slate-400">Subtotal:</span>
      <span className="font-medium text-slate-800 dark:text-slate-200">{formatCurrency(Number(subtotal || 0))}</span>
    </div>
    <div className="flex justify-between text-sm">
      <span className="text-slate-600 dark:text-slate-400">Tax ({Number(taxRate || 0).toFixed(2)}%):</span>
      <span className="font-medium text-slate-800 dark:text-slate-200">{formatCurrency(Number(tax || 0))}</span>
    </div>
    <Separator className="my-2 bg-slate-300 dark:bg-slate-600" />
    <div className="flex justify-between text-lg">
      <span className="font-semibold text-slate-800 dark:text-slate-100">Total:</span>
      <span className="font-bold text-primary">{formatCurrency(Number(total || 0))}</span>
    </div>
  </div>
);

const LineItemsTable: React.FC<{ lineItems: EstimateLineItem[] | null | undefined }> = ({ lineItems }) => {
  if (!lineItems || lineItems.length === 0) {
    return <p className="text-slate-500 dark:text-slate-400 text-center py-8">No line items for this estimate.</p>;
  }
  return (
    <div className="overflow-x-auto rounded-md border border-slate-200 dark:border-slate-700">
      <Table>
        <TableHeader className="bg-slate-50 dark:bg-slate-800">
          <TableRow>
            <TableHead className="w-[40px] px-3 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-400">#</TableHead>
            <TableHead className="min-w-[250px] px-3 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-400">Description</TableHead>
            <TableHead className="px-3 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-400">Category</TableHead>
            <TableHead className="text-right px-3 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-400">Qty</TableHead>
            <TableHead className="px-3 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-400">Unit</TableHead>
            <TableHead className="text-right px-3 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-400">Unit Price</TableHead>
            <TableHead className="text-right px-3 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-400">Markup</TableHead>
            <TableHead className="text-right px-3 py-2.5 text-xs font-medium text-slate-600 dark:text-slate-400">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lineItems.map((item, index) => (
            <TableRow key={item.id || `temp-${index}`} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/50">
              <TableCell className="px-3 py-3 text-sm text-slate-500 dark:text-slate-400">{index + 1}</TableCell>
              <TableCell className="px-3 py-3 text-sm text-slate-800 dark:text-slate-200 font-medium whitespace-pre-wrap">{item.description}</TableCell>
              <TableCell className="px-3 py-3 text-sm text-slate-600 dark:text-slate-300">{item.category || 'N/A'}</TableCell>
              <TableCell className="text-right px-3 py-3 text-sm text-slate-600 dark:text-slate-300">{Number(item.quantity).toFixed(2)}</TableCell>
              <TableCell className="px-3 py-3 text-sm text-slate-600 dark:text-slate-300">{item.unit || 'N/A'}</TableCell>
              <TableCell className="text-right px-3 py-3 text-sm text-slate-600 dark:text-slate-300">{formatCurrency(Number(item.unitPrice))}</TableCell>
              <TableCell className="text-right px-3 py-3 text-sm text-slate-600 dark:text-slate-300">{item.markupPct ? `${Number(item.markupPct).toFixed(1)}%` : '-'}</TableCell>
              <TableCell className="text-right px-3 py-3 text-sm text-slate-800 dark:text-slate-200 font-semibold">{formatCurrency(Number(item.total))}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const EstimateLineItemsTab: React.FC<{ estimate: ModernEstimate & { lineItems?: EstimateLineItem[] } }> = ({ estimate }) => (
  <Card className="shadow-md">
    <CardHeader>
      <CardTitle className="text-xl text-slate-800 dark:text-slate-100">Line Items</CardTitle>
      <CardDescription>Detailed breakdown of services and materials for this estimate.</CardDescription>
    </CardHeader>
    <CardContent>
      {estimate.estimateType === 'simple' ? (
        <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700 text-blue-700 dark:text-blue-300">
          <PackageOpen className="h-4 w-4 !text-blue-600 dark:!text-blue-400" />
          <AlertTitle className="font-semibold">Simple Estimate</AlertTitle>
          <AlertDescription>
            This is a simple estimate with a single total price of {formatCurrency(Number(estimate.totalPrice || estimate.total || 0))}. Line items are not applicable.
            To add detailed line items, please edit the estimate and change its type to "Detailed".
          </AlertDescription>
        </Alert>
      ) : (
        <LineItemsTable lineItems={estimate.lineItems} />
      )}
      <ItemizedTotalDisplay 
        subtotal={estimate.subtotal} 
        tax={estimate.tax} 
        total={estimate.total}
        taxRate={estimate.taxRate}
      />
    </CardContent>
  </Card>
);

const EstimateDocumentsTab: React.FC<{ estimate: ModernEstimate }> = ({ estimate }) => (
  <Card className="shadow-md">
    <CardHeader>
      <CardTitle className="text-xl text-slate-800 dark:text-slate-100">Documents</CardTitle>
      <CardDescription>Manage files and documents related to this estimate.</CardDescription>
    </CardHeader>
    <CardContent className="text-center py-12">
      <FileUp className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500 mb-4" />
      <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">Document Management Coming Soon</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
        Soon you'll be able to upload, view, and manage estimate PDFs and other related files here.
      </p>
      {/* Placeholder for PDF generation/download button */}
      <Button variant="outline" className="mt-6" disabled>
        <FileDown className="mr-2 h-4 w-4" /> Download PDF (Placeholder)
      </Button>
    </CardContent>
  </Card>
);


const EstimatePreviewTab: React.FC<{ estimate: ModernEstimate & { lineItems?: EstimateLineItem[] } }> = ({ estimate }) => (
 <Card className="shadow-md">
    <CardHeader>
      <CardTitle className="text-xl text-slate-800 dark:text-slate-100">Estimate Preview</CardTitle>
      <CardDescription>This is how the estimate will generally appear to the customer.</CardDescription>
    </CardHeader>
    <CardContent className="p-6 bg-white dark:bg-slate-900 rounded-b-md">
      <div className="border border-slate-200 dark:border-slate-700 p-8 rounded-lg shadow-sm bg-white dark:bg-slate-800/30">
        <header className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-primary">{estimate.title || `Estimate #${estimate.estimateNumber}`}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Estimate Number: {estimate.estimateNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">TULBOXX CRM</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Your Company Address</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Phone: (555) 123-4567</p>
            </div>
          </div>
          <Separator className="my-6 bg-slate-300 dark:bg-slate-600" />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Bill To:</h4>
              <p className="text-slate-600 dark:text-slate-400">{estimate.customerName || estimate.leadName || 'N/A'}</p>
              <p className="text-slate-600 dark:text-slate-400">{estimate.customerAddress || 'Customer Address N/A'}</p>
            </div>
            <div className="text-right">
              <p><strong className="text-slate-600 dark:text-slate-400">Date:</strong> {format(new Date(estimate.createdAt), "MMMM d, yyyy")}</p>
              {estimate.validUntil && <p><strong className="text-slate-600 dark:text-slate-400">Valid Until:</strong> {format(new Date(estimate.validUntil), "MMMM d, yyyy")}</p>}
            </div>
          </div>
        </header>

        {estimate.estimateType === 'simple' ? (
          <div className="py-4">
            <p className="text-slate-700 dark:text-slate-300">
              Total project cost: <strong className="text-lg">{formatCurrency(Number(estimate.totalPrice || estimate.total || 0))}</strong>
            </p>
            {estimate.notes && <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{estimate.notes}</p>}
          </div>
        ) : (
          <LineItemsTable lineItems={estimate.lineItems} />
        )}
        
        <div className="mt-8 flex justify-end">
          <ItemizedTotalDisplay 
            subtotal={estimate.subtotal} 
            tax={estimate.tax} 
            total={estimate.total}
            taxRate={estimate.taxRate}
          />
        </div>

        {estimate.termsAndConditions && (
          <footer className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-700">
            <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Terms & Conditions</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 whitespace-pre-wrap">{estimate.termsAndConditions}</p>
          </footer>
        )}
         <div className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
            Thank you for your business!
          </div>
      </div>
    </CardContent>
  </Card>
);

const ActivityTimelineItem: React.FC<{ event: EstimateEvent }> = ({ event }) => (
  <div className="flex space-x-3 py-3 border-b border-slate-200 dark:border-slate-700 last:border-b-0">
    <div className="flex-shrink-0 pt-0.5">
      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-700">
        <MessageSquare className="h-4 w-4 text-slate-500 dark:text-slate-400" />
      </span>
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-sm text-slate-700 dark:text-slate-300">
        {event.message || `Event: ${event.type}`}
        {event.userName && <span className="font-medium"> by {event.userName}</span>}
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {format(new Date(event.createdAt), "MMM d, yyyy 'at' h:mm a")}
      </p>
      {event.data && Object.keys(event.data).length > 0 && (
        <pre className="mt-1 text-xs bg-slate-50 dark:bg-slate-800 p-2 rounded overflow-x-auto max-h-32">
          {JSON.stringify(event.data, null, 2)}
        </pre>
      )}
    </div>
  </div>
);

const EstimateActivityTab: React.FC<{ events: EstimateEvent[], isLoading: boolean }> = ({ events, isLoading }) => (
  <Card className="shadow-md">
    <CardHeader>
      <CardTitle className="text-xl text-slate-800 dark:text-slate-100">Activity Feed</CardTitle>
      <CardDescription>History of actions and events related to this estimate.</CardDescription>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        Array.from({ length: 3 }).map((_, idx) => <Skeleton key={idx} className="h-16 w-full mb-2 rounded-md" />)
      ) : events.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400 text-center py-8">No activity recorded for this estimate yet.</p>
      ) : (
        <ScrollArea className="h-[400px] pr-3">
          <div className="space-y-1">
            {events.map(event => <ActivityTimelineItem key={event.id} event={event} />)}
          </div>
        </ScrollArea>
      )}
    </CardContent>
  </Card>
);

export default EstimateDetailPage;

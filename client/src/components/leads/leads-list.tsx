import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'; // Assuming these are now styled by Tailwind/shadcn conventions
import { Button } from '@/components/ui/button'; // Will use new design system styles
import { Input } from '@/components/ui/input';   // Will use new design system styles
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'; // Will use new design system styles
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator, // Added for better action separation
} from '@/components/ui/dropdown-menu';
import {
  Eye,
  Edit3,
  CheckCircle,
  MoreHorizontal,
  PlusCircle,
  Search,
  RefreshCw,
  Trash2,
  MessageSquarePlus,
  CalendarPlus,
  Users as UsersIcon, // For empty state
} from 'lucide-react';
import { type Contact, type InsertContact } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { apiRequestJson, apiRequest, queryKeys, invalidateQueries } from '@/lib/queryClient'; // Updated import

type Lead = Contact & {
  leadStageName?: string;
};

const LEAD_SOURCES = ['Website', 'Referral', 'Cold Call', 'Advertisement', 'Social Media', 'Event', 'Other'];

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

interface LeadsListProps {
  onAddLeadClick: () => void;
  onViewLeadDetails: (leadId: number) => void;
  onEditLead: (lead: Lead) => void;
}

const LeadsListComponent: React.FC<LeadsListProps> = ({ onAddLeadClick, onViewLeadDetails, onEditLead }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const leadsQuery = useQuery<{ data: Lead[]; totalCount: number }, Error>({
    queryKey: ['leads', debouncedSearchTerm, sourceFilter, page, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('contactType', 'lead');
      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
      if (sourceFilter) params.append('leadSource', sourceFilter);
      params.append('page', page.toString());
      params.append('pageSize', pageSize.toString());
      
      const response = await apiRequestJson<{ data: Lead[]; totalCount: number }>(
        'GET',
        `/api/contacts?${params.toString()}`,
      );
      return response;
    },
    placeholderData: (previousData) => previousData,
  });

  const convertToCustomerMutation = useMutation({
    mutationFn: async (leadId: number) => {
      return apiRequestJson<Contact>('PATCH', `/api/contacts/${leadId}/convert-to-customer`);
    },
    onSuccess: (data) => {
      toast({ title: 'Success', description: `${data.firstName} ${data.lastName} converted to customer.` });
      invalidateQueries.lead(data.id); // Use specific invalidation helper
    },
    onError: (error) => {
      toast({ title: 'Error', description: `Failed to convert lead: ${error.message}`, variant: 'destructive' });
    },
  });

  const deleteLeadMutation = useMutation({
    mutationFn: async (leadId: number) => {
      return apiRequest('DELETE', `/api/contacts/${leadId}`); // apiRequest for non-JSON response (204)
    },
    onSuccess: (_, leadId) => {
      toast({ title: 'Success', description: 'Lead deleted successfully.' });
      invalidateQueries.lead(leadId); // Invalidate specific lead and list
    },
    onError: (error) => {
      toast({ title: 'Error', description: `Failed to delete lead: ${error.message}`, variant: 'destructive' });
    },
  });

  const handleConvertToCustomer = (lead: Lead) => {
    convertToCustomerMutation.mutate(lead.id);
  };

  const handleDeleteLead = (lead: Lead) => {
    if (window.confirm(`Are you sure you want to delete lead ${lead.firstName} ${lead.lastName}? This action cannot be undone.`)) {
      deleteLeadMutation.mutate(lead.id);
    }
  };
  
  const totalPages = Math.ceil((leadsQuery.data?.totalCount || 0) / pageSize);

  const renderPagination = () => {
    if (!leadsQuery.data || leadsQuery.data.totalCount <= pageSize) return null;

    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex items-center justify-center space-x-2 py-6">
        <Button
          variant="outline" // Will map to button-secondary
          size="sm"
          onClick={() => setPage(prev => Math.max(1, prev - 1))}
          disabled={page === 1 || leadsQuery.isFetching}
        >
          Previous
        </Button>
        {startPage > 1 && (
            <>
                <Button variant="outline" size="sm" onClick={() => setPage(1)} disabled={leadsQuery.isFetching}>1</Button>
                {startPage > 2 && <span className="text-sm text-muted-foreground">...</span>}
            </>
        )}
        {pageNumbers.map(num => (
          <Button
            key={num}
            variant={page === num ? 'default' : 'outline'} // 'default' will map to button-primary
            size="sm"
            onClick={() => setPage(num)}
            disabled={leadsQuery.isFetching}
          >
            {num}
          </Button>
        ))}
        {endPage < totalPages && (
            <>
                {endPage < totalPages -1 && <span className="text-sm text-muted-foreground">...</span>}
                <Button variant="outline" size="sm" onClick={() => setPage(totalPages)} disabled={leadsQuery.isFetching}>{totalPages}</Button>
            </>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
          disabled={page === totalPages || leadsQuery.isFetching}
        >
          Next
        </Button>
      </div>
    );
  };

  const getStatusBadgeClass = (status?: string | null) => {
    switch (status) {
      case 'customer': 
      case 'converted_to_customer':
        return 'bg-brand-success/10 text-brand-success'; 
      case 'unqualified':
      case 'lost':
        return 'bg-brand-danger/10 text-brand-danger';
      case 'lead': 
      default:
        return 'bg-brand-info/10 text-brand-info'; 
    }
  };


  return (
    <div className="bg-card text-card-foreground shadow-lg rounded-xl p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-semibold text-foreground">Leads Management</h1>
        <Button onClick={onAddLeadClick} className="bg-brand-primary text-primary-foreground hover:bg-brand-primary-hover">
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Lead
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full h-10 rounded-md border-border focus:ring-ring focus:border-ring" 
          />
        </div>

        <Select
          value={sourceFilter === '' ? 'all' : sourceFilter}
          onValueChange={(v) => setSourceFilter(v === 'all' ? '' : v)}
        >
          <SelectTrigger className="w-full h-10 rounded-md border-border focus:ring-ring focus:border-ring">
            <SelectValue placeholder="Filter by Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {LEAD_SOURCES.map((source) => (
              <SelectItem key={source} value={source.toLowerCase().replace(' ', '_')}>
                {source}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
            variant="outline" 
            onClick={() => leadsQuery.refetch()}
            disabled={leadsQuery.isFetching}
            className="w-full md:w-auto h-10 rounded-md"
        >
            <RefreshCw className={cn("mr-2 h-4 w-4", leadsQuery.isFetching && "animate-spin")} />
            Refresh
        </Button>
      </div>

      {leadsQuery.isLoading && <p className="text-center text-muted-foreground py-4">Loading leads...</p>}
      {leadsQuery.isError && <p className="text-center text-brand-danger py-4">Error fetching leads: {leadsQuery.error.message}</p>}
      
      {leadsQuery.data && leadsQuery.data.data.length === 0 && !leadsQuery.isLoading && (
        <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
          <UsersIcon className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-lg font-semibold text-foreground">No leads found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your search or filters, or add a new lead.
          </p>
        </div>
      )}

      {leadsQuery.data && leadsQuery.data.data.length > 0 && (
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
          <Table className="min-w-full">
            <TableHeader className="bg-slate-50 dark:bg-slate-800">
              <TableRow>
                <TableHead className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Phone</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Lead Source</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Last Contact</TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Next Follow-up</TableHead>
                <TableHead className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-card divide-y divide-slate-200 dark:divide-slate-700">
              {leadsQuery.data.data.map((lead) => (
                <TableRow key={lead.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    {lead.firstName} {lead.lastName}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={cn("px-2.5 py-1 text-xs font-semibold rounded-full", getStatusBadgeClass(lead.status))}>
                        {lead.status ? lead.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{lead.email || 'N/A'}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{lead.phone || 'N/A'}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{lead.leadSource ? lead.leadSource.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A'}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {lead.lastContactDate ? new Date(lead.lastContactDate).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {lead.nextFollowUpDate ? new Date(lead.nextFollowUpDate).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-700">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Lead Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card border-border shadow-lg">
                        <DropdownMenuItem onClick={() => onViewLeadDetails(lead.id)} className="hover:bg-slate-100 dark:hover:bg-slate-700 text-foreground">
                          <Eye className="mr-2 h-4 w-4 text-muted-foreground" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditLead(lead)} className="hover:bg-slate-100 dark:hover:bg-slate-700 text-foreground">
                          <Edit3 className="mr-2 h-4 w-4 text-muted-foreground" /> Edit Lead
                        </DropdownMenuItem>
                        {lead.status !== 'customer' && lead.status !== 'converted_to_customer' && (
                           <DropdownMenuItem onClick={() => handleConvertToCustomer(lead)} disabled={convertToCustomerMutation.isPending} className="hover:bg-slate-100 dark:hover:bg-slate-700 text-foreground">
                            <CheckCircle className="mr-2 h-4 w-4 text-brand-success" /> Convert to Customer
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator className="bg-border" />
                        <DropdownMenuItem onClick={() => alert(`Adding note for ${lead.firstName}`)} className="hover:bg-slate-100 dark:hover:bg-slate-700 text-foreground">
                          <MessageSquarePlus className="mr-2 h-4 w-4 text-muted-foreground" /> Add Note/Activity
                        </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => alert(`Scheduling follow-up for ${lead.firstName}`)} className="hover:bg-slate-100 dark:hover:bg-slate-700 text-foreground">
                          <CalendarPlus className="mr-2 h-4 w-4 text-muted-foreground" /> Schedule Follow-up
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border" />
                        <DropdownMenuItem onClick={() => handleDeleteLead(lead)} className="text-brand-danger hover:!bg-brand-danger/10 hover:!text-brand-danger" disabled={deleteLeadMutation.isPending}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Lead
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

export default LeadsListComponent;

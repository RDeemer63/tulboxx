import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Plus, Search, FileText, DollarSign, Calendar, Users, CheckCircle, Clock, RefreshCw, History, GitBranch, Edit, Trash2, MoreHorizontal, Sparkles, Receipt, Briefcase, MapPin, Eye, SendHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Estimate, Customer } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";
import { UnifiedEstimateCreator } from "@/components/unified-estimate-creator";

export default function Estimates() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProfessionalModalOpen, setIsProfessionalModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingEstimate, setEditingEstimate] = useState<Estimate | null>(null);

  // Fetch estimates
  const { data: estimates = [], isLoading } = useQuery<(Estimate & { customer: Customer })[]>({
    queryKey: ["/api/estimates"],
  });

  // Fetch customers for the dropdown
  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  // Delete estimate mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/estimates/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/estimates"] });
      toast({ title: "Estimate deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete estimate", variant: "destructive" });
    },
  });

  // Convert to job mutation
  const convertToJobMutation = useMutation({
    mutationFn: (estimate: Estimate) => 
      apiRequest("/api/jobs", "POST", {
        customerId: estimate.customerId,
        title: estimate.title,
        description: estimate.description || "",
        serviceType: "other",
        estimatedValue: estimate.totalAmount,
        status: "pending"
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({ title: "Estimate converted to job successfully" });
    },
    onError: () => {
      toast({ title: "Failed to convert to job", variant: "destructive" });
    },
  });

  // Convert to invoice mutation
  const convertToInvoiceMutation = useMutation({
    mutationFn: (estimate: Estimate) => 
      apiRequest("/api/invoices", "POST", {
        customerId: estimate.customerId,
        estimateId: estimate.id,
        totalAmount: estimate.totalAmount,
        status: "draft",
        items: estimate.items || "[]"
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({ title: "Estimate converted to invoice successfully" });
    },
    onError: () => {
      toast({ title: "Failed to convert to invoice", variant: "destructive" });
    },
  });

  // Update estimate status mutation
  const updateEstimateStatusMutation = useMutation({
    mutationFn: async ({ estimateId, status }: { estimateId: number; status: string }) => {
      const response = await fetch(`/api/estimates/${estimateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error("Failed to update estimate status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/estimates"] });
      toast({ title: "Estimate status updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update estimate status", variant: "destructive" });
    },
  });

  const filteredEstimates = estimates.filter(estimate =>
    estimate.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${estimate.customer.firstName} ${estimate.customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      sent: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      accepted: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      expired: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    };
    return colors[status] || colors.draft;
  };

  const getStatusIcon = (status: string) => {
    const icons: { [key: string]: JSX.Element } = {
      draft: <FileText className="h-3 w-3" />,
      sent: <SendHorizontal className="h-3 w-3" />,
      approved: <CheckCircle className="h-3 w-3" />,
      accepted: <CheckCircle className="h-3 w-3" />,
      rejected: <Clock className="h-3 w-3" />,
      expired: <Calendar className="h-3 w-3" />
    };
    return icons[status] || <FileText className="h-3 w-3" />;
  };

  const getPriorityFromValue = (value: number) => {
    if (value >= 10000) return { label: "High Value", color: "text-green-600" };
    if (value >= 5000) return { label: "Medium Value", color: "text-yellow-600" };
    return { label: "Standard", color: "text-gray-500" };
  };

  const quickStatusUpdate = async (estimateId: number, newStatus: string) => {
    try {
      await apiRequest(`/api/estimates/${estimateId}`, "PATCH", { status: newStatus });
      queryClient.invalidateQueries({ queryKey: ["/api/estimates"] });
      toast({ title: `Estimate ${newStatus}` });
    } catch (error) {
      toast({ title: "Failed to update status", variant: "destructive" });
    }
  };

  const handleEdit = (estimate: Estimate) => {
    setEditingEstimate(estimate);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this estimate?")) {
      deleteMutation.mutate(id);
    }
  };

  // Enhanced estimate calculations for business insights
  const estimatesArray = estimates || [];
  const totalEstimateValue = estimatesArray.reduce((sum, estimate) => sum + parseFloat(estimate.totalAmount || '0'), 0);
  const draftEstimates = estimatesArray.filter(e => e.status === "draft").length;
  const sentEstimates = estimatesArray.filter(e => e.status === "sent").length;
  const approvedEstimates = estimatesArray.filter(e => e.status === "approved" || e.status === "accepted").length;
  
  const winRate = sentEstimates + approvedEstimates > 0 ? (approvedEstimates / (sentEstimates + approvedEstimates) * 100) : 0;
  const approvedValue = estimatesArray
    .filter(e => e.status === "approved" || e.status === "accepted")
    .reduce((sum, estimate) => sum + parseFloat(estimate.totalAmount || '0'), 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Estimates</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create and manage professional estimates
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search estimates or customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button 
          variant="outline"
          onClick={() => setIsCustomerModalOpen(true)}
          className="border-blue-600 text-blue-600 hover:bg-blue-50"
        >
          <Users className="h-4 w-4 mr-2" />
          New Customer
        </Button>
        <Button 
          onClick={() => setIsProfessionalModalOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Estimate
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Total Estimates</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estimates.length}</div>
            <p className="text-xs text-muted-foreground">
              {draftEstimates} draft, {sentEstimates} sent, {approvedEstimates} approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Total Pipeline Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalEstimateValue)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(approvedValue)} approved ({winRate.toFixed(0)}% win rate)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Estimates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Estimates ({filteredEstimates.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading estimates...</div>
          ) : filteredEstimates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {searchTerm ? "No estimates found matching your search." : "No estimates found. Create your first estimate to get started."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estimate</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEstimates.map((estimate) => (
                  <TableRow key={estimate.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <FileText className="h-4 w-4" />
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">{estimate.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            ID: {estimate.id}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {estimate.customer.firstName} {estimate.customer.lastName}
                        </p>
                        {estimate.customer.city && (
                          <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                            <MapPin className="h-3 w-3 mr-1" />
                            {estimate.customer.city}, {estimate.customer.state}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={estimate.status} 
                        onValueChange={(status) => updateEstimateStatusMutation.mutate({ estimateId: estimate.id, status })}
                        disabled={updateEstimateStatusMutation.isPending}
                      >
                        <SelectTrigger className="w-fit h-auto border-none bg-transparent p-0 focus:ring-0 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full">
                          <SelectValue asChild>
                            <div className={`${getStatusColor(estimate.status)} flex items-center space-x-1 w-fit px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer`}>
                              {getStatusIcon(estimate.status)}
                              <span className="capitalize">{estimate.status}</span>
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">
                            <div className="flex items-center space-x-2">
                              <FileText className="h-3 w-3" />
                              <span>Draft</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="sent">
                            <div className="flex items-center space-x-2">
                              <SendHorizontal className="h-3 w-3" />
                              <span>Sent</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="approved">
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="h-3 w-3" />
                              <span>Approved</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="accepted">
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="h-3 w-3" />
                              <span>Accepted</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="rejected">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-3 w-3" />
                              <span>Rejected</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="expired">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-3 w-3" />
                              <span>Expired</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(estimate.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {formatCurrency(parseFloat(estimate.totalAmount))}
                        </p>
                        {parseFloat(estimate.totalAmount) >= 5000 && (
                          <p className={`text-xs ${getPriorityFromValue(parseFloat(estimate.totalAmount)).color}`}>
                            {getPriorityFromValue(parseFloat(estimate.totalAmount)).label}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Quick Status Buttons */}
                        {estimate.status === 'draft' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => quickStatusUpdate(estimate.id, 'sent')}
                            className="h-8 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <SendHorizontal className="h-3 w-3 mr-1" />
                            Send
                          </Button>
                        )}
                        {estimate.status === 'sent' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => quickStatusUpdate(estimate.id, 'approved')}
                            className="h-8 px-2 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                        )}
                        
                        {/* Standard Actions */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setLocation(`/estimates/${estimate.id}`)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(estimate)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        
                        {/* More Actions Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem 
                              onClick={() => convertToJobMutation.mutate(estimate)}
                              className="text-blue-600"
                              disabled={convertToJobMutation.isPending}
                            >
                              <Briefcase className="mr-2 h-4 w-4" />
                              {convertToJobMutation.isPending ? "Converting..." : "Convert to Job"}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => convertToInvoiceMutation.mutate(estimate)}
                              className="text-green-600"
                              disabled={convertToInvoiceMutation.isPending}
                            >
                              <Receipt className="mr-2 h-4 w-4" />
                              {convertToInvoiceMutation.isPending ? "Converting..." : "Convert to Invoice"}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(estimate.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Unified Estimate Creator Modal */}
      <UnifiedEstimateCreator
        isOpen={isProfessionalModalOpen}
        onClose={() => setIsProfessionalModalOpen(false)}
        onSuccess={() => {
          setIsProfessionalModalOpen(false);
          queryClient.invalidateQueries({ queryKey: ["/api/estimates"] });
        }}
      />
    </div>
  );
}
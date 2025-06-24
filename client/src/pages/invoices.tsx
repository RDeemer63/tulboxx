import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Plus, Search, FileText, DollarSign, Calendar, Users, CheckCircle, Clock, AlertCircle, Edit3, Eye, Trash2, MoreHorizontal, Receipt, CreditCard, Send, Download } from "lucide-react";
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
import type { Invoice, Customer, Estimate } from "@shared/schema";
import Header from "@/components/header";
import { formatCurrency } from "@/lib/utils";
import { 
  searchInputStyles, 
  selectStyles, 
  cardStyles, 
  getStatusBadgeClass, 
  getIconClass,
  tableStyles,
  formStyles
} from "@/lib/theme-utils";

export default function Invoices() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  // Form states
  const [invoiceFormData, setInvoiceFormData] = useState({
    customerId: "",
    estimateId: "",
    title: "",
    description: "",
    totalAmount: "",
    subtotal: "",
    taxRate: "0",
    taxAmount: "0",
    balanceDue: "",
    paymentTerms: "net_30",
    isRecurring: false,
    recurringInterval: "",
    dueDate: "",
    items: "",
    notes: "",
  });

  const [paymentFormData, setPaymentFormData] = useState({
    amount: "",
    paymentMethod: "cash",
    paymentReference: "",
    paymentDate: new Date().toISOString().split('T')[0],
    notes: "",
  });

  // Fetch data
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["/api/invoices"],
    queryFn: () => fetch("/api/invoices", { credentials: "include" }).then(res => {
      if (!res.ok) return [];
      return res.json();
    }),
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["/api/customers"],
    queryFn: () => fetch("/api/customers", { credentials: "include" }).then(res => res.json()),
  });

  // Helper function to get customer info
  const getCustomerInfo = (customerId: number) => {
    return customers.find((c: Customer) => c.id === customerId);
  };

  const { data: estimates = [] } = useQuery({
    queryKey: ["/api/estimates"],
    queryFn: () => fetch("/api/estimates", { credentials: "include" }).then(res => res.json()),
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["/api/payments"],
    queryFn: () => fetch("/api/payments", { credentials: "include" }).then(res => res.json()),
  });

  // Mutations
  const createInvoiceMutation = useMutation({
    mutationFn: (data: any) => 
      fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({ title: "Invoice created successfully" });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to create invoice", variant: "destructive" });
    },
  });

  const updateInvoiceMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      fetch(`/api/invoices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({ title: "Invoice updated successfully" });
      setIsDialogOpen(false);
      setIsViewModalOpen(true);
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to update invoice", variant: "destructive" });
    },
  });

  const recordPaymentMutation = useMutation({
    mutationFn: (data: any) => 
      fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      toast({ title: "Payment recorded successfully" });
      setIsPaymentModalOpen(false);
      setSelectedInvoice(null);
      setPaymentFormData({
        amount: "",
        paymentMethod: "cash",
        paymentReference: "",
        paymentDate: new Date().toISOString().split('T')[0],
        notes: "",
      });
    },
    onError: () => {
      toast({ title: "Failed to record payment", variant: "destructive" });
    },
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: (id: number) => 
      fetch(`/api/invoices/${id}`, {
        method: "DELETE",
        credentials: "include",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({ title: "Invoice deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete invoice", variant: "destructive" });
    },
  });

  const sendInvoiceMutation = useMutation({
    mutationFn: (id: number) => 
      fetch(`/api/invoices/${id}/send`, {
        method: "POST",
        credentials: "include",
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({ title: "Invoice sent successfully" });
    },
    onError: () => {
      toast({ title: "Failed to send invoice", variant: "destructive" });
    },
  });

  // Helper functions
  const resetForm = () => {
    setInvoiceFormData({
      customerId: "",
      estimateId: "",
      title: "",
      description: "",
      totalAmount: "",
      subtotal: "",
      taxRate: "0",
      taxAmount: "0",
      balanceDue: "",
      paymentTerms: "net_30",
      isRecurring: false,
      recurringInterval: "",
      dueDate: "",
      items: "",
      notes: "",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      draft: "bg-gray-500",
      sent: "bg-blue-500",
      paid: "bg-green-500",
      partial_paid: "bg-yellow-500",
      overdue: "bg-red-500",
      cancelled: "bg-gray-500",
    };
    return variants[status] || "bg-gray-500";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="h-4 w-4" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4" />;
      case "sent":
        return <Send className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleSubmit = () => {
    if (!invoiceFormData.customerId || !invoiceFormData.title || !invoiceFormData.totalAmount) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    const formData = {
      ...invoiceFormData,
      customerId: parseInt(invoiceFormData.customerId),
      estimateId: invoiceFormData.estimateId ? parseInt(invoiceFormData.estimateId) : null,
      totalAmount: parseFloat(invoiceFormData.totalAmount),
      subtotal: parseFloat(invoiceFormData.subtotal || invoiceFormData.totalAmount),
      taxRate: parseFloat(invoiceFormData.taxRate),
      taxAmount: parseFloat(invoiceFormData.taxAmount),
      balanceDue: parseFloat(invoiceFormData.balanceDue || invoiceFormData.totalAmount),
    };

    if (editingInvoice) {
      updateInvoiceMutation.mutate({ id: editingInvoice.id, data: formData });
    } else {
      createInvoiceMutation.mutate(formData);
    }
  };

  const handleRecordPayment = () => {
    if (!selectedInvoice || !paymentFormData.amount) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    const paymentData = {
      invoiceId: selectedInvoice.id,
      amount: parseFloat(paymentFormData.amount),
      paymentMethod: paymentFormData.paymentMethod,
      paymentReference: paymentFormData.paymentReference,
      paymentDate: paymentFormData.paymentDate,
      notes: paymentFormData.notes,
    };

    recordPaymentMutation.mutate(paymentData);
  };

  const filteredInvoices = invoices.filter((invoice: Invoice & { customer?: Customer }) =>
    invoice.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customer?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customer?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = invoices.reduce((sum: number, invoice: Invoice) => 
    sum + parseFloat(invoice.totalAmount || "0"), 0);
  const paidInvoices = invoices.filter((inv: Invoice) => inv.status === "paid").length;
  const overdueInvoices = invoices.filter((inv: Invoice) => inv.status === "overdue").length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading invoices...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Invoices</h1>
            <p className="text-muted-foreground">Manage billing and payments</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Total Invoices</CardTitle>
              <FileText className="h-4 w-4 text-gray-500 dark:text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{invoices.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Paid Invoices</CardTitle>
              <CheckCircle className="h-4 w-4 text-gray-500 dark:text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{paidInvoices}</div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-gray-500 dark:text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{overdueInvoices}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600 focus:border-orange-500 dark:focus:border-orange-500"
            />
          </div>
        </div>

        {/* Invoices Table */}
        <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Receipt className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No invoices found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice: Invoice & { customer?: Customer }) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        <button
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setIsViewModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                        >
                          {invoice.invoiceNumber || `INV-${invoice.id}`}
                        </button>
                      </TableCell>
                      <TableCell>
                        {invoice.customer ? 
                          `${invoice.customer.firstName} ${invoice.customer.lastName}` : 
                          'Unknown Customer'
                        }
                      </TableCell>
                      <TableCell>{formatCurrency(parseFloat(invoice.totalAmount || "0"))}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusBadge(invoice.status)} text-white`}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(invoice.status)}
                            {invoice.status.replace('_', ' ').toUpperCase()}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'No due date'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setSelectedInvoice(invoice);
                              setIsViewModalOpen(true);
                            }}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setEditingInvoice(invoice);
                              setInvoiceFormData({
                                customerId: invoice.customerId.toString(),
                                estimateId: invoice.estimateId?.toString() || "",
                                title: invoice.title || "",
                                description: invoice.description || "",
                                totalAmount: invoice.totalAmount || "",
                                subtotal: invoice.subtotal || "",
                                taxRate: invoice.taxRate || "0",
                                taxAmount: invoice.taxAmount || "0",
                                balanceDue: invoice.balanceDue || "",
                                paymentTerms: invoice.paymentTerms || "net_30",
                                isRecurring: invoice.isRecurring || false,
                                recurringInterval: invoice.recurringInterval || "",
                                dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : "",
                                items: invoice.items || "",
                                notes: invoice.notes || "",
                              });
                              setIsDialogOpen(true);
                            }}>
                              <Edit3 className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedInvoice(invoice);
                              setPaymentFormData({
                                ...paymentFormData,
                                amount: (parseFloat(invoice.balanceDue || invoice.totalAmount || "0")).toString(),
                              });
                              setIsPaymentModalOpen(true);
                            }}>
                              <CreditCard className="mr-2 h-4 w-4" />
                              Record Payment
                            </DropdownMenuItem>
                            {invoice.status === 'draft' && (
                              <DropdownMenuItem onClick={() => sendInvoiceMutation.mutate(invoice.id)}>
                                <Send className="mr-2 h-4 w-4" />
                                Send Invoice
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => deleteInvoiceMutation.mutate(invoice.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Create/Edit Invoice Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingInvoice ? 'Edit' : 'Create'} Invoice</DialogTitle>
              <DialogDescription>
                {editingInvoice ? 'Update' : 'Create a new'} invoice for your customer.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer *</Label>
                  <Select value={invoiceFormData.customerId} onValueChange={(value) => 
                    setInvoiceFormData(prev => ({ ...prev, customerId: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer: Customer) => (
                        <SelectItem key={customer.id} value={customer.id.toString()}>
                          {customer.firstName} {customer.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimate">From Estimate</Label>
                  <Select value={invoiceFormData.estimateId} onValueChange={(value) => 
                    setInvoiceFormData(prev => ({ ...prev, estimateId: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select estimate" />
                    </SelectTrigger>
                    <SelectContent>
                      {estimates.map((estimate: Estimate) => (
                        <SelectItem key={estimate.id} value={estimate.id.toString()}>
                          {estimate.title} - {formatCurrency(parseFloat(estimate.totalAmount || "0"))}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={invoiceFormData.title}
                  onChange={(e) => setInvoiceFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Invoice title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={invoiceFormData.description}
                  onChange={(e) => setInvoiceFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Invoice description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subtotal">Subtotal *</Label>
                  <Input
                    id="subtotal"
                    type="number"
                    step="0.01"
                    value={invoiceFormData.subtotal}
                    onChange={(e) => {
                      const subtotal = e.target.value;
                      const taxRate = parseFloat(invoiceFormData.taxRate) / 100;
                      const taxAmount = parseFloat(subtotal) * taxRate;
                      const total = parseFloat(subtotal) + taxAmount;
                      setInvoiceFormData(prev => ({ 
                        ...prev, 
                        subtotal,
                        taxAmount: taxAmount.toFixed(2),
                        totalAmount: total.toFixed(2),
                        balanceDue: total.toFixed(2)
                      }));
                    }}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.01"
                    value={invoiceFormData.taxRate}
                    onChange={(e) => {
                      const taxRate = e.target.value;
                      const subtotal = parseFloat(invoiceFormData.subtotal) || 0;
                      const taxAmount = subtotal * (parseFloat(taxRate) / 100);
                      const total = subtotal + taxAmount;
                      setInvoiceFormData(prev => ({ 
                        ...prev, 
                        taxRate,
                        taxAmount: taxAmount.toFixed(2),
                        totalAmount: total.toFixed(2),
                        balanceDue: total.toFixed(2)
                      }));
                    }}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxAmount">Tax Amount</Label>
                  <Input
                    id="taxAmount"
                    type="number"
                    step="0.01"
                    value={invoiceFormData.taxAmount}
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalAmount">Total Amount *</Label>
                  <Input
                    id="totalAmount"
                    type="number"
                    step="0.01"
                    value={invoiceFormData.totalAmount}
                    onChange={(e) => setInvoiceFormData(prev => ({ 
                      ...prev, 
                      totalAmount: e.target.value,
                      balanceDue: e.target.value
                    }))}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Payment Terms</Label>
                  <Select value={invoiceFormData.paymentTerms} onValueChange={(value) => 
                    setInvoiceFormData(prev => ({ ...prev, paymentTerms: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="due_on_receipt">Due on Receipt</SelectItem>
                      <SelectItem value="net_15">Net 15</SelectItem>
                      <SelectItem value="net_30">Net 30</SelectItem>
                      <SelectItem value="net_60">Net 60</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={invoiceFormData.dueDate}
                    onChange={(e) => setInvoiceFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={invoiceFormData.notes}
                  onChange={(e) => setInvoiceFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes for the invoice"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setIsDialogOpen(false);
                if (editingInvoice) {
                  // Return to detail view when editing
                  setIsViewModalOpen(true);
                } else {
                  // Reset when creating new
                  setEditingInvoice(null);
                }
                resetForm();
              }}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={createInvoiceMutation.isPending || updateInvoiceMutation.isPending}
              >
                {editingInvoice ? 'Update' : 'Create'} Invoice
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Invoice Details View Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Invoice Details</DialogTitle>
              <DialogDescription>
                Complete invoice information and payment history
              </DialogDescription>
            </DialogHeader>
            {selectedInvoice && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Invoice Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Invoice Number:</span>
                        <span>{selectedInvoice.invoiceNumber || `INV-${selectedInvoice.id}`}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Status:</span>
                        <Badge className={`${getStatusBadge(selectedInvoice.status)} text-white`}>
                          {selectedInvoice.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Created:</span>
                        <span>{new Date(selectedInvoice.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Due Date:</span>
                        <span>{selectedInvoice.dueDate ? new Date(selectedInvoice.dueDate).toLocaleDateString() : 'No due date'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Customer Information</h3>
                    <div className="space-y-2">
                      {(() => {
                        const customer = getCustomerInfo(selectedInvoice.customerId);
                        return (
                          <>
                            <div className="flex justify-between">
                              <span className="font-medium">Name:</span>
                              <span>{customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown Customer'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Email:</span>
                              <span>{customer?.email || 'No email'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-medium">Phone:</span>
                              <span>{customer?.phone || 'No phone'}</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Invoice Details</h3>
                  <div className="space-y-2">
                    {selectedInvoice.title && (
                      <div className="flex justify-between">
                        <span className="font-medium">Title:</span>
                        <span>{selectedInvoice.title}</span>
                      </div>
                    )}
                    {selectedInvoice.description && (
                      <div className="flex justify-between">
                        <span className="font-medium">Description:</span>
                        <span className="text-right max-w-md">{selectedInvoice.description}</span>
                      </div>
                    )}
                    {selectedInvoice.notes && (
                      <div className="flex justify-between">
                        <span className="font-medium">Notes:</span>
                        <span className="text-right max-w-md">{selectedInvoice.notes}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Financial Summary</h3>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Subtotal:</span>
                        <span>{formatCurrency(parseFloat(selectedInvoice.subtotal || selectedInvoice.totalAmount || "0"))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Tax Rate:</span>
                        <span>{selectedInvoice.taxRate || "0"}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Tax Amount:</span>
                        <span>{formatCurrency(parseFloat(selectedInvoice.taxAmount || "0"))}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>Total Amount:</span>
                        <span>{formatCurrency(parseFloat(selectedInvoice.totalAmount || "0"))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Paid Amount:</span>
                        <span>{formatCurrency(parseFloat(selectedInvoice.paidAmount || "0"))}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold">
                        <span>Balance Due:</span>
                        <span className="text-red-600">{formatCurrency(parseFloat(selectedInvoice.balanceDue || selectedInvoice.totalAmount || "0"))}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Payment History</h3>
                    {(() => {
                      const invoicePayments = payments.filter((payment: any) => payment.invoiceId === selectedInvoice.id);
                      if (invoicePayments.length === 0) {
                        return (
                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <p className="text-sm text-gray-500">No payments recorded</p>
                          </div>
                        );
                      }
                      return (
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2 max-h-40 overflow-y-auto">
                          {invoicePayments.map((payment: any) => (
                            <div key={payment.id} className="flex justify-between items-center p-2 bg-white dark:bg-gray-700 rounded">
                              <div>
                                <div className="text-sm font-medium">{formatCurrency(parseFloat(payment.amount))}</div>
                                <div className="text-xs text-gray-500">
                                  {new Date(payment.paymentDate).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="text-xs text-gray-500">
                                {payment.paymentMethod || 'Cash'}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                <div className="flex justify-between">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsViewModalOpen(false);
                        setEditingInvoice(selectedInvoice);
                        setInvoiceFormData({
                          customerId: selectedInvoice.customerId.toString(),
                          estimateId: selectedInvoice.estimateId?.toString() || "",
                          title: selectedInvoice.title || "",
                          description: selectedInvoice.description || "",
                          totalAmount: selectedInvoice.totalAmount || "",
                          subtotal: selectedInvoice.subtotal || "",
                          taxRate: selectedInvoice.taxRate || "0",
                          taxAmount: selectedInvoice.taxAmount || "0",
                          balanceDue: selectedInvoice.balanceDue || "",
                          paymentTerms: selectedInvoice.paymentTerms || "net_30",
                          isRecurring: selectedInvoice.isRecurring || false,
                          recurringInterval: selectedInvoice.recurringInterval || "",
                          dueDate: selectedInvoice.dueDate ? new Date(selectedInvoice.dueDate).toISOString().split('T')[0] : "",
                          items: selectedInvoice.items || "",
                          notes: selectedInvoice.notes || "",
                        });
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit3 className="mr-2 h-4 w-4" />
                      Edit Invoice
                    </Button>
                    {selectedInvoice.status === 'draft' && (
                      <Button 
                        variant="outline"
                        onClick={() => {
                          sendInvoiceMutation.mutate(selectedInvoice.id);
                          setIsViewModalOpen(false);
                        }}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Send Invoice
                      </Button>
                    )}
                    <Button 
                      variant="outline"
                      onClick={() => {
                        // TODO: Add PDF download functionality
                        toast({ title: "PDF download feature coming soon!" });
                      }}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                      Close
                    </Button>
                    <Button onClick={() => {
                      setIsViewModalOpen(false);
                      setSelectedInvoice(selectedInvoice);
                      setPaymentFormData({
                        ...paymentFormData,
                        amount: (parseFloat(selectedInvoice.balanceDue || selectedInvoice.totalAmount || "0")).toString(),
                      });
                      setIsPaymentModalOpen(true);
                    }}>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Record Payment
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Record Payment Dialog */}
        <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
              <DialogDescription>
                Record a payment for invoice {selectedInvoice?.invoiceNumber || `INV-${selectedInvoice?.id}`}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentAmount">Amount *</Label>
                  <Input
                    id="paymentAmount"
                    type="number"
                    step="0.01"
                    value={paymentFormData.amount}
                    onChange={(e) => setPaymentFormData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method *</Label>
                  <Select value={paymentFormData.paymentMethod} onValueChange={(value) => 
                    setPaymentFormData(prev => ({ ...prev, paymentMethod: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="ach">ACH/Bank Transfer</SelectItem>
                      <SelectItem value="online">Online Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentReference">Reference</Label>
                  <Input
                    id="paymentReference"
                    value={paymentFormData.paymentReference}
                    onChange={(e) => setPaymentFormData(prev => ({ ...prev, paymentReference: e.target.value }))}
                    placeholder="Check #, Transaction ID, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentDate">Payment Date *</Label>
                  <Input
                    id="paymentDate"
                    type="date"
                    value={paymentFormData.paymentDate}
                    onChange={(e) => setPaymentFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentNotes">Notes</Label>
                <Textarea
                  id="paymentNotes"
                  value={paymentFormData.notes}
                  onChange={(e) => setPaymentFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Payment notes"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setIsPaymentModalOpen(false);
                setSelectedInvoice(null);
              }}>
                Cancel
              </Button>
              <Button 
                onClick={handleRecordPayment}
                disabled={recordPaymentMutation.isPending}
              >
                Record Payment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
import { useState, Fragment, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Header from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  searchInputStyles, 
  selectStyles, 
  cardStyles, 
  getIconClass,
  tableStyles,
  formStyles
} from "@/lib/theme-utils";
import { ProjectUpdates } from "@/legacy-components/project-updates/ProjectUpdates";
import { 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  Edit, 
  Trash2, 
  Eye,
  DollarSign,
  Calendar,
  MessageSquare,
  Briefcase,
  TrendingUp,
  FileText,
  Save,
  X,
  Users,
  Clock,
  Star,
  ExternalLink,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { UnifiedEstimateCreator } from "@/components/unified-estimate-creator";

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEstimateModalOpen, setIsEstimateModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    secondaryPhone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    propertyType: "residential",
    accessInstructions: "",
    preferredContactMethod: "phone",
    notes: "",
    status: "customer",
    leadSource: "",
    leadScore: 0,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customers, isLoading } = useQuery({
    queryKey: ["/api/customers"],
    queryFn: api.customers.getAll,
  });

  const createCustomerMutation = useMutation({
    mutationFn: api.customers.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({
        title: "Customer Created",
        description: "New customer has been added successfully.",
      });
      handleCloseModal();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create customer. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateCustomerMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.customers.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({
        title: "Customer Updated",
        description: "Customer information has been updated successfully.",
      });
      handleCloseModal();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update customer. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: api.customers.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({
        title: "Customer Deleted",
        description: "Customer has been removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete customer. Please try again.",
        variant: "destructive",
      });
    },
  });



  // Add queries for customer details
  const { data: customerJobs } = useQuery({
    queryKey: ["/api/jobs", "customer", selectedCustomer?.id],
    queryFn: () => selectedCustomer ? api.jobs.getAll().then(jobs => jobs.filter((job: any) => job.customerId === selectedCustomer.id)) : Promise.resolve([]),
    enabled: !!selectedCustomer,
  });

  const { data: customerEstimates } = useQuery({
    queryKey: ["/api/estimates", "customer", selectedCustomer?.id],
    queryFn: () => selectedCustomer ? api.estimates.getAll().then(estimates => estimates.filter((est: any) => est.customerId === selectedCustomer.id)) : Promise.resolve([]),
    enabled: !!selectedCustomer,
  });

  // Add query for project updates to get latest notes for each customer
  const { data: projectUpdates = [] } = useQuery({
    queryKey: ["/api/project-updates"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/project-updates");
        if (!response.ok) {
          console.warn("Failed to fetch project updates:", response.status);
          return [];
        }
        const text = await response.text();
        if (!text) return [];
        return JSON.parse(text);
      } catch (error) {
        console.warn("Error fetching project updates:", error);
        return [];
      }
    },
  });

  const filteredCustomers = customers ? customers
    .filter((customer: any) => {
      // Status filter
      if (statusFilter !== "all" && customer.status !== statusFilter) {
        return false;
      }
      
      // Search filter
      const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      return fullName.includes(searchLower) ||
             customer.email?.toLowerCase().includes(searchLower) ||
             customer.phone?.includes(searchTerm);
    })
    .sort((a: any, b: any) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)) : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      updateCustomerMutation.mutate({ id: editingCustomer.id, data: formData });
    } else {
      createCustomerMutation.mutate(formData);
    }
  };

  const handleEdit = (customer: any) => {
    setEditingCustomer(customer);
    setFormData({
      firstName: customer.firstName || "",
      lastName: customer.lastName || "",
      email: customer.email || "",
      phone: customer.phone || "",
      secondaryPhone: customer.secondaryPhone || "",
      address: customer.address || "",
      city: customer.city || "",
      state: customer.state || "",
      zipCode: customer.zipCode || "",
      propertyType: customer.propertyType || "residential",
      accessInstructions: customer.accessInstructions || "",
      preferredContactMethod: customer.preferredContactMethod || "phone",
      notes: customer.notes || "",
      status: customer.status || "customer",
      leadSource: customer.leadSource || "",
      leadScore: customer.leadScore || 0,
    });
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setEditingCustomer(null);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      secondaryPhone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      propertyType: "residential",
      accessInstructions: "",
      preferredContactMethod: "phone",
      notes: "",
      status: "customer",
      leadSource: "",
      leadScore: 0,
    });
  };

  const toggleRowExpansion = (customerId: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(customerId)) {
      newExpanded.delete(customerId);
    } else {
      newExpanded.add(customerId);
    }
    setExpandedRows(newExpanded);
  };

  const getCustomerInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getPrimaryContactMethod = (customer: any) => {
    if (customer.phone) return { type: 'phone', value: customer.phone };
    if (customer.email) return { type: 'email', value: customer.email };
    return { type: 'none', value: 'No contact info' };
  };



  const getLatestProjectUpdate = (customerId: number) => {
    if (!projectUpdates) return null;
    
    const customerUpdates = projectUpdates.filter((update: any) => update.contactId === customerId);
    if (customerUpdates.length === 0) return null;
    
    // Sort by creation date to get the latest
    return customerUpdates.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  };

  return (
    <>
      <Header 
        title="Contacts" 
        subtitle="Manage leads, customers, and all business contacts"
      />
      
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative max-w-lg">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600 focus:border-orange-500 dark:focus:border-orange-500"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                  <SelectItem value="all" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700">All Contacts</SelectItem>
                  <SelectItem value="lead" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700">Leads</SelectItem>
                  <SelectItem value="customer" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700">Customers</SelectItem>
                  <SelectItem value="past_customer" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700">Past Customers</SelectItem>
                  <SelectItem value="vendor" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700">Vendors</SelectItem>
                  <SelectItem value="subcontractor" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700">Subcontractors</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contact
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingCustomer ? "Edit Customer" : "Add New Customer"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingCustomer 
                      ? "Update customer information below."
                      : "Enter the customer details to add them to your database."
                    }
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Primary Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div>
                      <Label htmlFor="secondaryPhone">Secondary Phone</Label>
                      <Input
                        id="secondaryPhone"
                        value={formData.secondaryPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, secondaryPhone: e.target.value }))}
                        placeholder="Mobile/Office (optional)"
                      />
                    </div>
                    <div>
                      <Label htmlFor="propertyType">Property Type</Label>
                      <Select value={formData.propertyType} onValueChange={(value) => setFormData(prev => ({ ...prev, propertyType: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="residential">Residential</SelectItem>
                          <SelectItem value="commercial">Commercial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="preferredContactMethod">Preferred Contact</Label>
                      <Select value={formData.preferredContactMethod} onValueChange={(value) => setFormData(prev => ({ ...prev, preferredContactMethod: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="phone">Phone</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="text">Text</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={formData.state}
                          onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="zipCode">Zip Code</Label>
                        <Input
                          id="zipCode"
                          value={formData.zipCode}
                          onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="accessInstructions">Access Instructions</Label>
                    <Textarea
                      id="accessInstructions"
                      value={formData.accessInstructions}
                      onChange={(e) => setFormData(prev => ({ ...prev, accessInstructions: e.target.value }))}
                      rows={2}
                      placeholder="Gate codes, key location, special entry instructions..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                      placeholder="Any additional notes about this customer..."
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={handleCloseModal}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createCustomerMutation.isPending || updateCustomerMutation.isPending}
                    >
                      {editingCustomer ? "Update Customer" : "Create Customer"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Customer List ({filteredCustomers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading customers...</div>
              ) : filteredCustomers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {searchTerm ? "No customers found matching your search." : "No customers found. Add your first customer to get started."}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Primary Contact</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer: any) => {
                      const isExpanded = expandedRows.has(customer.id);
                      const primaryContact = getPrimaryContactMethod(customer);
                      
                      return [
                        <TableRow key={`main-${customer.id}`} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleRowExpansion(customer.id)}
                              className="p-1 h-6 w-6"
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-3 w-3" />
                              ) : (
                                <ChevronRight className="h-3 w-3" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                                    {getCustomerInitials(customer.firstName, customer.lastName)}
                                  </span>
                                </div>
                              </div>
                              <div>
                                <button
                                  onClick={() => setSelectedCustomer(customer)}
                                  className="font-medium text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 hover:underline transition-colors text-left"
                                >
                                  {`${customer.firstName} ${customer.lastName}`}
                                </button>
                                {customer.propertyType && (
                                  <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                                    {customer.propertyType}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              {primaryContact.type === 'phone' && <Phone className="h-3 w-3 text-slate-400" />}
                              {primaryContact.type === 'email' && <Mail className="h-3 w-3 text-slate-400" />}
                              <span className="text-sm text-slate-600 dark:text-slate-300">
                                {primaryContact.value}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-slate-600 dark:text-slate-300">
                              {customer.city && customer.state ? (
                                `${customer.city}, ${customer.state}`
                              ) : customer.city || customer.state || (
                                <span className="text-slate-400">No location</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={customer.status === 'lead' ? 'secondary' : 
                                      customer.status === 'customer' ? 'default' :
                                      customer.status === 'past_customer' ? 'outline' : 'secondary'}
                              className={customer.status === 'lead' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                                        customer.status === 'customer' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                                        customer.status === 'past_customer' ? 'border-gray-300 text-gray-700' : ''}
                            >
                              {customer.status === 'lead' ? 'Lead' :
                               customer.status === 'customer' ? 'Customer' :
                               customer.status === 'past_customer' ? 'Past Customer' :
                               customer.status === 'vendor' ? 'Vendor' :
                               customer.status === 'subcontractor' ? 'Subcontractor' : 'Contact'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedCustomer(customer)}
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(customer)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteCustomerMutation.mutate(customer.id)}
                                disabled={deleteCustomerMutation.isPending}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>,
                        
                        isExpanded && (
                          <TableRow key={`expanded-${customer.id}`} className="bg-slate-50 dark:bg-slate-800/30">
                            <TableCell></TableCell>
                            <TableCell colSpan={4}>
                              <div className="py-4 space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                  {customer.email && (
                                    <div className="flex items-center space-x-2">
                                      <Mail className="h-4 w-4 text-slate-400" />
                                      <span className="text-slate-600 dark:text-slate-300">{customer.email}</span>
                                    </div>
                                  )}
                                  {customer.phone && (
                                    <div className="flex items-center space-x-2">
                                      <Phone className="h-4 w-4 text-slate-400" />
                                      <span className="text-slate-600 dark:text-slate-300">{customer.phone}</span>
                                    </div>
                                  )}
                                  {customer.secondaryPhone && (
                                    <div className="flex items-center space-x-2">
                                      <Phone className="h-4 w-4 text-slate-400" />
                                      <span className="text-slate-600 dark:text-slate-300">{customer.secondaryPhone}</span>
                                      <Badge variant="secondary" className="text-xs">Secondary</Badge>
                                    </div>
                                  )}
                                  {(customer.address || customer.city || customer.state) && (
                                    <div className="flex items-start space-x-2 md:col-span-2">
                                      <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                                      <div className="text-slate-600 dark:text-slate-300">
                                        {customer.address && <div>{customer.address}</div>}
                                        <div>
                                          {customer.city}
                                          {customer.city && customer.state && ", "}
                                          {customer.state} {customer.zipCode}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  <div className="flex items-center space-x-2">
                                    <Calendar className="h-4 w-4 text-slate-400" />
                                    <span className="text-slate-600 dark:text-slate-300">
                                      Added {new Date(customer.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
{(() => {
                                  const latestUpdate = getLatestProjectUpdate(customer.id);
                                  return (
                                    <div className="mt-3 p-3 bg-white dark:bg-slate-700 rounded-md border">
                                      <div className="flex items-start space-x-2">
                                        <FileText className="h-4 w-4 text-slate-400 mt-0.5" />
                                        <div className="flex-1">
                                          <div className="flex items-center justify-between mb-2">
                                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                              Latest Project Update
                                            </p>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => setSelectedCustomer(customer)}
                                              className="h-6 px-2 text-xs"
                                            >
                                              {latestUpdate ? 'View All' : 'Add Update'}
                                            </Button>
                                          </div>
                                          
                                          {latestUpdate ? (
                                            <div 
                                              onClick={() => setSelectedCustomer(customer)}
                                              className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-600 -m-1 p-1 rounded transition-colors"
                                            >
                                              <div className="space-y-1">
                                                <div className="flex items-center space-x-2">
                                                  <Badge variant="outline" className="text-xs">
                                                    Update #{latestUpdate.updateNumber}
                                                  </Badge>
                                                  <span className="text-xs text-slate-500 dark:text-slate-400">
                                                    {new Date(latestUpdate.createdAt).toLocaleDateString()}
                                                  </span>
                                                </div>
                                                {latestUpdate.workNeeded && (
                                                  <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
                                                    {latestUpdate.workNeeded}
                                                  </p>
                                                )}
                                                {latestUpdate.customerRequests && (
                                                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">
                                                    Customer: {latestUpdate.customerRequests}
                                                  </p>
                                                )}
                                              </div>
                                            </div>
                                          ) : (
                                            <div 
                                              onClick={() => setSelectedCustomer(customer)}
                                              className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-600 -m-1 p-1 rounded transition-colors"
                                            >
                                              <p className="text-sm text-slate-400 italic">Click to add first project update...</p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })()}
                                {customer.accessInstructions && (
                                  <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md border border-amber-200 dark:border-amber-800">
                                    <div className="flex items-start space-x-2">
                                      <MapPin className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                                      <div>
                                        <p className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wide">Access Instructions</p>
                                        <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">{customer.accessInstructions}</p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      ].filter(Boolean);
                    }).flat()}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Customer Details Dialog */}
      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedCustomer ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}` : ''}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedCustomer) {
                    handleEdit(selectedCustomer);
                    setSelectedCustomer(null);
                  }
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Customer
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {selectedCustomer && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="jobs">Jobs</TabsTrigger>
                <TabsTrigger value="estimates">Estimates</TabsTrigger>
                <TabsTrigger value="project-updates">Project Notes</TabsTrigger>
                <TabsTrigger value="communications">Communications</TabsTrigger>
              </TabsList>
              
              <div className="mt-6 max-h-[60vh] overflow-y-auto">
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Customer Info Card */}
                    <Card className="md:col-span-2">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Users className="h-5 w-5 mr-2 text-blue-600" />
                          Customer Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-slate-600">Name</Label>
                            <p className="text-slate-900">{`${selectedCustomer.firstName} ${selectedCustomer.lastName}`}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-slate-600">Property Type</Label>
                            <p className="text-slate-900 capitalize">{selectedCustomer.propertyType || 'Not specified'}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-slate-600">Email</Label>
                            <p className="text-slate-900">{selectedCustomer.email || 'Not provided'}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-slate-600">Phone</Label>
                            <p className="text-slate-900">{selectedCustomer.phone || 'Not provided'}</p>
                          </div>
                          <div className="col-span-2">
                            <Label className="text-sm font-medium text-slate-600">Address</Label>
                            <p className="text-slate-900">
                              {selectedCustomer.address ? (
                                <>
                                  {selectedCustomer.address}<br />
                                  {selectedCustomer.city}, {selectedCustomer.state} {selectedCustomer.zipCode}
                                </>
                              ) : (
                                'Not provided'
                              )}
                            </p>
                          </div>
                          {selectedCustomer.notes && (
                            <div className="col-span-2">
                              <Label className="text-sm font-medium text-slate-600">Notes</Label>
                              <p className="text-slate-900">{selectedCustomer.notes}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Quick Stats Card */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                          Quick Stats
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Briefcase className="h-4 w-4 mr-2 text-blue-600" />
                              <span className="text-sm text-slate-600">Total Jobs</span>
                            </div>
                            <span className="font-semibold text-slate-900">{customerJobs?.length || 0}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                              <span className="text-sm text-slate-600">Revenue</span>
                            </div>
                            <span className="font-semibold text-slate-900">
                              ${customerEstimates?.reduce((sum: number, est: any) => 
                                sum + parseFloat(est.totalAmount || 0), 0).toFixed(2) || '0.00'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-purple-600" />
                              <span className="text-sm text-slate-600">Estimates</span>
                            </div>
                            <span className="font-semibold text-slate-900">{customerEstimates?.length || 0}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-orange-600" />
                              <span className="text-sm text-slate-600">Customer Since</span>
                            </div>
                            <span className="font-semibold text-slate-900">
                              {new Date(selectedCustomer.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="pt-4 border-t">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-600">Customer Rating</span>
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="ml-1 text-sm font-semibold">4.8</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Activity */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-orange-600" />
                        Recent Activity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {customerJobs?.slice(0, 3).map((job: any) => (
                          <div key={job.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div>
                              <p className="font-medium text-slate-900">{job.title}</p>
                              <p className="text-sm text-slate-600">{job.description}</p>
                            </div>
                            <Badge variant={job.status === 'completed' ? 'default' : 'secondary'}>
                              {job.status}
                            </Badge>
                          </div>
                        ))}
                        {(!customerJobs || customerJobs.length === 0) && (
                          <p className="text-slate-500 text-center py-4">No recent activity</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="jobs" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">Customer Jobs</h3>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      New Job
                    </Button>
                  </div>
                  
                  {customerJobs?.length ? (
                    <div className="space-y-3">
                      {customerJobs.map((job: any) => (
                        <Card key={job.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-slate-900">{job.title}</h4>
                                <p className="text-sm text-slate-600">{job.description}</p>
                                <div className="flex items-center mt-2 space-x-4">
                                  <span className="text-sm text-slate-500">
                                    Start: {new Date(job.startDate).toLocaleDateString()}
                                  </span>
                                  {job.endDate && (
                                    <span className="text-sm text-slate-500">
                                      End: {new Date(job.endDate).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge variant={job.status === 'completed' ? 'default' : 'secondary'}>
                                  {job.status}
                                </Badge>
                                <p className="text-lg font-semibold text-slate-900 mt-2">
                                  ${parseFloat(job.totalCost || 0).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Briefcase className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-500">No jobs found for this customer</p>
                        <Button className="mt-4" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Job
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="estimates" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">Customer Estimates</h3>
                    <Button size="sm" onClick={() => setIsEstimateModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Estimate
                    </Button>
                  </div>
                  
                  {customerEstimates?.length ? (
                    <div className="space-y-3">
                      {customerEstimates.map((estimate: any) => (
                        <Card key={estimate.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-slate-900">{estimate.title}</h4>
                                <p className="text-sm text-slate-600">{estimate.description}</p>
                                <div className="flex items-center mt-2 space-x-4">
                                  <span className="text-sm text-slate-500">
                                    Created: {new Date(estimate.createdAt).toLocaleDateString()}
                                  </span>
                                  {estimate.validUntil && (
                                    <span className="text-sm text-slate-500">
                                      Valid until: {new Date(estimate.validUntil).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge variant={estimate.status === 'accepted' ? 'default' : 'secondary'}>
                                  {estimate.status}
                                </Badge>
                                <p className="text-lg font-semibold text-slate-900 mt-2">
                                  ${parseFloat(estimate.totalAmount || 0).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <DollarSign className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-500">No estimates found for this customer</p>
                        <Button className="mt-4" size="sm" onClick={() => setIsEstimateModalOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Estimate
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="project-updates" className="space-y-4">
                  <ProjectUpdates 
                    contactId={selectedCustomer.id} 
                    contactName={`${selectedCustomer.firstName} ${selectedCustomer.lastName}`} 
                  />
                </TabsContent>

                <TabsContent value="communications" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">Communication History</h3>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email
                      </Button>
                      <Button size="sm" variant="outline">
                        <Phone className="h-4 w-4 mr-2" />
                        Log Call
                      </Button>
                    </div>
                  </div>
                  
                  <Card>
                    <CardContent className="p-8 text-center">
                      <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-500">No communications recorded yet</p>
                      <p className="text-sm text-slate-400 mt-2">
                        Communication history will appear here once you start logging calls, emails, and messages.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Unified Estimate Creator Modal */}
      <UnifiedEstimateCreator
        open={isEstimateModalOpen}
        onClose={() => setIsEstimateModalOpen(false)}
        onSuccess={() => {
          setIsEstimateModalOpen(false);
          queryClient.invalidateQueries({ queryKey: ["/api/estimates"] });
        }}
      />
    </>
  );
}

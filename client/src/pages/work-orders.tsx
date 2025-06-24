import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Search, Calendar, User, MapPin, Clock, CheckCircle, AlertCircle, Wrench } from "lucide-react";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { insertWorkOrderSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { 
  searchInputStyles, 
  selectStyles, 
  cardStyles, 
  getStatusBadgeClass, 
  getIconClass,
  tableStyles,
  formStyles
} from "@/lib/theme-utils";

const createWorkOrderSchema = insertWorkOrderSchema.extend({
  scheduledStartDate: z.string().optional(),
  scheduledEndDate: z.string().optional()
});

export default function WorkOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: workOrders = [], isLoading } = useQuery({
    queryKey: ["/api/work-orders"],
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["/api/employees"],
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["/api/customers"],
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ["/api/jobs"],
  });

  const createWorkOrderMutation = useMutation({
    mutationFn: (data: z.infer<typeof createWorkOrderSchema>) => 
      apiRequest("/api/work-orders", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/work-orders"] });
      setIsCreateOpen(false);
      toast({
        title: "Work order created",
        description: "The work order has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create work order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      apiRequest(`/api/work-orders/${id}`, "PATCH", { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/work-orders"] });
      toast({
        title: "Status updated",
        description: "Work order status has been updated.",
      });
    },
  });

  const form = useForm<z.infer<typeof createWorkOrderSchema>>({
    resolver: zodResolver(createWorkOrderSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "scheduled",
      priority: "normal",
    },
  });

  const onSubmit = (data: z.infer<typeof createWorkOrderSchema>) => {
    const submitData = {
      ...data,
      scheduledStartDate: data.scheduledStartDate ? new Date(data.scheduledStartDate) : undefined,
      scheduledEndDate: data.scheduledEndDate ? new Date(data.scheduledEndDate) : undefined,
    };
    createWorkOrderMutation.mutate(submitData);
  };

  const filteredWorkOrders = workOrders.filter((workOrder: any) => {
    const matchesSearch = workOrder.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workOrder.workOrderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workOrder.customer?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workOrder.customer?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || workOrder.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-300";
      case "in_progress": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-300";
      case "completed": return "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300";
      case "cancelled": return "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-slate-800/50 dark:text-slate-300";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high": return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "normal": return <Clock className="h-4 w-4 text-blue-500" />;
      case "low": return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Work Orders</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage field work and service delivery</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create Work Order
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Work Order</DialogTitle>
              <DialogDescription>
                Create a new work order for field operations and service delivery.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select customer" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {customers.map((customer: any) => (
                              <SelectItem key={customer.id} value={customer.id.toString()}>
                                {customer.firstName} {customer.lastName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="jobId"
                    render={({ field }) => {
                      const selectedCustomerId = form.watch("customerId");
                      const filteredJobs = jobs?.filter((job: any) => 
                        selectedCustomerId ? job.customerId === parseInt(selectedCustomerId) : true
                      ) || [];
                      
                      return (
                        <FormItem>
                          <FormLabel>Related Job</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={selectedCustomerId ? "Select job" : "Select customer first"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {filteredJobs.map((job: any) => (
                                <SelectItem key={job.id} value={job.id.toString()}>
                                  {job.title}
                                </SelectItem>
                              ))}
                              {filteredJobs.length === 0 && selectedCustomerId && (
                                <div className="px-2 py-1 text-sm text-muted-foreground">
                                  No jobs found for this customer
                                </div>
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Order Title</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input placeholder="Enter work order title" {...field} />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              if (!field.value) return;
                              try {
                                const response = await fetch('/api/ai/polish-text', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    text: field.value,
                                    fieldType: 'work order title',
                                    businessType: 'service business',
                                    businessName: 'Tulboxx'
                                  })
                                });
                                const data = await response.json();
                                if (data.polishedText) {
                                  field.onChange(data.polishedText);
                                }
                              } catch (error) {
                                console.error('Failed to polish text:', error);
                              }
                            }}
                            disabled={!field.value}
                            className="px-3 whitespace-nowrap"
                          >
                            ✨ Polish
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center justify-between">
                        Description
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            if (!field.value) return;
                            try {
                              const response = await fetch('/api/ai/polish-text', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  text: field.value,
                                  fieldType: 'work order description',
                                  businessType: 'service business',
                                  businessName: 'Tulboxx'
                                })
                              });
                              const data = await response.json();
                              if (data.polishedText) {
                                field.onChange(data.polishedText);
                              }
                            } catch (error) {
                              console.error('Failed to polish text:', error);
                            }
                          }}
                          disabled={!field.value}
                          className="px-3 whitespace-nowrap text-xs"
                        >
                          ✨ Polish
                        </Button>
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the work to be performed..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="assignedTechnicianId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assigned Technician</FormLabel>
                        <Select onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select technician" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {employees.filter((emp: any) => emp.role === 'technician' || emp.role === 'field_worker').map((employee: any) => (
                              <SelectItem key={employee.id} value={employee.id.toString()}>
                                {employee.firstName} {employee.lastName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Schedule</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="scheduledStartDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <DateTimePicker
                              label="Start Date & Time"
                              placeholder="Select start time"
                              value={field.value || ""}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="scheduledEndDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <DateTimePicker
                              label="End Date & Time"
                              placeholder="Select end time"
                              value={field.value || ""}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>💡</span>
                    <span>Times are automatically set in 15-minute increments.</span>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createWorkOrderMutation.isPending}>
                    {createWorkOrderMutation.isPending ? "Creating..." : "Create Work Order"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className={`flex flex-col sm:flex-row gap-4 ${cardStyles.card} p-4 rounded-lg`}>
        <div className="flex-1">
          <div className={searchInputStyles.container}>
            <Search className={searchInputStyles.icon} />
            <Input
              placeholder="Search work orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={searchInputStyles.input}
            />
          </div>
        </div>
        <div className="sm:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
              <SelectItem value="all" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700">All Statuses</SelectItem>
              <SelectItem value="scheduled" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700">Scheduled</SelectItem>
              <SelectItem value="in_progress" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700">In Progress</SelectItem>
              <SelectItem value="completed" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700">Completed</SelectItem>
              <SelectItem value="cancelled" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={cardStyles.card}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${cardStyles.title}`}>Total Orders</CardTitle>
            <Wrench className={`h-4 w-4 ${getIconClass()}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${cardStyles.title}`}>{workOrders.length}</div>
          </CardContent>
        </Card>
        <Card className={cardStyles.card}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${cardStyles.title}`}>Scheduled</CardTitle>
            <Calendar className={`h-4 w-4 ${getIconClass()}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${cardStyles.title}`}>
              {workOrders.filter((wo: any) => wo.status === 'scheduled').length}
            </div>
          </CardContent>
        </Card>
        <Card className={cardStyles.card}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${cardStyles.title}`}>In Progress</CardTitle>
            <Clock className={`h-4 w-4 ${getIconClass()}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${cardStyles.title}`}>
              {workOrders.filter((wo: any) => wo.status === 'in_progress').length}
            </div>
          </CardContent>
        </Card>
        <Card className={cardStyles.card}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${cardStyles.title}`}>Completed</CardTitle>
            <CheckCircle className={`h-4 w-4 ${getIconClass()}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${cardStyles.title}`}>
              {workOrders.filter((wo: any) => wo.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Work Orders List */}
      <div className="grid gap-4">
        {filteredWorkOrders.length === 0 ? (
          <Card className={cardStyles.card}>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Wrench className={`h-12 w-12 ${getIconClass('muted')} mb-4`} />
              <h3 className={`text-lg font-medium ${cardStyles.title} mb-2`}>No work orders found</h3>
              <p className={`${cardStyles.description} text-center mb-4`}>
                {searchTerm || statusFilter !== "all" ? "Try adjusting your filters" : "Create your first work order to get started"}
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Work Order
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredWorkOrders.map((workOrder: any) => (
            <Card key={workOrder.id} className={`${cardStyles.card} hover:shadow-md transition-shadow`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className={`text-lg ${cardStyles.title}`}>{workOrder.title}</CardTitle>
                      {getPriorityIcon(workOrder.priority)}
                    </div>
                    <div className={`flex items-center gap-4 text-sm ${cardStyles.description}`}>
                      <span className="font-medium">{workOrder.workOrderNumber}</span>
                      {workOrder.customer && (
                        <span className="flex items-center gap-1">
                          <User className={`h-3 w-3 ${getIconClass('muted')}`} />
                          {workOrder.customer.firstName} {workOrder.customer.lastName}
                        </span>
                      )}
                      {workOrder.scheduledStartDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className={`h-3 w-3 ${getIconClass('muted')}`} />
                          {format(new Date(workOrder.scheduledStartDate), "MMM d, yyyy h:mm a")}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusBadgeClass(workOrder.status)}>
                      {workOrder.status.replace('_', ' ')}
                    </Badge>
                    <Select
                      value={workOrder.status}
                      onValueChange={(status) => 
                        updateStatusMutation.mutate({ id: workOrder.id, status })
                      }
                    >
                      <SelectTrigger className="w-32 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                        <SelectItem value="scheduled" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700">Scheduled</SelectItem>
                        <SelectItem value="in_progress" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700">In Progress</SelectItem>
                        <SelectItem value="completed" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700">Completed</SelectItem>
                        <SelectItem value="cancelled" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              {workOrder.description && (
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300">{workOrder.description}</p>
                  {workOrder.assignedTechnician && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">Assigned to:</span>
                        <span className="font-medium">
                          {workOrder.assignedTechnician.firstName} {workOrder.assignedTechnician.lastName}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
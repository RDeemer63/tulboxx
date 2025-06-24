import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Briefcase,
  Edit3,
  Save,
  X,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ProjectUpdates } from "@/legacy-components/project-updates/ProjectUpdates";
import type { Customer, Job, Estimate, Invoice } from "@shared/schema";

const customerFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  notes: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerFormSchema>;

interface CustomerDetailModalProps {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatPhoneNumber = (phone: string | null) => {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

export default function CustomerDetailModal({ customer, open, onOpenChange }: CustomerDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(customer?.notes || "");
  const [activeTab, setActiveTab] = useState("details");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Sync notes value when customer changes
  useEffect(() => {
    if (customer?.notes !== undefined) {
      setNotesValue(customer.notes || "");
    }
  }, [customer?.notes]);

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      firstName: customer?.firstName || "",
      lastName: customer?.lastName || "",
      email: customer?.email || "",
      phone: customer?.phone || "",
      address: customer?.address || "",
      city: customer?.city || "",
      state: customer?.state || "",
      zipCode: customer?.zipCode || "",
      notes: customer?.notes || "",
    },
  });

  // Fetch customer's jobs
  const { data: jobs = [] } = useQuery<(Job & { customer: Customer })[]>({
    queryKey: ["/api/jobs"],
    enabled: !!customer,
  });

  // Fetch customer's estimates
  const { data: estimates = [] } = useQuery<(Estimate & { customer: Customer })[]>({
    queryKey: ["/api/estimates"],
    enabled: !!customer,
  });

  // Fetch customer's invoices
  const { data: invoices = [] } = useQuery<(Invoice & { customer: Customer })[]>({
    queryKey: ["/api/invoices"],
    enabled: !!customer,
  });

  const customerJobs = jobs.filter(job => job.customerId === customer?.id);
  const customerEstimates = estimates.filter(estimate => estimate.customerId === customer?.id);
  const customerInvoices = invoices.filter(invoice => invoice.customerId === customer?.id);

  const updateCustomerMutation = useMutation({
    mutationFn: async (data: CustomerFormData) => {
      if (!customer) return;
      const response = await apiRequest("PUT", `/api/customers/${customer.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Customer updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update customer.",
        variant: "destructive",
      });
    },
  });

  const updateNotesMutation = useMutation({
    mutationFn: async (notes: string) => {
      const response = await fetch(`/api/customers/${customer?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      if (!response.ok) throw new Error("Failed to update notes");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      setIsEditingNotes(false);
      toast({
        title: "Success",
        description: "Notes updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update notes.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CustomerFormData) => {
    updateCustomerMutation.mutate(data);
  };

  if (!customer) return null;

  const totalJobValue = customerJobs.reduce((sum, job) => 
    sum + (job.estimatedValue ? parseFloat(job.estimatedValue.toString()) : 0), 0
  );

  const totalEstimateValue = customerEstimates.reduce((sum, estimate) => 
    sum + (estimate.totalAmount ? parseFloat(estimate.totalAmount.toString()) : 0), 0
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {customer.firstName} {customer.lastName}
            </DialogTitle>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button 
                    size="sm" 
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={updateCustomerMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit3 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="jobs">Jobs ({customerJobs.length})</TabsTrigger>
            <TabsTrigger value="estimates">Estimates ({customerEstimates.length})</TabsTrigger>
            <TabsTrigger value="project-updates">Project Notes</TabsTrigger>
            <TabsTrigger value="invoices">Invoices ({customerInvoices.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{customerJobs.length}</div>
                  <p className="text-xs text-muted-foreground">
                    ${totalJobValue.toFixed(2)} total value
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Estimates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{customerEstimates.length}</div>
                  <p className="text-xs text-muted-foreground">
                    ${totalEstimateValue.toFixed(2)} total value
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{customerInvoices.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Outstanding payments
                  </p>
                </CardContent>
              </Card>
            </div>

            {isEditing ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP Code</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{formatPhoneNumber(customer.phone || "")}</span>
                    </div>
                    {customer.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{customer.email}</span>
                      </div>
                    )}
                    {customer.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>
                          {customer.address}
                          {customer.city && `, ${customer.city}`}
                          {customer.state && `, ${customer.state}`}
                          {customer.zipCode && ` ${customer.zipCode}`}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-orange-600" />
                      <h4 className="font-medium">Project Status</h4>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                      <p className="text-sm text-gray-600 mb-2">
                        Track detailed project updates and communications in the Project Notes tab.
                      </p>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setActiveTab("project-updates")}
                        className="text-orange-600 border-orange-200 hover:bg-orange-100"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        View Project Notes
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="jobs" className="space-y-4">
            <div className="space-y-3">
              {customerJobs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No jobs found for this customer.</p>
              ) : (
                customerJobs.map((job) => (
                  <Card key={job.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{job.title}</h4>
                          <p className="text-sm text-gray-600">{job.serviceType}</p>
                          {job.scheduledDate && (
                            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(job.scheduledDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{job.status}</Badge>
                          {job.estimatedValue && (
                            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                              <DollarSign className="h-3 w-3" />
                              ${job.estimatedValue}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="estimates" className="space-y-4">
            <div className="space-y-3">
              {customerEstimates.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No estimates found for this customer.</p>
              ) : (
                customerEstimates.map((estimate) => (
                  <Card key={estimate.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{estimate.title}</h4>
                          <p className="text-sm text-gray-600">{estimate.description}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{estimate.status}</Badge>
                          <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                            <DollarSign className="h-3 w-3" />
                            ${estimate.totalAmount}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="project-updates" className="space-y-4">
            <ProjectUpdates 
              contactId={customer.id} 
              contactName={`${customer.firstName} ${customer.lastName}`} 
            />
          </TabsContent>

          <TabsContent value="invoices" className="space-y-4">
            <div className="space-y-3">
              {customerInvoices.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No invoices found for this customer.</p>
              ) : (
                customerInvoices.map((invoice) => (
                  <Card key={invoice.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">Invoice #{invoice.invoiceNumber}</h4>
                          {invoice.dueDate && (
                            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                              <Calendar className="h-3 w-3" />
                              Due: {new Date(invoice.dueDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{invoice.status}</Badge>
                          <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                            <DollarSign className="h-3 w-3" />
                            ${invoice.totalAmount}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
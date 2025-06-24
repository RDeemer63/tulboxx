import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  Briefcase,
  User,
  Phone,
  MapPin,
  Edit3,
  Save,
  X,
  Navigation
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Job, Customer } from "@shared/schema";

const jobFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  serviceType: z.string().min(1, "Service type is required"),
  scheduledDate: z.string(),
  scheduledTime: z.string(),
  estimatedValue: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
});

type JobFormData = z.infer<typeof jobFormSchema>;

interface JobDetailModalProps {
  job: (Job & { customer: Customer }) | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatPhoneNumber = (phone: string) => {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "scheduled": return "bg-blue-100 text-blue-800 border-blue-200";
    case "in_progress": return "bg-orange-100 text-orange-800 border-orange-200";
    case "completed": return "bg-green-100 text-green-800 border-green-200";
    case "cancelled": return "bg-red-100 text-red-800 border-red-200";
    default: return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export default function JobDetailModal({ job, open, onOpenChange }: JobDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      title: "",
      serviceType: "",
      scheduledDate: "",
      scheduledTime: "",
      estimatedValue: "",
      description: "",
      notes: "",
    },
  });

  // Reset form when job changes
  useEffect(() => {
    if (job) {
      form.reset({
        title: job.title || "",
        serviceType: job.serviceType || "",
        scheduledDate: job.scheduledDate ? new Date(job.scheduledDate).toISOString().split('T')[0] : "",
        scheduledTime: job.scheduledDate ? new Date(job.scheduledDate).toISOString().split('T')[1].substring(0, 5) : "",
        estimatedValue: job.estimatedValue?.toString() || "",
        description: job.description || "",
        notes: job.notes || "",
      });
    }
  }, [job, form]);

  const updateJobMutation = useMutation({
    mutationFn: async (data: JobFormData) => {
      if (!job) return;
      const scheduledDateTime = new Date(`${data.scheduledDate}T${data.scheduledTime}`);
      
      const jobData = {
        title: data.title,
        serviceType: data.serviceType,
        scheduledDate: scheduledDateTime.toISOString(),
        estimatedValue: data.estimatedValue || undefined,
        description: data.description || undefined,
        notes: data.notes || undefined,
      };
      
      const response = await apiRequest("PUT", `/api/jobs/${job.id}`, jobData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Job updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update job.",
        variant: "destructive",
      });
    },
  });

  const updateJobStatusMutation = useMutation({
    mutationFn: async ({ jobId, status }: { jobId: number; status: string }) => {
      return apiRequest("PUT", `/api/jobs/${jobId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({
        title: "Success",
        description: "Job status updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update job status.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: JobFormData) => {
    updateJobMutation.mutate(data);
  };

  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              {job.title}
            </DialogTitle>
            <div className="flex gap-2">
              {isEditing ? (
                <Button 
                  size="sm" 
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={updateJobMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit3 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </div>
          <DialogDescription className="sr-only">
            Job details and editing form for {job.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Schedule */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Status:</span>
                <Select 
                  value={job.status} 
                  onValueChange={(status) => updateJobStatusMutation.mutate({ jobId: job.id, status })}
                  disabled={updateJobStatusMutation.isPending}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  value={job.scheduledDate ? new Date(job.scheduledDate).toISOString().split('T')[0] : ""}
                  onChange={(e) => {
                    if (e.target.value) {
                      const currentTime = job.scheduledDate ? new Date(job.scheduledDate).toTimeString().split(' ')[0] : "09:00:00";
                      const newDateTime = new Date(`${e.target.value}T${currentTime}`);
                      updateJobMutation.mutate({
                        title: job.title,
                        serviceType: job.serviceType,
                        scheduledDate: newDateTime.toISOString().split('T')[0],
                        scheduledTime: newDateTime.toISOString().split('T')[1].substring(0, 5),
                        estimatedValue: job.estimatedValue?.toString() || "",
                        description: job.description || "",
                        notes: job.notes || "",
                      });
                    }
                  }}
                  className="w-40"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <Input
                  type="time"
                  value={job.scheduledDate ? new Date(job.scheduledDate).toISOString().split('T')[1].substring(0, 5) : ""}
                  onChange={(e) => {
                    if (e.target.value) {
                      const currentDate = job.scheduledDate ? new Date(job.scheduledDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
                      const newDateTime = new Date(`${currentDate}T${e.target.value}`);
                      updateJobMutation.mutate({
                        title: job.title,
                        serviceType: job.serviceType,
                        scheduledDate: newDateTime.toISOString().split('T')[0],
                        scheduledTime: newDateTime.toISOString().split('T')[1].substring(0, 5),
                        estimatedValue: job.estimatedValue?.toString() || "",
                        description: job.description || "",
                        notes: job.notes || "",
                      });
                    }
                  }}
                  className="w-32"
                />
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Customer Information
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-3 w-3 text-gray-400" />
                <span>{job.customer?.firstName || 'N/A'} {job.customer?.lastName || ''}</span>
              </div>
              {job.customer?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3 text-gray-400" />
                  <span>{formatPhoneNumber(job.customer.phone)}</span>
                  <Button size="sm" variant="outline" className="ml-auto">
                    Call
                  </Button>
                </div>
              )}
              {(job.customer?.address || job.customer?.city) && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-gray-400" />
                  <span>
                    {job.customer.address}
                    {job.customer.city && `, ${job.customer.city}`}
                    {job.customer.state && `, ${job.customer.state}`}
                    {job.customer.zipCode && ` ${job.customer.zipCode}`}
                  </span>
                  <Button size="sm" variant="outline" className="ml-auto">
                    <Navigation className="h-3 w-3 mr-1" />
                    Directions
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Job Details */}
          {isEditing ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="serviceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Type</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="scheduledDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="scheduledTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="estimatedValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Value</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
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
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Internal Notes</FormLabel>
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
                <div>
                  <h4 className="font-medium text-sm text-gray-500 mb-1">Service Type</h4>
                  <p>{job.serviceType}</p>
                </div>
                {job.estimatedValue && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-500 mb-1">Estimated Value</h4>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-gray-400" />
                      <span>${job.estimatedValue}</span>
                    </div>
                  </div>
                )}
              </div>
              
              {job.description && (
                <div>
                  <h4 className="font-medium text-sm text-gray-500 mb-1">Description</h4>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg">{job.description}</p>
                </div>
              )}
              
              {job.notes && (
                <div>
                  <h4 className="font-medium text-sm text-gray-500 mb-1">Internal Notes</h4>
                  <p className="text-sm bg-yellow-50 p-3 rounded-lg border border-yellow-200">{job.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
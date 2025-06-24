import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { 
  searchInputStyles, 
  selectStyles, 
  cardStyles, 
  getStatusBadgeClass, 
  getIconClass,
  tableStyles,
  formStyles
} from "@/lib/theme-utils";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  MapPin,
  DollarSign,
  Bot,
  Route,
  Zap,
  Navigation,
  FileText,
  Search,
  Edit,
  Trash2,
  MoreHorizontal,
  PlayCircle,
  CheckCircle,
  Eye,
  Settings,
  Wrench,
  Droplets,
  Wind,
  Home
} from "lucide-react";
import type { Job, Customer, Employee } from "@shared/schema";

// Form schema for creating jobs
const jobFormSchema = z.object({
  serviceType: z.string().min(1, "Service type is required"),
  customerId: z.string().min(1, "Customer is required"),
  scheduledDate: z.string().min(1, "Date is required"),
  scheduledTime: z.string().min(1, "Time is required"),
  estimatedValue: z.string().optional(),
  description: z.string().optional(),
});

type JobFormData = z.infer<typeof jobFormSchema>;

const SERVICE_TYPES = [
  { value: "plumbing", label: "Plumbing" },
  { value: "electrical", label: "Electrical" },
  { value: "hvac", label: "HVAC" },
  { value: "landscaping", label: "Landscaping" },
  { value: "cleaning", label: "Cleaning" },
  { value: "maintenance", label: "General Maintenance" },
  { value: "repair", label: "Repair Services" },
  { value: "installation", label: "Installation" },
  { value: "other", label: "Other" }
];

export default function Schedule() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isScheduleJobOpen, setIsScheduleJobOpen] = useState(false);
  const [isOptimizeModalOpen, setIsOptimizeModalOpen] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState<number[]>([]);
  const [optimizationResult, setOptimizationResult] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [jobModalData, setJobModalData] = useState<(Job & { customer: Customer })[] | null>(null);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);

  // Fetch data
  const { data: jobs = [], isLoading: jobsLoading } = useQuery<(Job & { customer: Customer })[]>({
    queryKey: ['/api/jobs']
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ['/api/customers']
  });

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ['/api/employees']
  });

  const form = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      serviceType: "",
      customerId: "",
      scheduledDate: selectedDate.toISOString().split('T')[0],
      scheduledTime: "09:00",
      estimatedValue: "",
      description: "",
    },
  });

  // Create job mutation
  const createJobMutation = useMutation({
    mutationFn: async (data: JobFormData) => {
      const jobData = {
        ...data,
        customerId: parseInt(data.customerId),
        estimatedValue: data.estimatedValue ? parseFloat(data.estimatedValue) : undefined,
        scheduledDate: new Date(`${data.scheduledDate}T${data.scheduledTime}`),
        status: "scheduled",
        title: data.serviceType,
      };
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      });
      if (!response.ok) throw new Error('Failed to create job');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      setIsScheduleJobOpen(false);
      form.reset();
      toast({ title: "Job Scheduled", description: "Job has been added to the schedule" });
    },
    onError: (error) => {
      toast({ 
        title: "Failed to Schedule Job", 
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive" 
      });
    },
  });

  // Quick status update
  const quickStatusUpdate = async (jobId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error("Failed to update status");
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({ title: `Job ${newStatus.replace('_', ' ')}` });
    } catch (error) {
      toast({ title: "Failed to update status", variant: "destructive" });
    }
  };

  // Delete job mutation
  const deleteJobMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete job");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({ title: "Job deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete job", variant: "destructive" });
    }
  });

  // Filter jobs for selected date
  const selectedDateJobs = jobs.filter(job => {
    if (!job.scheduledDate) return false;
    const jobDate = new Date(job.scheduledDate);
    return jobDate.toDateString() === selectedDate.toDateString();
  });

  // Filter jobs by search term
  const filteredJobs = selectedDateJobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${job.customer.firstName} ${job.customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.serviceType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pending jobs for optimization
  const pendingJobs = jobs.filter(job => job.status === 'pending');

  // Helper functions
  const getServiceTypeIcon = (serviceType: string) => {
    const icons: { [key: string]: JSX.Element } = {
      plumbing: <Droplets className="h-4 w-4" />,
      electrical: <Zap className="h-4 w-4" />,
      hvac: <Wind className="h-4 w-4" />,
      landscaping: <Home className="h-4 w-4" />,
      cleaning: <Settings className="h-4 w-4" />,
      maintenance: <Wrench className="h-4 w-4" />,
      repair: <Settings className="h-4 w-4" />,
      installation: <Plus className="h-4 w-4" />,
      other: <Settings className="h-4 w-4" />
    };
    return icons[serviceType] || <Settings className="h-4 w-4" />;
  };

  const getStatusIcon = (status: string) => {
    const icons: { [key: string]: JSX.Element } = {
      pending: <Clock className="h-3 w-3" />,
      scheduled: <CalendarIcon className="h-3 w-3" />,
      in_progress: <PlayCircle className="h-3 w-3" />,
      completed: <CheckCircle className="h-3 w-3" />,
      cancelled: <Clock className="h-3 w-3" />
    };
    return icons[status] || <Clock className="h-3 w-3" />;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      in_progress: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    };
    return colors[status] || colors.pending;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Calendar utility functions
  const getWeekDates = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const getMonthDates = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    const endDate = new Date(lastDay);
    
    // Adjust to show full weeks
    startDate.setDate(startDate.getDate() - startDate.getDay());
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    
    const dates = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const getJobsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return jobs.filter(job => {
      if (!job.scheduledDate) return false;
      const jobDate = new Date(job.scheduledDate).toISOString().split('T')[0];
      return jobDate === dateStr;
    });
  };

  const handleDateClick = (date: Date, dateJobs: (Job & { customer: Customer })[]) => {
    if (dateJobs.length > 0) {
      setJobModalData(dateJobs);
      setIsJobModalOpen(true);
    }
  };

  // Calculate stats for selected date
  const dayStats = {
    total: selectedDateJobs.length,
    scheduled: selectedDateJobs.filter(job => job.status === 'scheduled').length,
    inProgress: selectedDateJobs.filter(job => job.status === 'in_progress').length,
    completed: selectedDateJobs.filter(job => job.status === 'completed').length,
    totalValue: selectedDateJobs.reduce((sum, job) => sum + parseFloat(job.estimatedValue || "0"), 0)
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Schedule</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and optimize your daily schedule
          </p>
        </div>
      </div>

      {/* View Controls */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* View Toggle Buttons */}
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <Button
                  variant={viewMode === 'day' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('day')}
                  className="px-3 py-1"
                >
                  Day
                </Button>
                <Button
                  variant={viewMode === 'week' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('week')}
                  className="px-3 py-1"
                >
                  Week
                </Button>
                <Button
                  variant={viewMode === 'month' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('month')}
                  className="px-3 py-1"
                >
                  Month
                </Button>
              </div>
            </div>
            
            {/* Navigation */}
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  if (viewMode === 'day') {
                    newDate.setDate(newDate.getDate() - 1);
                  } else if (viewMode === 'week') {
                    newDate.setDate(newDate.getDate() - 7);
                  } else {
                    newDate.setMonth(newDate.getMonth() - 1);
                  }
                  setSelectedDate(newDate);
                }}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous {viewMode === 'day' ? 'Day' : viewMode === 'week' ? 'Week' : 'Month'}
              </Button>
              
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {viewMode === 'day' 
                    ? selectedDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })
                    : viewMode === 'week'
                    ? `Week of ${selectedDate.toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric',
                        year: 'numeric'
                      })}`
                    : selectedDate.toLocaleDateString('en-US', { 
                        month: 'long', 
                        year: 'numeric' 
                      })
                  }
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {viewMode === 'day' ? `${dayStats.total} jobs scheduled` : 'Click dates to view jobs'}
                </p>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newDate = new Date(selectedDate);
                  if (viewMode === 'day') {
                    newDate.setDate(newDate.getDate() + 1);
                  } else if (viewMode === 'week') {
                    newDate.setDate(newDate.getDate() + 7);
                  } else {
                    newDate.setMonth(newDate.getMonth() + 1);
                  }
                  setSelectedDate(newDate);
                }}
              >
                Next {viewMode === 'day' ? 'Day' : viewMode === 'week' ? 'Week' : 'Month'}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search scheduled jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Button onClick={() => setSelectedDate(new Date())} variant="outline">
          <CalendarIcon className="h-4 w-4 mr-2" />
          Today
        </Button>
        
        <Dialog open={isScheduleJobOpen} onOpenChange={setIsScheduleJobOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule New Job</DialogTitle>
              <DialogDescription>
                Add a new job to the schedule for {selectedDate.toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => createJobMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="serviceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select service type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SERVICE_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
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
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select customer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customers.map((customer) => (
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
                      <FormLabel>Estimated Value ($)</FormLabel>
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
                        <Textarea placeholder="Job description..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsScheduleJobOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createJobMutation.isPending}>
                    {createJobMutation.isPending ? "Scheduling..." : "Schedule Job"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dayStats.total}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled for today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{dayStats.inProgress}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{dayStats.completed}</div>
            <p className="text-xs text-muted-foreground">
              Finished today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Day Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dayStats.totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              Total estimated value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Views */}
      {viewMode === 'day' && (
        <Card>
          <CardHeader>
            <CardTitle>Daily Schedule ({filteredJobs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {jobsLoading ? (
              <div className="text-center py-8">Loading schedule...</div>
            ) : filteredJobs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {searchTerm ? "No jobs found matching your search." : "No jobs scheduled for this date."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Job</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs
                  .sort((a, b) => new Date(a.scheduledDate!).getTime() - new Date(b.scheduledDate!).getTime())
                  .map((job) => (
                  <TableRow key={job.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {job.scheduledDate ? new Date(job.scheduledDate).toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit', 
                            hour12: true 
                          }) : 'No time set'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                            {getServiceTypeIcon(job.serviceType)}
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">{job.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                            {job.serviceType.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {job.customer?.firstName || 'N/A'} {job.customer?.lastName || ''}
                        </p>
                        {job.customer?.city && (
                          <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                            <MapPin className="h-3 w-3 mr-1" />
                            {job.customer.city}, {job.customer.state}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(job.status)} flex items-center space-x-1 w-fit`}>
                        {getStatusIcon(job.status)}
                        <span className="capitalize">{job.status.replace("_", " ")}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {job.estimatedValue ? (
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {formatCurrency(parseFloat(job.estimatedValue))}
                        </p>
                      ) : (
                        <span className="text-slate-400">TBD</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Quick Status Buttons */}
                        {job.status === 'scheduled' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => quickStatusUpdate(job.id, 'in_progress')}
                            className="h-8 px-2 text-xs text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                          >
                            <PlayCircle className="h-3 w-3 mr-1" />
                            Start
                          </Button>
                        )}
                        {job.status === 'in_progress' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => quickStatusUpdate(job.id, 'completed')}
                            className="h-8 px-2 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Complete
                          </Button>
                        )}
                        
                        {/* Standard Actions */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteJobMutation.mutate(job.id)}
                          disabled={deleteJobMutation.isPending}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          </CardContent>
        </Card>
      )}

      {/* Week View */}
      {viewMode === 'week' && (
        <Card>
          <CardHeader>
            <CardTitle>Week View</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center font-medium text-sm text-gray-500 dark:text-gray-400 p-2">
                  {day}
                </div>
              ))}
              {getWeekDates(selectedDate).map((date) => {
                const dateJobs = getJobsForDate(date);
                const isToday = date.toDateString() === new Date().toDateString();
                const isSelected = date.toDateString() === selectedDate.toDateString();
                
                return (
                  <div
                    key={date.toISOString()}
                    className={`
                      min-h-24 p-2 border rounded-lg cursor-pointer transition-colors
                      ${isToday ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'border-gray-200 dark:border-gray-700'}
                      ${isSelected ? 'ring-2 ring-blue-500' : ''}
                      hover:bg-gray-50 dark:hover:bg-gray-800
                    `}
                    onClick={() => handleDateClick(date, dateJobs)}
                  >
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                      {date.getDate()}
                    </div>
                    {dateJobs.slice(0, 3).map((job) => (
                      <div
                        key={job.id}
                        className={`text-xs p-1 mb-1 rounded truncate ${getStatusColor(job.status)}`}
                      >
                        {job.title}
                      </div>
                    ))}
                    {dateJobs.length > 3 && (
                      <div className="text-xs text-gray-500">+{dateJobs.length - 3} more</div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Month View */}
      {viewMode === 'month' && (
        <Card>
          <CardHeader>
            <CardTitle>Month View</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center font-medium text-sm text-gray-500 dark:text-gray-400 p-2">
                  {day}
                </div>
              ))}
              {getMonthDates(selectedDate).map((date) => {
                const dateJobs = getJobsForDate(date);
                const isToday = date.toDateString() === new Date().toDateString();
                const isCurrentMonth = date.getMonth() === selectedDate.getMonth();
                
                return (
                  <div
                    key={date.toISOString()}
                    className={`
                      min-h-20 p-1 border rounded cursor-pointer transition-colors
                      ${isToday ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'border-gray-200 dark:border-gray-700'}
                      ${!isCurrentMonth ? 'opacity-40' : ''}
                      hover:bg-gray-50 dark:hover:bg-gray-800
                    `}
                    onClick={() => handleDateClick(date, dateJobs)}
                  >
                    <div className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-1">
                      {date.getDate()}
                    </div>
                    {dateJobs.slice(0, 2).map((job) => (
                      <div
                        key={job.id}
                        className={`text-xs p-0.5 mb-0.5 rounded truncate ${getStatusColor(job.status)}`}
                      >
                        {job.title.substring(0, 8)}
                      </div>
                    ))}
                    {dateJobs.length > 2 && (
                      <div className="text-xs text-gray-500">+{dateJobs.length - 2}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Job Details Modal */}
      <Dialog open={isJobModalOpen} onOpenChange={setIsJobModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Jobs for {jobModalData && jobModalData.length > 0 
                ? new Date(jobModalData[0].scheduledDate!).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })
                : ''
              }
            </DialogTitle>
            <DialogDescription>
              {jobModalData?.length || 0} job(s) scheduled for this date
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {jobModalData?.map((job) => (
              <Card key={job.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg">{job.title}</h3>
                    <Badge className={getStatusColor(job.status)}>
                      {getStatusIcon(job.status)}
                      <span className="ml-1 capitalize">{job.status}</span>
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Customer</p>
                      <p className="font-medium">{job.customer?.firstName || 'N/A'} {job.customer?.lastName || ''}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Time</p>
                      <p className="font-medium">{job.scheduledDate ? new Date(job.scheduledDate).toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit', 
                        hour12: true 
                      }) : 'No time set'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Service Type</p>
                      <p className="font-medium capitalize">{job.serviceType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Estimated Value</p>
                      <p className="font-medium">{formatCurrency(parseFloat(job.estimatedValue || "0"))}</p>
                    </div>
                  </div>
                  {job.description && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Description</p>
                      <p className="text-sm">{job.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
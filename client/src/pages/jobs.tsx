import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, Search, Edit, Trash2, Users, DollarSign, Calendar, MapPin,
  Wrench, Car, Zap, Droplets, Wind, Settings, Home, PlayCircle, CheckCircle, Clock, Pause
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { 
  searchInputStyles, 
  selectStyles, 
  cardStyles, 
  getStatusBadgeClass, 
  getIconClass,
  tableStyles,
  formStyles
} from "@/lib/theme-utils";

interface Job {
  id: number;
  title: string;
  description: string;
  serviceType: string;
  status: string;
  scheduledDate: string | null;
  estimatedValue: string | null;
  estimatedHours: number | null;
  notes: string | null;
  customerId: number;
  customer: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

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

const JOB_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "scheduled", label: "Scheduled" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" }
];

export default function Jobs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    serviceType: "",
    customerId: "",
    scheduledDate: "",
    estimatedValue: "",
    estimatedHours: "",
    notes: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: jobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"]
  });

  const { data: customers = [] } = useQuery<any[]>({
    queryKey: ["/api/customers"]
  });

  const createJobMutation = useMutation({
    mutationFn: async (jobData: any) => {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobData)
      });
      if (!response.ok) throw new Error("Failed to create job");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      setIsCreateModalOpen(false);
      resetForm();
      toast({ title: "Job created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create job", variant: "destructive" });
    }
  });

  const updateJobMutation = useMutation({
    mutationFn: async ({ id, ...jobData }: any) => {
      const response = await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobData)
      });
      if (!response.ok) throw new Error("Failed to update job");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
    }
  });

  const updateJobStatusMutation = useMutation({
    mutationFn: async ({ jobId, status }: { jobId: number; status: string }) => {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error("Failed to update job status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({ title: "Job status updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update job", variant: "destructive" });
    }
  });

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

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.serviceType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const jobStats = {
    total: jobs.length,
    pending: jobs.filter(job => job.status === 'pending').length,
    scheduled: jobs.filter(job => job.status === 'scheduled').length,
    inProgress: jobs.filter(job => job.status === 'in_progress').length,
    completed: jobs.filter(job => job.status === 'completed').length
  };

  const totalValue = jobs
    .filter(job => job.estimatedValue)
    .reduce((sum, job) => sum + parseFloat(job.estimatedValue || "0"), 0);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      serviceType: "",
      customerId: "",
      scheduledDate: "",
      estimatedValue: "",
      estimatedHours: "",
      notes: ""
    });
  };

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      description: job.description,
      serviceType: job.serviceType,
      customerId: job.customerId.toString(),
      scheduledDate: job.scheduledDate ? job.scheduledDate.split('T')[0] : "",
      estimatedValue: job.estimatedValue || "",
      estimatedHours: job.estimatedHours?.toString() || "",
      notes: job.notes || ""
    });
    setIsCreateModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const jobData = {
      ...formData,
      customerId: parseInt(formData.customerId),
      estimatedValue: formData.estimatedValue ? parseFloat(formData.estimatedValue) : null,
      estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : null,
      scheduledDate: formData.scheduledDate || null
    };

    if (editingJob) {
      updateJobMutation.mutate({ id: editingJob.id, ...jobData });
    } else {
      createJobMutation.mutate(jobData);
    }
  };

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
      scheduled: <Calendar className="h-3 w-3" />,
      in_progress: <PlayCircle className="h-3 w-3" />,
      completed: <CheckCircle className="h-3 w-3" />,
      cancelled: <Pause className="h-3 w-3" />
    };
    return icons[status] || <Clock className="h-3 w-3" />;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: "bg-gray-100 text-gray-800 dark:bg-slate-800/50 dark:text-slate-300",
      scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-300",
      in_progress: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-300",
      completed: "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-300"
    };
    return colors[status] || colors.pending;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const getPriorityFromValue = (value: number) => {
    if (value >= 5000) return { label: "High Value", color: "text-green-600" };
    if (value >= 2000) return { label: "Medium Value", color: "text-yellow-600" };
    return { label: "Standard", color: "text-gray-500" };
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Jobs</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage and track your service jobs
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className={searchInputStyles.container}>
            <Search className={searchInputStyles.icon} />
            <Input
              type="text"
              placeholder="Search jobs or customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={searchInputStyles.input}
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className={`w-full sm:w-[180px] ${selectStyles.trigger}`}>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className={selectStyles.content}>
              <SelectItem value="all" className={selectStyles.item}>All Statuses</SelectItem>
              <SelectItem value="pending" className={selectStyles.item}>Pending</SelectItem>
              <SelectItem value="scheduled" className={selectStyles.item}>Scheduled</SelectItem>
              <SelectItem value="in_progress" className={selectStyles.item}>In Progress</SelectItem>
              <SelectItem value="completed" className={selectStyles.item}>Completed</SelectItem>
              <SelectItem value="cancelled" className={selectStyles.item}>Cancelled</SelectItem>
            </SelectContent>
          </Select>
          
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingJob ? "Edit Job" : "Create New Job"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Job Title</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter job title"
                      required
                      className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600 focus:border-orange-500 dark:focus:border-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Service Type</label>
                    <Select value={formData.serviceType} onValueChange={(value) => setFormData(prev => ({ ...prev, serviceType: value }))}>
                      <SelectTrigger className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600">
                        <SelectValue placeholder="Select service type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                        {SERVICE_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value} className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700">
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Customer</label>
                  <Select value={formData.customerId} onValueChange={(value) => setFormData(prev => ({ ...prev, customerId: value }))}>
                    <SelectTrigger className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600">
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                      {customers.map((customer: any) => (
                        <SelectItem key={customer.id} value={customer.id.toString()} className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700">
                          {customer.firstName} {customer.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-900 dark:text-white">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the work to be done..."
                    rows={3}
                    className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600 focus:border-orange-500 dark:focus:border-orange-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Scheduled Date</label>
                    <Input
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Estimated Value ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.estimatedValue}
                      onChange={(e) => setFormData(prev => ({ ...prev, estimatedValue: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Estimated Hours</label>
                    <Input
                      type="number"
                      step="0.5"
                      value={formData.estimatedHours}
                      onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes or special instructions..."
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createJobMutation.isPending || updateJobMutation.isPending}
                  >
                    {editingJob ? "Update Job" : "Create Job"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className={cardStyles.card}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className={`text-sm font-medium ${cardStyles.title}`}>Job Status Overview</CardTitle>
              <Users className={`h-4 w-4 ${getIconClass()}`} />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className={`text-lg font-bold ${cardStyles.title}`}>{jobStats.total}</div>
                  <p className={`text-xs ${cardStyles.description}`}>Total Jobs</p>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{jobStats.inProgress}</div>
                  <p className={`text-xs ${cardStyles.description}`}>In Progress</p>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{jobStats.scheduled}</div>
                  <p className={`text-xs ${cardStyles.description}`}>Scheduled</p>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">{jobStats.completed}</div>
                  <p className={`text-xs ${cardStyles.description}`}>Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={cardStyles.card}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className={`text-sm font-medium ${cardStyles.title}`}>Total Pipeline Value</CardTitle>
              <DollarSign className={`h-4 w-4 ${getIconClass()}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${cardStyles.title}`}>{formatCurrency(totalValue)}</div>
              <p className={`text-xs ${cardStyles.description}`}>
                Active jobs estimated value
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Jobs Table */}
        <Card className={cardStyles.card}>
          <CardHeader>
            <CardTitle className={cardStyles.title}>Jobs ({filteredJobs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading jobs...</div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== "all" ? "No jobs found matching your filters." : "No jobs found. Create your first job to get started."}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className={tableStyles.header}>Job</TableHead>
                    <TableHead className={tableStyles.header}>Customer</TableHead>
                    <TableHead className={tableStyles.header}>Status</TableHead>
                    <TableHead className={tableStyles.header}>Date</TableHead>
                    <TableHead className={tableStyles.header}>Value</TableHead>
                    <TableHead className={`text-right ${tableStyles.header}`}>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobs.map((job) => (
                    <TableRow key={job.id} className={tableStyles.row}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                              {getServiceTypeIcon(job.serviceType)}
                            </div>
                          </div>
                          <div>
                            <p className={`font-medium ${tableStyles.cell}`}>{job.title}</p>
                            <p className={`text-xs ${cardStyles.description} capitalize`}>
                              {job.serviceType.replace('_', ' ')}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className={`font-medium ${tableStyles.cell}`}>
                            {job.customer?.firstName || 'N/A'} {job.customer?.lastName || ''}
                          </p>
                          {job.customer?.city && (
                            <div className={`flex items-center text-xs ${cardStyles.description}`}>
                              <MapPin className={`h-3 w-3 mr-1 ${getIconClass('muted')}`} />
                              {job.customer.city}, {job.customer.state}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select 
                          value={job.status} 
                          onValueChange={(status) => updateJobStatusMutation.mutate({ jobId: job.id, status })}
                          disabled={updateJobStatusMutation.isPending}
                        >
                          <SelectTrigger className="w-fit h-auto border-none bg-transparent p-0 focus:ring-0 hover:bg-accent/50 rounded-full">
                            <SelectValue asChild>
                              <div className={`${getStatusBadgeClass(job.status)} flex items-center space-x-1 w-fit px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer`}>
                                {getStatusIcon(job.status)}
                                <span className="capitalize">{job.status.replace("_", " ")}</span>
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className={selectStyles.content}>
                            <SelectItem value="pending" className={selectStyles.item}>
                              <div className="flex items-center space-x-2">
                                <Clock className="h-3 w-3" />
                                <span>Pending</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="scheduled" className={selectStyles.item}>
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-3 w-3" />
                                <span>Scheduled</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="in_progress" className={selectStyles.item}>
                              <div className="flex items-center space-x-2">
                                <PlayCircle className="h-3 w-3" />
                                <span>In Progress</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="completed" className={selectStyles.item}>
                              <div className="flex items-center space-x-2">
                                <CheckCircle className="h-3 w-3" />
                                <span>Completed</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="cancelled" className={selectStyles.item}>
                              <div className="flex items-center space-x-2">
                                <Pause className="h-3 w-3" />
                                <span>Cancelled</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {job.scheduledDate ? (
                          <div className={`flex items-center text-sm ${tableStyles.cell}`}>
                            <Calendar className={`h-3 w-3 mr-1 ${getIconClass('muted')}`} />
                            {new Date(job.scheduledDate).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className={cardStyles.description}>Not scheduled</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {job.estimatedValue ? (
                          <div>
                            <p className={`font-medium ${tableStyles.cell}`}>
                              {formatCurrency(parseFloat(job.estimatedValue))}
                            </p>
                            {parseFloat(job.estimatedValue) >= 1000 && (
                              <p className={`text-xs ${getPriorityFromValue(parseFloat(job.estimatedValue)).color}`}>
                                {getPriorityFromValue(parseFloat(job.estimatedValue)).label}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className={cardStyles.description}>TBD</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* Quick Status Button */}
                          {job.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => quickStatusUpdate(job.id, 'scheduled')}
                              className="h-8 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Calendar className="h-3 w-3 mr-1" />
                              Schedule
                            </Button>
                          )}
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
                            onClick={() => handleEdit(job)}
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
      </div>
    </>
  );
}
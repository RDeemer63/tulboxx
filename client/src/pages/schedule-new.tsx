import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import JobDetailModal from "@/components/job-detail-modal";
import { 
  Plus, 
  Search, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  CalendarIcon,
  CheckCircle,
  PlayCircle,
  AlertCircle,
  Users,
  User,
  UserCheck,
  Calendar
} from "lucide-react";
import { format, addDays, subDays } from "date-fns";
import type { Job, Customer, Employee } from "@shared/schema";

type ViewMode = 'day' | 'week' | 'month';

export default function Schedule() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [searchTerm, setSearchTerm] = useState("");
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [jobModalData, setJobModalData] = useState<(Job & { customer: Customer })[] | null>(null);
  const [selectedTab, setSelectedTab] = useState('schedule');
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [selectedJob, setSelectedJob] = useState<(Job & { customer: Customer }) | null>(null);
  const [isJobDetailModalOpen, setIsJobDetailModalOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: jobs = [], isLoading: jobsLoading } = useQuery<(Job & { customer: Customer })[]>({
    queryKey: ["/api/jobs"],
  });

  const { data: employees = [], isLoading: employeesLoading } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const { data: availableEmployees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/employees/available", format(selectedDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      const response = await fetch(`/api/employees/available?date=${format(selectedDate, 'yyyy-MM-dd')}`);
      return response.json();
    },
  });

  const assignJobMutation = useMutation({
    mutationFn: async ({ jobId, employeeId }: { jobId: number; employeeId: number }) => {
      return apiRequest(`/api/jobs/${jobId}/assign`, 'POST', { employeeId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
    }
  });

  const updateJobStatusMutation = useMutation({
    mutationFn: async ({ jobId, status }: { jobId: number; status: string }) => {
      return apiRequest("PUT", `/api/jobs/${jobId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
    }
  });

  // Function to automatically update job status based on scheduled time
  const getAutomaticStatus = (job: Job) => {
    if (!job.scheduledDate) return job.status;
    
    const now = new Date();
    const scheduledTime = new Date(job.scheduledDate);
    const timeDiff = now.getTime() - scheduledTime.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    // Auto-update logic (can be overridden manually)
    if (job.status === 'pending' && hoursDiff >= 0) {
      return 'in_progress'; // Job should start automatically at scheduled time
    }
    if (job.status === 'in_progress' && hoursDiff >= 8) {
      return 'completed'; // Assume 8-hour job completion unless manually overridden
    }
    
    return job.status;
  };

  const filteredJobs = useMemo(() => {
    const dateStr = selectedDate.toDateString();
    return jobs.filter(job => {
      if (!job.scheduledDate) return false;
      const jobDate = new Date(job.scheduledDate).toDateString();
      const matchesDate = jobDate === dateStr;
      const matchesSearch = searchTerm === "" || 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.customer?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.customer?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesDate && matchesSearch;
    });
  }, [jobs, selectedDate, searchTerm]);

  const getWeekDates = (date: Date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day;
    start.setDate(diff);
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      dates.push(day);
    }
    return dates;
  };

  const getMonthDates = (date: Date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const startDay = start.getDay();
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    
    const dates = [];
    
    // Add previous month's dates to fill the week
    for (let i = startDay - 1; i >= 0; i--) {
      const prevDate = new Date(date.getFullYear(), date.getMonth(), -i);
      dates.push(prevDate);
    }
    
    // Add current month's dates
    for (let i = 1; i <= endDate; i++) {
      dates.push(new Date(date.getFullYear(), date.getMonth(), i));
    }
    
    // Add next month's dates to complete the grid (42 total)
    const remaining = 42 - dates.length;
    for (let i = 1; i <= remaining; i++) {
      dates.push(new Date(date.getFullYear(), date.getMonth() + 1, i));
    }
    
    return dates;
  };

  const getJobsForDate = (date: Date) => {
    const dateStr = date.toDateString();
    return jobs.filter(job => {
      if (!job.scheduledDate) return false;
      return new Date(job.scheduledDate).toDateString() === dateStr;
    });
  };

  const handleDateClick = (date: Date, dateJobs: (Job & { customer: Customer })[]) => {
    setSelectedDate(date);
    if (dateJobs.length > 0) {
      setJobModalData(dateJobs);
      setIsJobModalOpen(true);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'pending': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      case 'in_progress': return <PlayCircle className="h-3 w-3" />;
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'cancelled': return <AlertCircle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getAssignedEmployee = (jobId: number) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job?.assignedTechnicianId) return null;
    return employees.find(e => e.id === job.assignedTechnicianId);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-800/20 dark:text-purple-300';
      case 'manager': return 'bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-300';
      case 'technician': return 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300';
      case 'assistant': return 'bg-orange-100 text-orange-800 dark:bg-orange-800/20 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-slate-800/50 dark:text-slate-300';
    }
  };

  const handleJobClick = (job: Job & { customer: Customer }) => {
    setSelectedJob(job);
    setIsJobDetailModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Schedule & Workforce</h1>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(new Date())}
              >
                Today
              </Button>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-gray-300 dark:border-slate-600 focus:border-orange-500 dark:focus:border-orange-500"
                />
              </div>

              {/* Date Navigation */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(subDays(selectedDate, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* View Mode */}
              <div className="flex items-center border rounded-lg">
                {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
                  <Button
                    key={mode}
                    variant={viewMode === mode ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode(mode)}
                    className="capitalize"
                  >
                    {mode}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content Area with Selected Date */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long',
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h2>
        </div>

        {/* Main Content Area with Tabs */}
        <div className="flex-1 overflow-auto">
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="h-full">
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6">
              <TabsList className="h-12 bg-transparent">
                <TabsTrigger value="schedule" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule
                </TabsTrigger>
                <TabsTrigger value="employees" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                  <Users className="h-4 w-4 mr-2" />
                  Workforce
                </TabsTrigger>
                <TabsTrigger value="assignments" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Assignments
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              {/* Schedule Tab */}
              <TabsContent value="schedule" className="mt-0">
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
                              <TableHead>Service</TableHead>
                              <TableHead>Assigned</TableHead>
                              <TableHead>Value</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredJobs.map((job) => {
                              const assignedEmployee = getAssignedEmployee(job.id);
                              return (
                                <TableRow 
                                  key={job.id} 
                                  className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                                  onClick={() => handleJobClick(job)}
                                >
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
                                  <TableCell className="max-w-xs">
                                    <div className="flex items-center space-x-2">
                                      <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                                      <div className="min-w-0 flex-1">
                                        <div className="font-medium text-slate-900 dark:text-slate-100 truncate">{job.title}</div>
                                        {job.description && (
                                          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                            {job.description.length > 30 ? job.description.substring(0, 30) + '...' : job.description}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="min-w-0 w-40">
                                    <div className="font-medium text-slate-900 dark:text-slate-100 truncate">
                                      {job.customer ? 
                                        `${job.customer.firstName} ${job.customer.lastName}`.trim() : 
                                        'No Customer'
                                      }
                                    </div>
                                    {job.customer?.phone && (
                                      <div className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                        {job.customer.phone}
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 capitalize">
                                      {job.serviceType}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    {assignedEmployee ? (
                                      <div className="flex items-center space-x-2">
                                        <User className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm font-medium">{assignedEmployee.firstName} {assignedEmployee.lastName}</span>
                                      </div>
                                    ) : (
                                      <span className="text-sm text-gray-500">Unassigned</span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <span className="font-medium text-slate-900 dark:text-slate-100">
                                      {formatCurrency(parseFloat(job.estimatedValue || "0"))}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <Select 
                                      value={job.status} 
                                      onValueChange={(status) => updateJobStatusMutation.mutate({ jobId: job.id, status })}
                                      disabled={updateJobStatusMutation.isPending}
                                    >
                                      <SelectTrigger className="w-32" onClick={(e) => e.stopPropagation()}>
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
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Workforce Tab */}
              <TabsContent value="employees" className="mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Available Employees */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <UserCheck className="h-5 w-5 mr-2" />
                        Available Today ({availableEmployees.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {employeesLoading ? (
                        <div className="text-center py-8">Loading employees...</div>
                      ) : availableEmployees.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No employees available for this date.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {availableEmployees.map((employee) => (
                            <div key={employee.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                  <User className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                  <div className="font-medium">{employee.firstName} {employee.lastName}</div>
                                  <Badge className={getRoleColor(employee.role)} variant="outline">
                                    {employee.role}
                                  </Badge>
                                </div>
                              </div>
                              <div className="text-sm text-gray-500">
                                Available
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* All Employees */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Users className="h-5 w-5 mr-2" />
                        All Employees ({employees.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {employeesLoading ? (
                        <div className="text-center py-8">Loading employees...</div>
                      ) : employees.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No employees found.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {employees.map((employee) => (
                            <div key={employee.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${employee.isAvailable ? 'bg-green-500' : 'bg-gray-400'}`}>
                                  <User className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                  <div className="font-medium">{employee.firstName} {employee.lastName}</div>
                                  <Badge className={getRoleColor(employee.role)} variant="outline">
                                    {employee.role}
                                  </Badge>
                                </div>
                              </div>
                              <div className="text-sm">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${employee.isAvailable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                  {employee.isAvailable ? 'Available' : 'Unavailable'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Assignments Tab */}
              <TabsContent value="assignments" className="mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <UserCheck className="h-5 w-5 mr-2" />
                      Job Assignments for {format(selectedDate, 'MMMM dd, yyyy')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {jobsLoading ? (
                      <div className="text-center py-8">Loading job assignments...</div>
                    ) : filteredJobs.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No jobs scheduled for this date.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredJobs.map((job) => {
                          const assignedEmployee = getAssignedEmployee(job.id);
                          return (
                            <div key={job.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h3 className="font-medium text-lg">{job.title}</h3>
                                  <p className="text-sm text-gray-500">
                                    {job.customer?.firstName} {job.customer?.lastName} • {job.serviceType}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-4">
                                  <div className="text-right">
                                    <div className="font-medium">
                                      {job.scheduledDate ? new Date(job.scheduledDate).toLocaleTimeString('en-US', { 
                                        hour: 'numeric', 
                                        minute: '2-digit', 
                                        hour12: true 
                                      }) : 'No time set'}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {formatCurrency(parseFloat(job.estimatedValue || "0"))}
                                    </div>
                                  </div>
                                  <Separator orientation="vertical" className="h-12" />
                                  <div className="min-w-[200px]">
                                    <Select
                                      value={assignedEmployee?.id.toString() || ""}
                                      onValueChange={(value) => {
                                        if (value) {
                                          assignJobMutation.mutate({
                                            jobId: job.id,
                                            employeeId: parseInt(value)
                                          });
                                        }
                                      }}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Assign employee">
                                          {assignedEmployee ? (
                                            <div className="flex items-center space-x-2">
                                              <User className="h-4 w-4" />
                                              <span>{assignedEmployee.firstName} {assignedEmployee.lastName}</span>
                                            </div>
                                          ) : (
                                            "Select employee"
                                          )}
                                        </SelectValue>
                                      </SelectTrigger>
                                      <SelectContent>
                                        {availableEmployees.map((employee) => (
                                          <SelectItem key={employee.id} value={employee.id.toString()}>
                                            <div className="flex items-center space-x-2">
                                              <User className="h-4 w-4" />
                                              <span>{employee.firstName} {employee.lastName}</span>
                                              <Badge className={getRoleColor(employee.role)} variant="outline">
                                                {employee.role}
                                              </Badge>
                                            </div>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Job Modal */}
      <Dialog open={isJobModalOpen} onOpenChange={setIsJobModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Jobs for {selectedDate.toLocaleDateString()}</DialogTitle>
            <DialogDescription>
              View and manage jobs scheduled for this date.
            </DialogDescription>
          </DialogHeader>
          {jobModalData && (
            <div className="space-y-4">
              {jobModalData.map((job) => (
                <div key={job.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{job.title}</h3>
                      <p className="text-sm text-gray-500">{job.description}</p>
                      <p className="text-sm font-medium mt-2">
                        {job.customer?.firstName} {job.customer?.lastName}
                      </p>
                    </div>
                    <Badge className={getStatusColor(job.status)}>
                      {getStatusIcon(job.status)}
                      <span className="ml-1 capitalize">{job.status}</span>
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Job Detail Modal */}
      <JobDetailModal
        job={selectedJob}
        open={isJobDetailModalOpen}
        onOpenChange={setIsJobDetailModalOpen}
      />
    </div>
  );
}
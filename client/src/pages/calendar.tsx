import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import {
  useDroppable,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
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
import { useToast } from "@/hooks/use-toast";
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
  Home,
  GripVertical,
  AlertCircle,
  Zap
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

// Draggable Job Card Component
function DraggableJobCard({ job, isOverlay = false }: { job: Job & { customer: Customer }, isOverlay?: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
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

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      in_progress: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    };
    return colors[status] || colors.pending;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3 bg-white dark:bg-gray-800 rounded-lg border shadow-sm hover:shadow-md transition-shadow select-none ${
        isDragging ? 'opacity-50' : ''
      } ${isOverlay ? 'rotate-3 shadow-lg' : ''}`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start justify-between gap-3 pointer-events-none">
        <div className="cursor-grab active:cursor-grabbing flex items-center gap-2 flex-shrink-0 pointer-events-auto">
          <GripVertical className="h-4 w-4 text-gray-400" />
          {getServiceTypeIcon(job.serviceType)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-sm truncate">{job.title}</h4>
            <Badge variant="outline" className={`text-xs ${getStatusColor(job.status)}`}>
              {job.status}
            </Badge>
          </div>
          
          <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span className="truncate">{job.customer.firstName} {job.customer.lastName}</span>
            </div>
            
            {job.scheduledDate && (
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                <span>{new Date(job.scheduledDate).toLocaleDateString()}</span>
              </div>
            )}
            
            {job.estimatedValue && (
              <div className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                <span>${job.estimatedValue}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Droppable Calendar Cell Component
function DroppableCalendarCell({ date, jobs, isToday, isCurrentMonth }: {
  date: Date;
  jobs: (Job & { customer: Customer })[];
  isToday: boolean;
  isCurrentMonth: boolean;
}) {
  const dayNumber = date.getDate();
  const dateId = `date-${date.toISOString().split('T')[0]}`;
  
  const { isOver, setNodeRef } = useDroppable({
    id: dateId,
  });
  
  return (
    <div 
      ref={setNodeRef}
      className={`min-h-[120px] p-2 border border-gray-200 dark:border-gray-700 transition-all duration-200
        ${isCurrentMonth ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'} 
        ${isToday ? 'ring-2 ring-blue-500' : ''}
        ${isOver ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600 scale-105' : ''}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-medium ${
          isCurrentMonth 
            ? isToday 
              ? 'text-blue-600 dark:text-blue-400' 
              : 'text-gray-900 dark:text-gray-100'
            : 'text-gray-400 dark:text-gray-600'
        }`}>
          {dayNumber}
        </span>
        {jobs.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {jobs.length}
          </Badge>
        )}
      </div>
      
      <div className="space-y-1">
        {jobs.slice(0, 3).map(job => (
          <div key={job.id} className="text-xs p-1 bg-blue-100 dark:bg-blue-900 rounded truncate">
            <div className="font-medium">{job.title}</div>
          </div>
        ))}
        {jobs.length > 3 && (
          <div className="text-xs text-gray-500 text-center">
            +{jobs.length - 3} more
          </div>
        )}
        {isOver && (
          <div className="text-xs text-blue-600 dark:text-blue-400 text-center py-2 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded bg-blue-50 dark:bg-blue-900/30">
            Drop job here
          </div>
        )}
      </div>
    </div>
  );
}

export default function Calendar() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isScheduleJobOpen, setIsScheduleJobOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('month');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [jobModalData, setJobModalData] = useState<(Job & { customer: Customer })[] | null>(null);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch data
  const { data: jobs = [], isLoading: jobsLoading } = useQuery<(Job & { customer: Customer })[]>({
    queryKey: ['/api/jobs']
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ['/api/customers']
  });

  const form = useForm<JobFormData>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      serviceType: "",
      customerId: "",
      scheduledDate: selectedDate.toISOString().split('T')[0],
      scheduledTime: "09:00",
      estimatedValue: "",
      description: ""
    }
  });

  // Create job mutation
  const createJobMutation = useMutation({
    mutationFn: async (data: JobFormData) => {
      const scheduledDateTime = new Date(`${data.scheduledDate}T${data.scheduledTime}`);
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${SERVICE_TYPES.find(t => t.value === data.serviceType)?.label} Service`,
          serviceType: data.serviceType,
          customerId: parseInt(data.customerId),
          scheduledDate: scheduledDateTime,
          estimatedValue: data.estimatedValue ? parseFloat(data.estimatedValue) : undefined,
          description: data.description,
          status: "scheduled"
        })
      });
      if (!response.ok) throw new Error("Failed to create job");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({ title: "Job scheduled successfully" });
      setIsScheduleJobOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to schedule job", variant: "destructive" });
    }
  });

  // Update job mutation for drag and drop
  const updateJobMutation = useMutation({
    mutationFn: async ({ jobId, newDate }: { jobId: number, newDate: Date }) => {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduledDate: newDate,
          status: "scheduled"
        })
      });
      if (!response.ok) throw new Error("Failed to update job");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({ title: "Job rescheduled successfully" });
    },
    onError: () => {
      toast({ title: "Failed to reschedule job", variant: "destructive" });
    }
  });

  // Get unscheduled/pending jobs for drag source
  const unscheduledJobs = jobs.filter(job => job.status === 'pending' || !job.scheduledDate);

  // Calendar utility functions
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

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date, referenceDate: Date) => {
    return date.getMonth() === referenceDate.getMonth() && date.getFullYear() === referenceDate.getFullYear();
  };

  // Handle drag and drop
  const handleDragStart = (event: DragStartEvent) => {
    console.log('Drag started:', event.active.id);
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    console.log('Drag ended:', { activeId: active.id, overId: over?.id });
    setActiveId(null);

    if (!over) {
      console.log('No drop target found');
      return;
    }

    const jobId = parseInt(active.id as string);
    const targetDateStr = over.id as string;

    console.log('Processing drop:', { jobId, targetDateStr });

    if (targetDateStr.startsWith('date-')) {
      const targetDate = new Date(targetDateStr.replace('date-', ''));
      console.log('Updating job:', { jobId, targetDate });
      updateJobMutation.mutate({ jobId, newDate: targetDate });
    }
  };

  // Get week dates
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

  // Get filtered jobs for selected date (day view)
  const selectedDateJobs = jobs.filter(job => {
    if (!job.scheduledDate) return false;
    const jobDate = new Date(job.scheduledDate);
    return jobDate.toDateString() === selectedDate.toDateString();
  });

  const handleDateClick = (date: Date, dateJobs: (Job & { customer: Customer })[]) => {
    if (dateJobs.length > 0) {
      setJobModalData(dateJobs);
      setIsJobModalOpen(true);
    }
  };

  const monthDates = getMonthDates(selectedDate);
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Calendar</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Schedule and manage your jobs with drag-and-drop functionality
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Unscheduled Jobs */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  Unscheduled Jobs ({unscheduledJobs.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <SortableContext items={unscheduledJobs.map(job => job.id.toString())} strategy={verticalListSortingStrategy}>
                  {unscheduledJobs.map(job => (
                    <DraggableJobCard key={job.id} job={job} />
                  ))}
                </SortableContext>
                {unscheduledJobs.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">All jobs are scheduled</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Calendar */}
          <div className="lg:col-span-3">
            {/* View Controls */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
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

            {/* Calendar Grid */}
            <Card>
              <CardContent className="p-0">
                {/* Day View */}
                {viewMode === 'day' && (
                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold mb-2">
                        {selectedDate.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedDateJobs.length} jobs scheduled
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                      {selectedDateJobs.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No jobs scheduled for this date</p>
                        </div>
                      ) : (
                        selectedDateJobs
                          .sort((a, b) => new Date(a.scheduledDate!).getTime() - new Date(b.scheduledDate!).getTime())
                          .map(job => (
                            <div key={job.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm">
                                      {job.scheduledDate ? new Date(job.scheduledDate).toLocaleTimeString('en-US', {
                                        hour: 'numeric',
                                        minute: '2-digit',
                                        hour12: true
                                      }) : 'No time set'}
                                    </span>
                                  </div>
                                  <div>
                                    <h4 className="font-medium">{job.title}</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {job.customer.firstName} {job.customer.lastName}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {job.estimatedValue && (
                                    <span className="text-sm font-medium">${job.estimatedValue}</span>
                                  )}
                                  <Badge variant="outline" className="text-xs">
                                    {job.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                )}

                {/* Week View */}
                {viewMode === 'week' && (
                  <div className="p-0">
                    <div className="grid grid-cols-7 gap-0">
                      {/* Header */}
                      {weekdays.map(day => (
                        <div key={day} className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-center font-medium text-sm">
                          {day}
                        </div>
                      ))}
                      
                      {/* Week Cells */}
                      {getWeekDates(selectedDate).map(date => {
                        const dateJobs = getJobsForDate(date);
                        const dateId = `date-${date.toISOString().split('T')[0]}`;
                        
                        return (
                          <div
                            key={dateId}
                            id={dateId}
                            className="cursor-pointer"
                            onClick={() => handleDateClick(date, dateJobs)}
                          >
                            <DroppableCalendarCell
                              date={date}
                              jobs={dateJobs}
                              isToday={isToday(date)}
                              isCurrentMonth={true}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Month View */}
                {viewMode === 'month' && (
                  <div className="p-0">
                    <div className="grid grid-cols-7 gap-0">
                      {/* Header */}
                      {weekdays.map(day => (
                        <div key={day} className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-center font-medium text-sm">
                          {day}
                        </div>
                      ))}
                      
                      {/* Calendar Cells */}
                      {monthDates.map(date => {
                        const dateJobs = getJobsForDate(date);
                        const dateId = `date-${date.toISOString().split('T')[0]}`;
                        
                        return (
                          <div
                            key={dateId}
                            id={dateId}
                            className="cursor-pointer"
                            onClick={() => handleDateClick(date, dateJobs)}
                          >
                            <DroppableCalendarCell
                              date={date}
                              jobs={dateJobs}
                              isToday={isToday(date)}
                              isCurrentMonth={isCurrentMonth(date, selectedDate)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 flex gap-4">
          <Button onClick={() => setSelectedDate(new Date())} variant="outline">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Go to Today
          </Button>
          
          <Dialog open={isScheduleJobOpen} onOpenChange={setIsScheduleJobOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Schedule New Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Schedule New Job</DialogTitle>
                <DialogDescription>
                  Add a new job to the calendar
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
                          <Textarea placeholder="Job details..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={createJobMutation.isPending}>
                    {createJobMutation.isPending ? "Scheduling..." : "Schedule Job"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Job Details Modal */}
        <Dialog open={isJobModalOpen} onOpenChange={setIsJobModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Jobs for Selected Date</DialogTitle>
            </DialogHeader>
            {jobModalData && (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {jobModalData.map(job => (
                  <div key={job.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{job.title}</h4>
                        <p className="text-sm text-gray-600">
                          {job.customer.firstName} {job.customer.lastName}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">{job.description}</p>
                      </div>
                      <Badge variant="outline" className={`text-xs`}>
                        {job.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeId ? (
          <DraggableJobCard 
            job={jobs.find(job => job.id.toString() === activeId)!} 
            isOverlay 
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
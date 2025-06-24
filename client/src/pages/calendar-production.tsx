import { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter,
  rectIntersection,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
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
  MapPin,
  DollarSign,
  Search,
  Settings,
  Wrench,
  Droplets,
  Wind,
  Home,
  GripVertical,
  AlertCircle,
  Zap,
  Eye,
  CheckCircle,
  PlayCircle,
  Loader2,
  Phone,
  Edit,
} from "lucide-react";
import type { Job, Customer, Employee } from "@shared/schema";

// Job form validation schema
const jobFormSchema = z.object({
  serviceType: z.string().min(1, "Service type is required"),
  customerId: z.string().min(1, "Customer is required"),
  scheduledDate: z.string().min(1, "Date is required"),
  scheduledTime: z.string().min(1, "Time is required"),
  estimatedValue: z.string().optional(),
  description: z.string().optional(),
});

// Time picker form schema
const timePickerSchema = z.object({
  time: z.string().min(1, "Time is required"),
});

type JobFormData = z.infer<typeof jobFormSchema>;

// Service type configuration
const SERVICE_TYPES = [
  { value: "plumbing", label: "Plumbing", icon: Droplets },
  { value: "electrical", label: "Electrical", icon: Zap },
  { value: "hvac", label: "HVAC", icon: Wind },
  { value: "landscaping", label: "Landscaping", icon: Home },
  { value: "cleaning", label: "Cleaning", icon: Settings },
  { value: "maintenance", label: "General Maintenance", icon: Wrench },
  { value: "repair", label: "Repair Services", icon: Settings },
  { value: "installation", label: "Installation", icon: Plus },
  { value: "other", label: "Other", icon: Settings }
];

// Job status color mapping
const STATUS_COLORS = {
  pending: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  in_progress: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
};

// Utility functions
const getServiceTypeIcon = (serviceType: string) => {
  const serviceConfig = SERVICE_TYPES.find(s => s.value === serviceType);
  const IconComponent = serviceConfig?.icon || Settings;
  return <IconComponent className="h-4 w-4" />;
};

const getStatusColor = (status: string) => {
  return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.pending;
};

const formatTime = (dateString: string) => {
  // Extract time directly from the database string without timezone conversion
  const timeMatch = dateString.match(/(\d{2}):(\d{2}):(\d{2})/);
  if (!timeMatch) return 'No time set';
  
  const hours = parseInt(timeMatch[1]);
  const minutes = parseInt(timeMatch[2]);
  
  // Convert to 12-hour format
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

// Draggable Job Card Component
interface DraggableJobCardProps {
  job: Job & { customer: Customer };
  isOverlay?: boolean;
}

function DraggableJobCard({ job, isOverlay = false }: DraggableJobCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: job.id.toString(),
    data: {
      type: 'job',
      job,
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handlePreventClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        p-3 bg-white dark:bg-gray-800 rounded-lg border shadow-sm 
        hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing
        select-none touch-none
        ${isDragging ? 'opacity-50 z-50' : ''}
        ${isOverlay ? 'rotate-3 shadow-lg scale-105' : ''}
      `}
      {...attributes}
      {...listeners}
      onMouseDown={handlePreventClick}
      onTouchStart={handlePreventClick as any}
    >
      <div className="flex items-start justify-between gap-3 pointer-events-none">
        <div className="flex items-center gap-2 flex-shrink-0">
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
              <User className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{job.customer.firstName} {job.customer.lastName}</span>
            </div>
            
            {job.scheduledDate && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 flex-shrink-0" />
                <span>{formatTime(job.scheduledDate.toString())}</span>
              </div>
            )}
            
            {job.estimatedValue && (
              <div className="flex items-center gap-1">
                <DollarSign className="h-3 w-3 flex-shrink-0" />
                <span>${job.estimatedValue}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Draggable Calendar Event Component
interface DraggableCalendarEventProps {
  job: Job & { customer: Customer };
  onClick: (e: React.MouseEvent) => void;
}

function DraggableCalendarEvent({ job, onClick }: DraggableCalendarEventProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: `calendar-job-${job.id}`,
    data: {
      type: 'calendar-job',
      job,
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`
        text-xs p-1 bg-blue-100 dark:bg-blue-900 rounded cursor-pointer
        hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors
        ${isDragging ? 'opacity-50 z-50' : ''}
      `}
      title={`${job.title} - ${job.customer.firstName} ${job.customer.lastName}`}
      onClick={onClick}
      {...attributes}
      {...listeners}
    >
      <div className="font-medium truncate">{job.title}</div>
      <div className="text-blue-700 dark:text-blue-300 truncate">
        {job.customer.firstName} {job.customer.lastName}
      </div>
    </div>
  );
}

// Droppable Calendar Cell Component
interface DroppableCalendarCellProps {
  date: Date;
  jobs: (Job & { customer: Customer })[];
  isToday: boolean;
  isCurrentMonth: boolean;
  onDateClick: (date: Date, jobs: (Job & { customer: Customer })[]) => void;
  onEventClick: (job: Job & { customer: Customer }) => void;
}

function DroppableCalendarCell({ 
  date, 
  jobs, 
  isToday, 
  isCurrentMonth, 
  onDateClick,
  onEventClick
}: DroppableCalendarCellProps) {
  const dayNumber = date.getDate();
  const dateId = `date-${date.toISOString().split('T')[0]}`;
  
  const { isOver, setNodeRef, active } = useDroppable({
    id: dateId,
    data: {
      type: 'calendar-cell',
      date: date.getFullYear() + '-' + 
            String(date.getMonth() + 1).padStart(2, '0') + '-' + 
            String(date.getDate()).padStart(2, '0'),
    }
  });

  const canDrop = active && (
    active.data.current?.type === 'job' || 
    active.data.current?.type === 'calendar-job'
  );

  const handleClick = useCallback(() => {
    onDateClick(date, jobs);
  }, [date, jobs, onDateClick]);
  
  return (
    <div 
      ref={setNodeRef}
      onClick={handleClick}
      className={`
        min-h-[120px] p-2 border border-gray-200 dark:border-gray-700 
        transition-all duration-200 cursor-pointer
        ${isCurrentMonth ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'} 
        ${isToday ? 'ring-2 ring-blue-500' : ''}
        ${isOver && canDrop ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-600 scale-[1.02] ring-2 ring-green-400' : ''}
        ${isOver && !canDrop ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-600' : ''}
        hover:bg-gray-50 dark:hover:bg-gray-800
      `}
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
          <DraggableCalendarEvent 
            key={job.id} 
            job={job}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onEventClick(job);
            }}
          />
        ))}
        {jobs.length > 3 && (
          <div className="text-xs text-gray-500 text-center py-1">
            +{jobs.length - 3} more
          </div>
        )}
        {isOver && canDrop && (
          <div className="text-xs text-green-600 dark:text-green-400 text-center py-4 border-2 border-dashed border-green-300 dark:border-green-600 rounded bg-green-50 dark:bg-green-900/30">
            Drop job here
          </div>
        )}
      </div>
    </div>
  );
}

// Main Calendar Component
export default function ProductionCalendar() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  // State management
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('month');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDragOverCalendar, setIsDragOverCalendar] = useState(false);
  const [isScheduleJobOpen, setIsScheduleJobOpen] = useState(false);
  const [jobModalData, setJobModalData] = useState<(Job & { customer: Customer })[] | null>(null);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<(Job & { customer: Customer }) | null>(null);
  const [isJobDetailOpen, setIsJobDetailOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [pendingSchedule, setPendingSchedule] = useState<{
    jobId: number;
    targetDate: string;
    currentTime?: string;
  } | null>(null);

  // DnD sensors with proper configuration
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Reduced distance for better responsiveness
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Data fetching
  const { data: jobs = [], isLoading: jobsLoading, error: jobsError } = useQuery<(Job & { customer: Customer })[]>({
    queryKey: ['/api/jobs'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: customers = [], isLoading: customersLoading } = useQuery<Customer[]>({
    queryKey: ['/api/customers'],
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Form configuration
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

  // Mutations
  const createJobMutation = useMutation({
    mutationFn: async (data: JobFormData) => {
      const scheduledDateTime = new Date(`${data.scheduledDate}T${data.scheduledTime}`);
      const serviceConfig = SERVICE_TYPES.find(t => t.value === data.serviceType);
      
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${serviceConfig?.label || 'Service'} - ${customers.find(c => c.id === parseInt(data.customerId))?.firstName || 'Customer'}`,
          serviceType: data.serviceType,
          customerId: parseInt(data.customerId),
          scheduledDate: scheduledDateTime,
          estimatedValue: data.estimatedValue ? parseFloat(data.estimatedValue) : undefined,
          description: data.description,
          status: "scheduled"
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create job");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "today-schedule"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "recent-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
      toast({ title: "Job scheduled successfully" });
      setIsScheduleJobOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({ 
        title: "Failed to schedule job", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const updateJobMutation = useMutation({
    mutationFn: async ({ jobId, dateTimeString }: { jobId: number, dateTimeString: string }) => {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduledDate: dateTimeString,
          status: "scheduled"
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update job");
      }
      
      return response.json();
    },
    onSuccess: (_, { jobId }) => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "today-schedule"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "recent-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "stats"] });
      const job = jobs.find(j => j.id === jobId);
      toast({ 
        title: "Job rescheduled successfully",
        description: job ? `${job.title} has been moved` : undefined
      });
    },
    onError: (error) => {
      toast({ 
        title: "Failed to reschedule job", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  // Job filtering and categorization
  const unscheduledJobs = useMemo(() => {
    return jobs.filter(job => job.status === 'pending' || !job.scheduledDate);
  }, [jobs]);

  const scheduledJobs = useMemo(() => {
    return jobs.filter(job => job.scheduledDate && job.status !== 'pending');
  }, [jobs]);

  // Calendar utility functions
  const getMonthDates = useCallback((date: Date) => {
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
  }, []);

  const getWeekDates = useCallback((date: Date) => {
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
  }, []);

  const getJobsForDate = useCallback((date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return scheduledJobs.filter(job => {
      if (!job.scheduledDate) return false;
      const jobDate = new Date(job.scheduledDate).toISOString().split('T')[0];
      return jobDate === dateStr;
    });
  }, [scheduledJobs]);

  const isToday = useCallback((date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }, []);

  const isCurrentMonth = useCallback((date: Date, referenceDate: Date) => {
    return date.getMonth() === referenceDate.getMonth() && 
           date.getFullYear() === referenceDate.getFullYear();
  }, []);

  // Drag and drop handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    console.log('Drag started:', event.active.id);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    if (over?.data.current?.type === 'calendar-cell') {
      setIsDragOverCalendar(true);
    } else {
      setIsDragOverCalendar(false);
    }
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setIsDragOverCalendar(false);

    if (!over) {
      console.log('No drop target found');
      return;
    }

    const activeData = active.data.current;
    const overData = over.data.current;
    
    // Handle different drag types
    let jobId: number;
    if (activeData?.type === 'job') {
      // Dragging from unscheduled jobs
      jobId = activeData.job.id;
    } else if (activeData?.type === 'calendar-job') {
      // Dragging from calendar events
      jobId = activeData.job.id;
    } else {
      // Fallback for backward compatibility
      jobId = parseInt(active.id as string);
    }

    console.log('Drop event:', { 
      jobId, 
      activeType: activeData?.type,
      overType: overData?.type, 
      overData 
    });

    if (overData?.type === 'calendar-cell') {
      const targetDateStr = overData.date;
      const currentJob = activeData?.job;
      let currentTime = '09:00';
      
      if (currentJob?.scheduledDate) {
        const time = new Date(currentJob.scheduledDate);
        currentTime = time.toTimeString().substring(0, 5);
      }
      
      // Open time picker dialog instead of immediately scheduling
      setPendingSchedule({
        jobId,
        targetDate: targetDateStr,
        currentTime
      });
      setIsTimePickerOpen(true);
    }
  }, [updateJobMutation]);

  // Event handlers
  const handleDateClick = useCallback((date: Date, dateJobs: (Job & { customer: Customer })[]) => {
    if (dateJobs.length > 0) {
      setJobModalData(dateJobs);
      setIsJobModalOpen(true);
    }
  }, []);

  const handleEventClick = useCallback((job: Job & { customer: Customer }) => {
    setSelectedJob(job);
    setIsJobDetailOpen(true);
  }, []);

  // Time picker form
  const timePickerForm = useForm<z.infer<typeof timePickerSchema>>({
    resolver: zodResolver(timePickerSchema),
    defaultValues: {
      time: '09:00',
    },
  });

  // Update form when pending schedule changes
  useEffect(() => {
    if (pendingSchedule) {
      timePickerForm.reset({
        time: pendingSchedule.currentTime || '09:00',
      });
    }
  }, [pendingSchedule, timePickerForm]);

  const confirmSchedule = useCallback((data: z.infer<typeof timePickerSchema>) => {
    if (!pendingSchedule) return;
    
    // Create the exact datetime string without timezone conversion
    const dateTimeString = `${pendingSchedule.targetDate} ${data.time}:00`;
    
    console.log('Scheduling job:', {
      selectedTime: data.time,
      finalDateTime: dateTimeString,
      willDisplayAs: formatTime(dateTimeString)
    });
    
    // Send the raw datetime string to avoid any Date object timezone conversion
    updateJobMutation.mutate({ 
      jobId: pendingSchedule.jobId, 
      dateTimeString: dateTimeString 
    });
    
    setIsTimePickerOpen(false);
    setPendingSchedule(null);
  }, [pendingSchedule, updateJobMutation]);

  const handleViewModeChange = useCallback((mode: 'day' | 'week' | 'month') => {
    setViewMode(mode);
  }, []);

  const handleNavigate = useCallback((direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setSelectedDate(newDate);
  }, [selectedDate, viewMode]);

  // Data for current view
  const selectedDateJobs = useMemo(() => {
    return getJobsForDate(selectedDate);
  }, [getJobsForDate, selectedDate]);

  const monthDates = useMemo(() => {
    return getMonthDates(selectedDate);
  }, [getMonthDates, selectedDate]);

  const weekDates = useMemo(() => {
    return getWeekDates(selectedDate);
  }, [getWeekDates, selectedDate]);

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Loading and error states
  if (jobsError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Calendar</h3>
            <p className="text-gray-600 mb-4">Failed to load job data. Please refresh the page or contact support.</p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/jobs'] })}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Calendar</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Schedule and manage jobs with drag-and-drop functionality
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
                  Unscheduled Jobs
                  {jobsLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Badge variant="secondary">({unscheduledJobs.length})</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {jobsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <SortableContext 
                    items={[
                      ...unscheduledJobs.map(job => job.id.toString()),
                      ...scheduledJobs.map(job => `calendar-job-${job.id}`)
                    ]} 
                    strategy={verticalListSortingStrategy}
                  >
                    {unscheduledJobs.map(job => (
                      <DraggableJobCard key={job.id} job={job} />
                    ))}
                  </SortableContext>
                )}
                
                {!jobsLoading && unscheduledJobs.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
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
                      {(['day', 'week', 'month'] as const).map(mode => (
                        <Button
                          key={mode}
                          variant={viewMode === mode ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => handleViewModeChange(mode)}
                          className="px-3 py-1 capitalize"
                        >
                          {mode}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleNavigate('prev')}
                      disabled={jobsLoading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous {viewMode === 'day' ? 'Day' : viewMode === 'week' ? 'Week' : 'Month'}
                    </Button>
                    
                    <div className="text-center min-w-[200px]">
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
                      onClick={() => handleNavigate('next')}
                      disabled={jobsLoading}
                    >
                      Next {viewMode === 'day' ? 'Day' : viewMode === 'week' ? 'Week' : 'Month'}
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Calendar Grid */}
            <Card className={isDragOverCalendar ? 'ring-2 ring-blue-400' : ''}>
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
                        {selectedDateJobs.length} job{selectedDateJobs.length !== 1 ? 's' : ''} scheduled
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      {selectedDateJobs.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No jobs scheduled for this date</p>
                          <p className="text-sm mt-2">Drag jobs from the sidebar to schedule them</p>
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
                                      {job.scheduledDate ? formatTime(job.scheduledDate.toString()) : 'No time set'}
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
                                  <Badge variant="outline" className={`text-xs ${getStatusColor(job.status)}`}>
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
                      {weekdays.map((day, index) => (
                        <div key={day} className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-center font-medium text-sm">
                          <div>{day}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {weekDates[index]?.getDate()}
                          </div>
                        </div>
                      ))}
                      
                      {/* Week Cells */}
                      {weekDates.map(date => {
                        const dateJobs = getJobsForDate(date);
                        
                        return (
                          <DroppableCalendarCell
                            key={date.toISOString()}
                            date={date}
                            jobs={dateJobs}
                            isToday={isToday(date)}
                            isCurrentMonth={true}
                            onDateClick={handleDateClick}
                            onEventClick={handleEventClick}
                          />
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
                        
                        return (
                          <DroppableCalendarCell
                            key={date.toISOString()}
                            date={date}
                            jobs={dateJobs}
                            isToday={isToday(date)}
                            isCurrentMonth={isCurrentMonth(date, selectedDate)}
                            onDateClick={handleDateClick}
                            onEventClick={handleEventClick}
                          />
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
          <Button 
            onClick={() => setSelectedDate(new Date())} 
            variant="outline"
            disabled={jobsLoading}
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Go to Today
          </Button>
          
          <Dialog open={isScheduleJobOpen} onOpenChange={setIsScheduleJobOpen}>
            <DialogTrigger asChild>
              <Button disabled={customersLoading || createJobMutation.isPending}>
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

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={createJobMutation.isPending}
                  >
                    {createJobMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Scheduling...
                      </>
                    ) : (
                      "Schedule Job"
                    )}
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
              <DialogTitle>
                Jobs for {jobModalData && jobModalData.length > 0 && jobModalData[0].scheduledDate
                  ? new Date(jobModalData[0].scheduledDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : 'Selected Date'
                }
              </DialogTitle>
              <DialogDescription>
                {jobModalData?.length || 0} job{jobModalData?.length !== 1 ? 's' : ''} scheduled
              </DialogDescription>
            </DialogHeader>
            {jobModalData && (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {jobModalData.map(job => (
                  <div 
                    key={job.id} 
                    className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    onClick={() => {
                      setSelectedJob(job);
                      setIsJobDetailOpen(true);
                      setIsJobModalOpen(false);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getServiceTypeIcon(job.serviceType)}
                        <div>
                          <h4 className="font-medium">{job.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {job.customer.firstName} {job.customer.lastName}
                          </p>
                          {job.description && (
                            <p className="text-sm text-gray-500 mt-1">{job.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            {job.scheduledDate && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatTime(job.scheduledDate.toString())}
                              </span>
                            )}
                            {job.estimatedValue && (
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                ${job.estimatedValue}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className={`text-xs ${getStatusColor(job.status)}`}>
                        {job.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Individual Job Detail Modal */}
        <Dialog open={isJobDetailOpen} onOpenChange={setIsJobDetailOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedJob && getServiceTypeIcon(selectedJob.serviceType)}
                {selectedJob?.title || 'Job Details'}
              </DialogTitle>
              <DialogDescription>
                Complete job information and details
              </DialogDescription>
            </DialogHeader>
            {selectedJob && (
              <div className="space-y-6">
                {/* Job Overview */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Customer</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>{selectedJob.customer.firstName} {selectedJob.customer.lastName}</span>
                    </div>
                    {selectedJob.customer.phone && (
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                        <Phone className="h-3 w-3 text-gray-400" />
                        <span>{selectedJob.customer.phone}</span>
                      </div>
                    )}
                    {selectedJob.customer.email && (
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                        <span>@</span>
                        <span>{selectedJob.customer.email}</span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status & Value</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={getStatusColor(selectedJob.status)}>
                        {selectedJob.status}
                      </Badge>
                      {selectedJob.estimatedValue && (
                        <span className="text-lg font-semibold text-green-600">
                          ${selectedJob.estimatedValue}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Schedule Information */}
                {selectedJob.scheduledDate && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Schedule</Label>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                        <span>{new Date(selectedJob.scheduledDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{formatTime(selectedJob.scheduledDate.toString())}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Location Information */}
                {selectedJob.customer.address && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Location</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>
                        {selectedJob.customer.address}
                        {selectedJob.customer.city && `, ${selectedJob.customer.city}`}
                        {selectedJob.customer.state && `, ${selectedJob.customer.state}`}
                        {selectedJob.customer.zipCode && ` ${selectedJob.customer.zipCode}`}
                      </span>
                    </div>
                  </div>
                )}

                {/* Job Description */}
                {selectedJob.description && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</Label>
                    <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{selectedJob.description}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    onClick={() => {
                      setIsJobDetailOpen(false);
                      setLocation(`/jobs?edit=${selectedJob.id}`);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Job
                  </Button>
                  <Button 
                    onClick={() => {
                      setIsJobDetailOpen(false);
                      setLocation(`/jobs?view=${selectedJob.id}`);
                    }}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Full Details
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Time Picker Dialog */}
        <Dialog open={isTimePickerOpen} onOpenChange={setIsTimePickerOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule Job</DialogTitle>
              <DialogDescription>
                Choose a time for {pendingSchedule && new Date(pendingSchedule.targetDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </DialogDescription>
            </DialogHeader>
            <Form {...timePickerForm}>
              <form onSubmit={timePickerForm.handleSubmit(confirmSchedule)} className="space-y-4">
                <FormField
                  control={timePickerForm.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time</FormLabel>
                      <FormControl>
                        <Input 
                          type="time" 
                          {...field}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsTimePickerOpen(false);
                      setPendingSchedule(null);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={updateJobMutation.isPending}
                  >
                    {updateJobMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Scheduling...
                      </>
                    ) : (
                      'Schedule Job'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeId ? (
          (() => {
            // Handle different drag types
            let draggedJob: (Job & { customer: Customer }) | undefined;
            
            if (activeId.startsWith('calendar-job-')) {
              // Extract job ID from calendar event
              const jobId = parseInt(activeId.replace('calendar-job-', ''));
              draggedJob = jobs.find(job => job.id === jobId);
            } else {
              // Regular job from unscheduled list
              draggedJob = jobs.find(job => job.id.toString() === activeId);
            }
            
            return draggedJob ? (
              <DraggableJobCard 
                job={draggedJob} 
                isOverlay 
              />
            ) : null;
          })()
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
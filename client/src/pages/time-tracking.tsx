import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Play, Square, Plus, Timer, Calendar, DollarSign, MapPin, Navigation, AlertTriangle, CheckCircle, Smartphone, Monitor } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertTimeEntrySchema, type InsertTimeEntry, type TimeEntry, type Employee, type WorkOrder, type Job } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInMinutes, differenceInHours } from "date-fns";
import { getCurrentLocation, checkGeofence, reverseGeocode, formatLocation, type LocationData } from "@/lib/location";
import MobileTimeTracker from "@/components/mobile-time-tracker";

export default function TimeTracking() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeTimers, setActiveTimers] = useState<{[key: number]: Date}>({});
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch data
  const { data: timeEntries, isLoading: isLoadingEntries } = useQuery<(TimeEntry & { employee: Employee; workOrder?: WorkOrder; job?: Job })[]>({
    queryKey: ['/api/time-entries'],
  });

  const { data: employees } = useQuery<Employee[]>({
    queryKey: ['/api/employees'],
  });

  const { data: workOrders } = useQuery<(WorkOrder & { customer: any; job: Job })[]>({
    queryKey: ['/api/work-orders'],
  });

  const { data: jobs } = useQuery<(Job & { customer: any })[]>({
    queryKey: ['/api/jobs'],
  });

  // Create time entry mutation
  const createTimeEntry = useMutation({
    mutationFn: async (timeEntry: InsertTimeEntry) => {
      const response = await fetch('/api/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(timeEntry),
      });
      if (!response.ok) throw new Error('Failed to create time entry');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/time-entries'] });
      setIsCreateOpen(false);
      toast({ title: "Success", description: "Time entry created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create time entry", variant: "destructive" });
    },
  });

  // Clock in mutation
  const clockIn = useMutation({
    mutationFn: async ({ employeeId, workOrderId, jobId }: { employeeId: number; workOrderId?: number; jobId?: number }) => {
      const timeEntry = {
        employeeId,
        workOrderId: workOrderId || null,
        jobId: jobId || null,
        clockInTime: new Date(),
      };
      const response = await fetch('/api/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(timeEntry),
      });
      if (!response.ok) throw new Error('Failed to clock in');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/time-entries'] });
      setActiveTimers(prev => ({ ...prev, [data.employeeId]: new Date(data.clockInTime) }));
      toast({ title: "Success", description: "Clocked in successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to clock in", variant: "destructive" });
    },
  });

  // Clock out mutation
  const clockOut = useMutation({
    mutationFn: async (timeEntryId: number) => {
      const response = await fetch(`/api/time-entries/${timeEntryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clockOutTime: new Date(),
        }),
      });
      if (!response.ok) throw new Error('Failed to clock out');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/time-entries'] });
      setActiveTimers(prev => {
        const newTimers = { ...prev };
        delete newTimers[data.employeeId];
        return newTimers;
      });
      toast({ title: "Success", description: "Clocked out successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to clock out", variant: "destructive" });
    },
  });

  // Form setup
  const form = useForm<InsertTimeEntry>({
    resolver: zodResolver(insertTimeEntrySchema),
    defaultValues: {
      employeeId: 0,
      clockInTime: new Date(),
      clockOutTime: undefined,
      workOrderId: null,
      jobId: null,
      description: "",
      hourlyRate: null,
      gpsLocation: "",
    },
  });

  const onSubmit = async (data: InsertTimeEntry) => {
    // Calculate total minutes if both times are provided
    if (data.clockOutTime) {
      const totalMinutes = differenceInMinutes(new Date(data.clockOutTime), new Date(data.clockInTime));
      data.totalMinutes = totalMinutes;
    }
    
    // Convert empty strings to null for numeric fields
    const cleanedData = {
      ...data,
      hourlyRate: data.hourlyRate === "" ? null : data.hourlyRate,
    };

    // Add current location if available
    if (currentLocation) {
      cleanedData.clockInLatitude = currentLocation.latitude.toString();
      cleanedData.clockInLongitude = currentLocation.longitude.toString();
      cleanedData.locationAccuracy = currentLocation.accuracy.toString();
      if (currentLocation.address) {
        cleanedData.clockInAddress = currentLocation.address;
      }
    }
    
    createTimeEntry.mutate(cleanedData);
  };

  // Get current GPS location
  const captureLocation = async () => {
    setLocationLoading(true);
    setLocationError(null);
    
    try {
      const location = await getCurrentLocation();
      const address = await reverseGeocode(location.latitude, location.longitude);
      
      const locationWithAddress = { ...location, address };
      setCurrentLocation(locationWithAddress);
      
      toast({
        title: "Location captured",
        description: `${formatLocation(location.latitude, location.longitude, location.accuracy)}`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get location';
      setLocationError(errorMessage);
      toast({
        title: "Location error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLocationLoading(false);
    }
  };

  // Get active time entry for an employee
  const getActiveTimeEntry = (employeeId: number) => {
    return timeEntries?.find(entry => entry.employeeId === employeeId && !entry.clockOutTime);
  };

  // Calculate elapsed time for active timer
  const getElapsedTime = (startTime: Date) => {
    const now = new Date();
    const elapsed = differenceInMinutes(now, startTime);
    const hours = Math.floor(elapsed / 60);
    const minutes = elapsed % 60;
    return `${hours}h ${minutes}m`;
  };

  // Update active timers every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTimers(prev => ({ ...prev })); // Force re-render
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Initialize active timers from existing data
  useEffect(() => {
    if (timeEntries) {
      const active: {[key: number]: Date} = {};
      timeEntries.forEach(entry => {
        if (!entry.clockOutTime) {
          active[entry.employeeId] = new Date(entry.clockInTime);
        }
      });
      setActiveTimers(active);
    }
  }, [timeEntries]);

  const formatCurrency = (amount: string | null) => {
    if (!amount) return '$0.00';
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return '0h 0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (isLoadingEntries) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const todayEntries = timeEntries?.filter(entry => {
    try {
      const entryDate = new Date(entry.clockInTime);
      if (isNaN(entryDate.getTime())) return false;
      const today = new Date();
      return entryDate.toDateString() === today.toDateString();
    } catch {
      return false;
    }
  }) || [];

  const totalHoursToday = todayEntries.reduce((sum, entry) => {
    return sum + (entry.totalMinutes || 0);
  }, 0);

  const activeEmployees = employees?.filter(emp => activeTimers[emp.id]) || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="h-6 w-6" />
            Time Tracking
          </h1>
          <p className="text-gray-600">Simple mobile tracking and detailed management</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Time Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Time Entry</DialogTitle>
              <DialogDescription>
                Create a manual time entry for an employee.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="employeeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employee</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select employee" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {employees?.map((employee) => (
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

                <FormField
                  control={form.control}
                  name="workOrderId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Order (Optional)</FormLabel>
                      <Select onValueChange={(value) => field.onChange(value === "none" ? null : parseInt(value))} value={field.value?.toString() || "none"}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select work order" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No work order</SelectItem>
                          {workOrders?.map((workOrder) => (
                            <SelectItem key={workOrder.id} value={workOrder.id.toString()}>
                              {workOrder.workOrderNumber} - {workOrder.title}
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job (Optional)</FormLabel>
                      <Select onValueChange={(value) => field.onChange(value === "none" ? null : parseInt(value))} value={field.value?.toString() || "none"}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select job" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No job</SelectItem>
                          {jobs?.map((job) => (
                            <SelectItem key={job.id} value={job.id.toString()}>
                              {job.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* GPS Location Section */}
                <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location Verification
                    </Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={captureLocation}
                      disabled={locationLoading}
                    >
                      {locationLoading ? (
                        <>
                          <Navigation className="h-4 w-4 mr-2 animate-spin" />
                          Getting Location...
                        </>
                      ) : (
                        <>
                          <Navigation className="h-4 w-4 mr-2" />
                          Capture GPS
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {currentLocation && (
                    <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded">
                      <CheckCircle className="h-4 w-4" />
                      <span>{currentLocation.address || formatLocation(currentLocation.latitude, currentLocation.longitude, currentLocation.accuracy)}</span>
                    </div>
                  )}
                  
                  {locationError && (
                    <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 p-2 rounded">
                      <AlertTriangle className="h-4 w-4" />
                      <span>{locationError}</span>
                    </div>
                  )}
                </div>

                {/* Quick Time Presets */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Quick Time Entry</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={async () => {
                        const now = new Date();
                        const nineAM = new Date(now);
                        nineAM.setHours(9, 0, 0, 0);
                        const fivePM = new Date(now);
                        fivePM.setHours(17, 0, 0, 0);
                        form.setValue("clockInTime", nineAM);
                        form.setValue("clockOutTime", fivePM);
                        if (!currentLocation) await captureLocation();
                      }}
                    >
                      9 AM - 5 PM Today
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={async () => {
                        const now = new Date();
                        const eightAM = new Date(now);
                        eightAM.setHours(8, 0, 0, 0);
                        const fourPM = new Date(now);
                        fourPM.setHours(16, 0, 0, 0);
                        form.setValue("clockInTime", eightAM);
                        form.setValue("clockOutTime", fourPM);
                        if (!currentLocation) await captureLocation();
                      }}
                    >
                      8 AM - 4 PM Today
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={async () => {
                        const now = new Date();
                        now.setMinutes(now.getMinutes() - (now.getMinutes() % 15)); // Round to 15 min
                        form.setValue("clockInTime", now);
                        form.setValue("clockOutTime", undefined);
                        if (!currentLocation) await captureLocation();
                      }}
                    >
                      <Navigation className="h-4 w-4 mr-1" />
                      Clock In Now
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={async () => {
                        const now = new Date();
                        now.setMinutes(now.getMinutes() - (now.getMinutes() % 15)); // Round to 15 min
                        form.setValue("clockOutTime", now);
                        if (!currentLocation) await captureLocation();
                      }}
                    >
                      <Navigation className="h-4 w-4 mr-1" />
                      Clock Out Now
                    </Button>
                  </div>
                </div>

                {/* Manual Time Entry */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Clock In</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name="clockInTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                type="date" 
                                value={field.value ? format(new Date(field.value), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")}
                                onChange={(e) => {
                                  if (e.target.value) {
                                    const currentTime = field.value ? format(new Date(field.value), "HH:mm") : "09:00";
                                    const newDate = new Date(`${e.target.value}T${currentTime}`);
                                    field.onChange(newDate);
                                  }
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="clockInTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                type="time" 
                                value={field.value ? format(new Date(field.value), "HH:mm") : "09:00"}
                                onChange={(e) => {
                                  if (e.target.value) {
                                    const currentDate = field.value ? format(new Date(field.value), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");
                                    const newDate = new Date(`${currentDate}T${e.target.value}`);
                                    field.onChange(newDate);
                                  }
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Clock Out (Optional)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name="clockOutTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                type="date" 
                                value={field.value ? format(new Date(field.value), "yyyy-MM-dd") : ""}
                                onChange={(e) => {
                                  if (e.target.value) {
                                    const currentTime = field.value ? format(new Date(field.value), "HH:mm") : "17:00";
                                    const newDate = new Date(`${e.target.value}T${currentTime}`);
                                    field.onChange(newDate);
                                  } else {
                                    field.onChange(undefined);
                                  }
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="clockOutTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input 
                                type="time" 
                                value={field.value ? format(new Date(field.value), "HH:mm") : ""}
                                onChange={(e) => {
                                  if (e.target.value) {
                                    const currentDate = field.value ? format(new Date(field.value), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");
                                    const newDate = new Date(`${currentDate}T${e.target.value}`);
                                    field.onChange(newDate);
                                  } else {
                                    field.onChange(undefined);
                                  }
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="hourlyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hourly Rate</FormLabel>
                      <FormControl>
                        <Input placeholder="25.00" {...field} value={field.value || ""} />
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
                        <Textarea 
                          placeholder="Work performed..."
                          className="min-h-[80px]"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createTimeEntry.isPending}>
                    {createTimeEntry.isPending ? "Creating..." : "Create Entry"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabbed Interface */}
      <Tabs defaultValue="mobile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="mobile" className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Quick Tracker
          </TabsTrigger>
          <TabsTrigger value="detailed" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Detailed View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mobile" className="space-y-6">
          {/* Mobile Time Tracker */}
          <div className="flex justify-center">
            <MobileTimeTracker 
              employee={employees?.[0]} 
              className="max-w-md"
            />
          </div>

          {/* Quick Stats for Mobile */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Timer className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active</p>
                    <p className="text-2xl font-bold">{activeEmployees.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Today</p>
                    <p className="text-2xl font-bold">{formatDuration(totalHoursToday)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Entries</p>
                    <p className="text-2xl font-bold">{todayEntries.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cost</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(
                        todayEntries.reduce((sum, entry) => {
                          const hours = (entry.totalMinutes || 0) / 60;
                          const rate = parseFloat(entry.hourlyRate || '0');
                          return sum + (hours * rate);
                        }, 0).toString()
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Timer className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Now</p>
                    <p className="text-2xl font-bold">{activeEmployees.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Today's Hours</p>
                    <p className="text-2xl font-bold">{formatDuration(totalHoursToday)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Today's Entries</p>
                    <p className="text-2xl font-bold">{todayEntries.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Labor Cost Today</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(
                        todayEntries.reduce((sum, entry) => {
                          const hours = (entry.totalMinutes || 0) / 60;
                          const rate = parseFloat(entry.hourlyRate || '0');
                          return sum + (hours * rate);
                        }, 0).toString()
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Active Timers */}
          {activeEmployees.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Active Timers
                </CardTitle>
                <CardDescription>
                  Employees currently clocked in
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeEmployees.map((employee) => {
                    const activeEntry = getActiveTimeEntry(employee.id);
                    const startTime = activeTimers[employee.id];
                    return (
                      <Card key={employee.id} className="bg-green-50 border-green-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{employee.firstName} {employee.lastName}</div>
                              <div className="text-sm text-gray-600">
                                Started: {startTime ? format(startTime, 'HH:mm') : ''}
                              </div>
                              <div className="text-lg font-bold text-green-600">
                                {startTime ? getElapsedTime(startTime) : ''}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => activeEntry && clockOut.mutate(activeEntry.id)}
                              disabled={clockOut.isPending}
                            >
                              <Square className="h-3 w-3 mr-1" />
                              Clock Out
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Time Entries */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Time Entries</CardTitle>
              <CardDescription>
                Latest time tracking records
              </CardDescription>
            </CardHeader>
            <CardContent>
              {timeEntries && timeEntries.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Clock In</TableHead>
                      <TableHead>Clock Out</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Work Order/Job</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timeEntries.slice(0, 10).map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <div className="font-medium">
                            {(() => {
                              const employee = employees?.find(emp => emp.id === entry.employeeId);
                              return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee';
                            })()}
                          </div>
                        </TableCell>
                        <TableCell>
                          {(() => {
                            try {
                              const date = new Date(entry.clockInTime);
                              return isNaN(date.getTime()) ? 'Invalid Date' : format(date, 'MMM dd, yyyy');
                            } catch {
                              return 'Invalid Date';
                            }
                          })()}
                        </TableCell>
                        <TableCell>
                          {(() => {
                            try {
                              const date = new Date(entry.clockInTime);
                              return isNaN(date.getTime()) ? '--:--' : format(date, 'HH:mm');
                            } catch {
                              return '--:--';
                            }
                          })()}
                        </TableCell>
                        <TableCell>
                          {entry.clockOutTime ? (() => {
                            try {
                              const date = new Date(entry.clockOutTime);
                              return isNaN(date.getTime()) ? '--:--' : format(date, 'HH:mm');
                            } catch {
                              return '--:--';
                            }
                          })() : '-'}
                        </TableCell>
                        <TableCell>
                          {formatDuration(entry.totalMinutes)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {entry.workOrderId ? (
                              <div>
                                {(() => {
                                  const workOrder = workOrders?.find(wo => wo.id === entry.workOrderId);
                                  return workOrder ? workOrder.workOrderNumber : `WO-${entry.workOrderId}`;
                                })()}
                              </div>
                            ) : entry.jobId ? (
                              <div>
                                {(() => {
                                  const job = jobs?.find(j => j.id === entry.jobId);
                                  return job ? job.title : `Job-${entry.jobId}`;
                                })()}
                              </div>
                            ) : (
                              <span className="text-gray-400">No assignment</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {entry.clockInLatitude && entry.clockInLongitude ? (
                              <>
                                <MapPin className="h-4 w-4 text-green-600" />
                                <div className="text-xs">
                                  <div className="text-green-700 font-medium">
                                    {entry.clockInAddress || `${parseFloat(entry.clockInLatitude).toFixed(4)}, ${parseFloat(entry.clockInLongitude).toFixed(4)}`}
                                  </div>
                                  {entry.locationAccuracy && (
                                    <div className="text-gray-500">±{Math.round(parseFloat(entry.locationAccuracy))}m</div>
                                  )}
                                </div>
                              </>
                            ) : (
                              <span className="text-gray-400 text-xs">No location</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatCurrency(entry.hourlyRate)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={entry.clockOutTime ? "default" : "secondary"}>
                            {entry.clockOutTime ? "Completed" : "Active"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No time entries yet</h3>
                  <p className="text-gray-600">Start tracking time for your employees.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
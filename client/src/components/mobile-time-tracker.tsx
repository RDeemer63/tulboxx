import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Square, Coffee, Clock, MapPin, CheckCircle, AlertTriangle, Target, Users } from "lucide-react";
import { type TimeEntry, type Employee, type Job, type WorkOrder } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { format, differenceInMinutes } from "date-fns";
import { getCurrentLocation, type LocationData } from "@/lib/location";

interface MobileTimeTrackerProps {
  employee?: Employee;
  className?: string;
}

export default function MobileTimeTracker({ employee, className = "" }: MobileTimeTrackerProps) {
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [showJobSelection, setShowJobSelection] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current time entries
  const { data: timeEntries } = useQuery<(TimeEntry & { employee: Employee; workOrder?: WorkOrder; job?: (Job & { customer: any }) })[]>({
    queryKey: ['/api/time-entries'],
  });

  // Fetch today's scheduled jobs
  const { data: todayJobs } = useQuery<(Job & { customer: any })[]>({
    queryKey: ['/api/jobs'],
    select: (jobs) => jobs?.filter(job => {
      if (!job.scheduledDate) return false;
      const jobDate = new Date(job.scheduledDate).toDateString();
      const today = new Date().toDateString();
      return jobDate === today;
    }) || [],
  });

  // Get active time entry for current employee
  const activeEntry = timeEntries?.find(entry => 
    entry.employeeId === employee?.id && !entry.clockOutTime
  );

  // Get elapsed time for active timer
  const getElapsedTime = (startTime: string | Date) => {
    const now = new Date();
    const start = new Date(startTime);
    const elapsed = differenceInMinutes(now, start);
    const hours = Math.floor(elapsed / 60);
    const minutes = elapsed % 60;
    return { hours, minutes, totalMinutes: elapsed };
  };

  // Smart job assignment based on GPS and schedule
  const findBestJobAssignment = (location: LocationData | null, jobs: (Job & { customer: any })[]): Job | null => {
    if (!location || !jobs.length) return jobs[0] || null;

    // Priority 1: Jobs with GPS coordinates within 500m
    const nearbyJobs = jobs.filter(job => {
      if (!job.latitude || !job.longitude) return false;
      
      const jobLat = parseFloat(job.latitude);
      const jobLng = parseFloat(job.longitude);
      
      // Simple distance calculation (rough approximation)
      const latDiff = Math.abs(location.latitude - jobLat);
      const lngDiff = Math.abs(location.longitude - jobLng);
      const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111000; // Convert to meters
      
      return distance <= 500; // Within 500 meters
    });

    if (nearbyJobs.length > 0) {
      return nearbyJobs[0]; // Return closest job
    }

    // Priority 2: Jobs scheduled for today without GPS coordinates
    const todayJobsNoGPS = jobs.filter(job => !job.latitude);
    if (todayJobsNoGPS.length > 0) {
      return todayJobsNoGPS[0];
    }

    // Fallback: First job of the day
    return jobs[0] || null;
  };

  // Clock in mutation
  const clockIn = useMutation({
    mutationFn: async () => {
      setIsLocating(true);
      let location: LocationData | null = null;
      
      try {
        location = await getCurrentLocation();
        setCurrentLocation(location);
      } catch (error) {
        console.warn("Location access denied, proceeding without GPS");
      }

      // Smart job assignment - use manual selection if available, otherwise auto-detect
      const assignedJob = selectedJobId 
        ? todayJobs?.find(job => job.id === selectedJobId) || null
        : findBestJobAssignment(location, todayJobs || []);

      const timeEntry = {
        employeeId: employee?.id || 1,
        jobId: assignedJob?.id || null,
        workOrderId: null,
        clockInTime: new Date(),
        clockInLatitude: location?.latitude?.toString(),
        clockInLongitude: location?.longitude?.toString(),
        locationAccuracy: location?.accuracy?.toString(),
        hourlyRate: employee?.hourlyRate || "25.00",
      };

      const response = await fetch('/api/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(timeEntry),
      });
      
      if (!response.ok) throw new Error('Failed to clock in');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/time-entries'] });
      const assignedJob = selectedJobId 
        ? todayJobs?.find(job => job.id === selectedJobId)
        : findBestJobAssignment(currentLocation, todayJobs || []);
      
      let description = "Timer started";
      if (assignedJob) {
        description = `Auto-assigned to: ${assignedJob.title}`;
      } else if (currentLocation) {
        description = "Location verified - no nearby jobs";
      }
      
      toast({ 
        title: "Clocked In", 
        description
      });
      setIsLocating(false);
      setSelectedJobId(null);
      setShowJobSelection(false);
    },
    onError: () => {
      toast({ 
        title: "Clock In Failed", 
        description: "Please try again", 
        variant: "destructive" 
      });
    },
    onSettled: () => {
      setIsLocating(false);
    },
  });

  // Clock out mutation
  const clockOut = useMutation({
    mutationFn: async () => {
      if (!activeEntry) throw new Error('No active time entry');
      
      setIsLocating(true);
      let location: LocationData | null = null;
      
      try {
        location = await getCurrentLocation();
      } catch (error) {
        console.warn("Location access denied, proceeding without GPS");
      }

      const clockOutTime = new Date();
      const totalMinutes = differenceInMinutes(clockOutTime, new Date(activeEntry.clockInTime));

      const response = await fetch(`/api/time-entries/${activeEntry.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clockOutTime,
          totalMinutes,
          clockOutLatitude: location?.latitude?.toString(),
          clockOutLongitude: location?.longitude?.toString(),
        }),
      });
      
      if (!response.ok) throw new Error('Failed to clock out');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/time-entries'] });
      const elapsed = getElapsedTime(activeEntry!.clockInTime);
      toast({ 
        title: "Clocked Out", 
        description: `Worked ${elapsed.hours}h ${elapsed.minutes}m` 
      });
    },
    onError: () => {
      toast({ 
        title: "Clock Out Failed", 
        description: "Please try again", 
        variant: "destructive" 
      });
    },
    onSettled: () => {
      setIsLocating(false);
    },
  });

  // Update timer every minute
  useEffect(() => {
    if (!activeEntry) return;
    
    const interval = setInterval(() => {
      // Force re-render to update elapsed time
      queryClient.invalidateQueries({ queryKey: ['/api/time-entries'] });
    }, 60000);
    
    return () => clearInterval(interval);
  }, [activeEntry, queryClient]);

  const elapsed = activeEntry ? getElapsedTime(activeEntry.clockInTime) : null;
  const isWorking = !!activeEntry;

  return (
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <CardHeader className="text-center pb-4">
        <CardTitle className="flex items-center justify-center gap-2">
          <Clock className="h-5 w-5" />
          Time Tracker
        </CardTitle>
        {employee && (
          <p className="text-sm text-gray-600">{employee.firstName} {employee.lastName}</p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="text-center">
          {isWorking ? (
            <div className="space-y-2">
              <Badge variant="default" className="bg-green-600 text-white">
                <Play className="h-3 w-3 mr-1" />
                Working
              </Badge>
              <div className="text-3xl font-bold text-green-600">
                {elapsed ? `${elapsed.hours}:${elapsed.minutes.toString().padStart(2, '0')}` : '0:00'}
              </div>
              <p className="text-sm text-gray-600">
                Started at {activeEntry ? format(new Date(activeEntry.clockInTime), 'HH:mm') : ''}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Badge variant="secondary">
                <Square className="h-3 w-3 mr-1" />
                Not Working
              </Badge>
              <div className="text-3xl font-bold text-gray-400">0:00</div>
              <p className="text-sm text-gray-600">Ready to start</p>
            </div>
          )}
        </div>

        {/* Current Job Assignment - Show when working */}
        {isWorking && activeEntry && (
          <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">Current Assignment</span>
            </div>
            {activeEntry.job ? (
              <div className="text-sm text-green-600 dark:text-green-400">
                <span className="font-medium">{activeEntry.job.title}</span>
                <div className="text-xs text-green-500 mt-1">
                  {activeEntry.job.customer?.firstName} {activeEntry.job.customer?.lastName}
                  {activeEntry.job.address && <div className="truncate">{activeEntry.job.address}</div>}
                </div>
              </div>
            ) : (
              <div className="text-sm text-green-600 dark:text-green-400">
                <AlertTriangle className="h-3 w-3 inline mr-1" />
                No job assigned - general time
              </div>
            )}
          </div>
        )}

        {/* Location Status */}
        {currentLocation && (
          <div className="flex items-center justify-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded">
            <MapPin className="h-4 w-4" />
            <span>Location verified</span>
          </div>
        )}

        {/* Smart Job Assignment Preview */}
        {!isWorking && todayJobs && todayJobs.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Smart Assignment</span>
            </div>
            
            {(() => {
              const assignedJob = selectedJobId 
                ? todayJobs.find(job => job.id === selectedJobId)
                : findBestJobAssignment(currentLocation, todayJobs);
              
              if (assignedJob) {
                return (
                  <div className="space-y-2">
                    <div className="text-sm text-blue-600 dark:text-blue-400">
                      Will assign to: <span className="font-medium">{assignedJob.title}</span>
                    </div>
                    <div className="text-xs text-blue-500">
                      {assignedJob.customer?.firstName} {assignedJob.customer?.lastName}
                      {assignedJob.address && <div className="truncate">{assignedJob.address}</div>}
                    </div>
                    {!selectedJobId && currentLocation && assignedJob.latitude && (
                      <div className="text-xs text-blue-500">
                        <CheckCircle className="h-3 w-3 inline mr-1" />
                        Auto-detected from GPS location
                      </div>
                    )}
                  </div>
                );
              } else {
                return (
                  <div className="text-sm text-blue-600 dark:text-blue-400">
                    <AlertTriangle className="h-3 w-3 inline mr-1" />
                    No job will be assigned
                  </div>
                );
              }
            })()}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowJobSelection(!showJobSelection)}
              className="mt-2 h-8 text-xs text-blue-600 hover:text-blue-700"
            >
              {showJobSelection ? 'Hide' : 'Change'} Job Selection
            </Button>
          </div>
        )}

        {/* Manual Job Selection */}
        {!isWorking && showJobSelection && todayJobs && todayJobs.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Job</span>
            </div>
            
            <Select value={selectedJobId?.toString() || "auto"} onValueChange={(value) => setSelectedJobId(value === "auto" ? null : parseInt(value))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a job..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto-detect from location</SelectItem>
                {todayJobs.map((job) => (
                  <SelectItem key={job.id} value={job.id.toString()}>
                    <div className="flex flex-col">
                      <span className="font-medium">{job.title}</span>
                      <span className="text-xs text-gray-500">
                        {job.customer?.firstName} {job.customer?.lastName}
                      </span>
                      {job.address && (
                        <span className="text-xs text-gray-400 truncate">{job.address}</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Main Action Buttons */}
        <div className="space-y-3">
          {!isWorking ? (
            <Button 
              onClick={() => clockIn.mutate()}
              disabled={clockIn.isPending || isLocating}
              className="w-full h-16 text-lg bg-green-600 hover:bg-green-700"
            >
              {clockIn.isPending || isLocating ? (
                <>
                  <Play className="h-5 w-5 mr-2 animate-pulse" />
                  {isLocating ? "Getting Location..." : "Clocking In..."}
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 mr-2" />
                  Clock In
                </>
              )}
            </Button>
          ) : (
            <>
              <Button 
                onClick={() => clockOut.mutate()}
                disabled={clockOut.isPending || isLocating}
                className="w-full h-16 text-lg bg-red-600 hover:bg-red-700"
              >
                {clockOut.isPending || isLocating ? (
                  <>
                    <Square className="h-5 w-5 mr-2 animate-pulse" />
                    {isLocating ? "Getting Location..." : "Clocking Out..."}
                  </>
                ) : (
                  <>
                    <Square className="h-5 w-5 mr-2" />
                    Clock Out
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full h-12"
                disabled
              >
                <Coffee className="h-4 w-4 mr-2" />
                Break (Coming Soon)
              </Button>
            </>
          )}
        </div>

        {/* Today's Assignment */}
        {todayJobs && todayJobs.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 text-sm font-medium text-blue-800 mb-1">
              <CheckCircle className="h-4 w-4" />
              Today's Assignment
            </div>
            <p className="text-sm text-blue-700">
              {todayJobs[0].title} - {todayJobs[0].customer?.firstName} {todayJobs[0].customer?.lastName}
            </p>
            {todayJobs[0].address && (
              <p className="text-xs text-blue-600 mt-1">{todayJobs[0].address}</p>
            )}
          </div>
        )}

        {/* Overtime Warning */}
        {elapsed && elapsed.totalMinutes > 480 && ( // 8 hours
          <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400 p-2 rounded">
            <AlertTriangle className="h-4 w-4" />
            <span>Overtime: {Math.floor((elapsed.totalMinutes - 480) / 60)}h {(elapsed.totalMinutes - 480) % 60}m</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
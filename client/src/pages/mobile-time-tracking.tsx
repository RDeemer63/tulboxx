import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Clock,
  Play,
  Square,
  MapPin,
  Briefcase,
  Calendar,
  Timer
} from "lucide-react";
import type { TimeEntry, Job, Customer } from "@shared/schema";

export default function MobileTimeTracking() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isClockingIn, setIsClockingIn] = useState(false);
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: timeEntries = [], isLoading } = useQuery<TimeEntry[]>({
    queryKey: ["/api/time-entries"],
  });

  const { data: jobs = [] } = useQuery<(Job & { customer: Customer })[]>({
    queryKey: ["/api/jobs"],
  });

  // Clock in/out mutation
  const clockMutation = useMutation({
    mutationFn: async ({ action, jobId }: { action: 'in' | 'out', jobId?: number }) => {
      const response = await fetch('/api/time-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: 1, // This should come from auth context
          jobId,
          clockInTime: action === 'in' ? new Date().toISOString() : undefined,
          clockOutTime: action === 'out' ? new Date().toISOString() : undefined,
        }),
      });
      if (!response.ok) throw new Error('Failed to clock ' + action);
      return response.json();
    },
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-entries"] });
      setIsClockingIn(false);
      toast({
        title: `Clocked ${action}`,
        description: `Successfully clocked ${action} at ${currentTime.toLocaleTimeString()}`,
      });
    },
  });

  // Find active time entry
  useEffect(() => {
    const active = timeEntries.find(entry => entry.clockInTime && !entry.clockOutTime);
    setActiveEntry(active || null);
  }, [timeEntries]);

  // Calculate duration for active session
  const getActiveDuration = () => {
    if (!activeEntry?.clockInTime) return "00:00:00";
    
    const start = new Date(activeEntry.clockInTime);
    const now = currentTime;
    const diff = now.getTime() - start.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Get recent time entries (last 7 days)
  const recentEntries = timeEntries
    .filter(entry => {
      const entryDate = new Date(entry.clockInTime);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return entryDate >= weekAgo;
    })
    .sort((a, b) => new Date(b.clockInTime).getTime() - new Date(a.clockInTime).getTime())
    .slice(0, 10);

  // Calculate total hours for today
  const todayHours = timeEntries
    .filter(entry => {
      const entryDate = new Date(entry.clockInTime);
      const today = new Date();
      return entryDate.toDateString() === today.toDateString() && entry.clockOutTime;
    })
    .reduce((total, entry) => {
      const start = new Date(entry.clockInTime);
      const end = new Date(entry.clockOutTime!);
      return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 sticky top-0 z-10">
        <h1 className="text-xl font-bold mb-2">Time Tracking</h1>
        <div className="text-center">
          <div className="text-3xl font-mono font-bold">
            {currentTime.toLocaleTimeString()}
          </div>
          <div className="text-blue-100 text-sm">
            {currentTime.toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Active Session */}
      {activeEntry ? (
        <div className="p-4">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6 text-center">
              <div className="mb-4">
                <Timer className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-green-800">Currently Clocked In</h3>
                <p className="text-green-600">Session Duration</p>
              </div>
              
              <div className="text-4xl font-mono font-bold text-green-700 mb-4">
                {getActiveDuration()}
              </div>
              
              {activeEntry.jobId && (
                <div className="mb-4">
                  <p className="text-sm text-green-600">Working on:</p>
                  <p className="font-medium text-green-800">
                    {jobs.find(job => job.id === activeEntry.jobId)?.title || 'Unknown Job'}
                  </p>
                </div>
              )}

              <Button
                onClick={() => clockMutation.mutate({ action: 'out' })}
                className="bg-red-600 hover:bg-red-700 text-white w-full h-12 text-lg"
                disabled={clockMutation.isPending}
              >
                <Square className="h-6 w-6 mr-2" />
                Clock Out
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="p-4">
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Ready to Start</h3>
              <p className="text-gray-600 mb-6">Tap to clock in and start tracking your time</p>
              
              <Button
                onClick={() => clockMutation.mutate({ action: 'in' })}
                className="bg-green-600 hover:bg-green-700 text-white w-full h-16 text-xl"
                disabled={clockMutation.isPending}
              >
                <Play className="h-8 w-8 mr-3" />
                Clock In
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Today's Summary */}
      <div className="p-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Today's Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(todayHours * 10) / 10}h
                </div>
                <div className="text-sm text-gray-600">Hours Worked</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  ${Math.round(todayHours * 25 * 100) / 100}
                </div>
                <div className="text-sm text-gray-600">Estimated Earnings</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Entries */}
      <div className="p-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Time Entries</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4 text-gray-500">Loading...</div>
            ) : recentEntries.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No time entries yet</div>
            ) : (
              <div className="space-y-3">
                {recentEntries.map((entry) => {
                  const job = jobs.find(j => j.id === entry.jobId);
                  const duration = entry.clockOutTime 
                    ? Math.round((new Date(entry.clockOutTime).getTime() - new Date(entry.clockInTime).getTime()) / (1000 * 60 * 60) * 10) / 10
                    : null;

                  return (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">
                            {new Date(entry.clockInTime).toLocaleDateString()}
                          </span>
                          {!entry.clockOutTime && (
                            <Badge className="bg-green-500 text-white text-xs">Active</Badge>
                          )}
                        </div>
                        
                        <div className="text-xs text-gray-600">
                          {new Date(entry.clockInTime).toLocaleTimeString()} - 
                          {entry.clockOutTime ? new Date(entry.clockOutTime).toLocaleTimeString() : 'Active'}
                        </div>
                        
                        {job && (
                          <div className="flex items-center mt-1">
                            <Briefcase className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-600">{job.title}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right">
                        {duration !== null && (
                          <div className="text-sm font-bold text-blue-600">
                            {duration}h
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
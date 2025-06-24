import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Clock, 
  MapPin, 
  Phone, 
  CheckCircle, 
  Navigation,
  Camera,
  FileText,
  Users,
  Calendar
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Job, Customer, TimeEntry } from "@shared/schema";

export default function MobileDashboard() {
  const [activeTab, setActiveTab] = useState<"today" | "jobs" | "time">("today");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: todayJobs = [] } = useQuery<(Job & { customer: Customer })[]>({
    queryKey: ["/api/dashboard/today-schedule"],
  });

  const { data: timeEntries = [] } = useQuery<TimeEntry[]>({
    queryKey: ["/api/time-entries"],
  });

  const { data: allJobs = [] } = useQuery<(Job & { customer: Customer })[]>({
    queryKey: ["/api/jobs"],
  });

  // Clock in/out mutation for mobile time tracking
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
      toast({
        title: `Clocked ${action}`,
        description: `Successfully clocked ${action} at ${new Date().toLocaleTimeString()}`,
      });
    },
  });

  const updateJobStatus = useMutation({
    mutationFn: async ({ jobId, status }: { jobId: number, status: string }) => {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update job status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/today-schedule"] });
      toast({
        title: "Job Updated",
        description: "Job status has been updated successfully.",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500 text-white";
      case "in_progress": return "bg-blue-500 text-white";
      case "scheduled": return "bg-yellow-500 text-white";
      case "pending": return "bg-gray-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Mobile Header */}
      <div className="bg-blue-600 text-white p-4 sticky top-0 z-10">
        <h1 className="text-lg font-bold">Tulboxx Mobile</h1>
        <p className="text-blue-100 text-sm">Field Technician Dashboard</p>
      </div>

      {/* Quick Actions */}
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={() => clockMutation.mutate({ action: 'in' })}
            className="h-16 bg-green-600 hover:bg-green-700 text-white flex flex-col items-center justify-center"
            disabled={clockMutation.isPending}
          >
            <Clock className="h-6 w-6 mb-1" />
            <span className="text-sm">Clock In</span>
          </Button>
          <Button 
            onClick={() => clockMutation.mutate({ action: 'out' })}
            className="h-16 bg-red-600 hover:bg-red-700 text-white flex flex-col items-center justify-center"
            disabled={clockMutation.isPending}
          >
            <Clock className="h-6 w-6 mb-1" />
            <span className="text-sm">Clock Out</span>
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-white rounded-lg p-1 shadow-sm">
          {[
            { key: "today", label: "Today", icon: Calendar },
            { key: "jobs", label: "All Jobs", icon: FileText },
            { key: "time", label: "Time", icon: Clock },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                activeTab === key
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Content based on active tab */}
        {activeTab === "today" && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800">Today's Schedule</h2>
            {todayJobs.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No jobs scheduled for today</p>
                </CardContent>
              </Card>
            ) : (
              todayJobs.map((job) => (
                <Card key={job.id} className="shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{job.title}</h3>
                        <p className="text-sm text-gray-600">{job.customer.firstName} {job.customer.lastName}</p>
                      </div>
                      <Badge className={getStatusColor(job.status)}>
                        {job.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{job.customer.address}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        <span>{job.customer.phone}</span>
                      </div>
                      {job.estimatedValue && (
                        <div className="text-green-600 font-medium">
                          Value: {formatCurrency(parseFloat(job.estimatedValue.toString()))}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Button
                        onClick={() => updateJobStatus.mutate({ jobId: job.id, status: 'in_progress' })}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-2"
                        disabled={job.status === 'in_progress' || job.status === 'completed'}
                      >
                        Start Job
                      </Button>
                      <Button
                        onClick={() => updateJobStatus.mutate({ jobId: job.id, status: 'completed' })}
                        className="bg-green-600 hover:bg-green-700 text-white text-sm py-2"
                        disabled={job.status === 'completed'}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Complete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === "jobs" && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800">All Jobs</h2>
            {allJobs.map((job) => (
              <Card key={job.id} className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{job.title}</h3>
                      <p className="text-sm text-gray-600">{job.customer.firstName} {job.customer.lastName}</p>
                      <p className="text-sm text-gray-500">{job.serviceType}</p>
                    </div>
                    <Badge className={getStatusColor(job.status)}>
                      {job.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "time" && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800">Time Tracking</h2>
            {timeEntries.slice(0, 10).map((entry) => (
              <Card key={entry.id} className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">
                        {entry.clockInTime ? new Date(entry.clockInTime).toLocaleDateString() : 'No date'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {entry.clockInTime ? new Date(entry.clockInTime).toLocaleTimeString() : 'No time'} - 
                        {entry.clockOutTime ? new Date(entry.clockOutTime).toLocaleTimeString() : 'Active'}
                      </p>
                    </div>
                    <div className="text-right">
                      {entry.clockInTime && entry.clockOutTime && (
                        <p className="font-medium text-blue-600">
                          {Math.round((new Date(entry.clockOutTime).getTime() - new Date(entry.clockInTime).getTime()) / (1000 * 60 * 60 * 10)) / 100}h
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="grid grid-cols-4 gap-1">
          <Button variant="ghost" className="flex flex-col items-center py-2 h-auto">
            <Navigation className="h-5 w-5" />
            <span className="text-xs mt-1">Navigate</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center py-2 h-auto">
            <Camera className="h-5 w-5" />
            <span className="text-xs mt-1">Photos</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center py-2 h-auto">
            <FileText className="h-5 w-5" />
            <span className="text-xs mt-1">Notes</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center py-2 h-auto">
            <Users className="h-5 w-5" />
            <span className="text-xs mt-1">Contact</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Search,
  MapPin, 
  Phone, 
  CheckCircle, 
  Clock,
  ArrowLeft,
  Navigation,
  Camera,
  MessageSquare
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Job, Customer } from "@shared/schema";

export default function MobileJobs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJob, setSelectedJob] = useState<(Job & { customer: Customer }) | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: jobs = [], isLoading } = useQuery<(Job & { customer: Customer })[]>({
    queryKey: ["/api/jobs"],
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
      toast({
        title: "Job Updated",
        description: "Job status has been updated successfully.",
      });
      setSelectedJob(null);
    },
  });

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${job.customer.firstName} ${job.customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500 text-white";
      case "in_progress": return "bg-blue-500 text-white";
      case "scheduled": return "bg-yellow-500 text-white";
      case "pending": return "bg-gray-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  if (selectedJob) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedJob(null)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900">{selectedJob.title}</h1>
              <p className="text-sm text-gray-600">{selectedJob.serviceType}</p>
            </div>
            <Badge className={getStatusColor(selectedJob.status)}>
              {selectedJob.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        {/* Job Details */}
        <div className="p-4 space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{selectedJob.customer.firstName} {selectedJob.customer.lastName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Phone:</span>
                <a href={`tel:${selectedJob.customer.phone}`} className="text-blue-600 flex items-center">
                  <Phone className="h-4 w-4 mr-1" />
                  {selectedJob.customer.phone}
                </a>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-gray-600">Address:</span>
                <div className="text-right flex-1 ml-2">
                  <p className="font-medium">{selectedJob.customer.address}</p>
                  <p className="text-sm text-gray-600">
                    {selectedJob.customer.city}, {selectedJob.customer.state} {selectedJob.customer.zipCode}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedJob.description && (
                <div>
                  <span className="text-gray-600">Description:</span>
                  <p className="mt-1 text-gray-900">{selectedJob.description}</p>
                </div>
              )}
              {selectedJob.scheduledDate && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Scheduled:</span>
                  <span className="font-medium">{new Date(selectedJob.scheduledDate).toLocaleDateString()}</span>
                </div>
              )}
              {selectedJob.estimatedValue && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Estimated Value:</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(parseFloat(selectedJob.estimatedValue.toString()))}
                  </span>
                </div>
              )}
              {selectedJob.notes && (
                <div>
                  <span className="text-gray-600">Notes:</span>
                  <p className="mt-1 text-gray-900">{selectedJob.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(selectedJob.customer.address)}`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white h-12"
                >
                  <Navigation className="h-5 w-5 mr-2" />
                  Navigate
                </Button>
                <Button
                  onClick={() => window.open(`tel:${selectedJob.customer.phone}`)}
                  className="bg-green-600 hover:bg-green-700 text-white h-12"
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Call
                </Button>
                <Button
                  variant="outline"
                  className="h-12"
                  onClick={() => toast({ title: "Feature Coming Soon", description: "Photo capture will be available in the next update." })}
                >
                  <Camera className="h-5 w-5 mr-2" />
                  Photos
                </Button>
                <Button
                  variant="outline"
                  className="h-12"
                  onClick={() => toast({ title: "Feature Coming Soon", description: "Notes feature will be available in the next update." })}
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Notes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Status Updates */}
          {selectedJob.status !== 'completed' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Update Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  {selectedJob.status === 'pending' && (
                    <Button
                      onClick={() => updateJobStatus.mutate({ jobId: selectedJob.id, status: 'in_progress' })}
                      className="bg-blue-600 hover:bg-blue-700 text-white h-12"
                      disabled={updateJobStatus.isPending}
                    >
                      <Clock className="h-5 w-5 mr-2" />
                      Start Job
                    </Button>
                  )}
                  {selectedJob.status === 'scheduled' && (
                    <Button
                      onClick={() => updateJobStatus.mutate({ jobId: selectedJob.id, status: 'in_progress' })}
                      className="bg-blue-600 hover:bg-blue-700 text-white h-12"
                      disabled={updateJobStatus.isPending}
                    >
                      <Clock className="h-5 w-5 mr-2" />
                      Start Job
                    </Button>
                  )}
                  {(selectedJob.status === 'in_progress' || selectedJob.status === 'scheduled') && (
                    <Button
                      onClick={() => updateJobStatus.mutate({ jobId: selectedJob.id, status: 'completed' })}
                      className="bg-green-600 hover:bg-green-700 text-white h-12"
                      disabled={updateJobStatus.isPending}
                    >
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Complete Job
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <h1 className="text-lg font-semibold text-gray-900 mb-3">Jobs</h1>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search jobs or customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Jobs List */}
      <div className="p-4 space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Loading jobs...</div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500">No jobs found</div>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <Card 
              key={job.id} 
              className="shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedJob(job)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{job.title}</h3>
                    <p className="text-sm text-gray-600">{job.serviceType}</p>
                    <p className="text-sm text-gray-800 mt-1">
                      {job.customer.firstName} {job.customer.lastName}
                    </p>
                  </div>
                  <Badge className={getStatusColor(job.status)}>
                    {job.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="truncate">{job.customer.address}</span>
                  </div>
                  {job.scheduledDate && (
                    <div className="text-gray-600">
                      <Clock className="inline h-4 w-4 mr-2" />
                      {new Date(job.scheduledDate).toLocaleDateString()}
                    </div>
                  )}
                  {job.estimatedValue && (
                    <div className="text-green-600 font-medium">
                      {formatCurrency(parseFloat(job.estimatedValue.toString()))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
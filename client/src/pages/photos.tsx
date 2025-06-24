import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload, Eye, Trash2, Plus, Download, X, Printer } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Document, Customer, Job, Estimate, Invoice } from "@shared/schema";

interface PhotoWithRelations extends Document {
  customer?: Customer;
  job?: Job;
  estimate?: Estimate;
  invoice?: Invoice;
}

export default function Photos() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [viewingPhoto, setViewingPhoto] = useState<PhotoWithRelations | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCustomer, setFilterCustomer] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Only get image documents
  const { data: photos = [], isLoading } = useQuery<PhotoWithRelations[]>({
    queryKey: ["/api/documents"],
    select: (data) => data.filter(doc => doc.mimeType.startsWith("image/")),
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: jobs = [] } = useQuery<(Job & { customer: Customer })[]>({
    queryKey: ["/api/jobs"],
  });

  const { data: estimates = [] } = useQuery<(Estimate & { customer: Customer })[]>({
    queryKey: ["/api/estimates"],
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    category: "job_photo",
    description: "",
    customerId: "none",
    jobId: "none",
    estimateId: "none",
    invoiceId: "none"
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/documents", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      setIsUploadOpen(false);
      setSelectedFile(null);
      setFormData({
        title: "",
        category: "job_photo",
        description: "",
        customerId: "none",
        jobId: "none",
        estimateId: "none",
        invoiceId: "none"
      });
      toast({
        title: "Success",
        description: "Photo uploaded successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to upload photo",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/documents/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Success",
        description: "Photo deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete photo",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      uploadMutation.mutate({
        fileName: `${Date.now()}_${selectedFile.name}`,
        originalName: formData.title,
        fileType: "image",
        mimeType: selectedFile.type,
        fileSize: selectedFile.size,
        fileUrl: base64,
        category: formData.category,
        description: formData.description,
        customerId: formData.customerId && formData.customerId !== "none" ? parseInt(formData.customerId) : null,
        jobId: formData.jobId && formData.jobId !== "none" ? parseInt(formData.jobId) : null,
        estimateId: formData.estimateId && formData.estimateId !== "none" ? parseInt(formData.estimateId) : null,
        invoiceId: formData.invoiceId && formData.invoiceId !== "none" ? parseInt(formData.invoiceId) : null,
        isPublic: false,
      });
    };
    reader.readAsDataURL(selectedFile);
  };

  const downloadPhoto = (photo: PhotoWithRelations) => {
    if (photo.fileUrl) {
      const link = document.createElement('a');
      link.href = photo.fileUrl;
      link.download = photo.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const filteredPhotos = photos.filter(photo => {
    const matchesSearch = (photo.originalName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (photo.description?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (photo.fileName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterType === "all" || photo.category === filterType;
    const matchesCustomer = filterCustomer === "all" || 
                           (photo.customerId && photo.customerId.toString() === filterCustomer) ||
                           (photo.job && photo.job.customerId.toString() === filterCustomer) ||
                           (photo.estimate && photo.estimate.customerId.toString() === filterCustomer);
    return matchesSearch && matchesFilter && matchesCustomer;
  });

  const getTypeColor = (category: string) => {
    switch (category) {
      case "job_photo": return "bg-blue-100 text-blue-800";
      case "before_photo": return "bg-green-100 text-green-800";
      case "after_photo": return "bg-purple-100 text-purple-800";
      case "progress_photo": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const photoCategories = [
    { value: "job_photo", label: "Job Photo" },
    { value: "before_photo", label: "Before Photo" },
    { value: "after_photo", label: "After Photo" },
    { value: "progress_photo", label: "Progress Photo" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Photos</h1>
          <p className="text-gray-600 mt-2">Manage job site photos and project images</p>
        </div>
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Upload Photo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload Photo</DialogTitle>
              <DialogDescription>
                Upload job site photos, before/after images, or progress shots.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div>
                <Label htmlFor="file">Photo File</Label>
                <Input
                  id="file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter photo title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Photo Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {photoCategories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this photo shows"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="customer">Customer (Optional)</Label>
                <Select value={formData.customerId} onValueChange={(value) => setFormData(prev => ({ ...prev, customerId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No customer</SelectItem>
                    {customers
                      .sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`))
                      .map(customer => (
                        <SelectItem key={customer.id} value={customer.id.toString()}>
                          {customer.firstName} {customer.lastName}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="job">Job (Optional)</Label>
                <Select value={formData.jobId} onValueChange={(value) => setFormData(prev => ({ ...prev, jobId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select job" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No job</SelectItem>
                    {jobs.map(job => (
                      <SelectItem key={job.id} value={job.id.toString()}>
                        {job.title} - {job.customer?.firstName || 'N/A'} {job.customer?.lastName || ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsUploadOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploadMutation.isPending || !selectedFile}>
                  {uploadMutation.isPending ? "Uploading..." : "Upload Photo"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search photos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={filterCustomer} onValueChange={setFilterCustomer}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by customer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Customers</SelectItem>
            {customers
              .sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`))
              .map(customer => {
                const customerPhotoCount = photos.filter(photo => 
                  (photo.customerId && photo.customerId === customer.id) ||
                  (photo.job && photo.job.customerId === customer.id) ||
                  (photo.estimate && photo.estimate.customerId === customer.id)
                ).length;
                return (
                  <SelectItem key={customer.id} value={customer.id.toString()}>
                    {customer.firstName} {customer.lastName} ({customerPhotoCount} photos)
                  </SelectItem>
                );
              })}
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Photos</SelectItem>
            {photoCategories.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Customer Filter Summary */}
      {filterCustomer !== "all" && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-blue-900">
                Photos for {customers.find(c => c.id.toString() === filterCustomer)?.firstName} {customers.find(c => c.id.toString() === filterCustomer)?.lastName}
              </h3>
              <p className="text-sm text-blue-700">
                Showing {filteredPhotos.length} photos from jobs, estimates, and direct uploads
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setFilterCustomer("all")}
              className="text-blue-700 border-blue-300"
            >
              Clear Filter
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {filteredPhotos.map((photo) => (
          <Card key={photo.id} className="overflow-hidden">
            <div className="aspect-square relative">
              {photo.fileUrl && (
                <img
                  src={photo.fileUrl}
                  alt={photo.fileName}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className={getTypeColor(photo.category)}>
                  {photoCategories.find(cat => cat.value === photo.category)?.label || photo.category}
                </Badge>
              </div>
            </div>
            <CardContent className="p-2">
              <h3 className="font-medium text-xs mb-1 truncate">{photo.originalName || photo.fileName}</h3>
              {photo.description && (
                <p className="text-xs text-gray-600 mb-1 line-clamp-1">{photo.description}</p>
              )}
              
              <div className="space-y-0.5 text-xs text-gray-500 mb-2">
                {photo.customer && (
                  <div className="truncate">{photo.customer.firstName} {photo.customer.lastName}</div>
                )}
                {photo.job && (
                  <div className="truncate">{photo.job.title}</div>
                )}
              </div>

              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setViewingPhoto(photo)}
                  className="h-6 px-2 flex-1"
                >
                  <Eye className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadPhoto(photo)}
                  disabled={!photo.fileUrl}
                  className="h-6 px-2 flex-1"
                >
                  <Download className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deleteMutation.mutate(photo.id)}
                  disabled={deleteMutation.isPending}
                  className="h-6 px-2 flex-1"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPhotos.length === 0 && (
        <div className="text-center py-12">
          <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No photos found</h3>
          <p className="text-gray-600">
            {searchTerm || filterType !== "all" 
              ? "Try adjusting your search or filters" 
              : "Upload your first photo to get started"}
          </p>
        </div>
      )}

      {/* Photo Viewer Modal */}
      {viewingPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold">{viewingPhoto.fileName}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{viewingPhoto.description}</p>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadPhoto(viewingPhoto)}
                  disabled={!viewingPhoto.fileUrl}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (viewingPhoto.fileUrl) {
                      window.print();
                    }
                  }}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setViewingPhoto(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {viewingPhoto.fileUrl && (
              <div className="text-center">
                <img
                  src={viewingPhoto.fileUrl}
                  alt={viewingPhoto.fileName}
                  className="max-w-full max-h-[70vh] object-contain mx-auto rounded"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
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
import { FileText, Camera, Upload, Eye, Trash2, Plus, Download, X, Printer } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Document, Customer, Job, Estimate, Invoice } from "@shared/schema";

interface DocumentWithRelations extends Document {
  customer?: Customer;
  job?: Job;
  estimate?: Estimate;
  invoice?: Invoice;
}

export default function Documents() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<DocumentWithRelations | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCustomer, setFilterCustomer] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Only get non-image documents
  const { data: documents = [], isLoading } = useQuery<DocumentWithRelations[]>({
    queryKey: ["/api/documents"],
    select: (data) => data.filter(doc => !doc.mimeType.startsWith("image/")),
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

  const { data: invoices = [] } = useQuery<(Invoice & { customer: Customer })[]>({
    queryKey: ["/api/invoices"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("/api/documents", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      setIsUploadOpen(false);
      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/documents/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const file = formData.get("file") as File;
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    // Convert file to base64 for simple storage
    const reader = new FileReader();
    reader.onload = () => {
      const documentData = {
        fileName: `${Date.now()}_${file.name}`,
        originalName: formData.get("title") as string,
        fileType: file.type.startsWith("image/") ? "image" : "document",
        mimeType: file.type,
        fileSize: file.size,
        fileUrl: reader.result as string, // base64 data
        category: formData.get("type") as string,
        description: formData.get("description") as string || null,
        customerId: formData.get("customerId") ? parseInt(formData.get("customerId") as string) : null,
        jobId: formData.get("jobId") ? parseInt(formData.get("jobId") as string) : null,
        estimateId: formData.get("estimateId") ? parseInt(formData.get("estimateId") as string) : null,
        invoiceId: formData.get("invoiceId") ? parseInt(formData.get("invoiceId") as string) : null,
        isPublic: false,
      };
      
      uploadMutation.mutate(documentData);
    };
    reader.readAsDataURL(file);
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesType = filterType === "all" || doc.category === filterType;
    const matchesSearch = doc.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCustomer = filterCustomer === "all" || 
                           (doc.customerId && doc.customerId.toString() === filterCustomer) ||
                           (doc.job && doc.job.customerId.toString() === filterCustomer) ||
                           (doc.estimate && doc.estimate.customerId.toString() === filterCustomer) ||
                           (doc.invoice && doc.invoice.customerId.toString() === filterCustomer);
    return matchesType && matchesSearch && matchesCustomer;
  });

  const getDocumentIcon = (type: string, mimeType: string) => {
    if (mimeType.startsWith("image/")) return <Camera className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  const getTypeColor = (category: string) => {
    switch (category) {
      case "job_photo": return "bg-blue-100 text-blue-800";
      case "contract": return "bg-green-100 text-green-800";
      case "receipt": return "bg-orange-100 text-orange-800";
      case "insurance": return "bg-purple-100 text-purple-800";
      case "before_after": return "bg-cyan-100 text-cyan-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const downloadDocument = (doc: Document) => {
    if (doc.fileUrl) {
      const link = document.createElement("a");
      link.href = doc.fileUrl;
      link.download = doc.originalName;
      link.click();
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading documents...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Management</h1>
          <p className="text-gray-600">Upload and manage photos, contracts, and compliance documents</p>
        </div>
        
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
              <DialogDescription>
                Upload photos, contracts, receipts, or other documents related to your jobs and customers.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleFileUpload} className="space-y-4">
              <div>
                <Label htmlFor="file">File</Label>
                <Input
                  id="file"
                  name="file"
                  type="file"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Document title"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="type">Document Category</Label>
                <Select name="type" required>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select document category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="job_photo">Job Photo</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="receipt">Receipt</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                    <SelectItem value="before_after">Before/After</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Optional description"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="customerId">Customer (Optional)</Label>
                <Select name="customerId">
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers
                      .sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`))
                      .map((customer) => (
                        <SelectItem key={customer.id} value={customer.id.toString()}>
                          {customer.firstName} {customer.lastName}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="jobId">Job (Optional)</Label>
                <Select name="jobId">
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select job" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs.map((job) => (
                      <SelectItem key={job.id} value={job.id.toString()}>
                        {job.title} - {job.customer?.firstName || 'N/A'} {job.customer?.lastName || ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>



              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsUploadOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploadMutation.isPending}>
                  {uploadMutation.isPending ? "Uploading..." : "Upload Document"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
                const customerDocCount = documents.filter(doc => 
                  (doc.customerId && doc.customerId === customer.id) ||
                  (doc.job && doc.job.customerId === customer.id) ||
                  (doc.estimate && doc.estimate.customerId === customer.id) ||
                  (doc.invoice && doc.invoice.customerId === customer.id)
                ).length;
                return (
                  <SelectItem key={customer.id} value={customer.id.toString()}>
                    {customer.firstName} {customer.lastName} ({customerDocCount} docs)
                  </SelectItem>
                );
              })}
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="job_photo">Job Photos</SelectItem>
            <SelectItem value="contract">Contracts</SelectItem>
            <SelectItem value="receipt">Receipts</SelectItem>
            <SelectItem value="insurance">Insurance</SelectItem>
            <SelectItem value="before_after">Before/After</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Customer Filter Summary */}
      {filterCustomer !== "all" && (
        <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-green-900">
                Documents for {customers.find(c => c.id.toString() === filterCustomer)?.firstName} {customers.find(c => c.id.toString() === filterCustomer)?.lastName}
              </h3>
              <p className="text-sm text-green-700">
                Showing {filteredDocuments.length} documents from jobs, estimates, invoices, and direct uploads
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setFilterCustomer("all")}
              className="text-green-700 border-green-300"
            >
              Clear Filter
            </Button>
          </div>
        </div>
      )}

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map((doc) => (
          <Card key={doc.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {getDocumentIcon(doc.fileType, doc.mimeType)}
                  <CardTitle className="text-lg truncate">{doc.originalName}</CardTitle>
                </div>
                <Badge className={getTypeColor(doc.category)}>
                  {doc.category.replace('_', ' ')}
                </Badge>
              </div>
              {doc.description && (
                <p className="text-sm text-gray-600 line-clamp-2">{doc.description}</p>
              )}
            </CardHeader>
            
            <CardContent>
              <div className="space-y-2 text-sm text-gray-500">
                <div>
                  <strong>File:</strong> {doc.fileName}
                </div>
                <div>
                  <strong>Size:</strong> {(doc.fileSize / 1024).toFixed(1)} KB
                </div>
                <div>
                  <strong>Uploaded:</strong> {new Date(doc.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-4">
                {doc.mimeType.startsWith("image/") && doc.fileUrl && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setViewingDocument(doc)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadDocument(doc)}
                  disabled={!doc.fileUrl}
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deleteMutation.mutate(doc.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
          <p className="text-gray-600">
            {searchTerm || filterType !== "all" 
              ? "Try adjusting your search or filters" 
              : "Upload your first document to get started"}
          </p>
        </div>
      )}

      {/* Document Viewer Modal */}
      {viewingDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold">{viewingDocument.originalName}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{viewingDocument.description}</p>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadDocument(viewingDocument)}
                  disabled={!viewingDocument.fileUrl}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (viewingDocument.fileUrl) {
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
                  onClick={() => setViewingDocument(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {viewingDocument.fileUrl && (
              <div className="text-center">
                <img
                  src={viewingDocument.fileUrl}
                  alt={viewingDocument.originalName}
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
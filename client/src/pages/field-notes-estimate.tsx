import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { FileText, Wand2, User, Building, Clipboard, Shield } from "lucide-react";

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  propertyType: string;
  address?: string;
  notes?: string;
}

interface BusinessProfile {
  id: number;
  businessName: string;
  serviceTypes: string[];
  specializations?: string[];
  warranties?: string;
  insuranceInfo?: string;
}

export default function FieldNotesToEstimate() {
  const [fieldNotes, setFieldNotes] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [serviceType, setServiceType] = useState("");
  const [propertyType, setPropertyType] = useState<"residential" | "commercial">("residential");
  const [tone, setTone] = useState<"professional" | "friendly" | "technical">("professional");
  const [detailLevel, setDetailLevel] = useState<"basic" | "detailed" | "comprehensive">("detailed");
  const [generatedEstimate, setGeneratedEstimate] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch customers for selection
  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  // Fetch business profile for context
  const { data: businessProfile } = useQuery<BusinessProfile>({
    queryKey: ["/api/business-profile"],
  });

  // Generate estimate mutation
  const generateEstimateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/ai/field-notes-to-estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to generate estimate");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedEstimate(data);
      toast({
        title: "Estimate Generated",
        description: "Professional estimate created from your field notes",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/estimates"] });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate estimate",
        variant: "destructive",
      });
    },
  });

  const handleGenerateEstimate = () => {
    if (!fieldNotes.trim() || !selectedCustomerId || !serviceType.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in field notes, select a customer, and specify service type",
        variant: "destructive",
      });
      return;
    }

    const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
    if (!selectedCustomer || !businessProfile) return;

    setIsGenerating(true);

    const requestData = {
      customerId: selectedCustomerId,
      fieldNotes: fieldNotes.trim(),
      serviceType: serviceType.trim(),
      propertyType,
      customerContext: {
        firstName: selectedCustomer.firstName,
        lastName: selectedCustomer.lastName,
        propertyType: selectedCustomer.propertyType,
        address: selectedCustomer.address,
        notes: selectedCustomer.notes,
      },
      businessContext: {
        businessName: businessProfile.businessName,
        serviceTypes: businessProfile.serviceTypes || [serviceType],
        specializations: businessProfile.specializations || [],
        warranties: businessProfile.warranties,
        insuranceInfo: businessProfile.insuranceInfo,
      },
      estimatePreferences: {
        includeWarranties: true,
        tone,
        detailLevel,
      },
    };

    generateEstimateMutation.mutate(requestData);
    setIsGenerating(false);
  };

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Field Notes to Professional Estimate</h1>
        <p className="text-gray-600 mt-2">
          Transform your site visit notes into compelling, professional estimates using AI
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clipboard className="h-5 w-5" />
                Field Notes Input
              </CardTitle>
              <CardDescription>
                Enter your raw observations from the site visit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="fieldNotes">Site Visit Notes</Label>
                <Textarea
                  id="fieldNotes"
                  placeholder="Example: Customer wants deck repair. Wood is rotted in spots around posts. Needs new boards on south side, maybe 6-8 boards. Railing is loose and wobbly. Customer mentioned they have kids so safety is important. Wants to stain the whole deck after repairs. Deck is about 12x16 feet..."
                  value={fieldNotes}
                  onChange={(e) => setFieldNotes(e.target.value)}
                  rows={8}
                  className="resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer">Customer</Label>
                  <Select value={selectedCustomerId?.toString() || ""} onValueChange={(value) => setSelectedCustomerId(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id.toString()}>
                          {customer.firstName} {customer.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="serviceType">Service Type</Label>
                  <Input
                    id="serviceType"
                    placeholder="e.g., Deck Repair, Bathroom Renovation"
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Property Type</Label>
                  <Select value={propertyType} onValueChange={(value: "residential" | "commercial") => setPropertyType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Tone</Label>
                  <Select value={tone} onValueChange={(value: "professional" | "friendly" | "technical") => setTone(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Detail Level</Label>
                  <Select value={detailLevel} onValueChange={(value: "basic" | "detailed" | "comprehensive") => setDetailLevel(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                      <SelectItem value="comprehensive">Comprehensive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedCustomer && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-900">Customer Context</span>
                    </div>
                    <p className="text-sm text-blue-800">
                      {selectedCustomer.firstName} {selectedCustomer.lastName} • {selectedCustomer.propertyType}
                      {selectedCustomer.address && ` • ${selectedCustomer.address}`}
                    </p>
                    {selectedCustomer.notes && (
                      <p className="text-sm text-blue-700 mt-1">Notes: {selectedCustomer.notes}</p>
                    )}
                  </CardContent>
                </Card>
              )}

              <Button 
                onClick={handleGenerateEstimate} 
                disabled={isGenerating || generateEstimateMutation.isPending}
                className="w-full"
              >
                {isGenerating || generateEstimateMutation.isPending ? (
                  <>
                    <Wand2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Professional Estimate...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Professional Estimate
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Output Section */}
        <div className="space-y-6">
          {generatedEstimate ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Generated Professional Estimate
                  </CardTitle>
                  <CardDescription>
                    AI-enhanced estimate ready for client presentation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">PROJECT TITLE</Label>
                    <h3 className="text-lg font-semibold text-gray-900 mt-1">
                      {generatedEstimate.aiContent.title}
                    </h3>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-sm font-medium text-gray-500">PROJECT DESCRIPTION</Label>
                    <p className="text-gray-700 mt-1 leading-relaxed">
                      {generatedEstimate.aiContent.projectDescription}
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-sm font-medium text-gray-500">SCOPE OF WORK</Label>
                    <div className="mt-1 text-gray-700 leading-relaxed whitespace-pre-line">
                      {generatedEstimate.aiContent.scopeOfWork}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      WARRANTIES & BENEFITS
                    </Label>
                    <p className="text-gray-700 mt-1 leading-relaxed">
                      {generatedEstimate.aiContent.warrantiesAndBenefits}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-900">AI Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-green-700">Pain Points Identified</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {generatedEstimate.aiContent.metadata.painPointsIdentified.map((point: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-green-800 border-green-300">
                            {point}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-green-700">Key Selling Points</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {generatedEstimate.aiContent.metadata.keySellingPoints.map((point: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-green-800 border-green-300">
                            {point}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border-dashed border-2 border-gray-300">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Estimate Generated Yet</h3>
                <p className="text-gray-500 text-center">
                  Fill in your field notes and customer information, then click "Generate Professional Estimate" to see the AI-powered transformation.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
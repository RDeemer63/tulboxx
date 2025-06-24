import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileText, Zap, Plus, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import PolishFormField from "@/components/polish-form-field";
import { useLocation } from "wouter";

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
}

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface UnifiedEstimateCreatorProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function UnifiedEstimateCreator({ open, onClose, onSuccess }: UnifiedEstimateCreatorProps) {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("quick");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showInlineCustomerForm, setShowInlineCustomerForm] = useState(false);
  const [inlineCustomerData, setInlineCustomerData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    secondaryPhone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    propertyType: "residential",
    accessInstructions: "",
    preferredContactMethod: "phone",
    notes: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Quick form state
  const [quickForm, setQuickForm] = useState({
    customerId: "",
    description: "",
    amount: "",
    notes: ""
  });

  // Detailed form state
  const [detailedForm, setDetailedForm] = useState({
    customerId: "",
    title: "",
    description: "",
    lineItems: [{ id: "1", description: "", quantity: 1, rate: 0, amount: 0 }] as LineItem[],
    notes: "",
    validUntil: "",
    terms: ""
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: businessProfile = {} } = useQuery({
    queryKey: ["/api/business-profile"],
  });

  const resetForms = () => {
    setQuickForm({ customerId: "", description: "", amount: "", notes: "" });
    setDetailedForm({
      customerId: "",
      title: "",
      description: "",
      lineItems: [{ id: "1", description: "", quantity: 1, rate: 0, amount: 0 }],
      notes: "",
      validUntil: "",
      terms: ""
    });
    setShowInlineCustomerForm(false);
    setInlineCustomerData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      secondaryPhone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      propertyType: "residential",
      accessInstructions: "",
      preferredContactMethod: "phone",
      notes: "",
    });
  };

  const handleInlineCustomerCreate = async () => {
    if (!inlineCustomerData.firstName.trim() || !inlineCustomerData.lastName.trim()) {
      toast({
        title: "Error",
        description: "First and last name are required",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await apiRequest("POST", "/api/customers", inlineCustomerData);
      const newCustomer = await response.json();
      console.log("Customer creation response:", newCustomer);
      
      await queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      
      // Update both forms with the new customer
      const customerId = newCustomer?.id?.toString();
      if (customerId) {
        setQuickForm(prev => ({ ...prev, customerId }));
        setDetailedForm(prev => ({ ...prev, customerId }));
      } else {
        console.error("No customer ID in response:", newCustomer);
        throw new Error("Customer created but no ID returned");
      }
      
      setShowInlineCustomerForm(false);
      setInlineCustomerData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        secondaryPhone: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        propertyType: "residential",
        accessInstructions: "",
        preferredContactMethod: "phone",
        notes: "",
      });
      
      toast({
        title: "Success",
        description: "Customer created and selected"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create customer",
        variant: "destructive"
      });
    }
  };

  const createQuickEstimate = async () => {
    if (!quickForm.customerId || !quickForm.description.trim() || !quickForm.amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Generate AI content
      const aiData = await apiRequest("POST", "/api/ai/generate-estimate", {
        additionalNotes: quickForm.description,
        serviceType: "general"
      });

      const estimatePrice = parseFloat(quickForm.amount) || 0;
      const lineItems = [{
        id: "1",
        description: aiData?.description || quickForm.description,
        quantity: 1,
        rate: estimatePrice,
        amount: estimatePrice
      }];

      const estimateData = {
        customerId: parseInt(quickForm.customerId),
        title: aiData?.title || "Service Estimate",
        description: aiData?.description || quickForm.description,
        totalAmount: estimatePrice.toString(),
        status: "draft" as const,
        items: JSON.stringify(lineItems),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        estimateNumber: `EST-${Date.now().toString().slice(-6)}`,
        type: "original",
        version: 1
      };

      const response = await apiRequest("POST", "/api/estimates", estimateData);
      await queryClient.invalidateQueries({ queryKey: ['/api/estimates'] });
      
      toast({
        title: "Success!",
        description: "Quick estimate created successfully"
      });

      resetForms();
      onClose();
      
      // Redirect to preview page
      setLocation(`/estimates/${response.id}`);

    } catch (error) {
      console.error("Error creating estimate:", error);
      toast({
        title: "Error",
        description: "Failed to create estimate",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
    const newItems = [...detailedForm.lineItems];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    }
    
    setDetailedForm(prev => ({ ...prev, lineItems: newItems }));
  };

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      rate: 0,
      amount: 0
    };
    setDetailedForm(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, newItem]
    }));
  };

  const removeLineItem = (index: number) => {
    if (detailedForm.lineItems.length > 1) {
      setDetailedForm(prev => ({
        ...prev,
        lineItems: prev.lineItems.filter((_, i) => i !== index)
      }));
    }
  };

  const getTotalAmount = () => {
    return detailedForm.lineItems.reduce((sum, item) => sum + item.amount, 0);
  };

  const createDetailedEstimate = async () => {
    if (!detailedForm.customerId || !detailedForm.title.trim() || detailedForm.lineItems.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const totalAmount = getTotalAmount();
      
      const estimateData = {
        customerId: parseInt(detailedForm.customerId),
        title: detailedForm.title,
        description: detailedForm.description,
        totalAmount: totalAmount.toString(),
        status: "draft" as const,
        items: JSON.stringify(detailedForm.lineItems),
        validUntil: detailedForm.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        estimateNumber: `EST-${Date.now().toString().slice(-6)}`,
        type: "original",
        version: 1
      };

      const response = await apiRequest("POST", "/api/estimates", estimateData);
      await queryClient.invalidateQueries({ queryKey: ['/api/estimates'] });
      
      toast({
        title: "Success!",
        description: "Detailed estimate created successfully"
      });

      resetForms();
      onClose();
      
      // Redirect to preview page
      setLocation(`/estimates/${response.id}`);

    } catch (error) {
      console.error("Error creating estimate:", error);
      toast({
        title: "Error",
        description: "Failed to create estimate",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Estimate</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="quick" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Quick Estimate
            </TabsTrigger>
            <TabsTrigger value="detailed" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Detailed Estimate
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quick" className="space-y-6">
            <div className="text-center">
              <Zap className="mx-auto h-12 w-12 text-blue-500 mb-4" />
              <h3 className="text-lg font-semibold">Quick Estimate</h3>
              <p className="text-sm text-muted-foreground">Perfect for simple jobs with a single price</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="quick-customer">Customer *</Label>
                
                {showInlineCustomerForm ? (
                  <Card className="p-4 border-blue-200 bg-blue-50/30">
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="inline-firstName" className="text-xs">First Name *</Label>
                          <Input
                            id="inline-firstName"
                            value={inlineCustomerData.firstName}
                            onChange={(e) => setInlineCustomerData(prev => ({ ...prev, firstName: e.target.value }))}
                            placeholder="John"
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label htmlFor="inline-lastName" className="text-xs">Last Name *</Label>
                          <Input
                            id="inline-lastName"
                            value={inlineCustomerData.lastName}
                            onChange={(e) => setInlineCustomerData(prev => ({ ...prev, lastName: e.target.value }))}
                            placeholder="Smith"
                            className="h-8"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="inline-phone" className="text-xs">Phone *</Label>
                          <Input
                            id="inline-phone"
                            value={inlineCustomerData.phone}
                            onChange={(e) => setInlineCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="(555) 123-4567"
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label htmlFor="inline-secondaryPhone" className="text-xs">Secondary Phone</Label>
                          <Input
                            id="inline-secondaryPhone"
                            value={inlineCustomerData.secondaryPhone}
                            onChange={(e) => setInlineCustomerData(prev => ({ ...prev, secondaryPhone: e.target.value }))}
                            placeholder="(555) 987-6543"
                            className="h-8"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="inline-email" className="text-xs">Email</Label>
                        <Input
                          id="inline-email"
                          type="email"
                          value={inlineCustomerData.email}
                          onChange={(e) => setInlineCustomerData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="john@example.com"
                          className="h-8"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="inline-address" className="text-xs">Street Address</Label>
                        <Input
                          id="inline-address"
                          value={inlineCustomerData.address}
                          onChange={(e) => setInlineCustomerData(prev => ({ ...prev, address: e.target.value }))}
                          placeholder="123 Main St"
                          className="h-8"
                        />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label htmlFor="inline-city" className="text-xs">City</Label>
                          <Input
                            id="inline-city"
                            value={inlineCustomerData.city}
                            onChange={(e) => setInlineCustomerData(prev => ({ ...prev, city: e.target.value }))}
                            placeholder="Peoria"
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label htmlFor="inline-state" className="text-xs">State</Label>
                          <Input
                            id="inline-state"
                            value={inlineCustomerData.state}
                            onChange={(e) => setInlineCustomerData(prev => ({ ...prev, state: e.target.value }))}
                            placeholder="IL"
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label htmlFor="inline-zipCode" className="text-xs">ZIP</Label>
                          <Input
                            id="inline-zipCode"
                            value={inlineCustomerData.zipCode}
                            onChange={(e) => setInlineCustomerData(prev => ({ ...prev, zipCode: e.target.value }))}
                            placeholder="61614"
                            className="h-8"
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowInlineCustomerForm(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          onClick={handleInlineCustomerCreate}
                          size="sm"
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                          Create & Select
                        </Button>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Select value={quickForm.customerId} onValueChange={(value) => {
                    if (value === "add_new") {
                      setShowInlineCustomerForm(true);
                    } else {
                      setQuickForm(prev => ({ ...prev, customerId: value }));
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="add_new" className="text-blue-600 font-medium">
                        + Add Customer
                      </SelectItem>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id.toString()}>
                          {customer.firstName} {customer.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div>
                <Label htmlFor="quick-description">Project Description *</Label>
                <PolishFormField
                  value={quickForm.description}
                  onChange={(value) => setQuickForm(prev => ({ ...prev, description: value }))}
                  placeholder="Describe the project (e.g., Install 140 linear feet of wooden privacy fence...)"
                  fieldType="description"
                  businessType={businessProfile.businessType || "general"}
                  businessName={businessProfile.businessName || ""}
                />
              </div>

              <div>
                <Label htmlFor="quick-amount">Your Estimate Amount *</Label>
                <Input
                  id="quick-amount"
                  type="number"
                  placeholder="Enter your estimate price"
                  value={quickForm.amount}
                  onChange={(e) => setQuickForm(prev => ({ ...prev, amount: e.target.value }))}
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <Label htmlFor="quick-notes">Additional Notes</Label>
                <PolishFormField
                  value={quickForm.notes}
                  onChange={(value) => setQuickForm(prev => ({ ...prev, notes: value }))}
                  placeholder="Any special requirements or additional information..."
                  fieldType="notes"
                  businessType={businessProfile.businessType || "general"}
                  businessName={businessProfile.businessName || ""}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={createQuickEstimate}
                disabled={!quickForm.customerId || !quickForm.description.trim() || !quickForm.amount || isGenerating}
                className="min-w-[140px]"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Estimate"
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="detailed" className="space-y-6">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold">Detailed Estimate</h3>
              <p className="text-sm text-muted-foreground">Professional estimates with line items and custom terms</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="detailed-customer">Customer *</Label>
                <Select value={detailedForm.customerId} onValueChange={(value) => {
                  if (value === "add_new") {
                    setShowInlineCustomerForm(true);
                    setActiveTab("quick"); // Switch to quick tab for customer creation
                  } else {
                    setDetailedForm(prev => ({ ...prev, customerId: value }));
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add_new" className="text-blue-600 font-medium">
                      + Add Customer
                    </SelectItem>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.firstName} {customer.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="detailed-title">Estimate Title *</Label>
                <PolishFormField
                  value={detailedForm.title}
                  onChange={(value) => setDetailedForm(prev => ({ ...prev, title: value }))}
                  placeholder="Enter estimate title"
                  fieldType="title"
                  businessType={businessProfile.businessType || "general"}
                  businessName={businessProfile.businessName || ""}
                />
              </div>

              <div>
                <Label htmlFor="detailed-description">Project Description</Label>
                <PolishFormField
                  value={detailedForm.description}
                  onChange={(value) => setDetailedForm(prev => ({ ...prev, description: value }))}
                  placeholder="Detailed project description..."
                  fieldType="description"
                  businessType={businessProfile.businessType || "general"}
                  businessName={businessProfile.businessName || ""}
                />
              </div>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg">Line Items</CardTitle>
                  <Button onClick={addLineItem} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {detailedForm.lineItems.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-12 gap-4 items-end">
                      <div className="col-span-5">
                        <Label>Description</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                          placeholder="Item description"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Qty</Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Rate</Label>
                        <Input
                          type="number"
                          value={item.rate}
                          onChange={(e) => updateLineItem(index, 'rate', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Amount</Label>
                        <Input value={item.amount.toFixed(2)} readOnly className="bg-gray-50" />
                      </div>
                      <div className="col-span-1">
                        <Button
                          onClick={() => removeLineItem(index)}
                          size="sm"
                          variant="outline"
                          disabled={detailedForm.lineItems.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-end">
                    <div className="text-lg font-semibold">
                      Total: ${getTotalAmount().toFixed(2)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="detailed-valid-until">Valid Until</Label>
                  <Input
                    id="detailed-valid-until"
                    type="date"
                    value={detailedForm.validUntil}
                    onChange={(e) => setDetailedForm(prev => ({ ...prev, validUntil: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="detailed-notes">Additional Notes</Label>
                  <Input
                    id="detailed-notes"
                    value={detailedForm.notes}
                    onChange={(e) => setDetailedForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Special requirements..."
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="detailed-terms">Terms & Conditions</Label>
                <Textarea
                  id="detailed-terms"
                  value={detailedForm.terms}
                  onChange={(e) => setDetailedForm(prev => ({ ...prev, terms: e.target.value }))}
                  placeholder={businessProfile.defaultEstimateTerms || "Payment due within 30 days of acceptance..."}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={createDetailedEstimate}
                disabled={!detailedForm.customerId || !detailedForm.title.trim() || detailedForm.lineItems.length === 0 || isGenerating}
                className="min-w-[140px]"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Estimate"
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
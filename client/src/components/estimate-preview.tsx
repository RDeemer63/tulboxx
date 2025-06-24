import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  Edit3, 
  Save, 
  Mail, 
  Printer, 
  Download, 
  CheckCircle, 
  Sparkles,
  Plus,
  Trash2,
  ArrowLeft,
  Clock,
  Palette,
  X,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import type { Estimate, Customer, BusinessProfile } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import excavatingLogo from "@/assets/excavating-logo.svg";
import EstimateTemplateSelector from "./estimate-template-selector";
import { ProfessionalTemplate, ModernTemplate, ClassicTemplate, DetailedTemplate } from "./estimate-templates";

interface EstimatePreviewProps {
  estimateId: number;
  onAccept?: (estimate: Estimate) => void;
  onBack?: () => void;
}

interface LineItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export default function EstimatePreview({ estimateId, onAccept, onBack }: EstimatePreviewProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for editing modes
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [editingItems, setEditingItems] = useState(false);
  
  // State for edited content
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedNotes, setEditedNotes] = useState("");
  const [editedItems, setEditedItems] = useState<LineItem[]>([]);
  
  // Auto-save state
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Template state
  const [selectedTemplate, setSelectedTemplate] = useState('professional');
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  
  // Terms & Conditions state
  const [editingTerms, setEditingTerms] = useState(false);
  const [editedTerms, setEditedTerms] = useState("");
  const [selectedContractTemplate, setSelectedContractTemplate] = useState("none");

  // Fetch estimate data
  const { data: estimates = [] } = useQuery({
    queryKey: ['/api/estimates'],
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['/api/customers'],
  });

  const { data: businessProfile } = useQuery({
    queryKey: ['/api/business-profile'],
  });

  const estimate = (estimates as Estimate[]).find((est: Estimate) => est.id === estimateId);
  const customer = (customers as Customer[]).find((cust: Customer) => cust.id === estimate?.customerId);

  // Helper functions for contract templates
  const getContractTemplateName = (templateId: string) => {
    switch (templateId) {
      case 'standard': return 'Standard Service Agreement';
      case 'excavation': return 'Excavation Contract';
      case 'maintenance': return 'Maintenance Agreement';
      default: return 'Unknown Template';
    }
  };

  const getContractTemplateContent = (templateId: string) => {
    switch (templateId) {
      case 'standard':
        return 'This agreement covers standard service work including materials, labor, and cleanup. Payment terms: Net 30 days. Work guarantee: 1 year on labor, manufacturer warranty on materials.';
      case 'excavation':
        return 'Excavation work agreement including site preparation, excavation, backfill, and restoration. Client responsible for locating utilities. Weather delays may affect timeline. Payment: 50% down, balance on completion.';
      case 'maintenance':
        return 'Ongoing maintenance agreement with scheduled service visits. Emergency service available 24/7. Seasonal adjustments apply. Annual contract with quarterly billing.';
      default:
        return 'Standard terms and conditions apply.';
    }
  };

  // Auto-save function
  const triggerAutoSave = (field: string, value: any) => {
    setSaveStatus('unsaved');
    
    // Clear existing timeout
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    
    // Set new timeout for auto-save
    const newTimeout = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        const response = await fetch(`/api/estimates/${estimateId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            [field]: value
          })
        });
        
        if (response.ok) {
          setSaveStatus('saved');
          queryClient.invalidateQueries({ queryKey: ['/api/estimates'] });
        } else {
          throw new Error('Save failed');
        }
      } catch (error) {
        setSaveStatus('unsaved');
        toast({
          title: "Auto-save failed",
          description: "Your changes couldn't be saved automatically",
          variant: "destructive"
        });
      }
    }, 2000); // Save after 2 seconds of no typing
    
    setAutoSaveTimeout(newTimeout);
  };

  // PDF generation function
  const handleDownloadPDF = async () => {
    try {
      const element = document.querySelector('.estimate-document') as HTMLElement;
      if (!element) {
        toast({
          title: "Error",
          description: "Could not find estimate to generate PDF",
          variant: "destructive"
        });
        return;
      }

      // Create canvas from the estimate document
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download the PDF
      pdf.save(`estimate-${estimate?.estimateNumber || estimateId}.pdf`);
      
      toast({
        title: "PDF Generated",
        description: "Estimate has been downloaded successfully",
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive"
      });
    }
  };

  // Initialize edited states when estimate loads
  useEffect(() => {
    if (estimate) {
      setEditedTitle(estimate.title || "");
      setEditedDescription(estimate.description || "");
      setEditedNotes(""); // Estimates don't have notes field in schema
      
      if (estimate.items) {
        try {
          const items = JSON.parse(estimate.items);
          setEditedItems(items);
        } catch {
          setEditedItems([]);
        }
      }
    }
  }, [estimate]);

  // Save estimate mutation
  const saveEstimateMutation = useMutation({
    mutationFn: async (updates: Partial<Estimate>) => {
      const response = await fetch(`/api/estimates/${estimateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update estimate');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/estimates'] });
      toast({
        title: "Estimate Updated",
        description: "Your changes have been saved successfully.",
      });
    },
  });

  // Polish text mutation
  const polishTextMutation = useMutation({
    mutationFn: async ({ text, fieldType }: { text: string; fieldType: string }) => {
      const response = await fetch('/api/ai/polish-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          fieldType,
          businessType: (businessProfile as any)?.businessType || "service business",
          businessName: (businessProfile as any)?.businessName || "Your Business"
        }),
      });
      if (!response.ok) throw new Error('Failed to polish text');
      return response.json();
    },
    onSuccess: (data, variables) => {
      if (variables.fieldType === 'title') {
        setEditedTitle(data.polishedText);
      } else if (variables.fieldType === 'description') {
        setEditedDescription(data.polishedText);
      } else if (variables.fieldType === 'notes') {
        setEditedNotes(data.polishedText);
      }
      toast({
        title: "Text Polished",
        description: "AI has improved your content.",
      });
    },
  });

  // Accept estimate mutation
  const acceptEstimateMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/estimates/${estimateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'accepted' }),
      });
      if (!response.ok) throw new Error('Failed to accept estimate');
      return response.json();
    },
    onSuccess: (updatedEstimate) => {
      queryClient.invalidateQueries({ queryKey: ['/api/estimates'] });
      onAccept?.(updatedEstimate);
      toast({
        title: "Estimate Accepted",
        description: "This estimate has been marked as accepted and will be converted to a job.",
      });
    },
  });

  if (!estimate || !customer) {
    return <div>Loading estimate...</div>;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const calculateSubtotal = () => {
    return editedItems.reduce((sum, item) => sum + item.amount, 0);
  };

  const saveField = (field: string, value: string | LineItem[]) => {
    const updates: Partial<Estimate> = {};
    
    if (field === 'title') {
      updates.title = value as string;
      setEditingTitle(false);
    } else if (field === 'description') {
      updates.description = value as string;
      setEditingDescription(false);
    } else if (field === 'items') {
      updates.items = JSON.stringify(value);
      setEditingItems(false);
    }
    
    saveEstimateMutation.mutate(updates);
  };

  const addLineItem = () => {
    setEditedItems([...editedItems, { description: "", quantity: 1, rate: 0, amount: 0 }]);
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
    const updatedItems = [...editedItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Auto-calculate amount when quantity or rate changes
    if (field === 'quantity' || field === 'rate') {
      updatedItems[index].amount = updatedItems[index].quantity * updatedItems[index].rate;
    }
    
    setEditedItems(updatedItems);
    
    // Trigger auto-save for line items
    triggerAutoSave('items', JSON.stringify(updatedItems));
  };

  const removeLineItem = (index: number) => {
    const updatedItems = editedItems.filter((_, i) => i !== index);
    setEditedItems(updatedItems);
    
    // Trigger auto-save when removing items
    triggerAutoSave('items', JSON.stringify(updatedItems));
  };

  // Template renderer
  const renderTemplate = () => {
    const templateProps = {
      estimate,
      customer,
      businessProfile,
      editedItems,
      calculateSubtotal,
      formatCurrency
    };

    switch (selectedTemplate) {
      case 'modern':
        return <ModernTemplate {...templateProps} />;
      case 'classic':
        return <ClassicTemplate {...templateProps} />;
      case 'detailed':
        return <DetailedTemplate {...templateProps} />;
      case 'professional':
      default:
        return <ProfessionalTemplate {...templateProps} />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Badge variant={estimate.status === 'accepted' ? 'default' : 'secondary'}>
            {estimate.status}
          </Badge>
        </div>

        {/* Mobile Action Buttons */}
        <div className="space-y-3 mb-6">
          <div className="grid grid-cols-4 gap-2">
            <Button variant="outline" className="h-11 w-11 p-0" title="Send Estimate">
              <Mail className="w-5 h-5" />
            </Button>
            <Button variant="outline" className="h-11 w-11 p-0" title="Print" onClick={() => {
              const printContent = document.querySelector('.estimate-document');
              if (printContent) {
                const printWindow = window.open('', '_blank');
                if (printWindow) {
                  printWindow.document.write(`
                    <html>
                      <head>
                        <title>Estimate Print</title>
                        <style>
                          body { font-family: Arial, sans-serif; margin: 20px; }
                          @media print { body { margin: 0; } }
                        </style>
                      </head>
                      <body>
                        ${printContent.outerHTML}
                      </body>
                    </html>
                  `);
                  printWindow.document.close();
                  printWindow.print();
                  printWindow.close();
                }
              }
            }}>
              <Printer className="w-5 h-5" />
            </Button>
            <Button variant="outline" className="h-11 w-11 p-0" title="Download PDF" onClick={() => {
              window.open(`/api/estimates/${estimateId}/pdf`, '_blank');
            }}>
              <Download className="w-5 h-5" />
            </Button>
            <Button variant="outline" className="h-11 w-11 p-0" title="Change Template" onClick={() => setShowTemplateSelector(true)}>
              <Palette className="w-5 h-5" />
            </Button>
          </div>
          {estimate.status !== 'accepted' && (
            <Button 
              className="w-full h-12 text-sm"
              onClick={() => acceptEstimateMutation.mutate()}
              disabled={acceptEstimateMutation.isPending}
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Accept & Create Job
            </Button>
          )}
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Estimates
          </Button>
          <Badge variant={estimate.status === 'accepted' ? 'default' : 'secondary'}>
            {estimate.status}
          </Badge>
        </div>
        
        {/* Desktop Action Buttons */}
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="w-8 h-8 p-0" title="Send Estimate">
            <Mail className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" className="w-8 h-8 p-0" title="Print" onClick={() => {
            const printContent = document.querySelector('.estimate-document');
            if (printContent) {
              const printWindow = window.open('', '_blank');
              if (printWindow) {
                printWindow.document.write(`
                  <html>
                    <head>
                      <title>Estimate Print</title>
                      <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        @media print { body { margin: 0; } }
                      </style>
                    </head>
                    <body>
                      ${printContent.outerHTML}
                    </body>
                  </html>
                `);
                printWindow.document.close();
                printWindow.print();
                printWindow.close();
              }
            }
          }}>
            <Printer className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" className="w-8 h-8 p-0" title="Download PDF" onClick={() => {
            window.open(`/api/estimates/${estimateId}/pdf`, '_blank');
          }}>
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" className="w-8 h-8 p-0" title="Change Template" onClick={() => setShowTemplateSelector(true)}>
            <Palette className="w-4 h-4" />
          </Button>
          {estimate.status !== 'accepted' && (
            <Button 
              onClick={() => acceptEstimateMutation.mutate()}
              disabled={acceptEstimateMutation.isPending}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Accept & Create Job
            </Button>
          )}
        </div>
      </div>

      {/* Save Status Indicator - Floating */}
      {saveStatus !== 'saved' && (
        <div className="fixed bottom-4 right-4 z-40 bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 print:hidden">
          <div className="flex items-center text-sm text-gray-600">
            {saveStatus === 'saving' && (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                Saving...
              </>
            )}
            {saveStatus === 'unsaved' && (
              <>
                <div className="w-3 h-3 bg-orange-600 rounded-full mr-2"></div>
                Unsaved changes
              </>
            )}
          </div>
        </div>
      )}

      {/* Estimate Document */}
      <Card className="estimate-document print:shadow-none print:border-none">
        <CardContent className="p-8">
          {/* Dynamic Template Rendering */}
          {renderTemplate()}
          
          {/* Line Items Section - Always shown for editing */}
          <div className="mb-8 pb-6 border-b border-gray-300">
            {/* Desktop Layout */}
            <div className="hidden md:flex justify-between items-start">
              {/* Business Info - Left Side (Email Signature Style) */}
              <div className="flex items-start space-x-3 flex-1">
                <img src={excavatingLogo} alt="Company Logo" className="w-12 h-12 mt-1" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900 mb-2">
                    {(businessProfile as any)?.businessName || "Dunlap Excavating"}
                  </h1>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>{(businessProfile as any)?.phone || "(309) 555-0123"} | {(businessProfile as any)?.email || "mike@dunlapexcavating.com"}</p>
                    <p>{(businessProfile as any)?.address || "11222 N Tuscany Ridge Ct"}</p>
                  </div>
                </div>
              </div>

              {/* Estimate Info & Customer - Right Side */}
              <div className="text-right flex-1 max-w-xs">
                <h2 className="text-xl font-bold text-gray-900 mb-3">ESTIMATE</h2>
                
                {/* Customer Info - Prominent placement */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">PREPARED FOR:</p>
                  <div className="text-sm text-gray-900">
                    <p className="font-medium">{customer.firstName} {customer.lastName}</p>
                    <p className="text-gray-600">{customer.email}</p>
                    <p className="text-gray-600">{customer.phone}</p>
                    {customer.address && (
                      <p className="text-gray-600">{customer.address}</p>
                    )}
                  </div>
                </div>
                
                {/* Estimate Details - Single row footer style */}
                <div className="text-xs text-gray-500 space-x-4 pt-3 border-t border-gray-200">
                  <span>#{estimate.estimateNumber || `EST-${estimate.id}`}</span>
                  <span>{format(new Date(estimate.createdAt), 'MMM dd, yyyy')}</span>
                  <span>Valid: {estimate.validUntil ? format(new Date(estimate.validUntil), 'MMM dd, yyyy') : 'Jun 05, 2025'}</span>
                </div>
              </div>
            </div>

            {/* Mobile Layout - Stacked */}
            <div className="md:hidden space-y-6">
              {/* Business Info - Top */}
              <div className="flex items-start space-x-3">
                <img src={excavatingLogo} alt="Company Logo" className="w-10 h-10 mt-1" />
                <div>
                  <h1 className="text-lg font-bold text-gray-900 mb-1">
                    {(businessProfile as any)?.businessName || "Dunlap Excavating"}
                  </h1>
                  <div className="text-sm text-gray-600 space-y-0.5">
                    <p>{(businessProfile as any)?.phone || "(309) 555-0123"}</p>
                    <p>{(businessProfile as any)?.email || "mike@dunlapexcavating.com"}</p>
                    <p>{(businessProfile as any)?.address || "11222 N Tuscany Ridge Ct"}</p>
                  </div>
                </div>
              </div>

              {/* Estimate Title & Customer Info */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3">ESTIMATE</h2>
                
                {/* Customer Info */}
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-1">PREPARED FOR:</p>
                  <div className="text-sm text-gray-900">
                    <p className="font-medium">{customer.firstName} {customer.lastName}</p>
                    <p className="text-gray-600">{customer.email}</p>
                    <p className="text-gray-600">{customer.phone}</p>
                    {customer.address && (
                      <p className="text-gray-600">{customer.address}</p>
                    )}
                  </div>
                </div>
                
                {/* Estimate Details - Stacked for mobile */}
                <div className="text-xs text-gray-500 pt-3 border-t border-gray-200 space-y-1">
                  <div>#{estimate.estimateNumber || `EST-${estimate.id}`}</div>
                  <div>{format(new Date(estimate.createdAt), 'MMM dd, yyyy')}</div>
                  <div>Valid: {estimate.validUntil ? format(new Date(estimate.validUntil), 'MMM dd, yyyy') : 'Jun 05, 2025'}</div>
                </div>
              </div>
            </div>
          </div>

          <div>
          {/* Sales-Focused Content */}

          {/* Editable Project Title (no label) */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              {editingTitle ? (
                <Input
                  value={editedTitle}
                  onChange={(e) => {
                    setEditedTitle(e.target.value);
                    triggerAutoSave('title', e.target.value);
                  }}
                  className="text-xl font-semibold text-gray-900 border-none p-0 focus:ring-0 bg-transparent"
                  placeholder="Enter project title..."
                />
              ) : (
                <h2 className="text-xl font-semibold text-gray-900">
                  {estimate.title || "Project Title"}
                </h2>
              )}
              
              <div className="flex space-x-2 print:hidden">
                {!editingTitle && (
                  <Button
                    variant="ghost"
                    className="h-10 w-10 md:h-8 md:w-8"
                    onClick={() => setEditingTitle(true)}
                  >
                    <Edit3 className="w-5 h-5 md:w-4 md:h-4" />
                  </Button>
                )}
                {editingTitle && (
                  <>
                    <Button
                      variant="ghost"
                      className="h-10 w-10 md:h-8 md:w-8"
                      onClick={() => saveField('title', editedTitle)}
                      disabled={saveEstimateMutation.isPending}
                    >
                      <Save className="w-5 h-5 md:w-4 md:h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Editable Description */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">Description</h3>
              <div className="flex space-x-2 print:hidden">
                {!editingDescription && (
                  <Button
                    variant="ghost"
                    className="h-10 w-10 md:h-8 md:w-8"
                    onClick={() => setEditingDescription(true)}
                  >
                    <Edit3 className="w-5 h-5 md:w-4 md:h-4" />
                  </Button>
                )}
                {editingDescription && (
                  <>
                    <Button
                      variant="ghost"
                      className="h-10 w-10 md:h-8 md:w-8"
                      onClick={() => polishTextMutation.mutate({ text: editedDescription, fieldType: 'description' })}
                      disabled={polishTextMutation.isPending}
                    >
                      <Sparkles className="w-5 h-5 md:w-4 md:h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-10 w-10 md:h-8 md:w-8"
                      onClick={() => saveField('description', editedDescription)}
                      disabled={saveEstimateMutation.isPending}
                    >
                      <Save className="w-5 h-5 md:w-4 md:h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            {editingDescription ? (
              <Textarea
                value={editedDescription}
                onChange={(e) => {
                  setEditedDescription(e.target.value);
                  triggerAutoSave('description', e.target.value);
                }}
                rows={4}
                placeholder="Describe the project details..."
              />
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {estimate.description}
              </p>
            )}
          </div>

          {/* Editable Line Items */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Items & Services</h3>
              <div className="flex space-x-2 print:hidden">
                {!editingItems && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingItems(true)}
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                )}
                {editingItems && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={addLineItem}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => saveField('items', editedItems)}
                      disabled={saveEstimateMutation.isPending}
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-900">Description</th>
                    <th className="text-center p-4 font-medium text-gray-900 w-20">Qty</th>
                    <th className="text-right p-4 font-medium text-gray-900 w-24">Rate</th>
                    <th className="text-right p-4 font-medium text-gray-900 w-24">Amount</th>
                    {editingItems && <th className="w-12"></th>}
                  </tr>
                </thead>
                <tbody>
                  {editedItems.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-4">
                        {editingItems ? (
                          <Input
                            value={item.description}
                            onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                            placeholder="Item description..."
                          />
                        ) : (
                          <span className="text-gray-900">{item.description}</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {editingItems ? (
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                            className="text-center"
                          />
                        ) : (
                          <span className="text-gray-600">{item.quantity}</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {editingItems ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={item.rate}
                            onChange={(e) => updateLineItem(index, 'rate', parseFloat(e.target.value) || 0)}
                            className="text-right"
                          />
                        ) : (
                          <span className="text-gray-600">{formatCurrency(item.rate)}</span>
                        )}
                      </td>
                      <td className="p-4 text-right font-medium">
                        {formatCurrency(item.amount)}
                      </td>
                      {editingItems && (
                        <td className="p-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLineItem(index)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="flex justify-end mt-4">
              <div className="w-64">
                <div className="flex justify-between items-center py-2 border-t border-gray-200">
                  <span className="font-semibold text-gray-900">Subtotal:</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(calculateSubtotal())}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-t-2 border-gray-900">
                  <span className="text-xl font-bold text-gray-900">Total:</span>
                  <span className="text-xl font-bold text-gray-900">{formatCurrency(calculateSubtotal())}</span>
                </div>
              </div>
            </div>
          </div>



          {/* Terms */}
          {/* Terms & Conditions Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Terms & Conditions</h3>
              <div className="flex space-x-2 print:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingTerms(true)}
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {editingTerms ? (
              <div className="space-y-4">
                {/* Individual Estimate Terms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project-Specific Terms
                  </label>
                  <Textarea
                    value={editedTerms}
                    onChange={(e) => {
                      setEditedTerms(e.target.value);
                      triggerAutoSave('terms', e.target.value);
                    }}
                    rows={6}
                    placeholder="Add specific terms and conditions for this estimate..."
                    className="w-full"
                  />
                </div>
                
                {/* Contract Template Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Contract Template
                  </label>
                  <Select value={selectedContractTemplate} onValueChange={setSelectedContractTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a contract template (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No template</SelectItem>
                      <SelectItem value="standard">Standard Service Agreement</SelectItem>
                      <SelectItem value="excavation">Excavation Contract</SelectItem>
                      <SelectItem value="maintenance">Maintenance Agreement</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Templates are managed in your business profile settings
                  </p>
                </div>
                
                {/* Action buttons */}
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingTerms(false)}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => saveField('terms', editedTerms)}
                    disabled={saveEstimateMutation.isPending}
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Save Terms
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {editedTerms && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Project Terms</h4>
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                      {editedTerms}
                    </p>
                  </div>
                )}
                
                {selectedContractTemplate && selectedContractTemplate !== 'none' && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Contract Terms</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Template:</strong> {getContractTemplateName(selectedContractTemplate)}
                      </p>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {getContractTemplateContent(selectedContractTemplate)}
                      </p>
                    </div>
                  </div>
                )}
                
                {!editedTerms && (!selectedContractTemplate || selectedContractTemplate === 'none') && (
                  <p className="text-gray-500 text-sm italic">
                    No terms and conditions specified. Click the edit button to add terms.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center text-gray-500 text-sm">
            <p>Thank you for choosing {(businessProfile as any)?.businessName || "Tulboxx"}!</p>
            <p className="mt-1">This estimate is valid for 30 days from the date issued.</p>
          </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Template Selector Modal */}
      {showTemplateSelector && (
        <EstimateTemplateSelector
          selectedTemplate={selectedTemplate}
          onTemplateSelect={setSelectedTemplate}
          onClose={() => setShowTemplateSelector(false)}
        />
      )}
    </div>
  );
}
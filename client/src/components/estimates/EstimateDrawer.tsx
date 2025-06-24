import React, { useEffect, useMemo, useState } from "react";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, X, Sparkles, Plus, GripVertical, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import Big from "big.js";

// TODO: Replace with actual API hooks
const useGetEstimateById = (id: string | null) => ({ data: null, isLoading: false });
const useCreateEstimate = () => ({ mutateAsync: async (data: any) => console.log("Creating estimate", data), isPending: false });
const useUpdateEstimate = () => ({ mutateAsync: async (data: any) => console.log("Updating estimate", data), isPending: false });
const useSendEstimate = () => ({ mutate: (id: string) => console.log("Sending estimate", id), isPending: false });

// --- Zod Schema for Form Validation ---
const lineItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, "Description is required."),
  quantity: z.number().min(0),
  unitPrice: z.number().min(0),
  total: z.number(),
});

const estimateFormSchema = z.object({
  title: z.string().min(1, "Estimate title is required."),
  customerId: z.string().nullable(),
  status: z.string(),
  lineItems: z.array(lineItemSchema),
  notes: z.string().optional(),
  taxRate: z.number().min(0).max(100).default(0),
});

type EstimateFormValues = z.infer<typeof estimateFormSchema>;

// --- Component Props ---
interface EstimateDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  estimateId?: string | null;
  onSuccess?: (estimate: any) => void;
}

/**
 * A comprehensive drawer component for creating and editing estimates.
 * It features a tabbed interface, detailed form validation, and real-time calculations.
 */
export const EstimateDrawer: React.FC<EstimateDrawerProps> = ({
  isOpen,
  onClose,
  estimateId = null,
  onSuccess,
}) => {
  const { toast } = useToast();
  const isEditMode = !!estimateId;

  // --- Data Fetching ---
  const { data: initialData, isLoading: isLoadingInitialData } = useGetEstimateById(estimateId);

  // --- Form Setup ---
  const methods = useForm<EstimateFormValues>({
    resolver: zodResolver(estimateFormSchema),
    defaultValues: {
      title: "",
      customerId: null,
      status: "draft",
      lineItems: [],
      notes: "",
      taxRate: 7.5, // Default tax rate
    },
  });

  const {
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { isDirty },
  } = methods;

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "lineItems",
  });

  // --- Effects ---
  // Reset form when initial data is loaded for editing
  useEffect(() => {
    if (isEditMode && initialData) {
      reset({
        ...initialData,
        lineItems: initialData.lineItems || [],
      });
    } else if (!isEditMode) {
      reset(); // Reset to defaults for new estimate
    }
  }, [initialData, isEditMode, reset]);

  // Real-time calculation of totals
  const watchedLineItems = watch("lineItems");
  const watchedTaxRate = watch("taxRate");

  const { subtotal, taxAmount, total } = useMemo(() => {
    const sub = watchedLineItems.reduce((acc, item) => {
      const itemTotal = new Big(item.quantity || 0).times(new Big(item.unitPrice || 0));
      return acc.plus(itemTotal);
    }, new Big(0));

    const tax = sub.times(new Big(watchedTaxRate || 0).div(100));
    const grandTotal = sub.plus(tax);

    return {
      subtotal: sub.toFixed(2),
      taxAmount: tax.toFixed(2),
      total: grandTotal.toFixed(2),
    };
  }, [watchedLineItems, watchedTaxRate]);

  // --- Mutations ---
  const createEstimateMutation = useCreateEstimate();
  const updateEstimateMutation = useUpdateEstimate();
  const sendEstimateMutation = useSendEstimate();

  const isSaving = createEstimateMutation.isPending || updateEstimateMutation.isPending;

  // --- Event Handlers ---
  const handleSave = async (values: EstimateFormValues, asStatus: 'draft' | 'sent' = 'draft') => {
    const payload = { ...values, status: asStatus };
    try {
      let savedEstimate;
      if (isEditMode) {
        savedEstimate = await updateEstimateMutation.mutateAsync({ ...payload, id: estimateId });
      } else {
        savedEstimate = await createEstimateMutation.mutateAsync(payload);
      }
      toast({ title: "Success", description: `Estimate saved as ${asStatus}.` });
      if (onSuccess) onSuccess(savedEstimate);
      if (asStatus === 'sent') {
        sendEstimateMutation.mutate(savedEstimate.id);
      }
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save estimate.",
        variant: "destructive",
      });
    }
  };

  const onSaveDraft = (values: EstimateFormValues) => handleSave(values, 'draft');
  const onSendEstimate = (values: EstimateFormValues) => handleSave(values, 'sent');
  
  const addLineItem = () => {
    append({ description: "", quantity: 1, unitPrice: 0, total: 0 });
  };

  if (isLoadingInitialData) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="sm:max-w-4xl w-full">
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-4xl w-full flex flex-col">
        <SheetHeader className="pr-12">
          <SheetTitle>{isEditMode ? "Edit Estimate" : "Create New Estimate"}</SheetTitle>
          <SheetDescription>
            {isEditMode ? `Editing estimate #${initialData?.estimateNumber}` : "Fill in the details to create a new estimate."}
          </SheetDescription>
        </SheetHeader>
        <SheetClose asChild>
            <Button variant="ghost" size="icon" className="absolute top-4 right-4">
              <X className="h-5 w-5" />
            </Button>
        </SheetClose>
        
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSaveDraft)} className="flex-1 flex flex-col overflow-hidden">
            <Tabs defaultValue="details" className="flex-1 flex flex-col overflow-hidden">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="line-items">Line Items</TabsTrigger>
                <TabsTrigger value="settings">Settings & Preview</TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1 mt-4">
                <div className="pr-6">
                <TabsContent value="details" className="space-y-4">
                  {/* TODO: Replace with a real Customer Combobox */}
                  <div>
                    <Label>Customer</Label>
                    <Input placeholder="Select a customer..." />
                  </div>
                  <div>
                    <Label htmlFor="title">Estimate Title</Label>
                    <Input id="title" {...methods.register("title")} />
                  </div>
                   <div>
                    <Label htmlFor="notes">Notes / Scope</Label>
                    <Textarea id="notes" {...methods.register("notes")} rows={5} />
                  </div>
                </TabsContent>

                <TabsContent value="line-items" className="space-y-4">
                  {/* TODO: Implement drag-and-drop */}
                  <div className="space-y-2">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex items-center gap-2">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                        <Input {...methods.register(`lineItems.${index}.description`)} placeholder="Description" />
                        <Input type="number" {...methods.register(`lineItems.${index}.quantity`, { valueAsNumber: true })} placeholder="Qty" className="w-20" />
                        <Input type="number" {...methods.register(`lineItems.${index}.unitPrice`, { valueAsNumber: true })} placeholder="Price" className="w-24" />
                        <Button variant="ghost" size="icon" onClick={() => remove(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button type="button" variant="outline" onClick={addLineItem}>
                    <Plus className="mr-2 h-4 w-4" /> Add Line Item
                  </Button>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                  <div>
                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                    <Input id="taxRate" type="number" {...methods.register("taxRate", { valueAsNumber: true })} />
                  </div>
                  {/* TODO: Add Date Picker for validUntil */}
                  {/* TODO: Add Terms & Conditions textarea */}
                  <Button type="button" variant="secondary">Preview PDF</Button>
                </TabsContent>
                </div>
              </ScrollArea>
            </Tabs>
            
            <Separator className="my-4" />

            {/* Totals Section */}
            <div className="space-y-2 pr-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax ({watchedTaxRate}%)</span>
                <span>{formatCurrency(taxAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <SheetFooter className="mt-6 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Draft
              </Button>
              <Button type="button" onClick={handleSubmit(onSendEstimate)} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save & Send
              </Button>
            </SheetFooter>
          </form>
        </FormProvider>
      </SheetContent>
    </Sheet>
  );
};

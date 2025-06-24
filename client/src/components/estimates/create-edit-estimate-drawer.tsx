import React, { useEffect, useState, useMemo } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequestJson, queryKeys, invalidateQueries } from "@/lib/queryClient";

import { type ModernEstimate, type Lead } from "@/shared/schema";
import { insertModernEstimateSchema } from "@/shared/estimates-schema";

// Import sub-components for each tab
import { ClientJobDetailsTab } from "./tabs/ClientJobDetailsTab";
import { ScopePricingTab } from "./tabs/ScopePricingTab";
import { TermsDeliveryTab } from "./tabs/TermsDeliveryTab";

// For now, we'll define tab content inline before potentially splitting them.

// --- Zod Schema for the Full Form ---
const estimateFormSchema = insertModernEstimateSchema.extend({
  // We extend the base schema to include client-side specific transformations or fields
  // For example, if we need to handle numbers on the client but send strings to the API
  // This is where we would adjust. For now, the base schema is a good start.
  // We'll add a client-side estimate type toggle
  estimateType: z.enum(["simple", "detailed"]).default("simple"),
});

type EstimateFormValues = z.infer<typeof estimateFormSchema>;

// --- Component Props ---
interface CreateEditEstimateDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  estimateToEdit?: ModernEstimate | null;
  leadData?: Partial<Lead> | null; // For creating from a lead
  onSaveSuccess?: (savedEstimate: ModernEstimate) => void;
}

/**
 * A full-screen drawer component for creating and editing estimates.
 * It features a multi-tab layout to guide the user through the process.
 */
export const CreateEditEstimateDrawer: React.FC<CreateEditEstimateDrawerProps> = ({
  isOpen,
  onClose,
  estimateToEdit,
  leadData,
  onSaveSuccess,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("client-job-details");

  const isEditMode = !!estimateToEdit;

  const form = useForm<EstimateFormValues>({
    resolver: zodResolver(estimateFormSchema),
    defaultValues: {
      estimateType: "simple",
      // ... other sensible defaults
    },
  });

  // --- Data Population Effect ---
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && estimateToEdit) {
        // Populate form with existing estimate data
        form.reset({
          ...estimateToEdit,
          // Ensure client-side fields like estimateType are set
          estimateType: estimateToEdit.estimateType || "simple",
        });
      } else if (leadData) {
        // Populate form with data from a lead
        form.reset({
          title: `Estimate for ${leadData.leadName}`,
          leadId: leadData.id,
          // customerId: leadData.originContactId, // This needs mapping
          notes: leadData.notes || "",
          source: "lead",
          // ... map other relevant lead fields
        });
      } else {
        // Reset to default for a new estimate
        form.reset();
      }
    }
  }, [isOpen, isEditMode, estimateToEdit, leadData, form]);

  // --- API Mutations ---
  const mutation = useMutation({
    mutationFn: (data: EstimateFormValues) => {
      const payload = { ...data };
      // TODO: Add any necessary data transformations before sending to API
      if (isEditMode) {
        return apiRequestJson<ModernEstimate>(
          "PUT",
          `/api/estimates/${estimateToEdit.id}`,
          payload
        );
      }
      return apiRequestJson<ModernEstimate>("POST", "/api/estimates", payload);
    },
    onSuccess: (savedEstimate) => {
      toast.success({
        title: `Estimate ${isEditMode ? "Updated" : "Created"}`,
        description: `Estimate #${savedEstimate.estimateNumber} has been saved.`,
      });
      invalidateQueries.estimate(savedEstimate.id);
      queryClient.invalidateQueries({ queryKey: queryKeys.estimates.list });
      onSaveSuccess?.(savedEstimate);
      onClose(); // Close drawer on success
    },
    onError: (error) => {
      toast.error({
        title: "Save Failed",
        description: error.message,
      });
    },
  });

  // --- Event Handlers ---
  const onSubmit = (values: EstimateFormValues) => {
    mutation.mutate(values);
  };

  const handleSaveDraft = () => {
    // TODO: Implement draft saving logic. Might be a separate endpoint or a status change.
    form.trigger().then((isValid) => {
      if (isValid) {
        console.log("Saving draft:", form.getValues());
        toast.info({ title: "Draft Saved" });
      } else {
        toast.error({ title: "Cannot save draft with invalid fields." });
      }
    });
  };

  // ---------------------------------------------------------------------------
  // Preview Handler
  // ---------------------------------------------------------------------------
  const estimateId = form.watch("id");
  const handlePreview = () => {
    if (!estimateId) {
      toast.info({
        title: "Save First",
        description: "Please save the estimate before previewing the PDF.",
      });
      return;
    }
    // Open the generated PDF in a new tab
    const url = `/api/estimates/${estimateId}/pdf?ts=${Date.now()}`; // cache-buster
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full max-w-4xl flex flex-col p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="text-2xl">
            {isEditMode ? `Edit Estimate #${estimateToEdit.estimateNumber}` : "Create New Estimate"}
          </SheetTitle>
          <SheetDescription>
            {isEditMode
              ? "Update the details of the estimate."
              : "Fill out the form to create a new estimate for your client."}
          </SheetDescription>
        </SheetHeader>

        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex-1 flex flex-col"
            >
              <TabsList className="grid w-full grid-cols-3 sticky top-0 bg-background z-10 px-6 pt-4 border-b">
                <TabsTrigger value="client-job-details">
                  Client & Job Details
                </TabsTrigger>
                <TabsTrigger value="scope-pricing">Scope & Pricing</TabsTrigger>
                <TabsTrigger value="terms-delivery">Terms & Delivery</TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto p-6">
                <TabsContent value="client-job-details">
                  <ClientJobDetailsTab />
                </TabsContent>
                <TabsContent value="scope-pricing">
                  <ScopePricingTab />
                </TabsContent>
                <TabsContent value="terms-delivery">
                  <TermsDeliveryTab />
                </TabsContent>
              </div>
            </Tabs>

            <SheetFooter className="p-4 border-t bg-background sticky bottom-0 z-10 flex justify-between">
              <div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={mutation.isPending}
                >
                  Save Draft
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handlePreview}
                >
                  Preview
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Saving..." : "Send to Client"}
                </Button>
              </div>
            </SheetFooter>
          </form>
        </FormProvider>
      </SheetContent>
    </Sheet>
  );
};

export default CreateEditEstimateDrawer;

import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLeads } from "@/contexts/leads-context";
import { debounce } from "lodash";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Loader2, Save } from "lucide-react";

// =================================================================
// Schema and Types
// =================================================================

const quickCaptureSchema = z.object({
  leadName: z.string().min(2, "Name must be at least 2 characters."),
  phone: z.string().min(10, "A valid phone number is required."),
  serviceType: z.string().min(1, "Please select a service type."),
  source: z.string().min(1, "Please select a lead source."),
  notes: z.string().optional(),
});

type QuickCaptureFormValues = z.infer<typeof quickCaptureSchema>;

const DRAFT_STORAGE_KEY = "tulboxx-quick-capture-lead-draft";

// =================================================================
// Component Props
// =================================================================

interface QuickCaptureFormProps {
  /**
   * Callback function triggered on successful lead creation.
   * Receives the newly created lead as an argument.
   */
  onSuccess?: (newLead: any) => void;
  /**
   * If true, displays the form in a more compact way.
   */
  isCompact?: boolean;
}

// =================================================================
// Main Component
// =================================================================

export const QuickCaptureForm: React.FC<QuickCaptureFormProps> = ({
  onSuccess,
  isCompact = false,
}) => {
  const { addLead, isLoading: isSubmitting } = useLeads();
  const [serverError, setServerError] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState<boolean>(false);

  const form = useForm<QuickCaptureFormValues>({
    resolver: zodResolver(quickCaptureSchema),
    defaultValues: {
      leadName: "",
      phone: "",
      serviceType: "",
      source: "",
      notes: "",
    },
  });

  // --- Draft Handling ---

  // Check for a saved draft on component mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        setHasDraft(true);
      }
    } catch (error) {
      console.error("Failed to read draft from localStorage", error);
    }
  }, []);

  // Debounced autosave function
  const autosaveDraft = useCallback(
    debounce((data: QuickCaptureFormValues) => {
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.error("Failed to save draft to localStorage", error);
      }
    }, 500),
    []
  );

  // Subscribe to form changes to trigger autosave
  useEffect(() => {
    const subscription = form.watch((value) => {
      autosaveDraft(value as QuickCaptureFormValues);
    });
    return () => subscription.unsubscribe();
  }, [form.watch, autosaveDraft]);

  const resumeDraft = () => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        form.reset(JSON.parse(savedDraft));
        setHasDraft(false);
      }
    } catch (error) {
      console.error("Failed to parse or resume draft", error);
    }
  };

  const discardDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      form.reset();
      setHasDraft(false);
    } catch (error) {
      console.error("Failed to discard draft", error);
    }
  };

  // --- Form Submission ---

  const onSubmit = async (data: QuickCaptureFormValues) => {
    setServerError(null);
    try {
      const newLead = await addLead(data);
      discardDraft(); // Clear draft on successful submission
      form.reset();
      if (onSuccess) {
        onSuccess(newLead);
      }
    } catch (error: any) {
      setServerError(error.message || "An unknown error occurred.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {hasDraft && (
          <Alert variant="default" className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertTitle className="text-blue-800 dark:text-blue-300">Unsaved Draft</AlertTitle>
            <AlertDescription className="text-blue-700 dark:text-blue-400">
              You have an unsaved lead draft.
              <div className="mt-2 space-x-2">
                <Button type="button" size="sm" onClick={resumeDraft}>
                  Resume Draft
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={discardDraft}
                >
                  Discard
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {serverError && (
          <Alert variant="destructive">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <div className={cn("grid gap-4", !isCompact && "md:grid-cols-2")}>
          <FormField
            control={form.control}
            name="leadName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lead Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., John Smith" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="(555) 123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className={cn("grid gap-4", !isCompact && "md:grid-cols-2")}>
          <FormField
            control={form.control}
            name="serviceType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="landscaping">Landscaping</SelectItem>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="hvac">HVAC</SelectItem>
                    <SelectItem value="construction">Construction</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lead Source</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a source..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Website">Website</SelectItem>
                    <SelectItem value="Referral">Referral</SelectItem>
                    <SelectItem value="Social Media">Social Media</SelectItem>
                    <SelectItem value="Walk-up">Walk-up</SelectItem>
                    <SelectItem value="Advertisement">Advertisement</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Initial inquiry details, property access info, etc."
                  className="resize-y"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Lead
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default QuickCaptureForm;


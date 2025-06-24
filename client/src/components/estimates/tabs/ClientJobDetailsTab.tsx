import React from "react";
import { useFormContext } from "react-hook-form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  FormControl,
  FormDescription,
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
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { User, Briefcase, Wand2, FileText, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ClientJobDetailsTab
 *
 * This component represents the first step in the estimate creation process.
 * It gathers essential information about the client and the job itself,
 * and allows the user to select the format of the estimate.
 *
 * It assumes it is rendered within a <FormProvider> from react-hook-form.
 */
export const ClientJobDetailsTab: React.FC = () => {
  const form = useFormContext(); // Access the form context provided by the parent component

  const handleAiTimelineSuggestion = () => {
    // Placeholder for AI logic
    // In a real implementation, this would call a service.
    // e.g., const suggestion = await aiService.getTimelineSuggestion(form.getValues('serviceType'));
    // form.setValue('expectedTimeline', suggestion);
    console.log("AI suggestion for timeline clicked.");
  };

  return (
    <div className="space-y-6">
      <Accordion
        type="multiple"
        defaultValue={["contact-info", "job-info"]}
        className="w-full"
      >
        {/* Section 1: Client Information */}
        <AccordionItem value="contact-info">
          <AccordionTrigger>
            <div className="flex items-center gap-2 text-lg font-semibold">
              <User className="h-5 w-5" />
              <span>Client Information</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 p-1">
              {/* Contact Name (pre-filled and read-only from lead) */}
              <FormField
                control={form.control}
                name="leadName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        readOnly
                        placeholder="Pre-filled from lead"
                        className="bg-slate-100 dark:bg-slate-800"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Phone */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="tel"
                          placeholder="(555) 123-4567"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="client@example.com"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Property Address */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Address</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="123 Main St, Anytown, USA"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Section 2: Job & Estimate Details */}
        <AccordionItem value="job-info">
          <AccordionTrigger>
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Briefcase className="h-5 w-5" />
              <span>Job & Estimate Details</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 p-1">
              {/* Estimate Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimate Title</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="e.g., Kitchen Remodel Phase 1"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Service Type */}
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
                          <SelectItem value="landscaping">
                            Landscaping
                          </SelectItem>
                          <SelectItem value="plumbing">Plumbing</SelectItem>
                          <SelectItem value="electrical">Electrical</SelectItem>
                          <SelectItem value="hvac">HVAC</SelectItem>
                          <SelectItem value="construction">
                            Construction
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Expected Timeline */}
                <FormField
                  control={form.control}
                  name="expectedTimeline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Timeline</FormLabel>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input {...field} placeholder="e.g., 2-3 weeks" />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          title="Get AI Suggestion"
                          onClick={handleAiTimelineSuggestion}
                        >
                          <Wand2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Estimate Format Toggle */}
              <FormField
                control={form.control}
                name="estimateType"
                render={({ field }) => (
                  <FormItem className="space-y-3 pt-2">
                    <FormLabel>Estimate Format</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-1 gap-4 md:grid-cols-2"
                      >
                        <FormItem>
                          <FormControl>
                            <RadioGroupItem
                              value="simple"
                              id="simple-estimate"
                              className="peer sr-only"
                            />
                          </FormControl>
                          <FormLabel
                            htmlFor="simple-estimate"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                          >
                            <FileText className="mb-3 h-6 w-6" />
                            Simple (One-Price)
                          </FormLabel>
                        </FormItem>
                        <FormItem>
                          <FormControl>
                            <RadioGroupItem
                              value="detailed"
                              id="detailed-estimate"
                              className="peer sr-only"
                            />
                          </FormControl>
                          <FormLabel
                            htmlFor="detailed-estimate"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                          >
                            <ListChecks className="mb-3 h-6 w-6" />
                            Detailed (Line Items)
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormDescription>
                      Choose 'Simple' for a single project price or 'Detailed'
                      to break down costs.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { addDays, format } from "date-fns";
import {
  DollarSign,
  Percent,
  CalendarDays,
  FileText,
  ShieldCheck,
  Eye,
  Download,
  X,
  Send,
  Link as LinkIcon,
  Signature,
} from "lucide-react";

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
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import PDFViewer from "../PDFViewer";

// Assuming businessProfile data is available, possibly through a higher-level context or query
const useBusinessProfileDefaults = () => {
  // Placeholder hook
  return {
    defaultPaymentTerms: "net_30",
    defaultTermsAndConditions: "All work is guaranteed for a period of one year. Payment is due upon receipt of invoice.",
  };
};

/**
 * TermsDeliveryTab
 *
 * This component handles the final configuration of an estimate, including
 * payment terms, legal text, delivery options, and signature requirements.
 * It assumes it is rendered within a <FormProvider> from react-hook-form.
 */
export const TermsDeliveryTab: React.FC = () => {
  const form = useFormContext();
  const { defaultPaymentTerms, defaultTermsAndConditions } = useBusinessProfileDefaults();

  // ---------------------------------------------------------------------------
  // Local state for PDF preview handling
  // ---------------------------------------------------------------------------
  const [showPreview, setShowPreview] = useState(false);
  const [pdfSrc, setPdfSrc] = useState<string | null>(null);

  const estimateId = form.watch("id"); // Assumes the form has an `id` when editing

  const depositRequired = form.watch("depositRequired");
  const expirationEnabled = form.watch("expirationEnabled");

  const handleResetTerms = () => {
    form.setValue("termsAndConditions", defaultTermsAndConditions, { shouldDirty: true });
  };

  /**
   * Fetches / toggles the PDF preview.
   * In a full implementation this could show a loader while fetching
   * and handle errors gracefully.  For now we just set the URL.
   */
  const handlePreviewPDF = () => {
    if (!estimateId) {
      // In create-mode the server doesn’t yet have an ID to fetch;
      // require the user to save first.
      alert("Please save the estimate before previewing the PDF.");
      return;
    }
    const url = `/api/estimates/${estimateId}/pdf?ts=${Date.now()}`; // ts busts cache
    setPdfSrc(url);
    setShowPreview(true);
  };

  return (
    <div className="space-y-6">
      <Accordion type="multiple" defaultValue={["financial-terms", "legal-notes"]} className="w-full">
        {/* Section 1: Financial Terms */}
        <AccordionItem value="financial-terms">
          <AccordionTrigger>
            <div className="flex items-center gap-2 text-lg font-semibold">
              <DollarSign className="h-5 w-5" />
              <span>Financial Terms</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 p-1">
            {/* Deposit Required */}
            <FormField
              control={form.control}
              name="depositRequired"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Require Deposit</FormLabel>
                    <FormDescription>
                      Secure the job by requiring an upfront payment.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            {depositRequired && (
              <Card className="p-4">
                <FormField
                  control={form.control}
                  name="depositType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Deposit Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl><RadioGroupItem value="percentage" /></FormControl>
                            <FormLabel className="font-normal">Percentage (%)</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl><RadioGroupItem value="fixed" /></FormControl>
                            <FormLabel className="font-normal">Fixed Amount ($)</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="depositValue"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Deposit Value</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 50 or 500" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Card>
            )}

            <Separator />

            {/* Payment Terms */}
            <FormField
              control={form.control}
              name="paymentTerms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Terms</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || defaultPaymentTerms}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select payment terms" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="due_on_receipt">Due on receipt</SelectItem>
                      <SelectItem value="net_15">Net 15</SelectItem>
                      <SelectItem value="net_30">Net 30</SelectItem>
                      <SelectItem value="net_60">Net 60</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Separator />

            {/* Expiration Date */}
            <FormField
              control={form.control}
              name="expirationEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Set Expiration Date</FormLabel>
                    <FormDescription>
                      This estimate will be valid until the selected date.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      defaultChecked={true}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            {expirationEnabled && (
               <FormField
                control={form.control}
                name="expirationDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiration Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field}
                        value={field.value ? format(new Date(field.value), 'yyyy-MM-dd') : ''}
                        onChange={(e) => field.onChange(e.target.valueAsDate)}
                        defaultValue={format(addDays(new Date(), 30), 'yyyy-MM-dd')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Section 2: Legal & Notes */}
        <AccordionItem value="legal-notes">
          <AccordionTrigger>
            <div className="flex items-center gap-2 text-lg font-semibold">
              <ShieldCheck className="h-5 w-5" />
              <span>Legal & Notes</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 p-1">
            <FormField
              control={form.control}
              name="termsAndConditions"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Terms & Conditions</FormLabel>
                    <Button type="button" variant="link" size="sm" onClick={handleResetTerms}>Reset to Default</Button>
                  </div>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter your terms and conditions here..."
                      rows={8}
                      defaultValue={defaultTermsAndConditions}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="clientMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message to Client (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Add a personal note that will appear on the estimate..."
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Separator />

      {/* Section 3: Delivery & Approval */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Preview & Send</h3>
        <p className="text-sm text-muted-foreground">
          Review the final document and send it to your client for approval.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={handlePreviewPDF}>
            <Eye className="mr-2 h-4 w-4" /> Preview What the Client Will See
          </Button>
          <Button type="button" variant="secondary">
            <Send className="mr-2 h-4 w-4" /> Send via Email
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="button" variant="secondary">
                  <LinkIcon className="mr-2 h-4 w-4" /> Get Shareable Link
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Opens a mobile-friendly web page with signature option.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button type="button" variant="secondary">
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
        </div>
      </div>

      <Separator />

      {/* Section 4: Signature Placeholder */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Client Approval</h3>
        <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-800/50 text-center">
          <Signature className="mx-auto h-8 w-8 text-slate-400" />
          <p className="mt-2 text-sm text-muted-foreground">
            The signature and approval section will be available to the client
            on the final estimate page.
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* PDF Preview Section                                                */}
      {/* ------------------------------------------------------------------ */}
      {showPreview && pdfSrc && (
        <div
          className="mt-6 mb-16 rounded-lg border bg-background shadow-lg
                     transition-all animate-in fade-in slide-in-from-bottom-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <h3 className="text-base md:text-lg font-semibold">
              Estimate Preview
            </h3>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close Preview"
              className="h-9 w-9 md:h-6 md:w-6"
              onClick={() => setShowPreview(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* PDF */}
          <div className="p-1 sm:p-2">
            <PDFViewer src={pdfSrc} className="h-[65vh] md:h-[80vh]" />
          </div>
        </div>
      )}
    </div>
  );
};

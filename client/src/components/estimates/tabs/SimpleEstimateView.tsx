import React, { useState, useEffect, useCallback } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import {
  Sparkles,
  Wand2,
  PlusCircle,
  Trash2,
  ArrowRight,
  Info,
} from "lucide-react";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PromptBuilder } from "@/services/ai-prompt-builder";
import { cn, formatCurrency } from "@/lib/utils";

/**
 * A view for creating a "Simple Estimate" which consists of a single
 * scope of work and a total price, with options for add-ons, discounts, and tax.
 */
export const SimpleEstimateView: React.FC = () => {
  const form = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "addOns",
  });

  const [total, setTotal] = useState(0);
  const [highlightClass, setHighlightClass] = useState("");

  const watchedFields = form.watch([
    "basePrice",
    "addOns",
    "discountType",
    "discountValue",
    "taxRate",
  ]);

  // --- Real-time Price Calculation ---
  useEffect(() => {
    const [basePrice, addOns, discountType, discountValue, taxRate] =
      watchedFields;
    const addOnsTotal =
      addOns?.reduce((sum: number, item: any) => sum + (item.price || 0), 0) || 0;
    const subtotal = (basePrice || 0) + addOnsTotal;

    let discountAmount = 0;
    if (discountType === "percentage") {
      discountAmount = subtotal * ((discountValue || 0) / 100);
    } else if (discountType === "fixed") {
      discountAmount = discountValue || 0;
    }

    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * ((taxRate || 0) / 100);
    const newTotal = taxableAmount + taxAmount;

    if (newTotal !== total) {
      // Visual feedback for total change
      setHighlightClass(newTotal > total ? "flash-green" : "flash-red");
      setTimeout(() => setHighlightClass(""), 500); // Remove class after animation
    }

    setTotal(newTotal);
    // Update form state silently to avoid re-renders
    form.setValue("subtotal", subtotal, { shouldValidate: false });
    form.setValue("discountAmount", discountAmount, { shouldValidate: false });
    form.setValue("taxAmount", taxAmount, { shouldValidate: false });
    form.setValue("total", newTotal, { shouldValidate: false });
  }, [watchedFields, form, total]);

  const handleConvertToDetailed = () => {
    const scope = form.getValues("scopeOfWork");
    const price = form.getValues("basePrice");
    // Convert simple scope/price to the first line item in detailed view
    form.setValue("lineItems", [{ description: scope, quantity: 1, unitPrice: price }]);
    form.setValue("estimateType", "detailed");
  };

  const handleAiAction = (promptType: "generate" | "improve" | "exclusions" | "timeline", customPrompt?: string) => {
    const context = {
      serviceType: form.getValues("serviceType"),
      propertyType: "residential", // Placeholder
      existingScope: form.getValues("scopeOfWork"),
    };
    const prompt = customPrompt || PromptBuilder.buildScopePrompt(promptType, context);
    // TODO: Integrate with AI service call
    console.log("AI Prompt:", prompt);
    // Example: form.setValue("scopeOfWork", "AI-generated text...");
  };

  return (
    <div className="space-y-6">
      {/* --- Scope of Work Section --- */}
      <Card>
        <CardHeader>
          <CardTitle>Scope of Work</CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="scopeOfWork"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Scope of Work</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe the work this estimate covers in detail..."
                      className="min-h-[150px] pr-24"
                    />
                  </FormControl>
                  <div className="absolute right-2 bottom-2 flex gap-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <Sparkles className="h-4 w-4 mr-1" /> Generate
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {PromptBuilder.getSuggestedScopePrompts(form.getValues("serviceType")).map((p) => (
                          <DropdownMenuItem key={p.label} onSelect={() => handleAiAction('generate', p.prompt)}>
                            {p.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button size="sm" variant="ghost" onClick={() => handleAiAction('improve')}>
                      <Wand2 className="h-4 w-4 mr-1" /> Improve
                    </Button>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* --- Pricing Section --- */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Base Price */}
          <FormField
            control={form.control}
            name="basePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Base Project Price</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Optional Add-ons */}
          <div>
            <FormLabel>Optional Add-ons</FormLabel>
            <div className="space-y-2 mt-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name={`addOns.${index}.description`}
                    render={({ field }) => (
                      <Input placeholder="Add-on description" {...field} />
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`addOns.${index}.price`}
                    render={({ field }) => (
                      <Input
                        type="number"
                        placeholder="0.00"
                        className="w-32"
                        {...field}
                      />
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ description: "", price: 0 })}
              >
                <PlusCircle className="h-4 w-4 mr-2" /> Add Optional Item
              </Button>
            </div>
          </div>

          <Separator />

          {/* Totals Section */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(form.getValues("subtotal"))}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Discount</span>
              <span className="text-destructive">
                - {formatCurrency(form.getValues("discountAmount"))}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">
                Tax ({form.watch("taxRate") || 0}%)
              </span>
              <span>{formatCurrency(form.getValues("taxAmount"))}</span>
            </div>
            <div
              className={cn(
                "flex justify-between items-center font-bold text-lg transition-colors duration-500",
                highlightClass
              )}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="flex items-center gap-1 cursor-help">
                    Total <Info className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Subtotal + Tax - Discount</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* --- Convert to Detailed View --- */}
      <div className="text-center">
        <Button
          type="button"
          variant="link"
          onClick={handleConvertToDetailed}
          className="text-primary"
        >
          Need more detail? Switch to a line-item estimate
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

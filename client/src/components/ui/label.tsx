"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Defines the base styles for the Label component using class-variance-authority.
 * This approach allows for easy extension with variants in the future if needed.
 */
const labelVariants = cva(
  // Base classes applied to all labels
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

/**
 * An accessible label component that enhances the native <label> element.
 * It's built on top of the Radix UI Label primitive for accessibility and
 * styled according to the Blue Steel design system.
 *
 * This component is intended to be used with the FormField, FormItem, and
 * FormControl components to automatically link the label to its corresponding input.
 */
const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };

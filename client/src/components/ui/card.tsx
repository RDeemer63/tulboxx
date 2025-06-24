import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Define variants for the Card component using cva
// This allows for different styles based on props.
const cardVariants = cva(
  // Base classes applied to all cards
  "rounded-lg border bg-card text-card-foreground transition-all duration-200",
  {
    variants: {
      // Elevation variants for different shadow depths
      elevation: {
        none: "shadow-none",
        sm: "shadow-sm",
        md: "shadow-md",
        lg: "shadow-lg",
        xl: "shadow-xl",
      },
      // Interactive variant for hover effects
      interactive: {
        true: "hover:shadow-lg hover:-translate-y-1 cursor-pointer",
        false: "",
      },
    },
    // Default variants if none are specified
    defaultVariants: {
      elevation: "md",
      interactive: false,
    },
  }
);

// Define the props for the Card component.
// It extends standard HTML div attributes and the variants defined above.
export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

// --- Main Card Component ---
// The main container for the card.
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, elevation, interactive, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ elevation, interactive, className }))}
      {...props}
    />
  )
);
Card.displayName = "Card";

// --- CardHeader Component ---
// The top section of the card, typically containing the title and description.
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

// --- CardTitle Component ---
// A semantic h3 element for the card's title.
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

// --- CardDescription Component ---
// A paragraph for the card's description, styled with muted text.
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

// --- CardContent Component ---
// The main content area of the card.
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

// --- CardFooter Component ---
// The bottom section of the card, often used for action buttons.
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};

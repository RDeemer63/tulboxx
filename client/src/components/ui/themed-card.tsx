/**
 * Themed Card Component - Enforces consistent theming across all pages
 * Replaces manual className overrides with systematic theme implementation
 */

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ThemedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outline";
}

const ThemedCard = forwardRef<HTMLDivElement, ThemedCardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-card text-card-foreground border-border",
      elevated: "bg-card text-card-foreground border-border shadow-lg",
      outline: "bg-card text-card-foreground border-2 border-border"
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border p-6 transition-all duration-200",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

ThemedCard.displayName = "ThemedCard";

const ThemedCardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-4", className)}
    {...props}
  />
));

ThemedCardHeader.displayName = "ThemedCardHeader";

const ThemedCardTitle = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight text-card-foreground",
      className
    )}
    {...props}
  />
));

ThemedCardTitle.displayName = "ThemedCardTitle";

const ThemedCardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));

ThemedCardDescription.displayName = "ThemedCardDescription";

const ThemedCardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pt-0", className)} {...props} />
));

ThemedCardContent.displayName = "ThemedCardContent";

export {
  ThemedCard,
  ThemedCardHeader,
  ThemedCardTitle,
  ThemedCardDescription,
  ThemedCardContent,
};
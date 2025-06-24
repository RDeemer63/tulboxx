/**
 * Themed Button Component - Enforces consistent button styling
 */

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "@/components/ui/button";

interface ThemedButtonProps extends ButtonProps {
  colorScheme?: "primary" | "secondary" | "success" | "danger" | "warning";
}

const ThemedButton = forwardRef<HTMLButtonElement, ThemedButtonProps>(
  ({ className, colorScheme = "primary", variant = "default", ...props }, ref) => {
    const colorSchemes = {
      primary: "bg-primary text-primary-foreground hover:bg-primary/90",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80", 
      success: "bg-green-600 text-white hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700",
      danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      warning: "bg-yellow-600 text-white hover:bg-yellow-700 dark:bg-yellow-600 dark:hover:bg-yellow-700"
    };

    return (
      <Button
        ref={ref}
        variant={variant}
        className={cn(
          variant === "default" && colorSchemes[colorScheme],
          className
        )}
        {...props}
      />
    );
  }
);

ThemedButton.displayName = "ThemedButton";

export { ThemedButton };
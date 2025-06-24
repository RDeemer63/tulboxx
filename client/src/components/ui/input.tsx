import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * An optional icon to display at the start of the input field.
   */
  icon?: React.ReactNode;
  /**
   * An optional icon to display at the end of the input field.
   */
  suffixIcon?: React.ReactNode;
  /**
   * If `true`, the input will be styled to indicate an error.
   * This also sets `aria-invalid` to true for accessibility.
   */
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, suffixIcon, error, ...props }, ref) => {
    const hasIcon = !!icon;
    const hasSuffixIcon = !!suffixIcon;

    // Base classes for the input element, designed to be theme-aware
    // and handle different states.
    const inputClasses = cn(
      "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      // Apply error styling conditionally
      error
        ? "border-destructive focus-visible:ring-destructive"
        : "border-input",
      // Add padding if icons are present to prevent text overlap
      hasIcon ? "pl-10" : "",
      hasSuffixIcon ? "pr-10" : "",
      className
    );

    // If icons are provided, wrap the input in a relative container
    // to position the icons absolutely within it.
    if (hasIcon || hasSuffixIcon) {
      return (
        <div className="relative w-full">
          {hasIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={inputClasses}
            ref={ref}
            aria-invalid={error}
            {...props}
          />
          {hasSuffixIcon && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
              {suffixIcon}
            </div>
          )}
        </div>
      );
    }

    // If no icons, render the input element directly.
    return (
      <input
        type={type}
        className={inputClasses}
        ref={ref}
        aria-invalid={error}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };

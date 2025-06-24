import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * If `true`, the textarea will be styled to indicate an error.
   * This also sets `aria-invalid` to true for accessibility.
   */
  error?: boolean;
  /**
   * If `true`, the textarea will automatically resize its height to fit the content.
   */
  autoResize?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, autoResize = false, ...props }, ref) => {
    const internalRef = React.useRef<HTMLTextAreaElement>(null);

    // Combine forwarded ref and internal ref
    React.useImperativeHandle(ref, () => internalRef.current!, []);

    React.useEffect(() => {
      if (autoResize && internalRef.current) {
        const textarea = internalRef.current;
        // Reset height to shrink if text is deleted
        textarea.style.height = "auto";
        // Set height to scroll height to fit content
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }, [props.value, autoResize]);

    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-destructive focus-visible:ring-destructive",
          autoResize && "resize-none overflow-hidden",
          className
        )}
        ref={internalRef}
        aria-invalid={error}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };

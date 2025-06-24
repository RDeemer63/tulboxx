import * as React from "react";
import * as Progress from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

// Define the props for our custom ProgressBar
// We extend the props from Radix's Progress.Root to ensure full compatibility
interface ProgressBarProps extends React.ComponentPropsWithoutRef<typeof Progress.Root> {
  // We can add custom props here if needed in the future
}

/**
 * A progress bar component that displays the progress of an operation.
 * It supports both determinate (with a value) and indeterminate states.
 * Built on top of Radix UI Progress for accessibility and functionality.
 */
const ProgressBar = React.forwardRef<
  React.ElementRef<typeof Progress.Root>,
  ProgressBarProps
>(({ className, value, ...props }, ref) => {
  // Determine if the progress bar is in an indeterminate state
  const isIndeterminate = value === null || value === undefined;

  return (
    <Progress.Root
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700",
        className
      )}
      value={isIndeterminate ? undefined : value} // Radix handles value clamping
      {...props}
    >
      <Progress.Indicator
        className={cn(
          "h-full w-full flex-1 bg-primary transition-transform duration-500 ease-in-out",
          {
            // When indeterminate, we apply a custom animation.
            // This assumes keyframes for 'indeterminate-progress' are defined in the global CSS.
            // Example animation: a sliding gradient effect.
            "absolute left-0 top-0 animate-indeterminate-progress": isIndeterminate,
          }
        )}
        style={{
          // For determinate progress, we use transform to animate the width change.
          // Radix's `value` prop handles the aria attributes, but we control the visual style.
          transform: `translateX(-${100 - (value || 0)}%)`,
        }}
      />
    </Progress.Root>
  );
});
ProgressBar.displayName = Progress.Root.displayName;

export { ProgressBar };


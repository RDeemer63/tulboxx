/**
 * Themed Badge Component - Consistent status and role badges
 */

import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Badge, BadgeProps } from "@/components/ui/badge";

interface ThemedBadgeProps extends BadgeProps {
  status?: "pending" | "scheduled" | "in_progress" | "completed" | "cancelled" | "paid" | "overdue" | "draft" | "sent" | "approved";
  role?: "admin" | "manager" | "technician" | "assistant";
}

const ThemedBadge = forwardRef<HTMLDivElement, ThemedBadgeProps>(
  ({ className, status, role, ...props }, ref) => {
    const statusVariants = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300",
      scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300", 
      in_progress: "bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300",
      completed: "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300",
      paid: "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300",
      overdue: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300",
      draft: "bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-300",
      sent: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300",
      approved: "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300"
    };

    const roleVariants = {
      admin: "bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300",
      manager: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300",
      technician: "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300",
      assistant: "bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300"
    };

    const variantClass = status ? statusVariants[status] : role ? roleVariants[role] : "";

    return (
      <Badge
        ref={ref}
        className={cn(variantClass, className)}
        {...props}
      />
    );
  }
);

ThemedBadge.displayName = "ThemedBadge";

export { ThemedBadge };
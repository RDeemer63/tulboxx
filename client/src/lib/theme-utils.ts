/**
 * TULBOXX Theme Utilities
 * Centralized theme management for consistent dark/light mode implementation
 */

import { cn } from "@/lib/utils";

// Icon color variants for consistent theming
export const iconVariants = {
  default: "text-muted-foreground",
  primary: "text-foreground", 
  secondary: "text-muted-foreground/80",
  muted: "text-muted-foreground/60",
  accent: "text-primary",
  destructive: "text-destructive"
} as const;

// Search input styling
export const searchInputStyles = {
  container: "relative",
  icon: cn(
    "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4",
    iconVariants.default
  ),
  input: cn(
    "pl-10 bg-background border-border text-foreground",
    "placeholder:text-muted-foreground",
    "focus:border-primary focus:ring-primary/20"
  )
};

// Select component styling
export const selectStyles = {
  trigger: cn(
    "bg-background border-border text-foreground",
    "data-[placeholder]:text-muted-foreground"
  ),
  content: "bg-popover border-border text-popover-foreground",
  item: cn(
    "text-foreground hover:bg-accent hover:text-accent-foreground",
    "focus:bg-accent focus:text-accent-foreground"
  )
};

// Card component styling
export const cardStyles = {
  card: "bg-card border-border text-card-foreground",
  header: "",
  title: "text-card-foreground",
  description: "text-muted-foreground",
  content: ""
};

// Status badge variants with opacity-based dark mode colors
export const statusBadgeVariants = {
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
} as const;

// Role badge variants
export const roleBadgeVariants = {
  admin: "bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300",
  manager: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300",
  technician: "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300",
  assistant: "bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300"
} as const;

// Table styling
export const tableStyles = {
  row: "hover:bg-accent/50 transition-colors",
  cell: "text-foreground",
  header: "text-muted-foreground font-medium"
};

// Form styling
export const formStyles = {
  label: "text-foreground font-medium",
  input: cn(
    "bg-background border-border text-foreground",
    "placeholder:text-muted-foreground",
    "focus:border-primary focus:ring-primary/20"
  ),
  textarea: cn(
    "bg-background border-border text-foreground",
    "placeholder:text-muted-foreground", 
    "focus:border-primary focus:ring-primary/20"
  )
};

// Helper function to get status badge class
export function getStatusBadgeClass(status: string): string {
  const normalizedStatus = status.toLowerCase().replace(/ /g, '_') as keyof typeof statusBadgeVariants;
  return statusBadgeVariants[normalizedStatus] || statusBadgeVariants.draft;
}

// Helper function to get role badge class
export function getRoleBadgeClass(role: string): string {
  const normalizedRole = role.toLowerCase() as keyof typeof roleBadgeVariants;
  return roleBadgeVariants[normalizedRole] || roleBadgeVariants.technician;
}

// Helper function to get icon class
export function getIconClass(variant: keyof typeof iconVariants = "default"): string {
  return iconVariants[variant];
}
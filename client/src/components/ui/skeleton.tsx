import { cn } from "@/lib/utils";

/**
 * A placeholder component to indicate a loading state.
 *
 * This component displays a shimmering, gray box that can be styled with
 * standard Tailwind CSS classes to match the dimensions of the content
 * it is replacing. It is typically used to create "skeleton screens".
 *
 * @example
 * // A single line of text
 * <Skeleton className="h-4 w-[250px]" />
 *
 * @example
 * // An avatar
 * <Skeleton className="h-12 w-12 rounded-full" />
 *
 * @param {React.HTMLAttributes<HTMLDivElement>} props - Standard div attributes.
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };

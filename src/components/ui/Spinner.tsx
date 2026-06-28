import { cn } from "@/lib/utils";
import type { Size } from "@/types";

const sizeMap: Record<Size, string> = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-10 w-10 border-[3px]",
};

export interface SpinnerProps {
  /** Diameter preset. @default "md" */
  size?: Size;
  /** Accessible label announced to screen readers. @default "Loading" */
  label?: string;
  className?: string;
}

/**
 * Indeterminate loading spinner.
 *
 * Pure CSS (no JS animation) so it works in Server Components and adds zero
 * client bundle weight. Use for actions/regions with an unknown duration.
 */
export function Spinner({ size = "md", label = "Loading", className }: SpinnerProps) {
  return (
    <span role="status" aria-live="polite" className="inline-flex items-center">
      <span
        className={cn(
          "animate-spin rounded-full border-current border-t-transparent text-brand-600",
          sizeMap[size],
          className,
        )}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}

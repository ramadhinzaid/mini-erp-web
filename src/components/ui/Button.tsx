import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./Spinner";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const variantStyles: Record<Variant, string> = {
  // Solid fill for primary actions.
  primary: "bg-primary text-on-primary hover:bg-primary-container",
  // Tonal secondary action.
  secondary:
    "bg-secondary-container text-on-secondary-container hover:brightness-95",
  // "Ghost" — outline only, per the design's secondary-action guidance.
  ghost:
    "border border-outline-variant bg-transparent text-on-surface hover:bg-surface-container",
  danger: "bg-error text-on-error hover:brightness-110",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2.5",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: ButtonSize;
  /** Show a spinner and disable interaction. */
  isLoading?: boolean;
  /** Stretch to the full width of the container. */
  fullWidth?: boolean;
}

/**
 * Primary interactive control for the design system.
 *
 * Forwards refs (works with `motion`, tooltips, form libraries), exposes
 * semantic variants, and renders an inline {@link Spinner} when `isLoading`.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      fullWidth = false,
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors",
          // Focus = the only high-contrast depth element: 2px primary ring, 2px offset.
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          "disabled:cursor-not-allowed disabled:opacity-60",
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && "w-full",
          className,
        )}
        {...props}
      >
        {isLoading && <Spinner size="sm" className="text-current" />}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

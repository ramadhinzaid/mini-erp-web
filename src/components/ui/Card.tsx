import { cn } from "@/lib/utils";

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Surface container with consistent border, radius and elevation.
 * Compose with the `Card.*` sub-parts for predictable spacing.
 */
export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        // Level 1: surface container with a subtle 1px outline, no shadow.
        "rounded-xl border border-outline-variant bg-surface-container-lowest",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: CardProps) {
  return <div className={cn("p-5 pb-0", className)} {...props} />;
}

function CardBody({ className, ...props }: CardProps) {
  return <div className={cn("p-5", className)} {...props} />;
}

function CardFooter({ className, ...props }: CardProps) {
  return (
    <div
      className={cn("border-t border-outline-variant p-5", className)}
      {...props}
    />
  );
}

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

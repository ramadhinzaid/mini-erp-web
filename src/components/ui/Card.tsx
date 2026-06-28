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
        "rounded-xl border border-zinc-200 bg-white shadow-sm",
        "dark:border-zinc-800 dark:bg-zinc-900",
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
      className={cn("border-t border-zinc-100 p-5 dark:border-zinc-800", className)}
      {...props}
    />
  );
}

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

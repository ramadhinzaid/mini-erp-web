import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Render as a circle (avatars, icons). @default false */
  circle?: boolean;
}

/**
 * Content placeholder shown while data loads.
 *
 * Compose primitives to mirror the real layout so the page doesn't shift when
 * content arrives. Size it with Tailwind utilities via `className`.
 *
 * @example
 * <Skeleton className="h-4 w-32" />
 * <Skeleton circle className="h-10 w-10" />
 */
export function Skeleton({ circle = false, className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse bg-zinc-200 dark:bg-zinc-800",
        circle ? "rounded-full" : "rounded-md",
        className,
      )}
      {...props}
    />
  );
}

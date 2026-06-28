import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge conditional class names while resolving Tailwind conflicts.
 *
 * `clsx` flattens conditional/array/object inputs into a class string and
 * `tailwind-merge` ensures the last conflicting utility wins
 * (e.g. `cn("px-2", "px-4")` -> `"px-4"`).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { FontAwesomeIconProps } from "@fortawesome/react-fontawesome";
import { cn } from "@/lib/utils";

export type IconProps = FontAwesomeIconProps;

/**
 * Thin wrapper around Font Awesome's React component.
 *
 * Centralising it means the whole app imports icons one way, and we can swap
 * the underlying icon library later without touching call sites. Pass any icon
 * re-exported from `@/lib/icons`.
 *
 * @example
 * import { faUsers } from "@/lib/icons";
 * <Icon icon={faUsers} className="text-brand-600" />
 */
export function Icon({ className, ...props }: IconProps) {
  return <FontAwesomeIcon className={cn(className)} {...props} />;
}

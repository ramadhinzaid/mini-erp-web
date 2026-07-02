"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui";
import { primaryNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";

export interface SidebarProps {
  /** Whether the off-canvas sidebar is open on mobile. */
  open: boolean;
  /** Close handler used when a link is tapped on mobile. */
  onClose: () => void;
}

/**
 * Primary navigation rail.
 *
 * Always visible from `lg` up; an off-canvas drawer on smaller screens driven
 * by {@link SidebarProps.open}. Highlights the active route via `usePathname`.
 */
export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile scrim */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 border-r border-outline-variant bg-surface-container-lowest p-4",
          "transition-transform duration-200 ease-out",
          // From lg up: in-flow but pinned to the top of the viewport so the rail
          // stays put while the page scrolls (own height, scrolls internally if tall).
          "lg:sticky lg:top-0 lg:h-dvh lg:self-start lg:translate-x-0 lg:overflow-y-auto",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-6 flex items-center gap-2 px-2">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-primary font-bold text-on-primary">
            E
          </span>
          <span className="text-headline-sm">{siteConfig.name}</span>
        </div>

        <nav aria-label="Primary" className="flex flex-col gap-1">
          {primaryNav.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  // "Soft" highlight: 8px rounded background on active/hover.
                  "flex items-center gap-3 rounded-md px-3 py-2 text-body-md font-medium transition-colors",
                  isActive
                    ? "bg-secondary-container text-on-secondary-container"
                    : "text-on-surface-variant hover:bg-surface-container",
                )}
              >
                <Icon icon={item.icon} className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

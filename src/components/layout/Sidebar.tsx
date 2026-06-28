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
          "fixed inset-y-0 left-0 z-40 w-64 border-r border-zinc-200 bg-white p-4",
          "transition-transform duration-200 ease-out dark:border-zinc-800 dark:bg-zinc-900",
          "lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-6 flex items-center gap-2 px-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 font-bold text-white">
            E
          </span>
          <span className="text-lg font-semibold">{siteConfig.name}</span>
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
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-600/10 dark:text-brand-400"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800",
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

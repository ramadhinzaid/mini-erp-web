"use client";

import { Icon } from "@/components/ui";
import { faBars, faBell, faMagnifyingGlass } from "@/lib/icons";

export interface HeaderProps {
  /** Opens the mobile navigation drawer. */
  onMenuClick: () => void;
}

/** Sticky top bar with the mobile menu toggle, search and actions. */
export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-outline-variant bg-surface/80 px-4 backdrop-blur">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
        className="grid h-9 w-9 place-items-center rounded-md text-on-surface-variant hover:bg-surface-container lg:hidden"
      >
        <Icon icon={faBars} />
      </button>

      <div className="relative hidden max-w-sm flex-1 sm:block">
        <Icon
          icon={faMagnifyingGlass}
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant"
        />
        <input
          type="search"
          placeholder="Search…"
          aria-label="Search"
          className="h-9 w-full rounded-md border border-outline-variant bg-surface-container-low pl-9 pr-3 text-body-md text-on-surface outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="ml-auto flex items-center gap-1">
        <button
          type="button"
          aria-label="Notifications"
          className="grid h-9 w-9 place-items-center rounded-md text-on-surface-variant hover:bg-surface-container"
        >
          <Icon icon={faBell} />
        </button>
        <span
          className="grid h-9 w-9 place-items-center rounded-full bg-primary text-body-md font-semibold text-on-primary"
          aria-hidden="true"
        >
          BK
        </span>
      </div>
    </header>
  );
}

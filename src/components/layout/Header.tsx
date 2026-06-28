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
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-zinc-200 bg-white/80 px-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
        className="grid h-9 w-9 place-items-center rounded-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 lg:hidden"
      >
        <Icon icon={faBars} />
      </button>

      <div className="relative hidden max-w-sm flex-1 sm:block">
        <Icon
          icon={faMagnifyingGlass}
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
        />
        <input
          type="search"
          placeholder="Search…"
          aria-label="Search"
          className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-9 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-zinc-700 dark:bg-zinc-800"
        />
      </div>

      <div className="ml-auto flex items-center gap-1">
        <button
          type="button"
          aria-label="Notifications"
          className="grid h-9 w-9 place-items-center rounded-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <Icon icon={faBell} />
        </button>
        <span
          className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-sm font-semibold text-white"
          aria-hidden="true"
        >
          BK
        </span>
      </div>
    </header>
  );
}

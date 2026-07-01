"use client";

import { Button, Icon } from "@/components/ui";
import { useAuth } from "@/modules/auth";
import {
  faBars,
  faBell,
  faMagnifyingGlass,
  faRightFromBracket,
} from "@/lib/icons";

export interface HeaderProps {
  /** Opens the mobile navigation drawer. */
  onMenuClick: () => void;
}

/** Build up-to-two-letter initials from the signed-in user's name. */
function initialsFor(firstName: string, lastName: string): string {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.trim();
  return initials.toUpperCase() || "?";
}

/** Sticky top bar with the mobile menu toggle, search, the user and actions. */
export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();

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

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          aria-label="Notifications"
          className="grid h-9 w-9 place-items-center rounded-md text-on-surface-variant hover:bg-surface-container"
        >
          <Icon icon={faBell} />
        </button>

        {user && (
          <>
            <span
              className="hidden text-body-sm text-on-surface-variant sm:inline"
              data-testid="user-email"
            >
              {user.email}
            </span>
            <span
              className="grid h-9 w-9 place-items-center rounded-full bg-primary text-body-md font-semibold text-on-primary"
              aria-hidden="true"
            >
              {initialsFor(user.firstName, user.lastName)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              aria-label="Log out"
            >
              <Icon icon={faRightFromBracket} className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}

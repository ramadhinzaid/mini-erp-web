"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/modules/auth";
import { Spinner } from "@/components/ui";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Footer } from "./Footer";

export interface AppShellProps {
  children: React.ReactNode;
}

/** Routes that render bare, without the authenticated chrome or guard. */
const PUBLIC_ROUTES = ["/login"];

/**
 * Top-level application chrome with a client-side auth guard.
 *
 * Public routes (e.g. `/login`) render their content bare. Every other route
 * is gated: unauthenticated visitors are redirected to `/login`, and a
 * {@link Spinner} covers the brief window while the stored token is resolved
 * into a user (tokens live in `localStorage`, so the gate is client-side).
 */
export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  if (PUBLIC_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }

  return <AuthenticatedShell>{children}</AuthenticatedShell>;
}

/** The protected layout: sidebar + header + footer, gated on `useAuth()`. */
function AuthenticatedShell({ children }: AppShellProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  // While auth resolves — or after a redirect has been queued — show a spinner
  // instead of flashing the authenticated UI.
  if (isLoading || !user) {
    return (
      <div className="grid min-h-dvh place-items-center bg-background">
        <Spinner size="lg" label="Checking your session" />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        <Footer />
      </div>
    </div>
  );
}

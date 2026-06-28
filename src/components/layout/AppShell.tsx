"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Footer } from "./Footer";

export interface AppShellProps {
  children: React.ReactNode;
}

/**
 * Top-level application chrome: responsive sidebar + header + footer wrapping
 * the routed page. Owns the mobile drawer open/close state.
 *
 * Routes (future micro-frontends) render into `children` and stay agnostic of
 * the surrounding navigation.
 */
export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

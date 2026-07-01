import { DashboardView } from "@/modules/dashboard";

/**
 * Dashboard route.
 *
 * Thin by design: it renders the module's view, which owns its own client-side
 * data fetching (the authenticated `GET /dashboard/summary`) plus its loading
 * and error states. The surrounding authenticated `AppShell` is provided by the
 * root layout.
 */
export default function HomePage() {
  return <DashboardView />;
}

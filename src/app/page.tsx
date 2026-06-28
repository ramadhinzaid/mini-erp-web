import { DashboardView, getDashboardStats } from "@/modules/dashboard";

/**
 * Dashboard route (Server Component).
 *
 * Thin by design: it fetches via the module's service and hands data to the
 * module's view. While the async work runs, Next renders `loading.tsx`.
 */
export default async function HomePage() {
  const stats = await getDashboardStats();
  return <DashboardView stats={stats} />;
}

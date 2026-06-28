import { DashboardSkeleton } from "@/modules/dashboard";

/**
 * Route-level Suspense fallback. Next renders this automatically while the
 * server component in `page.tsx` awaits data.
 */
export default function Loading() {
  return <DashboardSkeleton />;
}

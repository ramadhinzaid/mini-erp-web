/**
 * Public API of the Dashboard module.
 *
 * Everything a host (the App Router today, a micro-frontend shell tomorrow)
 * needs is exported from here. Internal files (`components/`, `services/`,
 * `types/`) are implementation details and should not be imported directly
 * from outside the module.
 */
export { DashboardView } from "./components/DashboardView";
export { DashboardSkeleton } from "./components/DashboardSkeleton";
export { getDashboardStats } from "./services/dashboard.service";
export type { DashboardStat } from "./types";

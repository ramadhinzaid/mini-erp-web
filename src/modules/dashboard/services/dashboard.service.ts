import {
  faFileInvoiceDollar,
  faBoxesStacked,
  faUsers,
  faChartLine,
} from "@/lib/icons";
import type { DashboardStat } from "../types";

/**
 * Data-access layer for the dashboard module.
 *
 * Returns mocked data for now — the NestJS backend (separate repo at
 * `../nestjs/mini-erp-be`) has no stats endpoint yet. The async signature
 * matches the real one, so swapping in the API client is a one-line change
 * with no impact on callers:
 *
 * @example
 * import { api } from "@/lib/api";
 * export const getDashboardStats = (token: string) =>
 *   api.get<DashboardStat[]>("/dashboard/stats", { token });
 *
 * Isolating I/O here keeps components pure and easy to test.
 */
export async function getDashboardStats(): Promise<DashboardStat[]> {
  // Simulated latency so loading states (skeletons) are demonstrable.
  await new Promise((resolve) => setTimeout(resolve, 600));

  return [
    {
      id: "revenue",
      label: "Revenue",
      value: "$48,290",
      delta: 12.5,
      icon: faFileInvoiceDollar,
    },
    {
      id: "orders",
      label: "Orders",
      value: "1,204",
      delta: 4.1,
      icon: faChartLine,
    },
    {
      id: "inventory",
      label: "In Stock",
      value: "8,932",
      delta: -2.3,
      icon: faBoxesStacked,
    },
    {
      id: "customers",
      label: "Customers",
      value: "612",
      delta: 6.7,
      icon: faUsers,
    },
  ];
}

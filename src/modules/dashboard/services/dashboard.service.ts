import { api } from "@/lib/api";
import { formatMoney } from "@/modules/invoices";
import type { InvoiceStatus } from "@/modules/invoices";
import {
  faFileInvoiceDollar,
  faChartLine,
  faGaugeHigh,
  faUsers,
} from "@/lib/icons";
import type { DashboardStat, DashboardSummary } from "../types";

/**
 * Data-access layer for the dashboard module.
 *
 * Talks to the live NestJS Dashboard resource (see the companion
 * `api-dashboard-summary` plan) through the single typed client in `@/lib/api`
 * — never a raw `fetch`. `GET /dashboard/summary` is authenticated, so callers
 * pass the Bearer token; the backend wraps the payload as `{ success, data }`,
 * which this layer unwraps so components receive a plain {@link DashboardSummary}.
 *
 * Isolating I/O here keeps components pure and easy to test.
 */

/** The backend wraps every successful response as `{ success, data }`. */
interface Envelope<T> {
  success: boolean;
  data: T;
}

/**
 * The dashboard's loaded data: the raw {@link DashboardSummary} for the new
 * sections (status breakdown, recent invoices) plus the KPI cards derived from
 * it, so the view can render both without re-deriving.
 */
export interface DashboardData {
  summary: DashboardSummary;
  stats: DashboardStat[];
}

/**
 * Fetches the dashboard summary and maps it into the KPI {@link DashboardStat}s.
 *
 * Async signature preserved from the previous `getDashboardStats()` so callers
 * and skeletons are unaffected by the swap from mocked to live data.
 */
export async function getDashboardSummary(
  token?: string,
): Promise<DashboardData> {
  const res = await api.get<Envelope<DashboardSummary>>("/dashboard/summary", {
    token,
  });
  const summary = res.data;
  return { summary, stats: summaryToStats(summary) };
}

/** Total number of invoices across every status bucket. */
export function totalInvoiceCount(
  counts: Record<InvoiceStatus, number>,
): number {
  return Object.values(counts).reduce((sum, n) => sum + (n ?? 0), 0);
}

/**
 * Maps a {@link DashboardSummary} into the four headline KPI cards
 * (revenue, outstanding, invoices, customers). No `delta` is set — the endpoint
 * doesn't return period-over-period change — so the cards omit the delta chip.
 */
export function summaryToStats(summary: DashboardSummary): DashboardStat[] {
  return [
    {
      id: "revenue",
      label: "Revenue",
      value: formatMoney(summary.revenue),
      icon: faFileInvoiceDollar,
    },
    {
      id: "outstanding",
      label: "Outstanding",
      value: formatMoney(summary.outstanding),
      icon: faChartLine,
    },
    {
      id: "invoices",
      label: "Invoices",
      value: String(totalInvoiceCount(summary.invoiceCounts)),
      icon: faGaugeHigh,
    },
    {
      id: "customers",
      label: "Customers",
      value: String(summary.customerCount),
      icon: faUsers,
    },
  ];
}

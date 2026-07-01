import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import type { InvoiceStatus, Money } from "@/modules/invoices";

/** A single KPI displayed on the dashboard. */
export interface DashboardStat {
  id: string;
  label: string;
  value: string;
  /**
   * Percentage change vs. the previous period (positive or negative). Optional:
   * the live `GET /dashboard/summary` endpoint does not return period-over-period
   * deltas, so KPI cards built from it omit this and the delta chip is hidden.
   */
  delta?: number;
  icon: IconDefinition;
}

/**
 * A compact invoice row surfaced in the dashboard's "recent invoices" list.
 *
 * A projection of the Invoices module's `Invoice` — only the fields the
 * dashboard renders — as returned inside `GET /dashboard/summary`'s
 * `recentInvoices[]`. The status/money types are reused from the invoices
 * module's public API so the shapes stay in lockstep.
 */
export interface RecentInvoice {
  id: string;
  /** Human-facing invoice number (e.g. `INV-0001`). */
  number: string;
  /** Denormalized customer name for display, when the backend includes it. */
  customerName?: string;
  status: InvoiceStatus;
  /** `subtotal + taxAmount` (Decimal, string over the wire). */
  total: Money;
  /** ISO-8601 date the invoice was issued. */
  issueDate: string;
}

/**
 * The business summary returned by `GET /dashboard/summary` (unwrapped from the
 * backend's `{ success, data }` envelope).
 *
 * Mirrors the NestJS Dashboard resource (see the companion
 * `api-dashboard-summary` plan): headline money figures, invoice counts keyed
 * by status (including the derived `OVERDUE` bucket), the customer total, and a
 * short list of the most recent invoices.
 */
export interface DashboardSummary {
  /** Total settled revenue (sum of PAID invoice totals). */
  revenue: Money;
  /** Outstanding balance (sum of SENT/OVERDUE invoice totals). */
  outstanding: Money;
  /** Invoice count per status, including the derived `OVERDUE` bucket. */
  invoiceCounts: Record<InvoiceStatus, number>;
  /** Total number of customers. */
  customerCount: number;
  /** The most recent invoices, newest first. */
  recentInvoices: RecentInvoice[];
}

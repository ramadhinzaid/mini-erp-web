"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, FadeIn, Stagger, StaggerItem } from "@/components/ui";
import { ApiError } from "@/lib/api";
import {
  InvoiceStatusBadge,
  formatMoney,
  type InvoiceStatus,
} from "@/modules/invoices";
import { getDashboardSummary } from "../services/dashboard.service";
import { getStoredToken } from "../services/token";
import type { DashboardStat, DashboardSummary } from "../types";
import { StatCard } from "./StatCard";
import { DashboardSkeleton } from "./DashboardSkeleton";

/** Order the status breakdown chips are rendered in (lifecycle order). */
const STATUS_ORDER: InvoiceStatus[] = [
  "DRAFT",
  "SENT",
  "OVERDUE",
  "PAID",
  "VOID",
];

type LoadStatus = "loading" | "success" | "error";

/**
 * Dashboard feature surface (client component).
 *
 * Fetches the authenticated `GET /dashboard/summary` on mount (delegating I/O
 * to the module's service) and renders the KPI cards, a per-status invoice
 * breakdown, and a list of recent invoices. Shows {@link DashboardSkeleton}
 * while loading and a `text-error` message on failure.
 */
export function DashboardView() {
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    // State updates happen inside the async closure (never synchronously in the
    // effect body); `loading` is already the initial value, so there is no gap.
    void Promise.resolve().then(async () => {
      try {
        const data = await getDashboardSummary(getStoredToken());
        if (!active) return;
        setStats(data.stats);
        setSummary(data.summary);
        setStatus("success");
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof ApiError
            ? err.message
            : "Failed to load the dashboard. Please try again.",
        );
        setStatus("error");
      }
    });

    return () => {
      active = false;
    };
  }, []);

  if (status === "loading") {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-headline-lg">Dashboard</h1>
          <p className="text-body-md text-on-surface-variant">
            Overview of your business at a glance.
          </p>
        </div>
      </FadeIn>

      {status === "error" && (
        <p role="alert" className="text-body-md text-error">
          {error}
        </p>
      )}

      {status === "success" && summary && (
        <>
          <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <StaggerItem key={stat.id}>
                <StatCard stat={stat} />
              </StaggerItem>
            ))}
          </Stagger>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <FadeIn delay={0.1}>
              <Card className="p-5">
                <h2 className="text-headline-sm">Invoices by status</h2>
                <ul className="mt-4 space-y-3">
                  {STATUS_ORDER.map((s) => (
                    <li
                      key={s}
                      className="flex items-center justify-between gap-3"
                    >
                      <InvoiceStatusBadge status={s} />
                      <span className="text-body-md font-medium text-on-surface">
                        {summary.invoiceCounts[s] ?? 0}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            </FadeIn>

            <FadeIn delay={0.15}>
              <Card className="p-5">
                <h2 className="text-headline-sm">Recent invoices</h2>
                {summary.recentInvoices.length === 0 ? (
                  <p className="mt-4 text-body-md text-on-surface-variant">
                    No invoices yet.
                  </p>
                ) : (
                  <ul className="mt-4 divide-y divide-outline-variant">
                    {summary.recentInvoices.map((invoice) => (
                      <li key={invoice.id}>
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="-mx-2 flex items-center justify-between gap-3 rounded-md px-2 py-3 transition-colors hover:bg-surface-container-high focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        >
                          <span className="min-w-0">
                            <span className="block truncate font-medium text-on-surface">
                              {invoice.number}
                            </span>
                            <span className="block truncate text-body-sm text-on-surface-variant">
                              {invoice.customerName ?? "—"}
                            </span>
                          </span>
                          <span className="flex shrink-0 items-center gap-3">
                            <InvoiceStatusBadge status={invoice.status} />
                            <span className="text-body-md font-medium text-on-surface">
                              {formatMoney(invoice.total)}
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </FadeIn>
          </div>
        </>
      )}
    </div>
  );
}

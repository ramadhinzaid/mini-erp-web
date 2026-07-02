"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, FadeIn } from "@/components/ui";
import { ApiError } from "@/lib/api";
import { formatMoney, getInvoice } from "../services/invoices.service";
import { getStoredToken } from "../services/token";
import type { Invoice } from "../types";
import { InvoiceItemsEditor } from "./InvoiceItemsEditor";
import { InvoicesSkeleton } from "./InvoicesSkeleton";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import { InvoiceStatusControl } from "./InvoiceStatusControl";

export interface InvoiceDetailProps {
  /** Id of the invoice to display (from the `/invoices/[id]` route param). */
  id: string;
}

type LoadStatus = "loading" | "success" | "error";

/** Formats an ISO date as a short, locale-aware date (or `—` when absent). */
function formatDate(iso?: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
}

/**
 * Invoice detail **shell** (client component).
 *
 * The foundation renders the header (number, customer, status badge, total) and
 * a read-only summary of the invoice's line items from real data. The
 * status-controls and activity-timeline regions are intentionally left as
 * labelled slots — sibling plans (update-status, activity history) fill them in,
 * and the add-items plan makes the items section editable.
 */
export function InvoiceDetail({ id }: InvoiceDetailProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const data = await getInvoice(id, getStoredToken());
      setInvoice(data);
      setStatus("success");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to load the invoice. Please try again.",
      );
      setStatus("error");
    }
  }, [id]);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  if (status === "loading") {
    return <InvoicesSkeleton />;
  }

  if (status === "error" || !invoice) {
    return (
      <p role="alert" className="text-body-md text-error">
        {error ?? "Invoice not found."}
      </p>
    );
  }

  return (
    <FadeIn>
      <div className="space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-headline-lg">{invoice.number}</h1>
            <p className="text-body-md text-on-surface-variant">
              {invoice.customerName ?? "Customer"} · Issued{" "}
              {formatDate(invoice.issueDate)}
              {invoice.dueDate ? ` · Due ${formatDate(invoice.dueDate)}` : ""}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <InvoiceStatusBadge status={invoice.status} />
            <p className="text-headline-sm">{formatMoney(invoice.total)}</p>
          </div>
        </header>

        {/* Items — editable line-item table (add-items plan). */}
        <section aria-labelledby="invoice-items-heading">
          <InvoiceItemsEditor invoice={invoice} onUpdated={setInvoice} />
        </section>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Status controls — valid next-status actions for this invoice. */}
          <section aria-labelledby="invoice-status-heading">
            <Card className="space-y-3 p-5">
              <h2
                id="invoice-status-heading"
                className="text-label-md text-on-surface-variant"
              >
                Status
              </h2>
              <InvoiceStatusControl invoice={invoice} onUpdated={setInvoice} />
            </Card>
          </section>

          {/* Activity timeline — filled by the history plan. */}
          <section aria-labelledby="invoice-activity-heading">
            <Card className="space-y-2 p-5">
              <h2
                id="invoice-activity-heading"
                className="text-label-md text-on-surface-variant"
              >
                Activity
              </h2>
              <p className="text-body-sm text-on-surface-variant">
                The activity timeline will appear here.
              </p>
            </Card>
          </section>
        </div>

        {invoice.notes && (
          <section aria-labelledby="invoice-notes-heading">
            <Card className="space-y-2 p-5">
              <h2
                id="invoice-notes-heading"
                className="text-label-md text-on-surface-variant"
              >
                Notes
              </h2>
              <p className="whitespace-pre-wrap text-body-md text-on-surface">
                {invoice.notes}
              </p>
            </Card>
          </section>
        )}
      </div>
    </FadeIn>
  );
}

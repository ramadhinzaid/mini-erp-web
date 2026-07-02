"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button, Card, FadeIn, Icon } from "@/components/ui";
import { ApiError } from "@/lib/api";
import {
  faPlus,
  faMagnifyingGlass,
  faChevronLeft,
  faChevronRight,
} from "@/lib/icons";
import { listCustomers, type Customer } from "@/modules/customers";
import {
  deriveInvoiceStatus,
  formatMoney,
  listInvoices,
} from "../services/invoices.service";
import { getStoredToken } from "../services/token";
import type { Invoice, InvoiceStatus } from "../types";
import { InvoicesListSkeleton } from "./InvoicesListSkeleton";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";

/** Page size used for the invoice list. */
const PAGE_LIMIT = 10;

/** Selectable status filters (empty value = any). */
const STATUS_OPTIONS: { value: InvoiceStatus; label: string }[] = [
  { value: "DRAFT", label: "Draft" },
  { value: "SENT", label: "Sent" },
  { value: "PAID", label: "Paid" },
  { value: "OVERDUE", label: "Overdue" },
  { value: "VOID", label: "Void" },
];

type LoadStatus = "loading" | "success" | "error";

/** The set of filters the list can be narrowed by. */
interface Filters {
  status: string;
  customerId: string;
  search: string;
  issuedFrom: string;
  issuedTo: string;
}

const EMPTY_FILTERS: Filters = {
  status: "",
  customerId: "",
  search: "",
  issuedFrom: "",
  issuedTo: "",
};

/** True when no filter is applied (drives the empty-state copy). */
function hasActiveFilters(filters: Filters): boolean {
  return Object.values(filters).some((value) => value !== "");
}

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

const controlClass =
  "rounded-md border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-md text-on-surface placeholder:text-on-surface-variant focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

/**
 * Invoices **list** surface (client component).
 *
 * Browses past invoices in a paginated table (number, customer, issue/due date,
 * total, status badge with a client-derived `OVERDUE`), narrowable by status,
 * customer, a free-text search, and an issue-date range. Rows link to the
 * detail page and a **New invoice** button links to the create route. Delegates
 * all I/O to the module's services; load failures surface as `text-error`.
 */
export function InvoicesView() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  // The committed filters (what was actually queried).
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  // The live filter form values (before Apply).
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS);

  const [status, setStatus] = useState<LoadStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  // Customer options for the filter dropdown (best-effort; failure is silent so
  // the rest of the list still works).
  const [customers, setCustomers] = useState<Customer[]>([]);

  const load = useCallback(async (nextPage: number, nextFilters: Filters) => {
    setStatus("loading");
    setError(null);
    try {
      const result = await listInvoices({
        page: nextPage,
        limit: PAGE_LIMIT,
        status: (nextFilters.status || undefined) as InvoiceStatus | undefined,
        customerId: nextFilters.customerId || undefined,
        search: nextFilters.search || undefined,
        issuedFrom: nextFilters.issuedFrom || undefined,
        issuedTo: nextFilters.issuedTo || undefined,
        token: getStoredToken(),
      });
      setInvoices(result.items);
      setTotal(result.total);
      setPage(result.page);
      setFilters(nextFilters);
      setStatus("success");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to load invoices. Please try again.",
      );
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    // Defer to a microtask so the first `setState` is async; the loading state
    // is already the initial value, so there is no visual gap.
    void Promise.resolve().then(() => load(1, EMPTY_FILTERS));
  }, [load]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const result = await listCustomers({
          limit: 100,
          token: getStoredToken(),
        });
        if (active) setCustomers(result.items);
      } catch {
        // Non-fatal: the customer filter just stays empty.
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  function handleFilterSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void load(1, draft);
  }

  function handleReset() {
    setDraft(EMPTY_FILTERS);
    void load(1, EMPTY_FILTERS);
  }

  function goToPage(nextPage: number) {
    void load(nextPage, filters);
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));
  const showInitialSkeleton = status === "loading" && invoices.length === 0;

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-headline-lg">Invoices</h1>
            <p className="text-body-md text-on-surface-variant">
              Browse and filter your invoice history.
            </p>
          </div>
          <Link
            href="/invoices/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-on-primary transition-colors hover:bg-primary-container focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <Icon icon={faPlus} className="h-4 w-4" />
            New invoice
          </Link>
        </div>
      </FadeIn>

      <form
        onSubmit={handleFilterSubmit}
        role="search"
        aria-label="Filter invoices"
        className="flex flex-wrap items-end gap-3"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="invoice-search" className="text-label-md text-on-surface-variant">
            Search
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 grid place-items-center text-on-surface-variant">
              <Icon icon={faMagnifyingGlass} className="h-4 w-4" />
            </span>
            <input
              id="invoice-search"
              type="search"
              name="search"
              value={draft.search}
              onChange={(e) => setDraft((f) => ({ ...f, search: e.target.value }))}
              placeholder="Number or customer…"
              className={`${controlClass} w-56 pl-9`}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="invoice-status" className="text-label-md text-on-surface-variant">
            Status
          </label>
          <select
            id="invoice-status"
            name="status"
            value={draft.status}
            onChange={(e) => setDraft((f) => ({ ...f, status: e.target.value }))}
            className={controlClass}
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="invoice-customer" className="text-label-md text-on-surface-variant">
            Customer
          </label>
          <select
            id="invoice-customer"
            name="customerId"
            value={draft.customerId}
            onChange={(e) => setDraft((f) => ({ ...f, customerId: e.target.value }))}
            className={controlClass}
          >
            <option value="">All customers</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="invoice-from" className="text-label-md text-on-surface-variant">
            Issued from
          </label>
          <input
            id="invoice-from"
            type="date"
            name="issuedFrom"
            value={draft.issuedFrom}
            onChange={(e) => setDraft((f) => ({ ...f, issuedFrom: e.target.value }))}
            className={controlClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="invoice-to" className="text-label-md text-on-surface-variant">
            Issued to
          </label>
          <input
            id="invoice-to"
            type="date"
            name="issuedTo"
            value={draft.issuedTo}
            onChange={(e) => setDraft((f) => ({ ...f, issuedTo: e.target.value }))}
            className={controlClass}
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit">Apply</Button>
          <Button type="button" variant="ghost" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </form>

      {error && (
        <p role="alert" className="text-body-md text-error">
          {error}
        </p>
      )}

      {showInitialSkeleton ? (
        <InvoicesListSkeleton />
      ) : (
        <Card className="overflow-hidden p-0">
          {invoices.length === 0 ? (
            <div className="grid place-items-center p-12 text-center text-body-md text-on-surface-variant">
              {hasActiveFilters(filters)
                ? "No invoices match these filters."
                : "No invoices yet. Create your first one."}
            </div>
          ) : (
            <table className="w-full text-left text-body-md">
              <thead className="border-b border-outline-variant text-label-md text-on-surface-variant">
                <tr>
                  <th scope="col" className="p-4 font-medium">
                    Number
                  </th>
                  <th scope="col" className="hidden p-4 font-medium sm:table-cell">
                    Customer
                  </th>
                  <th scope="col" className="hidden p-4 font-medium md:table-cell">
                    Issued
                  </th>
                  <th scope="col" className="hidden p-4 font-medium lg:table-cell">
                    Due
                  </th>
                  <th scope="col" className="p-4 text-right font-medium">
                    Total
                  </th>
                  <th scope="col" className="p-4 text-right font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-b border-outline-variant last:border-b-0 hover:bg-surface-container"
                  >
                    <td className="p-4">
                      <Link
                        href={`/invoices/${invoice.id}`}
                        className="font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      >
                        {invoice.number}
                      </Link>
                      <div className="text-body-sm text-on-surface-variant sm:hidden">
                        {invoice.customerName ?? "—"}
                      </div>
                    </td>
                    <td className="hidden p-4 text-on-surface-variant sm:table-cell">
                      {invoice.customerName ?? "—"}
                    </td>
                    <td className="hidden p-4 text-on-surface-variant md:table-cell">
                      {formatDate(invoice.issueDate)}
                    </td>
                    <td className="hidden p-4 text-on-surface-variant lg:table-cell">
                      {formatDate(invoice.dueDate)}
                    </td>
                    <td className="p-4 text-right text-on-surface">
                      {formatMoney(invoice.total)}
                    </td>
                    <td className="p-4 text-right">
                      <InvoiceStatusBadge status={deriveInvoiceStatus(invoice)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {!showInitialSkeleton && invoices.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-body-sm text-on-surface-variant">
            Page {page} of {totalPages} · {total} invoice{total === 1 ? "" : "s"}
          </p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              aria-label="Previous page"
              disabled={page <= 1 || status === "loading"}
              onClick={() => goToPage(page - 1)}
            >
              <Icon icon={faChevronLeft} className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Next page"
              disabled={page >= totalPages || status === "loading"}
              onClick={() => goToPage(page + 1)}
            >
              <Icon icon={faChevronRight} className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

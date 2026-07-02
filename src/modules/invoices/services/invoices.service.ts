import { api } from "@/lib/api";
import type {
  Invoice,
  InvoiceEvent,
  InvoiceInput,
  InvoiceItemInput,
  InvoiceStatus,
  Money,
} from "../types";

/**
 * Data-access layer for the Invoices module — the whole client surface the
 * invoice domain needs.
 *
 * Every function goes through the single typed client in `@/lib/api` (never a
 * raw `fetch`) and unwraps the backend's `{ success, data }` envelope so callers
 * receive plain domain objects. Signatures are token-based so they compose with
 * the auth module (`useAuth()` / {@link getStoredToken}).
 *
 * `createInvoice` and `getInvoice` back the foundation (create flow + detail
 * shell). The remaining functions are the reserved surface that sibling plans
 * (add-items, update-status, activity history, list) build on; they already hit
 * the conventional REST paths so wiring a feature to them is a one-liner.
 */

/** The backend wraps every successful response as `{ success, data }`. */
interface Envelope<T> {
  success: boolean;
  data: T;
}

const RESOURCE = "/invoices";

/** Query parameters for the paginated {@link listInvoices} call. */
export interface InvoiceListParams {
  /** 1-based page number. @default 1 */
  page?: number;
  /** Page size. @default 10 */
  limit?: number;
  /** Filter by lifecycle status. */
  status?: InvoiceStatus;
  /** Filter by owning customer. */
  customerId?: string;
  /** Free-text search (invoice number / customer name). */
  search?: string;
  /** Inclusive lower bound on issue date (ISO `YYYY-MM-DD`). */
  issuedFrom?: string;
  /** Inclusive upper bound on issue date (ISO `YYYY-MM-DD`). */
  issuedTo?: string;
  /** Bearer token for the authenticated request. */
  token?: string;
}

/** Unwrapped result of the paginated list endpoint. */
export interface InvoiceListResult {
  items: Invoice[];
  total: number;
  page: number;
  limit: number;
}

/** Creates an invoice (with optional inline items) and returns the record. */
export async function createInvoice(
  input: InvoiceInput,
  token?: string,
): Promise<Invoice> {
  const res = await api.post<Envelope<Invoice>>(RESOURCE, input, { token });
  return res.data;
}

/** Fetches a single invoice (with its items) by id. */
export async function getInvoice(id: string, token?: string): Promise<Invoice> {
  const res = await api.get<Envelope<Invoice>>(`${RESOURCE}/${id}`, { token });
  return res.data;
}

/**
 * Lists invoices, paginated and optionally filtered. Owned by the history plan;
 * present here so the module exposes one coherent service surface.
 */
export async function listInvoices(
  params: InvoiceListParams = {},
): Promise<InvoiceListResult> {
  const {
    page = 1,
    limit = 10,
    status,
    customerId,
    search,
    issuedFrom,
    issuedTo,
    token,
  } = params;

  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (status) query.set("status", status);
  if (customerId) query.set("customerId", customerId);
  if (search && search.trim()) query.set("search", search.trim());
  if (issuedFrom) query.set("issuedFrom", issuedFrom);
  if (issuedTo) query.set("issuedTo", issuedTo);

  const res = await api.get<Envelope<InvoiceListResult>>(
    `${RESOURCE}?${query.toString()}`,
    { token },
  );
  return res.data;
}

/** Adds a line item to an existing invoice (add-items plan). */
export async function addItem(
  invoiceId: string,
  item: InvoiceItemInput,
  token?: string,
): Promise<Invoice> {
  const res = await api.post<Envelope<Invoice>>(
    `${RESOURCE}/${invoiceId}/items`,
    item,
    { token },
  );
  return res.data;
}

/** Updates a line item on an invoice (add-items plan). */
export async function updateItem(
  invoiceId: string,
  itemId: string,
  patch: Partial<InvoiceItemInput>,
  token?: string,
): Promise<Invoice> {
  const res = await api.patch<Envelope<Invoice>>(
    `${RESOURCE}/${invoiceId}/items/${itemId}`,
    patch,
    { token },
  );
  return res.data;
}

/** Removes a line item from an invoice (add-items plan). */
export async function removeItem(
  invoiceId: string,
  itemId: string,
  token?: string,
): Promise<Invoice> {
  const res = await api.delete<Envelope<Invoice>>(
    `${RESOURCE}/${invoiceId}/items/${itemId}`,
    { token },
  );
  return res.data;
}

/** Transitions an invoice to a new status (update-status plan). */
export async function updateStatus(
  invoiceId: string,
  status: InvoiceStatus,
  token?: string,
): Promise<Invoice> {
  const res = await api.patch<Envelope<Invoice>>(
    `${RESOURCE}/${invoiceId}/status`,
    { status },
    { token },
  );
  return res.data;
}

/** Fetches the activity timeline for an invoice (history plan). */
export async function getInvoiceEvents(
  invoiceId: string,
  token?: string,
): Promise<InvoiceEvent[]> {
  const res = await api.get<Envelope<InvoiceEvent[]>>(
    `${RESOURCE}/${invoiceId}/events`,
    { token },
  );
  return res.data;
}

/**
 * Formats a `Decimal` money value (string or number) for display.
 *
 * Backend money fields arrive as strings to preserve precision; this coerces
 * them to a locale-formatted currency string. Non-numeric input degrades to a
 * plain zero so the UI never renders `NaN`.
 */
export function formatMoney(
  value: Money | null | undefined,
  currency = "USD",
  locale = "en-US",
): string {
  const amount = typeof value === "number" ? value : Number(value ?? 0);
  const safe = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(safe);
}

/**
 * Computes the client-side money totals for a set of line items, mirroring the
 * server's arithmetic so the create form can preview subtotal/tax/total live.
 */
export function computeTotals(
  items: Array<{ quantity: number; unitPrice: Money }>,
  taxRate = 0,
): { subtotal: number; taxAmount: number; total: number } {
  const subtotal = items.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    return sum + qty * price;
  }, 0);
  const rate = Number(taxRate) || 0;
  const taxAmount = subtotal * (rate / 100);
  return { subtotal, taxAmount, total: subtotal + taxAmount };
}

/**
 * Resolves the status to *display* for an invoice, deriving `OVERDUE` for a
 * still-open (`SENT`) invoice whose due date has passed. Terminal states
 * (`PAID`, `VOID`) and an already-`OVERDUE`/`DRAFT` invoice are returned as-is.
 *
 * The backend is the source of truth, but between a due date lapsing and the
 * server recomputing it the list would otherwise show a stale `SENT` badge;
 * deriving on the client keeps the timeline honest. `now` is injectable for
 * deterministic tests.
 */
export function deriveInvoiceStatus(
  invoice: Pick<Invoice, "status" | "dueDate">,
  now: Date = new Date(),
): InvoiceStatus {
  if (invoice.status === "SENT" && invoice.dueDate) {
    const due = new Date(invoice.dueDate);
    if (!Number.isNaN(due.getTime()) && due.getTime() < now.getTime()) {
      return "OVERDUE";
    }
  }
  return invoice.status;
}

/**
 * Types owned by the Invoices module.
 *
 * These mirror the entities returned by the NestJS Invoices resource. Money
 * fields are `Decimal` on the backend and arrive JSON-serialized as strings;
 * the frontend treats them as `string | number` and formats for display via
 * {@link formatMoney} (see `services/invoices.service.ts`). Keeping the shapes
 * here preserves the module's ownership boundary (see `src/modules/README.md`).
 *
 * This module is the **foundation** of the invoice domain. Sibling plans
 * (add-items, update-status, activity history) extend these types, the service
 * surface, and the detail shell rather than introducing parallel ones.
 */

/** A monetary amount. `Decimal` on the backend, string over the wire. */
export type Money = string | number;

/** Lifecycle state of an invoice. */
export type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "VOID" | "OVERDUE";

/** A single line on an invoice, as returned by the backend. */
export interface InvoiceItem {
  id: string;
  /** Parent invoice id (present on persisted rows). */
  invoiceId?: string;
  /** Human-readable description of the goods/service. */
  description: string;
  /** Quantity of units billed. */
  quantity: number;
  /** Price per unit (Decimal). */
  unitPrice: Money;
  /** `quantity × unitPrice`, computed server-side (Decimal). */
  lineTotal: Money;
}

/** An invoice record as returned by `GET /invoices/:id`. */
export interface Invoice {
  id: string;
  /** Human-facing invoice number (e.g. `INV-0001`). */
  number: string;
  /** Owning customer id. */
  customerId: string;
  /** Denormalized customer name for display, when the backend includes it. */
  customerName?: string;
  status: InvoiceStatus;
  /** ISO-8601 date the invoice was issued. */
  issueDate: string;
  /** ISO-8601 due date, when set. */
  dueDate?: string;
  /** Free-text notes shown on the invoice. */
  notes?: string;
  /** Tax rate applied, as a percentage (e.g. `11` for 11%). */
  taxRate: number;
  /** Sum of line totals before tax (Decimal). */
  subtotal: Money;
  /** Tax charged on the subtotal (Decimal). */
  taxAmount: Money;
  /** `subtotal + taxAmount` (Decimal). */
  total: Money;
  /** Line items on the invoice. */
  items: InvoiceItem[];
  /** ISO-8601 creation timestamp. */
  createdAt: string;
}

/**
 * Structured metadata attached to an {@link InvoiceEvent}, when the audit trail
 * records more than a free-text message. All fields are optional — the timeline
 * degrades to `message` when they are absent.
 */
export interface InvoiceEventData {
  /** Previous value for a `STATUS_CHANGED` transition. */
  from?: string;
  /** New value for a `STATUS_CHANGED` transition. */
  to?: string;
  /** Description of the affected line item for `ITEM_*` events. */
  description?: string;
  /** Escape hatch for any extra fields the backend attaches. */
  [key: string]: unknown;
}

/**
 * A single entry in an invoice's activity timeline, sourced from the backend
 * audit trail (`GET /invoices/:id/events`). Kinds include `CREATED`,
 * `STATUS_CHANGED` (with `data.from`/`data.to`), and `ITEM_ADDED` /
 * `ITEM_UPDATED` / `ITEM_REMOVED`.
 */
export interface InvoiceEvent {
  id: string;
  invoiceId: string;
  /** Machine-readable event kind (e.g. `CREATED`, `STATUS_CHANGED`, `SENT`). */
  type: string;
  /** Human-readable summary of what happened. */
  message: string;
  /** ISO-8601 timestamp of the event. */
  createdAt: string;
  /** Who performed the action, when the audit trail records an actor. */
  actor?: string;
  /** Structured metadata (status transition, affected item, …). */
  data?: InvoiceEventData;
}

/** Payload for a single line item when creating/updating an invoice. */
export interface InvoiceItemInput {
  description: string;
  quantity: number;
  unitPrice: Money;
}

/** Payload accepted by `POST /invoices`. */
export interface InvoiceInput {
  /** Required — the customer the invoice is for. */
  customerId: string;
  /** ISO-8601 issue date; the backend defaults to today when omitted. */
  issueDate?: string;
  /** ISO-8601 due date. */
  dueDate?: string;
  /** Free-text notes. */
  notes?: string;
  /** Tax rate as a percentage (e.g. `11`). */
  taxRate?: number;
  /** Inline line items to create alongside the invoice. */
  items?: InvoiceItemInput[];
}

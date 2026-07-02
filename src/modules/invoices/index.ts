/**
 * Public API of the Invoices module — the **foundation** of the invoice domain.
 *
 * Hosts (the App Router today, a micro-frontend shell tomorrow) import only from
 * here. Internal files (`components/`, `services/`, `types/`) are implementation
 * details and must not be imported directly from outside.
 *
 * Sibling plans (add-items, update-status, activity history, list) extend this
 * barrel, the service surface, and the detail shell rather than adding parallel
 * modules.
 */
export { InvoiceForm } from "./components/InvoiceForm";
export { InvoiceDetail } from "./components/InvoiceDetail";
export { InvoicesView } from "./components/InvoicesView";
export { InvoiceActivityTimeline } from "./components/InvoiceActivityTimeline";
export {
  InvoiceItemsEditor,
  canEditItems,
  type InvoiceItemsEditorProps,
} from "./components/InvoiceItemsEditor";
export { InvoicesSkeleton } from "./components/InvoicesSkeleton";
export { InvoicesListSkeleton } from "./components/InvoicesListSkeleton";
export { InvoiceStatusBadge } from "./components/InvoiceStatusBadge";
export {
  createInvoice,
  getInvoice,
  listInvoices,
  addItem,
  updateItem,
  removeItem,
  updateStatus,
  getInvoiceEvents,
  formatMoney,
  computeTotals,
  deriveInvoiceStatus,
  type InvoiceListParams,
  type InvoiceListResult,
} from "./services/invoices.service";
export type {
  Invoice,
  InvoiceItem,
  InvoiceStatus,
  InvoiceEvent,
  InvoiceEventData,
  InvoiceInput,
  InvoiceItemInput,
  Money,
} from "./types";

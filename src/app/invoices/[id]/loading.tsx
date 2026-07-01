import { InvoicesSkeleton } from "@/modules/invoices";

/**
 * Route-level Suspense fallback. Next renders this while the invoice detail
 * segment streams in, mirroring {@link InvoiceDetail}'s layout.
 */
export default function Loading() {
  return <InvoicesSkeleton />;
}

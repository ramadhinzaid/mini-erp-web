import { InvoicesListSkeleton } from "@/modules/invoices";

/**
 * Route-level Suspense fallback. Next renders this while the invoices list
 * segment streams in, mirroring {@link InvoicesView}'s layout.
 */
export default function Loading() {
  return <InvoicesListSkeleton />;
}

import type { Metadata } from "next";
import { InvoicesView } from "@/modules/invoices";

export const metadata: Metadata = {
  title: "Invoices",
};

/**
 * Invoices list route.
 *
 * Thin by design: it renders the module's `InvoicesView`, which owns its own
 * client-side data fetching, filters, and pagination. The surrounding
 * authenticated `AppShell` is provided by the root layout; `loading.tsx` streams
 * the list skeleton as the Suspense fallback.
 */
export default function InvoicesPage() {
  return <InvoicesView />;
}

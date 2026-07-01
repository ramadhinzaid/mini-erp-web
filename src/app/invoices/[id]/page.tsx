import type { Metadata } from "next";
import { InvoiceDetail } from "@/modules/invoices";

export const metadata: Metadata = {
  title: "Invoice",
};

/**
 * Invoice detail route.
 *
 * Thin by design: it unwraps the `[id]` route param and hands it to the
 * module's `InvoiceDetail` shell, which fetches the invoice client-side and
 * renders the header plus the slots sibling plans expand. Renders inside the
 * authenticated `AppShell`; `loading.tsx` streams `InvoicesSkeleton`.
 */
export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <InvoiceDetail id={id} />;
}

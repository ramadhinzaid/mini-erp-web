import type { Metadata } from "next";
import { InvoiceForm } from "@/modules/invoices";

export const metadata: Metadata = {
  title: "New invoice",
};

/**
 * Create-invoice route.
 *
 * Thin by design: it renders the module's `InvoiceForm`, which owns customer
 * loading, the line-item editor, validation, and the redirect to the new
 * invoice on success. Renders inside the authenticated `AppShell`.
 */
export default function NewInvoicePage() {
  return <InvoiceForm />;
}

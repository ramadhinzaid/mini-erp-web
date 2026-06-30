import type { Metadata } from "next";
import { CustomersView } from "@/modules/customers";

export const metadata: Metadata = {
  title: "Customers",
};

/**
 * Customers route.
 *
 * Thin by design: it renders the module's view, which owns its own client-side
 * data fetching, search, pagination, and CRUD flows. The surrounding
 * authenticated `AppShell` is provided by the root layout.
 */
export default function CustomersPage() {
  return <CustomersView />;
}

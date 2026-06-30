import { CustomersSkeleton } from "@/modules/customers";

/**
 * Route-level Suspense fallback. Next renders this while the customers route
 * segment streams in, mirroring {@link CustomersView}'s layout.
 */
export default function Loading() {
  return <CustomersSkeleton />;
}

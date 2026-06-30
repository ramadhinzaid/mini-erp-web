import { Card, Skeleton } from "@/components/ui";

/**
 * Loading placeholder that mirrors {@link CustomersView}'s layout (header,
 * search bar, table rows) so the page doesn't shift when real data arrives.
 * Rendered both by the route's Suspense fallback (`src/app/customers/loading.tsx`)
 * and by the view itself during the initial client-side fetch.
 */
export function CustomersSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header: title + "New customer" button */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Search bar */}
      <Skeleton className="h-10 w-full max-w-sm" />

      {/* Table */}
      <Card className="overflow-hidden p-0">
        <div className="border-b border-outline-variant p-4">
          <Skeleton className="h-4 w-24" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-4 border-b border-outline-variant p-4 last:border-b-0"
          >
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
            <Skeleton className="h-4 w-24" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

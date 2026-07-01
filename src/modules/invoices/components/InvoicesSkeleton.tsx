import { Card, Skeleton } from "@/components/ui";

/**
 * Loading placeholder that mirrors {@link InvoiceDetail}'s layout (header with
 * number/customer/status/total, then the items / status / activity sections) so
 * the page doesn't shift when real data arrives. Rendered by the detail route's
 * Suspense fallback (`src/app/invoices/[id]/loading.tsx`) and by the detail view
 * during its initial client-side fetch.
 */
export function InvoicesSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header: number + customer on the left, status badge + total on the right */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="flex flex-col items-end gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-7 w-28" />
        </div>
      </div>

      {/* Items section */}
      <Card className="overflow-hidden p-0">
        <div className="border-b border-outline-variant p-4">
          <Skeleton className="h-4 w-24" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-4 border-b border-outline-variant p-4 last:border-b-0"
          >
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </Card>

      {/* Status + activity sections */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="space-y-3 p-5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-9 w-full" />
        </Card>
        <Card className="space-y-3 p-5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </Card>
      </div>
    </div>
  );
}

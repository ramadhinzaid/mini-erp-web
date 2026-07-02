import { Card, Skeleton } from "@/components/ui";

/**
 * Loading placeholder mirroring {@link InvoicesView}'s layout (title + New
 * button, the filter row, then a table of invoice rows) so the page doesn't
 * shift when real data arrives. Rendered by the list route's Suspense fallback
 * (`src/app/invoices/loading.tsx`) and by the view during its initial fetch.
 */
export function InvoicesListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header: title on the left, New invoice button on the right */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-40" />
        ))}
      </div>

      {/* Table of invoice rows */}
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
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </Card>
    </div>
  );
}

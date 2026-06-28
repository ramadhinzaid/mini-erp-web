import { Card, Skeleton } from "@/components/ui";

/**
 * Loading placeholder that mirrors {@link DashboardView}'s layout so the page
 * doesn't shift when real data arrives. Rendered by the route's Suspense
 * fallback (`src/app/loading.tsx`).
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-5">
            <div className="flex items-center justify-between">
              <Skeleton circle className="h-10 w-10" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="mt-4 h-8 w-24" />
            <Skeleton className="mt-2 h-4 w-16" />
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="mt-4 h-48 w-full" />
      </Card>
    </div>
  );
}

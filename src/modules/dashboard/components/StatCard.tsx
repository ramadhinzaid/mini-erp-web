import { Card, Icon } from "@/components/ui";
import { cn } from "@/lib/utils";
import { faArrowUp, faArrowDown } from "@/lib/icons";
import type { DashboardStat } from "../types";

export interface StatCardProps {
  stat: DashboardStat;
}

/** Presentational KPI tile. Pure: derives everything from props. */
export function StatCard({ stat }: StatCardProps) {
  const isPositive = stat.delta >= 0;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-600/10">
          <Icon icon={stat.icon} className="h-5 w-5" />
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1 text-sm font-medium",
            isPositive ? "text-emerald-600" : "text-red-600",
          )}
        >
          <Icon icon={isPositive ? faArrowUp : faArrowDown} className="h-3 w-3" />
          {Math.abs(stat.delta)}%
        </span>
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight">{stat.value}</p>
      <p className="text-sm text-zinc-500">{stat.label}</p>
    </Card>
  );
}

import { Card, Icon } from "@/components/ui";
import { cn } from "@/lib/utils";
import { faArrowUp, faArrowDown } from "@/lib/icons";
import type { DashboardStat } from "../types";

export interface StatCardProps {
  stat: DashboardStat;
}

/** Presentational KPI tile. Pure: derives everything from props. */
export function StatCard({ stat }: StatCardProps) {
  // The live summary endpoint has no period-over-period delta, so the chip only
  // renders when a delta is actually provided.
  const hasDelta = stat.delta !== undefined;
  const isPositive = (stat.delta ?? 0) >= 0;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-md bg-secondary-container text-primary">
          <Icon icon={stat.icon} className="h-5 w-5" />
        </span>
        {hasDelta && (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-body-md font-medium",
              isPositive ? "text-success" : "text-error",
            )}
          >
            <Icon
              icon={isPositive ? faArrowUp : faArrowDown}
              className="h-3 w-3"
            />
            {Math.abs(stat.delta as number)}%
          </span>
        )}
      </div>
      <p className="mt-4 text-headline-md">{stat.value}</p>
      <p className="text-body-sm text-on-surface-variant">{stat.label}</p>
    </Card>
  );
}

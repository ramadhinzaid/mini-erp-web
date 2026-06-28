"use client";

import { Card, FadeIn, Stagger, StaggerItem } from "@/components/ui";
import { StatCard } from "./StatCard";
import type { DashboardStat } from "../types";

export interface DashboardViewProps {
  stats: DashboardStat[];
}

/**
 * Dashboard presentation. Receives already-loaded data and animates it in.
 * Data fetching lives in the route/service layer, keeping this component pure
 * and trivial to test or render in isolation (Storybook, micro-frontend host).
 */
export function DashboardView({ stats }: DashboardViewProps) {
  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-headline-lg">Dashboard</h1>
          <p className="text-body-md text-on-surface-variant">
            Overview of your business at a glance.
          </p>
        </div>
      </FadeIn>

      <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StaggerItem key={stat.id}>
            <StatCard stat={stat} />
          </StaggerItem>
        ))}
      </Stagger>

      <FadeIn delay={0.1}>
        <Card className="p-5">
          <h2 className="text-headline-sm">Activity</h2>
          <p className="mt-1 text-body-md text-on-surface-variant">
            Plug a chart library in here — this card is a placeholder for the
            next feature slice.
          </p>
          <div className="mt-4 grid h-48 place-items-center rounded-lg border border-dashed border-outline-variant text-body-md text-on-surface-variant">
            Chart goes here
          </div>
        </Card>
      </FadeIn>
    </div>
  );
}

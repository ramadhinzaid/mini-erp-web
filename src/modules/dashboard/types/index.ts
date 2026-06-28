import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

/** A single KPI displayed on the dashboard. */
export interface DashboardStat {
  id: string;
  label: string;
  value: string;
  /** Percentage change vs. the previous period (positive or negative). */
  delta: number;
  icon: IconDefinition;
}

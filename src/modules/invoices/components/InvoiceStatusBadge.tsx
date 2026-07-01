import { cn } from "@/lib/utils";
import type { InvoiceStatus } from "../types";

/**
 * Maps each invoice status to a semantic ErgoSoft token pair (container +
 * on-container), so the badge reads correctly in light and dark mode without
 * any raw colors. Shared across the invoice surfaces (detail shell today; the
 * list and status controls added by sibling plans reuse it).
 */
const statusStyles: Record<InvoiceStatus, string> = {
  // Neutral — a work-in-progress invoice.
  DRAFT: "bg-surface-container-high text-on-surface-variant",
  // Informational — sent to the customer, awaiting payment.
  SENT: "bg-secondary-container text-on-secondary-container",
  // Positive — settled.
  PAID: "bg-success-container text-on-success-container",
  // Error — cancelled/voided.
  VOID: "bg-error-container text-on-error-container",
  // Warning nuance — past due (tertiary is the palette's warm accent).
  OVERDUE: "bg-tertiary-container text-on-tertiary-container",
};

/** Human-facing label for each status. */
const statusLabel: Record<InvoiceStatus, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  PAID: "Paid",
  VOID: "Void",
  OVERDUE: "Overdue",
};

export interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
  className?: string;
}

/** Small pill that renders an invoice's status with semantic coloring. */
export function InvoiceStatusBadge({
  status,
  className,
}: InvoiceStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-0.5 text-label-md font-medium",
        statusStyles[status],
        className,
      )}
    >
      {statusLabel[status]}
    </span>
  );
}

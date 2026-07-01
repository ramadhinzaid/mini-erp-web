"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/modules/auth";
import { updateStatus } from "../services/invoices.service";
import { getStoredToken } from "../services/token";
import type { Invoice, InvoiceStatus } from "../types";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";

/** The role permitted to void an invoice (mirrors the backend's ADMIN gate). */
const ADMIN_ROLE = "ADMIN";

/**
 * A manual status transition the UI can offer. `to` is always a real,
 * sendable status — `OVERDUE` is derived (display-only) and never appears here,
 * so the control can never send it to the backend.
 */
interface StatusAction {
  /** Target status sent to `updateStatus`. */
  to: Exclude<InvoiceStatus, "OVERDUE" | "DRAFT">;
  /** Button label. */
  label: string;
  /** Button variant from the design system. */
  variant: "primary" | "danger";
  /** Whether the action needs an explicit confirmation step. */
  destructive: boolean;
  /** Whether the action is restricted to ADMIN users. */
  adminOnly: boolean;
}

const MARK_SENT: StatusAction = {
  to: "SENT",
  label: "Mark as sent",
  variant: "primary",
  destructive: false,
  adminOnly: false,
};

const MARK_PAID: StatusAction = {
  to: "PAID",
  label: "Mark as paid",
  variant: "primary",
  destructive: false,
  adminOnly: false,
};

const VOID: StatusAction = {
  to: "VOID",
  label: "Void",
  variant: "danger",
  destructive: true,
  adminOnly: true,
};

/**
 * The valid **manual** next actions for a given status. Mirrors the backend
 * lifecycle `DRAFT→SENT→PAID` (+ `VOID`); `PAID`/`VOID` are terminal and expose
 * nothing. `OVERDUE` is a derived view of a `SENT` invoice, so it offers the
 * same actions as `SENT` (never a transition *out of* a terminal status).
 */
function nextActions(status: InvoiceStatus): StatusAction[] {
  switch (status) {
    case "DRAFT":
      return [MARK_SENT, VOID];
    case "SENT":
    case "OVERDUE":
      return [MARK_PAID, VOID];
    case "PAID":
    case "VOID":
    default:
      return [];
  }
}

/** Maps a failed transition to a friendly, semantic error message. */
function messageForError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 409) {
      return "That status change isn't allowed for this invoice.";
    }
    if (err.status === 403) {
      return "You don't have permission to change this invoice's status.";
    }
    return err.message;
  }
  return "Something went wrong. Please try again.";
}

export interface InvoiceStatusControlProps {
  /** The invoice whose status is being controlled. */
  invoice: Invoice;
  /** Called with the updated invoice after a successful transition. */
  onUpdated: (invoice: Invoice) => void;
}

/**
 * Status control for the invoice detail's Status section (client component).
 *
 * Shows the current status via {@link InvoiceStatusBadge} (including the derived
 * `OVERDUE`) and offers only the **valid** next transitions for that status —
 * never a transition out of a terminal status, and never the derived `OVERDUE`.
 * The **Void** action is gated on the user's role from `useAuth()` (ADMIN only)
 * and requires an explicit confirmation. While a transition is pending the
 * button shows a `Spinner`; on success the badge/invoice update via `onUpdated`;
 * a `409`/`403` (or any failure) surfaces as a friendly `text-error` message.
 */
export function InvoiceStatusControl({
  invoice,
  onUpdated,
}: InvoiceStatusControlProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === ADMIN_ROLE;

  const [pending, setPending] = useState<StatusAction["to"] | null>(null);
  const [confirming, setConfirming] = useState<StatusAction["to"] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const actions = nextActions(invoice.status).filter(
    (action) => !action.adminOnly || isAdmin,
  );

  async function run(action: StatusAction) {
    setError(null);
    setConfirming(null);
    setPending(action.to);
    try {
      const updated = await updateStatus(
        invoice.id,
        action.to,
        getStoredToken(),
      );
      onUpdated(updated);
    } catch (err) {
      setError(messageForError(err));
    } finally {
      setPending(null);
    }
  }

  function handleClick(action: StatusAction) {
    if (action.destructive) {
      setError(null);
      setConfirming(action.to);
      return;
    }
    void run(action);
  }

  const busy = pending !== null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <InvoiceStatusBadge status={invoice.status} />
      </div>

      {actions.length === 0 ? (
        <p className="text-body-sm text-on-surface-variant">
          No further status changes are available.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => (
            <Button
              key={action.to}
              type="button"
              size="sm"
              variant={action.variant}
              isLoading={pending === action.to}
              disabled={busy}
              onClick={() => handleClick(action)}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}

      {confirming === "VOID" && (
        <div
          role="alertdialog"
          aria-label="Confirm voiding this invoice"
          className="space-y-2 rounded-md border border-outline-variant bg-surface-container p-3"
        >
          <p className="text-body-sm text-on-surface">
            Void this invoice? This can&apos;t be undone.
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="danger"
              isLoading={pending === "VOID"}
              disabled={busy}
              onClick={() => run(VOID)}
            >
              Confirm void
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={busy}
              onClick={() => setConfirming(null)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="text-body-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}

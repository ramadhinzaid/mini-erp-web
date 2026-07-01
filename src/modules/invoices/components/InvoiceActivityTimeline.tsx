"use client";

import { useCallback, useEffect, useState } from "react";
import { Skeleton } from "@/components/ui";
import { ApiError } from "@/lib/api";
import { getInvoiceEvents } from "../services/invoices.service";
import { getStoredToken } from "../services/token";
import type { InvoiceEvent } from "../types";

export interface InvoiceActivityTimelineProps {
  /** Id of the invoice whose audit trail to render. */
  invoiceId: string;
}

type LoadStatus = "loading" | "success" | "error";

/** Formats an ISO timestamp as a short, locale-aware date + time. */
function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Title-cases a machine event type (e.g. `ITEM_ADDED` → `Item added`). */
function humanizeType(type: string): string {
  const spaced = type.replace(/_/g, " ").toLowerCase().trim();
  if (!spaced) return "Event";
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/**
 * Reduces an event to a display title and an optional detail line. Known kinds
 * get a curated title (with `from → to` for status changes and the item
 * description for item events); anything else falls back to the raw `message`.
 */
function describeEvent(event: InvoiceEvent): { title: string; detail?: string } {
  switch (event.type) {
    case "CREATED":
      // The title already says it; a "Invoice created" message would duplicate.
      return { title: "Invoice created" };
    case "STATUS_CHANGED": {
      const from = event.data?.from;
      const to = event.data?.to;
      return {
        title: "Status changed",
        detail: from && to ? `${from} → ${to}` : event.message || undefined,
      };
    }
    case "ITEM_ADDED":
      return { title: "Item added", detail: event.data?.description ?? event.message };
    case "ITEM_UPDATED":
      return { title: "Item updated", detail: event.data?.description ?? event.message };
    case "ITEM_REMOVED":
      return { title: "Item removed", detail: event.data?.description ?? event.message };
    default:
      return { title: humanizeType(event.type), detail: event.message || undefined };
  }
}

/** Loading placeholder mirroring a few timeline rows. */
function TimelineSkeleton() {
  return (
    <ul className="space-y-4" aria-hidden="true">
      {Array.from({ length: 3 }).map((_, i) => (
        <li key={i} className="flex gap-3">
          <Skeleton className="mt-1 h-2.5 w-2.5 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </li>
      ))}
    </ul>
  );
}

/**
 * Invoice **activity timeline** (client component).
 *
 * Fetches the audit trail via {@link getInvoiceEvents} and renders it as an
 * ordered, oldest-first list (`CREATED` at the top). Each entry shows a curated
 * title — `STATUS_CHANGED` renders `from → to`, `ITEM_*` the affected item —
 * plus its timestamp and, when the trail records one, the acting user. Shows a
 * {@link Skeleton} while loading and a `text-error` message on failure. Mounted
 * in {@link InvoiceDetail}'s activity section.
 */
export function InvoiceActivityTimeline({
  invoiceId,
}: InvoiceActivityTimelineProps) {
  const [events, setEvents] = useState<InvoiceEvent[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const data = await getInvoiceEvents(invoiceId, getStoredToken());
      // Order oldest-first so the story reads top-to-bottom (CREATED first).
      const ordered = [...data].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
      setEvents(ordered);
      setStatus("success");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to load the activity timeline. Please try again.",
      );
      setStatus("error");
    }
  }, [invoiceId]);

  useEffect(() => {
    void Promise.resolve().then(load);
  }, [load]);

  if (status === "loading") {
    return <TimelineSkeleton />;
  }

  if (status === "error") {
    return (
      <p role="alert" className="text-body-sm text-error">
        {error}
      </p>
    );
  }

  if (events.length === 0) {
    return (
      <p className="text-body-sm text-on-surface-variant">
        No activity recorded yet.
      </p>
    );
  }

  return (
    <ol className="space-y-4">
      {events.map((event) => {
        const { title, detail } = describeEvent(event);
        return (
          <li key={event.id} className="flex gap-3">
            <span
              aria-hidden="true"
              className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-primary"
            />
            <div className="min-w-0 flex-1">
              <p className="text-body-md text-on-surface">{title}</p>
              {detail && (
                <p className="text-body-sm text-on-surface-variant">{detail}</p>
              )}
              <p className="text-body-sm text-on-surface-variant">
                <time dateTime={event.createdAt}>
                  {formatTimestamp(event.createdAt)}
                </time>
                {event.actor ? ` · ${event.actor}` : ""}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

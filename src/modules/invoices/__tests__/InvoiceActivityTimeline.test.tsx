import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import { InvoiceActivityTimeline } from "../components/InvoiceActivityTimeline";
import { getInvoiceEvents } from "../services/invoices.service";
import type { InvoiceEvent } from "../types";

// Mock the I/O boundary the timeline depends on.
vi.mock("../services/invoices.service", () => ({
  getInvoiceEvents: vi.fn(),
}));

// Deliberately out of chronological order; the component must sort them.
const events: InvoiceEvent[] = [
  {
    id: "e2",
    invoiceId: "inv1",
    type: "STATUS_CHANGED",
    message: "Status changed",
    createdAt: "2026-07-02T10:00:00.000Z",
    actor: "Jane Doe",
    data: { from: "DRAFT", to: "SENT" },
  },
  {
    id: "e1",
    invoiceId: "inv1",
    type: "CREATED",
    message: "Invoice created",
    createdAt: "2026-07-01T09:00:00.000Z",
  },
  {
    id: "e3",
    invoiceId: "inv1",
    type: "ITEM_ADDED",
    message: "Item added",
    createdAt: "2026-07-03T11:00:00.000Z",
    data: { description: "Consulting services" },
  },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe("InvoiceActivityTimeline", () => {
  it("renders events oldest-first with details and actor", async () => {
    vi.mocked(getInvoiceEvents).mockResolvedValue(events);
    render(<InvoiceActivityTimeline invoiceId="inv1" />);

    await screen.findByText("Invoice created");

    const rows = screen.getAllByRole("listitem");
    expect(rows).toHaveLength(3);
    // CREATED first (earliest timestamp), then STATUS_CHANGED, then ITEM_ADDED.
    expect(rows[0]).toHaveTextContent("Invoice created");
    expect(rows[1]).toHaveTextContent("Status changed");
    expect(within(rows[1]).getByText("DRAFT → SENT")).toBeInTheDocument();
    expect(rows[1]).toHaveTextContent("Jane Doe");
    expect(rows[2]).toHaveTextContent("Item added");
    expect(rows[2]).toHaveTextContent("Consulting services");

    expect(getInvoiceEvents).toHaveBeenCalledWith("inv1", undefined);
  });

  it("shows a skeleton while loading", async () => {
    // A promise that never settles keeps the component in its loading state.
    vi.mocked(getInvoiceEvents).mockReturnValue(new Promise(() => {}));
    const { container } = render(<InvoiceActivityTimeline invoiceId="inv1" />);

    await waitFor(() =>
      expect(container.querySelector(".animate-pulse")).toBeTruthy(),
    );
    expect(screen.queryByText("Invoice created")).not.toBeInTheDocument();
  });

  it("shows an error message when the fetch fails", async () => {
    vi.mocked(getInvoiceEvents).mockRejectedValue(new Error("boom"));
    render(<InvoiceActivityTimeline invoiceId="inv1" />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /failed to load the activity timeline/i,
    );
  });

  it("renders an empty state when there is no activity", async () => {
    vi.mocked(getInvoiceEvents).mockResolvedValue([]);
    render(<InvoiceActivityTimeline invoiceId="inv1" />);

    expect(
      await screen.findByText(/no activity recorded yet/i),
    ).toBeInTheDocument();
  });
});

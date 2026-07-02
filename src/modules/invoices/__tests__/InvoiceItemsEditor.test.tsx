import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApiError } from "@/lib/api";
import { InvoiceItemsEditor } from "../components/InvoiceItemsEditor";
import {
  addItem,
  removeItem,
  updateItem,
} from "../services/invoices.service";
import type { Invoice, InvoiceStatus } from "../types";

// Mock only the I/O boundary; keep the real `formatMoney` so totals render as in
// production.
vi.mock("../services/invoices.service", async () => {
  const actual = await vi.importActual<
    typeof import("../services/invoices.service")
  >("../services/invoices.service");
  return {
    ...actual,
    addItem: vi.fn(),
    updateItem: vi.fn(),
    removeItem: vi.fn(),
  };
});

function makeInvoice(overrides: Partial<Invoice> = {}): Invoice {
  return {
    id: "inv1",
    number: "INV-0001",
    customerId: "c1",
    customerName: "Acme Corp",
    status: "DRAFT",
    issueDate: "2026-07-01",
    taxRate: 11,
    subtotal: "200.00",
    taxAmount: "22.00",
    total: "222.00",
    items: [
      {
        id: "it1",
        description: "Consulting",
        quantity: 2,
        unitPrice: "100.00",
        lineTotal: "200.00",
      },
    ],
    createdAt: "2026-07-01T00:00:00.000Z",
    ...overrides,
  };
}

/**
 * Stateful harness mirroring `InvoiceDetail`: it owns the invoice and feeds each
 * mutation's returned invoice back in, so we can assert the totals update live.
 */
function Harness({ initial }: { initial: Invoice }) {
  const [invoice, setInvoice] = useState(initial);
  return <InvoiceItemsEditor invoice={invoice} onUpdated={setInvoice} />;
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("InvoiceItemsEditor — render", () => {
  it("renders existing line items with description, qty, unit price and total", () => {
    render(<Harness initial={makeInvoice()} />);

    expect(screen.getByText("Consulting")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    // unit price and line total both format to money.
    expect(screen.getAllByText("$100.00").length).toBeGreaterThan(0);
    // The totals footer reflects the invoice.
    expect(screen.getByText("$222.00")).toBeInTheDocument();
  });
});

describe("InvoiceItemsEditor — add", () => {
  it("adds an item and shows the server-recomputed totals", async () => {
    const user = userEvent.setup();
    vi.mocked(addItem).mockResolvedValue(
      makeInvoice({
        subtotal: "280.00",
        taxAmount: "30.80",
        total: "310.80",
        items: [
          {
            id: "it1",
            description: "Consulting",
            quantity: 2,
            unitPrice: "100.00",
            lineTotal: "200.00",
          },
          {
            id: "it2",
            description: "Design",
            quantity: 1,
            unitPrice: "80.00",
            lineTotal: "80.00",
          },
        ],
      }),
    );

    render(<Harness initial={makeInvoice()} />);

    await user.type(screen.getByLabelText("Description"), "Design");
    const qty = screen.getByLabelText("Qty");
    await user.clear(qty);
    await user.type(qty, "1");
    const price = screen.getByLabelText("Unit price");
    await user.clear(price);
    await user.type(price, "80");

    await user.click(screen.getByRole("button", { name: /add item/i }));

    await waitFor(() =>
      expect(addItem).toHaveBeenCalledWith(
        "inv1",
        { description: "Design", quantity: 1, unitPrice: 80 },
        undefined,
      ),
    );
    // Live totals update to the returned invoice.
    expect(await screen.findByText("$310.80")).toBeInTheDocument();
    expect(screen.getByText("Design")).toBeInTheDocument();
  });

  it("validates before calling the service", async () => {
    const user = userEvent.setup();
    render(<Harness initial={makeInvoice()} />);

    // Empty description → invalid.
    await user.click(screen.getByRole("button", { name: /add item/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /needs a description/i,
    );
    expect(addItem).not.toHaveBeenCalled();
  });
});

describe("InvoiceItemsEditor — edit", () => {
  it("edits a line item and reflects the returned totals", async () => {
    const user = userEvent.setup();
    vi.mocked(updateItem).mockResolvedValue(
      makeInvoice({
        subtotal: "300.00",
        taxAmount: "33.00",
        total: "333.00",
        items: [
          {
            id: "it1",
            description: "Consulting",
            quantity: 3,
            unitPrice: "100.00",
            lineTotal: "300.00",
          },
        ],
      }),
    );

    render(<Harness initial={makeInvoice()} />);

    await user.click(screen.getByRole("button", { name: "Edit Consulting" }));

    const qty = screen.getByDisplayValue("2");
    await user.clear(qty);
    await user.type(qty, "3");

    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(updateItem).toHaveBeenCalledWith(
        "inv1",
        "it1",
        { description: "Consulting", quantity: 3, unitPrice: 100 },
        undefined,
      ),
    );
    expect(await screen.findByText("$333.00")).toBeInTheDocument();
  });
});

describe("InvoiceItemsEditor — remove", () => {
  it("confirms then removes the item and updates totals", async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    vi.mocked(removeItem).mockResolvedValue(
      makeInvoice({
        subtotal: "0.00",
        taxAmount: "0.00",
        total: "0.00",
        items: [],
      }),
    );

    render(<Harness initial={makeInvoice()} />);

    await user.click(screen.getByRole("button", { name: "Remove Consulting" }));

    expect(confirmSpy).toHaveBeenCalled();
    await waitFor(() =>
      expect(removeItem).toHaveBeenCalledWith("inv1", "it1", undefined),
    );
    await waitFor(() =>
      expect(screen.queryByText("Consulting")).not.toBeInTheDocument(),
    );
  });

  it("does not remove when the confirmation is dismissed", async () => {
    const user = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(false);

    render(<Harness initial={makeInvoice()} />);

    await user.click(screen.getByRole("button", { name: "Remove Consulting" }));

    expect(removeItem).not.toHaveBeenCalled();
    expect(screen.getByText("Consulting")).toBeInTheDocument();
  });
});

describe("InvoiceItemsEditor — not editable", () => {
  it.each<InvoiceStatus>(["PAID", "VOID", "OVERDUE"])(
    "hides editing controls and explains why when status is %s",
    (status) => {
      render(<Harness initial={makeInvoice({ status })} />);

      expect(
        screen.getByText(new RegExp(`can’t be edited.*${status}`, "i")),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /add item/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /edit consulting/i }),
      ).not.toBeInTheDocument();
      // Items are still shown read-only.
      expect(screen.getByText("Consulting")).toBeInTheDocument();
    },
  );
});

describe("InvoiceItemsEditor — error handling", () => {
  it("surfaces a 409 as a friendly, editability-focused message", async () => {
    const user = userEvent.setup();
    vi.mocked(addItem).mockRejectedValue(new ApiError("Conflict", 409));

    render(<Harness initial={makeInvoice()} />);

    await user.type(screen.getByLabelText("Description"), "Design");
    await user.click(screen.getByRole("button", { name: /add item/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /can no longer be edited/i,
    );
  });

  it("shows the ApiError message for other failures", async () => {
    const user = userEvent.setup();
    vi.mocked(addItem).mockRejectedValue(
      new ApiError("Item description too long", 400),
    );

    render(<Harness initial={makeInvoice()} />);

    await user.type(screen.getByLabelText("Description"), "Design");
    await user.click(screen.getByRole("button", { name: /add item/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Item description too long",
    );
  });
});

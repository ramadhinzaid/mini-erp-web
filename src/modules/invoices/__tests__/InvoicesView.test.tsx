import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { listCustomers } from "@/modules/customers";
import { InvoicesView } from "../components/InvoicesView";
import { listInvoices } from "../services/invoices.service";
import type { Invoice } from "../types";
import type { InvoiceListResult } from "../services/invoices.service";

// Customer filter source — mock the Customers module's public API.
vi.mock("@/modules/customers", () => ({
  listCustomers: vi.fn(),
}));

// Mock only the I/O boundary; keep the real `formatMoney`/`deriveInvoiceStatus`
// helpers so money and the derived OVERDUE badge render as in production.
vi.mock("../services/invoices.service", async () => {
  const actual = await vi.importActual<
    typeof import("../services/invoices.service")
  >("../services/invoices.service");
  return { ...actual, listInvoices: vi.fn() };
});

const invoices: Invoice[] = [
  {
    id: "inv1",
    number: "INV-0001",
    customerId: "c1",
    customerName: "Acme Corp",
    status: "DRAFT",
    issueDate: "2026-07-01",
    dueDate: "2026-07-31",
    taxRate: 11,
    subtotal: "200.00",
    taxAmount: "22.00",
    total: "222.00",
    items: [],
    createdAt: "2026-07-01T00:00:00.000Z",
  },
  {
    // SENT + a long-past due date → the view must derive OVERDUE.
    id: "inv2",
    number: "INV-0002",
    customerId: "c2",
    customerName: "Globex",
    status: "SENT",
    issueDate: "2020-01-01",
    dueDate: "2020-02-01",
    taxRate: 0,
    subtotal: "50.00",
    taxAmount: "0.00",
    total: "50.00",
    items: [],
    createdAt: "2020-01-01T00:00:00.000Z",
  },
];

function page(
  items: Invoice[],
  total = items.length,
  pageNo = 1,
): InvoiceListResult {
  return { items, total, page: pageNo, limit: 10 };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(listInvoices).mockResolvedValue(page(invoices));
  vi.mocked(listCustomers).mockResolvedValue({
    items: [
      { id: "c1", name: "Acme Corp", isActive: true, createdAt: "2026-01-01" },
      { id: "c2", name: "Globex", isActive: true, createdAt: "2026-01-01" },
    ],
    total: 2,
    page: 1,
    limit: 100,
  });
});

describe("InvoicesView — list", () => {
  it("loads and renders invoices with a derived OVERDUE badge", async () => {
    render(<InvoicesView />);

    expect(await screen.findByText("INV-0001")).toBeInTheDocument();
    expect(screen.getByText("INV-0002")).toBeInTheDocument();
    expect(screen.getByText("$222.00")).toBeInTheDocument();
    // inv2 is SENT with a past due date → the badge derives to Overdue.
    // Scope to the table so the filter <option> labels don't collide.
    const table = screen.getByRole("table");
    expect(within(table).getByText("Overdue")).toBeInTheDocument();
    expect(within(table).getByText("Draft")).toBeInTheDocument();
    expect(listInvoices).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 10 }),
    );
  });

  it("links each invoice row to its detail page", async () => {
    render(<InvoicesView />);

    const link = await screen.findByRole("link", { name: "INV-0001" });
    expect(link).toHaveAttribute("href", "/invoices/inv1");
  });

  it("shows an empty state when there are no invoices", async () => {
    vi.mocked(listInvoices).mockResolvedValue(page([], 0));
    render(<InvoicesView />);

    expect(await screen.findByText(/no invoices yet/i)).toBeInTheDocument();
  });

  it("shows an error message when loading fails", async () => {
    vi.mocked(listInvoices).mockRejectedValue(new Error("boom"));
    render(<InvoicesView />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /failed to load invoices/i,
    );
  });
});

describe("InvoicesView — filters", () => {
  it("re-queries page 1 with the selected status filter", async () => {
    const user = userEvent.setup();
    render(<InvoicesView />);
    await screen.findByText("INV-0001");

    await user.selectOptions(screen.getByLabelText("Status"), "PAID");
    await user.click(screen.getByRole("button", { name: "Apply" }));

    await waitFor(() =>
      expect(listInvoices).toHaveBeenLastCalledWith(
        expect.objectContaining({ status: "PAID", page: 1 }),
      ),
    );
  });

  it("passes the search term and date range", async () => {
    const user = userEvent.setup();
    render(<InvoicesView />);
    await screen.findByText("INV-0001");

    await user.type(screen.getByLabelText("Search"), "acme");
    await user.type(screen.getByLabelText("Issued from"), "2026-01-01");
    await user.click(screen.getByRole("button", { name: "Apply" }));

    await waitFor(() =>
      expect(listInvoices).toHaveBeenLastCalledWith(
        expect.objectContaining({
          search: "acme",
          issuedFrom: "2026-01-01",
          page: 1,
        }),
      ),
    );
  });
});

describe("InvoicesView — pagination", () => {
  it("advances to the next page with the committed filters", async () => {
    vi.mocked(listInvoices).mockResolvedValue(page(invoices, 25, 1));
    const user = userEvent.setup();
    render(<InvoicesView />);
    await screen.findByText("INV-0001");

    await user.click(screen.getByRole("button", { name: "Next page" }));

    await waitFor(() =>
      expect(listInvoices).toHaveBeenLastCalledWith(
        expect.objectContaining({ page: 2 }),
      ),
    );
  });
});

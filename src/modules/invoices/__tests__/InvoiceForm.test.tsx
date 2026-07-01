import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApiError } from "@/lib/api";
import { listCustomers } from "@/modules/customers";
import { InvoiceForm } from "../components/InvoiceForm";
import { createInvoice } from "../services/invoices.service";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

// Customer picker source — mock the Customers module's public API.
vi.mock("@/modules/customers", () => ({
  listCustomers: vi.fn(),
}));

// Mock only the I/O boundary; keep the real `formatMoney`/`computeTotals`
// helpers so the live-total preview renders as in production.
vi.mock("../services/invoices.service", async () => {
  const actual = await vi.importActual<
    typeof import("../services/invoices.service")
  >("../services/invoices.service");
  return { ...actual, createInvoice: vi.fn() };
});

const customers = {
  items: [
    {
      id: "c1",
      name: "Acme Corp",
      isActive: true,
      createdAt: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "c2",
      name: "Globex",
      isActive: true,
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  ],
  total: 2,
  page: 1,
  limit: 100,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(listCustomers).mockResolvedValue(customers);
});

describe("InvoiceForm — render", () => {
  it("loads customers into the picker", async () => {
    render(<InvoiceForm />);

    expect(
      await screen.findByRole("option", { name: "Acme Corp" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Globex" })).toBeInTheDocument();
  });
});

describe("InvoiceForm — validation", () => {
  it("requires a customer and does not call the service", async () => {
    const user = userEvent.setup();
    render(<InvoiceForm />);
    await screen.findByRole("option", { name: "Acme Corp" });

    await user.click(screen.getByRole("button", { name: /create invoice/i }));

    expect(await screen.findByText("Select a customer.")).toBeInTheDocument();
    expect(createInvoice).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });
});

describe("InvoiceForm — live totals", () => {
  it("computes subtotal, tax and total from the line items", async () => {
    const user = userEvent.setup();
    render(<InvoiceForm />);
    await screen.findByRole("option", { name: "Acme Corp" });

    await user.type(screen.getByLabelText("Description"), "Consulting");
    const qty = screen.getByLabelText("Qty");
    await user.clear(qty);
    await user.type(qty, "2");
    const price = screen.getByLabelText("Unit price");
    await user.clear(price);
    await user.type(price, "100");
    await user.type(screen.getByLabelText(/tax rate/i), "10");

    // subtotal 200, tax 20, total 220
    expect(screen.getByText("$200.00")).toBeInTheDocument();
    expect(screen.getByText("$20.00")).toBeInTheDocument();
    expect(screen.getByText("$220.00")).toBeInTheDocument();
  });
});

describe("InvoiceForm — create", () => {
  it("creates the invoice with inline items and redirects to its detail page", async () => {
    const user = userEvent.setup();
    vi.mocked(createInvoice).mockResolvedValue({
      id: "inv1",
      number: "INV-0001",
      customerId: "c1",
      status: "DRAFT",
      issueDate: "2026-07-01",
      taxRate: 0,
      subtotal: "200.00",
      taxAmount: "0.00",
      total: "200.00",
      items: [],
      createdAt: "2026-07-01T00:00:00.000Z",
    });

    render(<InvoiceForm />);
    await screen.findByRole("option", { name: "Acme Corp" });

    await user.selectOptions(screen.getByLabelText(/customer/i), "c1");
    await user.type(screen.getByLabelText("Description"), "Consulting");
    const qty = screen.getByLabelText("Qty");
    await user.clear(qty);
    await user.type(qty, "2");
    const price = screen.getByLabelText("Unit price");
    await user.clear(price);
    await user.type(price, "100");

    await user.click(screen.getByRole("button", { name: /create invoice/i }));

    await waitFor(() => expect(createInvoice).toHaveBeenCalledTimes(1));
    const [payload] = vi.mocked(createInvoice).mock.calls[0];
    expect(payload).toMatchObject({
      customerId: "c1",
      items: [{ description: "Consulting", quantity: 2, unitPrice: 100 }],
    });
    await waitFor(() => expect(push).toHaveBeenCalledWith("/invoices/inv1"));
  });
});

describe("InvoiceForm — error handling", () => {
  it("shows the ApiError message when the service rejects", async () => {
    const user = userEvent.setup();
    vi.mocked(createInvoice).mockRejectedValue(
      new ApiError("Customer not found", 404),
    );

    render(<InvoiceForm />);
    await screen.findByRole("option", { name: "Acme Corp" });

    await user.selectOptions(screen.getByLabelText(/customer/i), "c1");
    await user.type(screen.getByLabelText("Description"), "Consulting");
    const qty = screen.getByLabelText("Qty");
    await user.clear(qty);
    await user.type(qty, "1");
    const price = screen.getByLabelText("Unit price");
    await user.clear(price);
    await user.type(price, "50");

    await user.click(screen.getByRole("button", { name: /create invoice/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Customer not found",
    );
    expect(push).not.toHaveBeenCalled();
  });
});

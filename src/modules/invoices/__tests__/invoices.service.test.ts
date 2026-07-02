import { describe, it, expect, vi, beforeEach } from "vitest";
import { api } from "@/lib/api";
import {
  createInvoice,
  getInvoice,
  addItem,
  updateItem,
  removeItem,
  formatMoney,
  computeTotals,
} from "../services/invoices.service";
import type { Invoice, InvoiceInput } from "../types";

// Mock the typed client so we can assert exactly which verb/path each service
// function hits, and confirm the `{ success, data }` envelope is unwrapped.
vi.mock("@/lib/api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const invoice: Invoice = {
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
};

function envelope<T>(data: T) {
  return { success: true, data };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createInvoice", () => {
  it("POSTs the input to /invoices and unwraps data", async () => {
    vi.mocked(api.post).mockResolvedValue(envelope(invoice));
    const input: InvoiceInput = {
      customerId: "c1",
      taxRate: 11,
      items: [{ description: "Consulting", quantity: 2, unitPrice: 100 }],
    };

    const data = await createInvoice(input, "jwt-1");

    expect(api.post).toHaveBeenCalledWith("/invoices", input, { token: "jwt-1" });
    expect(data).toEqual(invoice);
  });
});

describe("getInvoice", () => {
  it("GETs /invoices/:id and unwraps data", async () => {
    vi.mocked(api.get).mockResolvedValue(envelope(invoice));

    const data = await getInvoice("inv1", "jwt-1");

    expect(api.get).toHaveBeenCalledWith("/invoices/inv1", { token: "jwt-1" });
    expect(data).toEqual(invoice);
  });
});

describe("addItem", () => {
  it("POSTs the item to /invoices/:id/items and unwraps data", async () => {
    vi.mocked(api.post).mockResolvedValue(envelope(invoice));
    const item = { description: "Design", quantity: 1, unitPrice: 80 };

    const data = await addItem("inv1", item, "jwt-1");

    expect(api.post).toHaveBeenCalledWith("/invoices/inv1/items", item, {
      token: "jwt-1",
    });
    expect(data).toEqual(invoice);
  });
});

describe("updateItem", () => {
  it("PATCHes /invoices/:id/items/:itemId and unwraps data", async () => {
    vi.mocked(api.patch).mockResolvedValue(envelope(invoice));
    const patch = { quantity: 3 };

    const data = await updateItem("inv1", "it1", patch, "jwt-1");

    expect(api.patch).toHaveBeenCalledWith(
      "/invoices/inv1/items/it1",
      patch,
      { token: "jwt-1" },
    );
    expect(data).toEqual(invoice);
  });
});

describe("removeItem", () => {
  it("DELETEs /invoices/:id/items/:itemId and unwraps data", async () => {
    vi.mocked(api.delete).mockResolvedValue(envelope(invoice));

    const data = await removeItem("inv1", "it1", "jwt-1");

    expect(api.delete).toHaveBeenCalledWith("/invoices/inv1/items/it1", {
      token: "jwt-1",
    });
    expect(data).toEqual(invoice);
  });
});

describe("formatMoney", () => {
  it("formats string and number Decimals, defaulting NaN to zero", () => {
    expect(formatMoney("1234.5")).toBe("$1,234.50");
    expect(formatMoney(10)).toBe("$10.00");
    expect(formatMoney(undefined)).toBe("$0.00");
    expect(formatMoney("not-a-number")).toBe("$0.00");
  });
});

describe("computeTotals", () => {
  it("sums line totals and applies the tax rate", () => {
    const totals = computeTotals(
      [
        { quantity: 2, unitPrice: "100" },
        { quantity: 1, unitPrice: 50 },
      ],
      10,
    );
    expect(totals).toEqual({ subtotal: 250, taxAmount: 25, total: 275 });
  });
});

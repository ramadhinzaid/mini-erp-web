import { describe, it, expect, vi, beforeEach } from "vitest";
import { api } from "@/lib/api";
import {
  createInvoice,
  getInvoice,
  updateStatus,
  listInvoices,
  getInvoiceEvents,
  deriveInvoiceStatus,
  addItem,
  updateItem,
  removeItem,
  formatMoney,
  computeTotals,
} from "../services/invoices.service";
import type { Invoice, InvoiceEvent, InvoiceInput } from "../types";

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

describe("updateStatus", () => {
  it("PATCHes /invoices/:id/status with the new status and unwraps data", async () => {
    const sent: Invoice = { ...invoice, status: "SENT" };
    vi.mocked(api.patch).mockResolvedValue(envelope(sent));

    const data = await updateStatus("inv1", "SENT", "jwt-1");

    expect(api.patch).toHaveBeenCalledWith(
      "/invoices/inv1/status",
      { status: "SENT" },
      { token: "jwt-1" },
    );
    expect(data).toEqual(sent);
  });
});

describe("listInvoices", () => {
  it("GETs the paginated path and maps the backend's { data, meta } to { items, total, page, limit }", async () => {
    vi.mocked(api.get).mockResolvedValue(
      envelope({
        data: [invoice],
        meta: { page: 2, limit: 10, total: 1, totalPages: 1 },
      }),
    );

    const data = await listInvoices({
      page: 2,
      status: "SENT",
      customerId: "c1",
      search: "  acme ",
      issuedFrom: "2026-01-01",
      issuedTo: "2026-12-31",
      token: "jwt-1",
    });

    expect(api.get).toHaveBeenCalledWith(
      "/invoices?page=2&limit=10&status=SENT&customerId=c1&search=acme&issuedFrom=2026-01-01&issuedTo=2026-12-31",
      { token: "jwt-1" },
    );
    expect(data).toEqual({ items: [invoice], total: 1, page: 2, limit: 10 });
  });

  it("defaults to page 1 / limit 10 and omits empty filters", async () => {
    vi.mocked(api.get).mockResolvedValue(
      envelope({
        data: [],
        meta: { page: 1, limit: 10, total: 0, totalPages: 1 },
      }),
    );

    await listInvoices();

    expect(api.get).toHaveBeenCalledWith("/invoices?page=1&limit=10", {
      token: undefined,
    });
  });
});

describe("getInvoiceEvents", () => {
  it("GETs /invoices/:id/events and unwraps the event array", async () => {
    const events: InvoiceEvent[] = [
      {
        id: "e1",
        invoiceId: "inv1",
        type: "CREATED",
        message: "Invoice created",
        createdAt: "2026-07-01T00:00:00.000Z",
      },
    ];
    vi.mocked(api.get).mockResolvedValue(envelope(events));

    const data = await getInvoiceEvents("inv1", "jwt-1");

    expect(api.get).toHaveBeenCalledWith("/invoices/inv1/events", {
      token: "jwt-1",
    });
    expect(data).toEqual(events);
  });
});

describe("deriveInvoiceStatus", () => {
  const now = new Date("2026-07-10T00:00:00.000Z");

  it("derives OVERDUE for a SENT invoice past its due date", () => {
    expect(
      deriveInvoiceStatus({ status: "SENT", dueDate: "2026-07-01" }, now),
    ).toBe("OVERDUE");
  });

  it("keeps SENT when the due date has not passed", () => {
    expect(
      deriveInvoiceStatus({ status: "SENT", dueDate: "2026-07-31" }, now),
    ).toBe("SENT");
  });

  it("keeps SENT when there is no due date", () => {
    expect(deriveInvoiceStatus({ status: "SENT" }, now)).toBe("SENT");
  });

  it("never overrides terminal or non-SENT statuses", () => {
    expect(
      deriveInvoiceStatus({ status: "PAID", dueDate: "2026-07-01" }, now),
    ).toBe("PAID");
    expect(
      deriveInvoiceStatus({ status: "DRAFT", dueDate: "2026-07-01" }, now),
    ).toBe("DRAFT");
    expect(
      deriveInvoiceStatus({ status: "VOID", dueDate: "2026-07-01" }, now),
    ).toBe("VOID");
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

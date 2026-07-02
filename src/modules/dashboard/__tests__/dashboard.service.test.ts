import { describe, it, expect, vi, beforeEach } from "vitest";
import { api } from "@/lib/api";
import {
  getDashboardSummary,
  summaryToStats,
  totalInvoiceCount,
} from "../services/dashboard.service";
import type { DashboardSummary } from "../types";

// Mock the typed client so we can assert exactly which verb/path the service
// hits, and confirm the `{ success, data }` envelope is unwrapped.
vi.mock("@/lib/api", () => ({
  api: {
    get: vi.fn(),
  },
}));

const summary: DashboardSummary = {
  revenue: "48290.5",
  outstanding: "12000",
  invoiceCounts: { DRAFT: 2, SENT: 5, PAID: 10, VOID: 1, OVERDUE: 3 },
  customerCount: 42,
  recentInvoices: [
    {
      id: "inv-1",
      number: "INV-0001",
      customerName: "Acme Corp",
      status: "SENT",
      total: "1200",
      issueDate: "2026-06-01",
    },
  ],
};

function envelope<T>(data: T) {
  return { success: true, data };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getDashboardSummary", () => {
  it("GETs /dashboard/summary with the token and unwraps data", async () => {
    vi.mocked(api.get).mockResolvedValue(envelope(summary));

    const data = await getDashboardSummary("jwt-1");

    expect(api.get).toHaveBeenCalledWith("/dashboard/summary", {
      token: "jwt-1",
    });
    expect(data.summary).toEqual(summary);
  });

  it("passes an undefined token through when none is supplied", async () => {
    vi.mocked(api.get).mockResolvedValue(envelope(summary));

    await getDashboardSummary();

    expect(api.get).toHaveBeenCalledWith("/dashboard/summary", {
      token: undefined,
    });
  });

  it("maps the summary into the four KPI StatCards", async () => {
    vi.mocked(api.get).mockResolvedValue(envelope(summary));

    const { stats } = await getDashboardSummary("jwt-1");

    expect(stats.map((s) => s.id)).toEqual([
      "revenue",
      "outstanding",
      "invoices",
      "customers",
    ]);

    const byId = Object.fromEntries(stats.map((s) => [s.id, s]));
    // Money is formatted as USD currency.
    expect(byId.revenue.value).toBe("$48,290.50");
    expect(byId.outstanding.value).toBe("$12,000.00");
    // Invoices KPI is the sum across every status bucket (2+5+10+1+3 = 21).
    expect(byId.invoices.value).toBe("21");
    expect(byId.customers.value).toBe("42");
    // No period-over-period delta comes from the endpoint.
    expect(stats.every((s) => s.delta === undefined)).toBe(true);
  });
});

describe("totalInvoiceCount", () => {
  it("sums every status bucket", () => {
    expect(
      totalInvoiceCount({ DRAFT: 2, SENT: 5, PAID: 10, VOID: 1, OVERDUE: 3 }),
    ).toBe(21);
  });
});

describe("summaryToStats", () => {
  it("derives labels and values without deltas", () => {
    const stats = summaryToStats(summary);
    const customers = stats.find((s) => s.id === "customers");
    expect(customers?.label).toBe("Customers");
    expect(customers?.value).toBe("42");
    expect(customers?.delta).toBeUndefined();
  });
});

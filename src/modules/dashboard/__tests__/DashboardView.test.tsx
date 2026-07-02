import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { faUsers, faFileInvoiceDollar } from "@/lib/icons";
import { DashboardView } from "../components/DashboardView";
import {
  getDashboardSummary,
  type DashboardData,
} from "../services/dashboard.service";
import type { DashboardSummary } from "../types";

// Mock the service and token bridge so the view's I/O is deterministic.
vi.mock("../services/dashboard.service", () => ({
  getDashboardSummary: vi.fn(),
}));
vi.mock("../services/token", () => ({
  getStoredToken: vi.fn(() => "jwt-1"),
}));

const summary: DashboardSummary = {
  revenue: "48290",
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
    {
      id: "inv-2",
      number: "INV-0002",
      customerName: "Globex",
      status: "OVERDUE",
      total: "3400",
      issueDate: "2026-06-02",
    },
  ],
};

const data: DashboardData = {
  summary,
  stats: [
    { id: "revenue", label: "Revenue", value: "$48,290.00", icon: faFileInvoiceDollar },
    { id: "customers", label: "Customers", value: "42", icon: faUsers },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getDashboardSummary).mockResolvedValue(data);
});

describe("DashboardView", () => {
  it("fetches the summary with the stored token on mount", async () => {
    render(<DashboardView />);
    await screen.findByText("Revenue");
    expect(getDashboardSummary).toHaveBeenCalledWith("jwt-1");
  });

  it("renders the KPI stat cards from the mapped stats", async () => {
    render(<DashboardView />);

    expect(await screen.findByText("$48,290.00")).toBeInTheDocument();
    expect(screen.getByText("Revenue")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("Customers")).toBeInTheDocument();
  });

  it("renders the per-status invoice breakdown with counts", async () => {
    render(<DashboardView />);

    const section = (await screen.findByText("Invoices by status")).closest(
      "div",
    ) as HTMLElement;
    const list = within(section);
    // Each status bucket shows its label and count.
    expect(list.getByText("Draft")).toBeInTheDocument();
    expect(list.getByText("Paid")).toBeInTheDocument();
    expect(list.getByText("Overdue")).toBeInTheDocument();
    // Counts: PAID = 10, OVERDUE = 3.
    expect(list.getByText("10")).toBeInTheDocument();
    expect(list.getByText("3")).toBeInTheDocument();
  });

  it("renders recent invoices linking each row to its detail page", async () => {
    render(<DashboardView />);

    const first = await screen.findByText("INV-0001");
    const link = first.closest("a") as HTMLAnchorElement;
    expect(link).toHaveAttribute("href", "/invoices/inv-1");
    expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    // Money formatted.
    expect(screen.getByText("$1,200.00")).toBeInTheDocument();

    const second = screen.getByText("INV-0002");
    expect(second.closest("a")).toHaveAttribute("href", "/invoices/inv-2");
  });

  it("shows an empty state when there are no recent invoices", async () => {
    vi.mocked(getDashboardSummary).mockResolvedValue({
      ...data,
      summary: { ...summary, recentInvoices: [] },
    });
    render(<DashboardView />);

    expect(await screen.findByText("No invoices yet.")).toBeInTheDocument();
  });

  it("renders an error message when the fetch fails", async () => {
    vi.mocked(getDashboardSummary).mockRejectedValue(new Error("boom"));
    render(<DashboardView />);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/failed to load the dashboard/i);
    expect(alert).toHaveClass("text-error");
  });
});

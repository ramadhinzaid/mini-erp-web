import { describe, it, expect, vi, beforeEach } from "vitest";
import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/modules/auth";
import { InvoiceStatusControl } from "../components/InvoiceStatusControl";
import type { Invoice, InvoiceStatus } from "../types";

// Mock the typed API client (the update-status service goes through `api.patch`)
// while keeping a real `ApiError` so the component's `instanceof` status mapping
// works. Also mock the Auth module's `useAuth` to drive the ADMIN gate.
vi.mock("@/lib/api", () => {
  class MockApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
      super(message);
      this.name = "ApiError";
      this.status = status;
    }
  }
  return {
    ApiError: MockApiError,
    api: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
  };
});

vi.mock("@/modules/auth", () => ({ useAuth: vi.fn() }));

const baseInvoice: Invoice = {
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
  items: [],
  createdAt: "2026-07-01T00:00:00.000Z",
};

function envelope<T>(data: T) {
  return { success: true, data };
}

/** Sets the mocked signed-in user's role (or logs the user out with `null`). */
function setRole(role: string | null) {
  vi.mocked(useAuth).mockReturnValue({
    user: role ? { id: "u1", email: "a@b.c", role, firstName: "A", lastName: "B" } : null,
    login: vi.fn(),
    logout: vi.fn(),
    isLoading: false,
  });
}

/**
 * Renders the control inside a tiny stateful harness that mirrors how
 * `InvoiceDetail` owns the invoice — so a successful transition (via
 * `onUpdated`) re-renders the badge from fresh props.
 */
function Harness({ status }: { status: InvoiceStatus }) {
  const [invoice, setInvoice] = useState<Invoice>({ ...baseInvoice, status });
  return <InvoiceStatusControl invoice={invoice} onUpdated={setInvoice} />;
}

beforeEach(() => {
  vi.clearAllMocks();
  setRole("ADMIN");
});

describe("InvoiceStatusControl — valid actions per status", () => {
  it("offers Mark-as-sent and Void for a DRAFT invoice", () => {
    render(<Harness status="DRAFT" />);

    expect(
      screen.getByRole("button", { name: "Mark as sent" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Void" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Mark as paid" }),
    ).not.toBeInTheDocument();
  });

  it("offers Mark-as-paid and Void for a SENT invoice", () => {
    render(<Harness status="SENT" />);

    expect(
      screen.getByRole("button", { name: "Mark as paid" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Void" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Mark as sent" }),
    ).not.toBeInTheDocument();
  });

  it("reflects the derived OVERDUE status and offers the SENT actions", () => {
    render(<Harness status="OVERDUE" />);

    // Derived status still shown via the badge…
    expect(screen.getByText("Overdue")).toBeInTheDocument();
    // …and the actionable transitions are those of the underlying SENT invoice.
    expect(
      screen.getByRole("button", { name: "Mark as paid" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Void" })).toBeInTheDocument();
  });

  it("offers no actions for a terminal PAID invoice", () => {
    render(<Harness status="PAID" />);

    expect(
      screen.getByText(/no further status changes/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Void" }),
    ).not.toBeInTheDocument();
  });

  it("offers no actions for a terminal VOID invoice", () => {
    render(<Harness status="VOID" />);

    expect(
      screen.getByText(/no further status changes/i),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

describe("InvoiceStatusControl — role gating", () => {
  it("hides Void from non-admin users", () => {
    setRole("STAFF");
    render(<Harness status="DRAFT" />);

    expect(
      screen.getByRole("button", { name: "Mark as sent" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Void" }),
    ).not.toBeInTheDocument();
  });

  it("hides Void when logged out", () => {
    setRole(null);
    render(<Harness status="SENT" />);

    expect(
      screen.getByRole("button", { name: "Mark as paid" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Void" }),
    ).not.toBeInTheDocument();
  });
});

describe("InvoiceStatusControl — transitions", () => {
  it("calls updateStatus and updates the badge on success", async () => {
    const user = userEvent.setup();
    vi.mocked(api.patch).mockResolvedValue(
      envelope({ ...baseInvoice, status: "SENT" }),
    );

    render(<Harness status="DRAFT" />);
    await user.click(screen.getByRole("button", { name: "Mark as sent" }));

    await waitFor(() =>
      expect(api.patch).toHaveBeenCalledWith(
        "/invoices/inv1/status",
        { status: "SENT" },
        { token: undefined },
      ),
    );

    // Badge now reflects the new status; the draft action is gone.
    expect(await screen.findByText("Sent")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Mark as sent" }),
    ).not.toBeInTheDocument();
  });

  it("confirms a Void before sending it", async () => {
    const user = userEvent.setup();
    vi.mocked(api.patch).mockResolvedValue(
      envelope({ ...baseInvoice, status: "VOID" }),
    );

    render(<Harness status="SENT" />);

    // First click only opens the confirmation; nothing is sent yet.
    await user.click(screen.getByRole("button", { name: "Void" }));
    expect(api.patch).not.toHaveBeenCalled();
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /confirm void/i }));

    await waitFor(() =>
      expect(api.patch).toHaveBeenCalledWith(
        "/invoices/inv1/status",
        { status: "VOID" },
        { token: undefined },
      ),
    );
    expect(await screen.findByText("Void")).toBeInTheDocument();
  });

  it("cancelling the Void confirmation sends nothing", async () => {
    const user = userEvent.setup();
    render(<Harness status="SENT" />);

    await user.click(screen.getByRole("button", { name: "Void" }));
    await user.click(screen.getByRole("button", { name: /cancel/i }));

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(api.patch).not.toHaveBeenCalled();
  });
});

describe("InvoiceStatusControl — error handling", () => {
  it("shows a friendly message on a 409 illegal transition", async () => {
    const user = userEvent.setup();
    vi.mocked(api.patch).mockRejectedValue(new ApiError("Conflict", 409));

    render(<Harness status="DRAFT" />);
    await user.click(screen.getByRole("button", { name: "Mark as sent" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /isn't allowed/i,
    );
    // Status is unchanged — the draft action is still offered.
    expect(
      screen.getByRole("button", { name: "Mark as sent" }),
    ).toBeInTheDocument();
  });

  it("shows a friendly message on a 403 permission error", async () => {
    const user = userEvent.setup();
    vi.mocked(api.patch).mockRejectedValue(new ApiError("Forbidden", 403));

    render(<Harness status="SENT" />);
    await user.click(screen.getByRole("button", { name: "Void" }));
    await user.click(screen.getByRole("button", { name: /confirm void/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /don't have permission/i,
    );
  });
});

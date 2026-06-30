import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CustomersView } from "../components/CustomersView";
import {
  listCustomers,
  deleteCustomer,
} from "../services/customers.service";
import type { Customer, CustomerListResult } from "../types";

// Mock the service so the view's I/O is deterministic. The view's only side
// effects flow through these functions.
vi.mock("../services/customers.service", () => ({
  listCustomers: vi.fn(),
  deleteCustomer: vi.fn(),
  createCustomer: vi.fn(),
  updateCustomer: vi.fn(),
}));

const customers: Customer[] = [
  {
    id: "c1",
    name: "Acme Corp",
    email: "hello@acme.com",
    company: "Acme",
    phone: "555-0100",
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "c2",
    name: "Globex",
    email: "info@globex.com",
    isActive: true,
    createdAt: "2026-01-02T00:00:00.000Z",
  },
];

function page(items: Customer[], total = items.length): CustomerListResult {
  return { items, total, page: 1, limit: 10 };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(listCustomers).mockResolvedValue(page(customers));
  vi.mocked(deleteCustomer).mockResolvedValue(undefined);
});

describe("CustomersView — list", () => {
  it("loads and renders the customers", async () => {
    render(<CustomersView />);

    expect(await screen.findByText("Acme Corp")).toBeInTheDocument();
    expect(screen.getByText("Globex")).toBeInTheDocument();
    expect(listCustomers).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, search: "", limit: 10 }),
    );
  });

  it("shows an empty state when there are no customers", async () => {
    vi.mocked(listCustomers).mockResolvedValue(page([], 0));
    render(<CustomersView />);

    expect(
      await screen.findByText(/no customers yet/i),
    ).toBeInTheDocument();
  });
});

describe("CustomersView — search", () => {
  it("re-queries with the submitted search term", async () => {
    const user = userEvent.setup();
    render(<CustomersView />);
    await screen.findByText("Acme Corp");

    await user.type(screen.getByLabelText("Search customers"), "globex");
    await user.click(screen.getByRole("button", { name: "Search" }));

    await waitFor(() =>
      expect(listCustomers).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: "globex", page: 1 }),
      ),
    );
  });
});

describe("CustomersView — delete", () => {
  it("confirms before deleting, then calls the service and refreshes", async () => {
    const user = userEvent.setup();
    render(<CustomersView />);
    await screen.findByText("Acme Corp");

    await user.click(screen.getByRole("button", { name: "Delete Acme Corp" }));

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveTextContent(/are you sure/i);
    expect(deleteCustomer).not.toHaveBeenCalled();

    await user.click(within(dialog).getByRole("button", { name: "Delete" }));

    await waitFor(() =>
      expect(deleteCustomer).toHaveBeenCalledWith("c1", undefined),
    );
    // Success feedback + a refetch (initial load + reload after delete).
    expect(await screen.findByRole("status")).toHaveTextContent(/was deleted/i);
    expect(vi.mocked(listCustomers).mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it("can cancel the delete confirmation", async () => {
    const user = userEvent.setup();
    render(<CustomersView />);
    await screen.findByText("Acme Corp");

    await user.click(screen.getByRole("button", { name: "Delete Globex" }));
    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(deleteCustomer).not.toHaveBeenCalled();
  });
});

describe("CustomersView — create flow", () => {
  it("opens the form when New customer is clicked", async () => {
    const user = userEvent.setup();
    render(<CustomersView />);
    await screen.findByText("Acme Corp");

    await user.click(screen.getByRole("button", { name: /new customer/i }));

    expect(
      screen.getByRole("button", { name: /create customer/i }),
    ).toBeInTheDocument();
  });
});

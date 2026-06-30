import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApiError } from "@/lib/api";
import { CustomerForm } from "../components/CustomerForm";
import { createCustomer, updateCustomer } from "../services/customers.service";
import type { Customer } from "../types";

// Mock the I/O boundary the form depends on; ApiError stays the real class so
// `instanceof ApiError` works in the component.
vi.mock("../services/customers.service", () => ({
  createCustomer: vi.fn(),
  updateCustomer: vi.fn(),
}));

const existing: Customer = {
  id: "c1",
  name: "Acme Corp",
  email: "hello@acme.com",
  company: "Acme",
  isActive: true,
  createdAt: "2026-01-01T00:00:00.000Z",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("CustomerForm — validation", () => {
  it("requires a name and does not call the service when empty", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    render(<CustomerForm onSuccess={onSuccess} onCancel={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /create customer/i }));

    expect(await screen.findByText("Name is required.")).toBeInTheDocument();
    expect(createCustomer).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("rejects an invalid email format", async () => {
    const user = userEvent.setup();
    render(<CustomerForm onSuccess={vi.fn()} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText(/name/i), "Bob");
    await user.type(screen.getByLabelText("Email"), "not-an-email");
    await user.click(screen.getByRole("button", { name: /create customer/i }));

    expect(
      await screen.findByText("Enter a valid email address."),
    ).toBeInTheDocument();
    expect(createCustomer).not.toHaveBeenCalled();
  });
});

describe("CustomerForm — create", () => {
  it("calls createCustomer with the trimmed payload and reports success", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    vi.mocked(createCustomer).mockResolvedValue({
      ...existing,
      id: "new",
      name: "Bob",
    });

    render(<CustomerForm onSuccess={onSuccess} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText(/name/i), "  Bob  ");
    await user.type(screen.getByLabelText("Email"), "bob@acme.com");
    await user.click(screen.getByRole("button", { name: /create customer/i }));

    await waitFor(() => expect(createCustomer).toHaveBeenCalledTimes(1));
    const [payload] = vi.mocked(createCustomer).mock.calls[0];
    expect(payload).toMatchObject({ name: "Bob", email: "bob@acme.com" });
    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ id: "new" }),
      "create",
    );
  });
});

describe("CustomerForm — edit", () => {
  it("pre-fills fields and calls updateCustomer with the id", async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    vi.mocked(updateCustomer).mockResolvedValue({
      ...existing,
      name: "Acme Inc",
    });

    render(
      <CustomerForm customer={existing} onSuccess={onSuccess} onCancel={vi.fn()} />,
    );

    const nameInput = screen.getByLabelText(/name/i) as HTMLInputElement;
    expect(nameInput.value).toBe("Acme Corp");

    await user.clear(nameInput);
    await user.type(nameInput, "Acme Inc");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => expect(updateCustomer).toHaveBeenCalledTimes(1));
    const [id, payload] = vi.mocked(updateCustomer).mock.calls[0];
    expect(id).toBe("c1");
    expect(payload).toMatchObject({ name: "Acme Inc" });
    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Acme Inc" }),
      "edit",
    );
  });
});

describe("CustomerForm — error handling", () => {
  it("shows the ApiError message when the service rejects", async () => {
    const user = userEvent.setup();
    vi.mocked(createCustomer).mockRejectedValue(
      new ApiError("Email already in use", 409),
    );

    render(<CustomerForm onSuccess={vi.fn()} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText(/name/i), "Bob");
    await user.click(screen.getByRole("button", { name: /create customer/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Email already in use",
    );
  });
});

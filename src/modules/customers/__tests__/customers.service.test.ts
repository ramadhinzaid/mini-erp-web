import { describe, it, expect, vi, beforeEach } from "vitest";
import { api } from "@/lib/api";
import {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../services/customers.service";
import type { Customer } from "../types";

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

const customer: Customer = {
  id: "c1",
  name: "Acme Corp",
  email: "hello@acme.com",
  isActive: true,
  createdAt: "2026-01-01T00:00:00.000Z",
};

function envelope<T>(data: T) {
  return { success: true, data };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("listCustomers", () => {
  it("GETs the paginated path and maps the backend's { data, meta } to { items, total, page, limit }", async () => {
    vi.mocked(api.get).mockResolvedValue(
      envelope({
        data: [customer],
        meta: { page: 2, limit: 10, total: 1, totalPages: 1 },
      }),
    );

    const data = await listCustomers({
      page: 2,
      search: "acme",
      token: "jwt-1",
    });

    expect(api.get).toHaveBeenCalledWith(
      "/customers?page=2&limit=10&search=acme",
      { token: "jwt-1" },
    );
    expect(data).toEqual({ items: [customer], total: 1, page: 2, limit: 10 });
  });

  it("defaults to page 1 / limit 10 and omits an empty search", async () => {
    vi.mocked(api.get).mockResolvedValue(
      envelope({
        data: [],
        meta: { page: 1, limit: 10, total: 0, totalPages: 1 },
      }),
    );

    await listCustomers();

    expect(api.get).toHaveBeenCalledWith("/customers?page=1&limit=10", {
      token: undefined,
    });
  });
});

describe("getCustomer", () => {
  it("GETs /customers/:id and unwraps data", async () => {
    vi.mocked(api.get).mockResolvedValue(envelope(customer));

    const data = await getCustomer("c1", "jwt-1");

    expect(api.get).toHaveBeenCalledWith("/customers/c1", { token: "jwt-1" });
    expect(data).toEqual(customer);
  });
});

describe("createCustomer", () => {
  it("POSTs the input to /customers and unwraps data", async () => {
    vi.mocked(api.post).mockResolvedValue(envelope(customer));
    const input = { name: "Acme Corp", email: "hello@acme.com" };

    const data = await createCustomer(input, "jwt-1");

    expect(api.post).toHaveBeenCalledWith("/customers", input, {
      token: "jwt-1",
    });
    expect(data).toEqual(customer);
  });
});

describe("updateCustomer", () => {
  it("PATCHes /customers/:id with the input and unwraps data", async () => {
    const updated = { ...customer, name: "Acme Inc" };
    vi.mocked(api.patch).mockResolvedValue(envelope(updated));
    const input = { name: "Acme Inc" };

    const data = await updateCustomer("c1", input, "jwt-1");

    expect(api.patch).toHaveBeenCalledWith("/customers/c1", input, {
      token: "jwt-1",
    });
    expect(data).toEqual(updated);
  });
});

describe("deleteCustomer", () => {
  it("DELETEs /customers/:id", async () => {
    vi.mocked(api.delete).mockResolvedValue(undefined);

    await deleteCustomer("c1", "jwt-1");

    expect(api.delete).toHaveBeenCalledWith("/customers/c1", {
      token: "jwt-1",
    });
  });
});

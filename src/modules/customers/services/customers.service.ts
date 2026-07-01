import { api } from "@/lib/api";
import type {
  Customer,
  CustomerInput,
  CustomerListParams,
  CustomerListResult,
} from "../types";

/**
 * Data-access layer for the Customers module.
 *
 * Every function goes through the single typed client in `@/lib/api` (never a
 * raw `fetch`) and unwraps the backend's `{ success, data }` envelope so callers
 * receive plain domain objects. Signatures are token-based so they compose with
 * the auth module (`useAuth().token`) once it lands — today callers pass the
 * value from {@link getStoredToken}.
 *
 * The NestJS Customers resource (see the companion `api-customers` plan) exposes:
 * `GET /customers?page=&limit=&search=`, `GET /customers/:id`,
 * `POST /customers`, `PATCH /customers/:id`, `DELETE /customers/:id`.
 */

/** The backend wraps every successful response as `{ success, data }`. */
interface Envelope<T> {
  success: boolean;
  data: T;
}

const RESOURCE = "/customers";

/** Lists customers, paginated and optionally filtered by a search term. */
export async function listCustomers(
  params: CustomerListParams = {},
): Promise<CustomerListResult> {
  const { page = 1, limit = 10, search = "", token } = params;

  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search.trim()) query.set("search", search.trim());

  const res = await api.get<Envelope<CustomerListResult>>(
    `${RESOURCE}?${query.toString()}`,
    { token },
  );
  return res.data;
}

/** Fetches a single customer by id. */
export async function getCustomer(
  id: string,
  token?: string,
): Promise<Customer> {
  const res = await api.get<Envelope<Customer>>(`${RESOURCE}/${id}`, { token });
  return res.data;
}

/** Creates a customer and returns the persisted record. */
export async function createCustomer(
  input: CustomerInput,
  token?: string,
): Promise<Customer> {
  const res = await api.post<Envelope<Customer>>(RESOURCE, input, { token });
  return res.data;
}

/** Updates an existing customer and returns the persisted record. */
export async function updateCustomer(
  id: string,
  input: CustomerInput,
  token?: string,
): Promise<Customer> {
  const res = await api.patch<Envelope<Customer>>(
    `${RESOURCE}/${id}`,
    input,
    { token },
  );
  return res.data;
}

/** Deletes a customer by id. */
export async function deleteCustomer(
  id: string,
  token?: string,
): Promise<void> {
  await api.delete<Envelope<unknown> | undefined>(`${RESOURCE}/${id}`, {
    token,
  });
}

/**
 * Types owned by the Customers module.
 *
 * `Customer` mirrors the entity returned by the NestJS backend's Customers
 * resource; `CustomerInput` is the shape accepted by create/update. Keeping
 * these here preserves the module's ownership boundary (see
 * `src/modules/README.md`).
 */

/** A customer record as returned by `GET /customers`. */
export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  notes?: string;
  /** Whether the customer is active (soft-enable flag from the backend). */
  isActive: boolean;
  /** ISO-8601 creation timestamp. */
  createdAt: string;
}

/** Payload accepted by `POST /customers` and `PATCH /customers/:id`. */
export interface CustomerInput {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  notes?: string;
  isActive?: boolean;
}

/** Query parameters for the paginated `listCustomers` call. */
export interface CustomerListParams {
  /** 1-based page number. @default 1 */
  page?: number;
  /** Page size. @default 10 */
  limit?: number;
  /** Free-text search across name/email/company. */
  search?: string;
  /** Bearer token for the authenticated request. */
  token?: string;
}

/** Unwrapped result of the paginated list endpoint. */
export interface CustomerListResult {
  items: Customer[];
  /** Total number of records matching the query (across all pages). */
  total: number;
  /** The page that was returned. */
  page: number;
  /** The page size that was applied. */
  limit: number;
}

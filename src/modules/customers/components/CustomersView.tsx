"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Card, FadeIn, Icon } from "@/components/ui";
import { ApiError } from "@/lib/api";
import {
  faPlus,
  faPenToSquare,
  faTrash,
  faMagnifyingGlass,
  faChevronLeft,
  faChevronRight,
} from "@/lib/icons";
import {
  listCustomers,
  deleteCustomer,
} from "../services/customers.service";
import { getStoredToken } from "../services/token";
import type { Customer } from "../types";
import { CustomerForm } from "./CustomerForm";
import { CustomersSkeleton } from "./CustomersSkeleton";

/** Page size used for the customer list. */
const PAGE_LIMIT = 10;

type Mode =
  | { kind: "list" }
  | { kind: "create" }
  | { kind: "edit"; customer: Customer };

type LoadStatus = "loading" | "success" | "error";

/**
 * Customers feature surface (client component).
 *
 * Owns the list state, search, pagination, and the create/edit/delete flows,
 * delegating all I/O to the module's services so it stays easy to test. Renders
 * {@link CustomerForm} for create/edit and a confirm dialog before deleting.
 */
export function CustomersView() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  // The committed search term (what was actually queried).
  const [query, setQuery] = useState("");
  // The live value of the search input (before submit).
  const [searchInput, setSearchInput] = useState("");

  const [status, setStatus] = useState<LoadStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const [mode, setMode] = useState<Mode>({ kind: "list" });
  const [pendingDelete, setPendingDelete] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async (nextPage: number, nextQuery: string) => {
    setStatus("loading");
    setError(null);
    try {
      const result = await listCustomers({
        page: nextPage,
        search: nextQuery,
        limit: PAGE_LIMIT,
        token: getStoredToken(),
      });
      setCustomers(result.items);
      setTotal(result.total);
      setPage(result.page);
      setQuery(nextQuery);
      setStatus("success");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to load customers. Please try again.",
      );
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    // Defer to a microtask so the first `setState` happens asynchronously
    // (outside the synchronous effect body) — the loading state is already the
    // initial value, so there is no visual gap.
    void Promise.resolve().then(() => load(1, ""));
  }, [load]);

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFlash(null);
    void load(1, searchInput);
  }

  function goToPage(nextPage: number) {
    setFlash(null);
    void load(nextPage, query);
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteCustomer(pendingDelete.id, getStoredToken());
      const name = pendingDelete.name;
      setPendingDelete(null);
      // If we just removed the last row on a page, step back a page.
      const nextPage = customers.length === 1 && page > 1 ? page - 1 : page;
      await load(nextPage, query);
      setFlash(`Customer "${name}" was deleted.`);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to delete customer. Please try again.",
      );
    } finally {
      setDeleting(false);
    }
  }

  function handleFormSuccess(saved: Customer, formMode: "create" | "edit") {
    setMode({ kind: "list" });
    setFlash(
      formMode === "create"
        ? `Customer "${saved.name}" was created.`
        : `Customer "${saved.name}" was updated.`,
    );
    // Created records land on the first page (newest first); edits stay put.
    void load(formMode === "create" ? 1 : page, query);
  }

  if (mode.kind !== "list") {
    return (
      <CustomerForm
        customer={mode.kind === "edit" ? mode.customer : undefined}
        onSuccess={handleFormSuccess}
        onCancel={() => setMode({ kind: "list" })}
      />
    );
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));
  const showInitialSkeleton = status === "loading" && customers.length === 0;

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-headline-lg">Customers</h1>
            <p className="text-body-md text-on-surface-variant">
              Manage your customer directory.
            </p>
          </div>
          <Button onClick={() => setMode({ kind: "create" })}>
            <Icon icon={faPlus} className="h-4 w-4" />
            New customer
          </Button>
        </div>
      </FadeIn>

      <form onSubmit={handleSearchSubmit} className="flex max-w-sm gap-2" role="search">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute inset-y-0 left-3 grid place-items-center text-on-surface-variant">
            <Icon icon={faMagnifyingGlass} className="h-4 w-4" />
          </span>
          <input
            type="search"
            name="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label="Search customers"
            placeholder="Search customers…"
            className="w-full rounded-md border border-outline-variant bg-surface-container-lowest py-2 pl-9 pr-3 text-body-md text-on-surface placeholder:text-on-surface-variant focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
        </div>
        <Button type="submit" variant="ghost">
          Search
        </Button>
      </form>

      {flash && (
        <p role="status" className="text-body-md text-success">
          {flash}
        </p>
      )}
      {error && (
        <p role="alert" className="text-body-md text-error">
          {error}
        </p>
      )}

      {showInitialSkeleton ? (
        <CustomersSkeleton />
      ) : (
        <Card className="overflow-hidden p-0">
          {customers.length === 0 ? (
            <div className="grid place-items-center p-12 text-center text-body-md text-on-surface-variant">
              {query
                ? `No customers match "${query}".`
                : "No customers yet. Create your first one."}
            </div>
          ) : (
            <table className="w-full text-left text-body-md">
              <thead className="border-b border-outline-variant text-label-md text-on-surface-variant">
                <tr>
                  <th scope="col" className="p-4 font-medium">
                    Name
                  </th>
                  <th scope="col" className="hidden p-4 font-medium sm:table-cell">
                    Company
                  </th>
                  <th scope="col" className="hidden p-4 font-medium md:table-cell">
                    Phone
                  </th>
                  <th scope="col" className="p-4 text-right font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b border-outline-variant last:border-b-0"
                  >
                    <td className="p-4">
                      <div className="font-medium text-on-surface">
                        {customer.name}
                      </div>
                      {customer.email && (
                        <div className="text-body-sm text-on-surface-variant">
                          {customer.email}
                        </div>
                      )}
                    </td>
                    <td className="hidden p-4 text-on-surface-variant sm:table-cell">
                      {customer.company ?? "—"}
                    </td>
                    <td className="hidden p-4 text-on-surface-variant md:table-cell">
                      {customer.phone ?? "—"}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`Edit ${customer.name}`}
                          onClick={() => setMode({ kind: "edit", customer })}
                        >
                          <Icon icon={faPenToSquare} className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`Delete ${customer.name}`}
                          onClick={() => {
                            setFlash(null);
                            setPendingDelete(customer);
                          }}
                        >
                          <Icon icon={faTrash} className="h-4 w-4 text-error" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {!showInitialSkeleton && customers.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-body-sm text-on-surface-variant">
            Page {page} of {totalPages} · {total} customer{total === 1 ? "" : "s"}
          </p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              aria-label="Previous page"
              disabled={page <= 1 || status === "loading"}
              onClick={() => goToPage(page - 1)}
            >
              <Icon icon={faChevronLeft} className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Next page"
              disabled={page >= totalPages || status === "loading"}
              onClick={() => goToPage(page + 1)}
            >
              <Icon icon={faChevronRight} className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {pendingDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-customer-title"
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
        >
          <Card className="w-full max-w-md p-5">
            <h2 id="delete-customer-title" className="text-headline-sm">
              Delete customer
            </h2>
            <p className="mt-2 text-body-md text-on-surface-variant">
              Are you sure you want to delete{" "}
              <span className="font-medium text-on-surface">
                {pendingDelete.name}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setPendingDelete(null)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={confirmDelete}
                isLoading={deleting}
              >
                Delete
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

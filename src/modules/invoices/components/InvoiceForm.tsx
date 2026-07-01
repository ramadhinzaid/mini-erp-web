"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Icon } from "@/components/ui";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api";
import { faPlus, faTrash } from "@/lib/icons";
import { listCustomers, type Customer } from "@/modules/customers";
import {
  computeTotals,
  createInvoice,
  formatMoney,
} from "../services/invoices.service";
import { getStoredToken } from "../services/token";
import type { InvoiceInput, InvoiceItemInput } from "../types";

/** A line-item row in the editor. Numbers are kept as strings while editing. */
interface ItemRow {
  key: number;
  description: string;
  quantity: string;
  unitPrice: string;
}

let rowSeq = 0;
/** Creates a blank line-item row with a stable key. */
function blankRow(): ItemRow {
  rowSeq += 1;
  return { key: rowSeq, description: "", quantity: "1", unitPrice: "0" };
}

/** Trims a string field, collapsing empties to `undefined` for the API. */
function clean(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

/** True when a row is completely untouched (safe to ignore on submit). */
function isBlankRow(row: ItemRow): boolean {
  return (
    row.description.trim() === "" &&
    row.quantity.trim() === "" &&
    row.unitPrice.trim() === ""
  );
}

const inputClass =
  "w-full rounded-md border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-md text-on-surface placeholder:text-on-surface-variant focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

/**
 * Create-invoice form (client component).
 *
 * Picks a customer (fetched through the Customers module's public API), collects
 * issue/due dates, an optional tax rate and notes, and edits inline line items
 * with a live client-side subtotal/tax/total preview that mirrors the server's
 * arithmetic. Validates inline (`text-error`), shows a {@link Button} spinner
 * while submitting, surfaces backend {@link ApiError}s, and on success redirects
 * to the new invoice's detail page (`/invoices/[id]`).
 */
export function InvoiceForm() {
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersError, setCustomersError] = useState<string | null>(null);
  const [loadingCustomers, setLoadingCustomers] = useState(true);

  const [customerId, setCustomerId] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [taxRate, setTaxRate] = useState("");
  const [notes, setNotes] = useState("");
  const [rows, setRows] = useState<ItemRow[]>(() => [blankRow()]);

  const [errors, setErrors] = useState<{ customer?: string; items?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Populate the customer picker from the Customers module's service.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const result = await listCustomers({ limit: 100, token: getStoredToken() });
        if (active) {
          setCustomers(result.items);
          setCustomersError(null);
        }
      } catch (err) {
        if (active) {
          setCustomersError(
            err instanceof ApiError
              ? err.message
              : "Failed to load customers. Please try again.",
          );
        }
      } finally {
        if (active) setLoadingCustomers(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const totals = useMemo(
    () =>
      computeTotals(
        rows.map((r) => ({
          quantity: Number(r.quantity) || 0,
          unitPrice: Number(r.unitPrice) || 0,
        })),
        Number(taxRate) || 0,
      ),
    [rows, taxRate],
  );

  function updateRow(key: number, patch: Partial<ItemRow>) {
    setRows((prev) =>
      prev.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );
  }

  function addRow() {
    setRows((prev) => [...prev, blankRow()]);
  }

  function removeRow(key: number) {
    setRows((prev) =>
      prev.length === 1 ? prev : prev.filter((row) => row.key !== key),
    );
  }

  function validate(): { ok: boolean; items: InvoiceItemInput[] } {
    const next: { customer?: string; items?: string } = {};
    if (!customerId) next.customer = "Select a customer.";

    const filled = rows.filter((row) => !isBlankRow(row));
    const items: InvoiceItemInput[] = [];
    for (const row of filled) {
      const quantity = Number(row.quantity);
      const unitPrice = Number(row.unitPrice);
      if (
        row.description.trim() === "" ||
        !Number.isFinite(quantity) ||
        quantity <= 0 ||
        !Number.isFinite(unitPrice) ||
        unitPrice < 0
      ) {
        next.items =
          "Each item needs a description, a quantity above zero, and a non-negative price.";
        break;
      }
      items.push({
        description: row.description.trim(),
        quantity,
        unitPrice,
      });
    }

    setErrors(next);
    return { ok: Object.keys(next).length === 0, items };
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);

    const { ok, items } = validate();
    if (!ok) return;

    const parsedTax = Number(taxRate);
    const payload: InvoiceInput = {
      customerId,
      issueDate: clean(issueDate),
      dueDate: clean(dueDate),
      notes: clean(notes),
      taxRate:
        taxRate.trim() !== "" && Number.isFinite(parsedTax)
          ? parsedTax
          : undefined,
      items: items.length > 0 ? items : undefined,
    };

    setSubmitting(true);
    try {
      const created = await createInvoice(payload, getStoredToken());
      router.push(`/invoices/${created.id}`);
    } catch (err) {
      setSubmitError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again.",
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-headline-lg">New invoice</h1>
        <p className="text-body-md text-on-surface-variant">
          Create an invoice for a customer, with line items and tax.
        </p>
      </div>

      <Card className="p-5">
        <form noValidate onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-1">
              <label
                htmlFor="invoice-customer"
                className="text-label-md text-on-surface"
              >
                Customer <span className="text-error">*</span>
              </label>
              <select
                id="invoice-customer"
                name="customerId"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                disabled={loadingCustomers}
                aria-invalid={Boolean(errors.customer)}
                aria-describedby={
                  errors.customer ? "invoice-customer-error" : undefined
                }
                className={cn(inputClass, errors.customer && "border-error")}
              >
                <option value="">
                  {loadingCustomers ? "Loading customers…" : "Select a customer"}
                </option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
              {errors.customer && (
                <p id="invoice-customer-error" className="text-body-sm text-error">
                  {errors.customer}
                </p>
              )}
              {customersError && (
                <p className="text-body-sm text-error">{customersError}</p>
              )}
            </div>

            <div className="space-y-1">
              <label
                htmlFor="invoice-tax"
                className="text-label-md text-on-surface"
              >
                Tax rate (%)
              </label>
              <input
                id="invoice-tax"
                name="taxRate"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className={inputClass}
                placeholder="0"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="invoice-issue-date"
                className="text-label-md text-on-surface"
              >
                Issue date
              </label>
              <input
                id="invoice-issue-date"
                name="issueDate"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="invoice-due-date"
                className="text-label-md text-on-surface"
              >
                Due date
              </label>
              <input
                id="invoice-due-date"
                name="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Line items editor */}
          <fieldset className="space-y-3">
            <legend className="text-label-md text-on-surface">Line items</legend>

            <div className="space-y-3">
              {rows.map((row, index) => (
                <div
                  key={row.key}
                  className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_5rem_7rem_auto] sm:items-end"
                >
                  <div className="space-y-1">
                    <label
                      htmlFor={`item-desc-${row.key}`}
                      className="text-body-sm text-on-surface-variant sm:sr-only"
                    >
                      Description
                    </label>
                    <input
                      id={`item-desc-${row.key}`}
                      value={row.description}
                      onChange={(e) =>
                        updateRow(row.key, { description: e.target.value })
                      }
                      className={inputClass}
                      placeholder="Consulting services"
                    />
                  </div>
                  <div className="space-y-1">
                    <label
                      htmlFor={`item-qty-${row.key}`}
                      className="text-body-sm text-on-surface-variant sm:sr-only"
                    >
                      Qty
                    </label>
                    <input
                      id={`item-qty-${row.key}`}
                      type="number"
                      min="0"
                      step="1"
                      inputMode="numeric"
                      value={row.quantity}
                      onChange={(e) =>
                        updateRow(row.key, { quantity: e.target.value })
                      }
                      className={inputClass}
                      placeholder="1"
                    />
                  </div>
                  <div className="space-y-1">
                    <label
                      htmlFor={`item-price-${row.key}`}
                      className="text-body-sm text-on-surface-variant sm:sr-only"
                    >
                      Unit price
                    </label>
                    <input
                      id={`item-price-${row.key}`}
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      value={row.unitPrice}
                      onChange={(e) =>
                        updateRow(row.key, { unitPrice: e.target.value })
                      }
                      className={inputClass}
                      placeholder="0.00"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label={`Remove item ${index + 1}`}
                    onClick={() => removeRow(row.key)}
                    disabled={rows.length === 1}
                  >
                    <Icon icon={faTrash} className="h-4 w-4 text-error" />
                  </Button>
                </div>
              ))}
            </div>

            {errors.items && (
              <p role="alert" className="text-body-sm text-error">
                {errors.items}
              </p>
            )}

            <Button type="button" variant="ghost" size="sm" onClick={addRow}>
              <Icon icon={faPlus} className="h-4 w-4" />
              Add item
            </Button>
          </fieldset>

          <div className="space-y-1">
            <label
              htmlFor="invoice-notes"
              className="text-label-md text-on-surface"
            >
              Notes
            </label>
            <textarea
              id="invoice-notes"
              name="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className={cn(inputClass, "resize-y")}
              placeholder="Payment terms, thank-you note, etc."
            />
          </div>

          {/* Live totals preview (mirrors the server-side calculation) */}
          <dl
            aria-label="Invoice totals"
            className="ml-auto w-full max-w-xs space-y-1 border-t border-outline-variant pt-4 text-body-md"
          >
            <div className="flex justify-between">
              <dt className="text-on-surface-variant">Subtotal</dt>
              <dd className="text-on-surface">{formatMoney(totals.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-on-surface-variant">
                Tax ({Number(taxRate) || 0}%)
              </dt>
              <dd className="text-on-surface">{formatMoney(totals.taxAmount)}</dd>
            </div>
            <div className="flex justify-between text-label-md">
              <dt className="font-medium text-on-surface">Total</dt>
              <dd className="font-medium text-on-surface">
                {formatMoney(totals.total)}
              </dd>
            </div>
          </dl>

          {submitError && (
            <p role="alert" className="text-body-sm text-error">
              {submitError}
            </p>
          )}

          <div className="flex items-center gap-3">
            <Button type="submit" isLoading={submitting}>
              Create invoice
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/invoices")}
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

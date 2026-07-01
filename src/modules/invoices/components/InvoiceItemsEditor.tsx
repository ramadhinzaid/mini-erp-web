"use client";

import { useState } from "react";
import { Button, Card, Icon, Spinner } from "@/components/ui";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api";
import { faPenToSquare, faPlus, faTrash } from "@/lib/icons";
import {
  addItem,
  formatMoney,
  removeItem,
  updateItem,
} from "../services/invoices.service";
import { getStoredToken } from "../services/token";
import type {
  Invoice,
  InvoiceItem,
  InvoiceItemInput,
  InvoiceStatus,
} from "../types";

/**
 * Line items may only be edited while the invoice is a working `DRAFT` or has
 * been `SENT`. The backend enforces this too (returning `409` otherwise); the
 * UI mirrors it so the controls disappear once the invoice is locked.
 */
const EDITABLE_STATUSES: readonly InvoiceStatus[] = ["DRAFT", "SENT"];

/** Whether line items may be added/edited/removed for the given status. */
export function canEditItems(status: InvoiceStatus): boolean {
  return EDITABLE_STATUSES.includes(status);
}

/** Sentinel `busy` value for the standalone add-item form. */
const ADD_KEY = "__add__";

const inputClass =
  "w-full rounded-md border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-md text-on-surface placeholder:text-on-surface-variant focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

/** A line-item form's values. Numbers are kept as strings while editing. */
interface DraftItem {
  description: string;
  quantity: string;
  unitPrice: string;
}

const BLANK_DRAFT: DraftItem = { description: "", quantity: "1", unitPrice: "0" };

function draftFromItem(item: InvoiceItem): DraftItem {
  return {
    description: item.description,
    quantity: String(item.quantity),
    unitPrice: String(item.unitPrice),
  };
}

/** Validates/normalizes a draft into an API payload, or `null` when invalid. */
function toInput(draft: DraftItem): InvoiceItemInput | null {
  const description = draft.description.trim();
  const quantity = Number(draft.quantity);
  const unitPrice = Number(draft.unitPrice);
  if (
    description === "" ||
    !Number.isFinite(quantity) ||
    quantity <= 0 ||
    !Number.isFinite(unitPrice) ||
    unitPrice < 0
  ) {
    return null;
  }
  return { description, quantity, unitPrice };
}

const INVALID_MESSAGE =
  "Each item needs a description, a quantity above zero, and a non-negative price.";

/** Turns a thrown error into a friendly, `text-error`-ready message. */
function messageFor(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 409) {
      return "This invoice can no longer be edited because of its current status.";
    }
    return err.message;
  }
  return "Something went wrong. Please try again.";
}

export interface InvoiceItemsEditorProps {
  /** The invoice whose line items are being edited. */
  invoice: Invoice;
  /**
   * Called with the invoice returned by each successful mutation so the caller
   * can refresh the header totals (subtotal/tax/total) live.
   */
  onUpdated: (invoice: Invoice) => void;
}

/**
 * Editable line-item table for the invoice detail page (client component).
 *
 * Renders existing items (description, qty, unit price, line total) with inline
 * **Edit** and **Remove** controls plus an **Add item** form. Each mutation
 * calls the token-based service, which returns the invoice with server-recomputed
 * totals; that invoice is handed back via {@link InvoiceItemsEditorProps.onUpdated}
 * so the surrounding header updates without a refetch. Editing is hidden when the
 * status is not `DRAFT`/`SENT`, and a backend `409` surfaces as a friendly
 * `text-error` message. A {@link Spinner} indicates the pending action and
 * **Remove** asks for confirmation first.
 */
export function InvoiceItemsEditor({
  invoice,
  onUpdated,
}: InvoiceItemsEditorProps) {
  const editable = canEditItems(invoice.status);
  const { items } = invoice;

  const [error, setError] = useState<string | null>(null);
  /** Key of the item/form with an in-flight request, or `null` when idle. */
  const [busy, setBusy] = useState<string | null>(null);
  /** Id of the row currently in inline-edit mode, or `null`. */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<DraftItem>(BLANK_DRAFT);
  const [addDraft, setAddDraft] = useState<DraftItem>(BLANK_DRAFT);

  function startEdit(item: InvoiceItem) {
    setError(null);
    setEditingId(item.id);
    setEditDraft(draftFromItem(item));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDraft(BLANK_DRAFT);
  }

  async function saveEdit(itemId: string) {
    const input = toInput(editDraft);
    if (!input) {
      setError(INVALID_MESSAGE);
      return;
    }
    setError(null);
    setBusy(itemId);
    try {
      const updated = await updateItem(
        invoice.id,
        itemId,
        input,
        getStoredToken(),
      );
      onUpdated(updated);
      cancelEdit();
    } catch (err) {
      setError(messageFor(err));
    } finally {
      setBusy(null);
    }
  }

  async function handleRemove(item: InvoiceItem) {
    if (
      typeof window !== "undefined" &&
      !window.confirm(`Remove "${item.description}" from this invoice?`)
    ) {
      return;
    }
    setError(null);
    setBusy(item.id);
    try {
      const updated = await removeItem(invoice.id, item.id, getStoredToken());
      onUpdated(updated);
      if (editingId === item.id) cancelEdit();
    } catch (err) {
      setError(messageFor(err));
    } finally {
      setBusy(null);
    }
  }

  async function handleAdd() {
    const input = toInput(addDraft);
    if (!input) {
      setError(INVALID_MESSAGE);
      return;
    }
    setError(null);
    setBusy(ADD_KEY);
    try {
      const updated = await addItem(invoice.id, input, getStoredToken());
      onUpdated(updated);
      setAddDraft(BLANK_DRAFT);
    } catch (err) {
      setError(messageFor(err));
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between gap-4 border-b border-outline-variant p-4">
        <h2
          id="invoice-items-heading"
          className="text-label-md text-on-surface-variant"
        >
          Items
        </h2>
        {!editable && (
          <span className="text-body-sm text-on-surface-variant">
            Items can’t be edited while this invoice is {invoice.status}.
          </span>
        )}
      </div>

      {items.length === 0 && !editable ? (
        <p className="p-6 text-center text-body-md text-on-surface-variant">
          No line items on this invoice.
        </p>
      ) : (
        <table className="w-full text-left text-body-md">
          <thead className="border-b border-outline-variant text-label-md text-on-surface-variant">
            <tr>
              <th scope="col" className="p-4 font-medium">
                Description
              </th>
              <th scope="col" className="p-4 text-right font-medium">
                Qty
              </th>
              <th
                scope="col"
                className="hidden p-4 text-right font-medium sm:table-cell"
              >
                Unit price
              </th>
              <th scope="col" className="p-4 text-right font-medium">
                Line total
              </th>
              {editable && (
                <th scope="col" className="p-4 text-right font-medium">
                  <span className="sr-only">Actions</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {items.map((item) =>
              editable && editingId === item.id ? (
                <tr
                  key={item.id}
                  className="border-b border-outline-variant last:border-b-0"
                >
                  <td className="p-4">
                    <label
                      htmlFor={`edit-desc-${item.id}`}
                      className="sr-only"
                    >
                      Description
                    </label>
                    <input
                      id={`edit-desc-${item.id}`}
                      value={editDraft.description}
                      onChange={(e) =>
                        setEditDraft((d) => ({
                          ...d,
                          description: e.target.value,
                        }))
                      }
                      className={inputClass}
                    />
                  </td>
                  <td className="p-4">
                    <label htmlFor={`edit-qty-${item.id}`} className="sr-only">
                      Qty
                    </label>
                    <input
                      id={`edit-qty-${item.id}`}
                      type="number"
                      min="0"
                      step="1"
                      inputMode="numeric"
                      value={editDraft.quantity}
                      onChange={(e) =>
                        setEditDraft((d) => ({
                          ...d,
                          quantity: e.target.value,
                        }))
                      }
                      className={inputClass}
                    />
                  </td>
                  <td className="hidden p-4 sm:table-cell">
                    <label
                      htmlFor={`edit-price-${item.id}`}
                      className="sr-only"
                    >
                      Unit price
                    </label>
                    <input
                      id={`edit-price-${item.id}`}
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      value={editDraft.unitPrice}
                      onChange={(e) =>
                        setEditDraft((d) => ({
                          ...d,
                          unitPrice: e.target.value,
                        }))
                      }
                      className={inputClass}
                    />
                  </td>
                  <td className="p-4 text-right text-on-surface">
                    {formatMoney(item.lineTotal)}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => saveEdit(item.id)}
                        isLoading={busy === item.id}
                      >
                        Save
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={cancelEdit}
                        disabled={busy === item.id}
                      >
                        Cancel
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr
                  key={item.id}
                  className="border-b border-outline-variant last:border-b-0"
                >
                  <td className="p-4 text-on-surface">{item.description}</td>
                  <td className="p-4 text-right text-on-surface-variant">
                    {item.quantity}
                  </td>
                  <td className="hidden p-4 text-right text-on-surface-variant sm:table-cell">
                    {formatMoney(item.unitPrice)}
                  </td>
                  <td className="p-4 text-right text-on-surface">
                    {formatMoney(item.lineTotal)}
                  </td>
                  {editable && (
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1">
                        {busy === item.id ? (
                          <Spinner size="sm" label="Working" />
                        ) : (
                          <>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              aria-label={`Edit ${item.description}`}
                              onClick={() => startEdit(item)}
                              disabled={busy !== null}
                            >
                              <Icon icon={faPenToSquare} className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              aria-label={`Remove ${item.description}`}
                              onClick={() => handleRemove(item)}
                              disabled={busy !== null}
                            >
                              <Icon icon={faTrash} className="h-4 w-4 text-error" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ),
            )}
          </tbody>
        </table>
      )}

      {editable && (
        <div className="border-t border-outline-variant p-4">
          <h3 className="mb-3 text-label-md text-on-surface">Add item</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_5rem_7rem_auto] sm:items-end">
            <div className="space-y-1">
              <label
                htmlFor="add-item-desc"
                className="text-body-sm text-on-surface-variant sm:sr-only"
              >
                Description
              </label>
              <input
                id="add-item-desc"
                value={addDraft.description}
                onChange={(e) =>
                  setAddDraft((d) => ({ ...d, description: e.target.value }))
                }
                className={inputClass}
                placeholder="Consulting services"
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="add-item-qty"
                className="text-body-sm text-on-surface-variant sm:sr-only"
              >
                Qty
              </label>
              <input
                id="add-item-qty"
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={addDraft.quantity}
                onChange={(e) =>
                  setAddDraft((d) => ({ ...d, quantity: e.target.value }))
                }
                className={inputClass}
                placeholder="1"
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="add-item-price"
                className="text-body-sm text-on-surface-variant sm:sr-only"
              >
                Unit price
              </label>
              <input
                id="add-item-price"
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                value={addDraft.unitPrice}
                onChange={(e) =>
                  setAddDraft((d) => ({ ...d, unitPrice: e.target.value }))
                }
                className={inputClass}
                placeholder="0.00"
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleAdd}
              isLoading={busy === ADD_KEY}
            >
              {busy !== ADD_KEY && <Icon icon={faPlus} className="h-4 w-4" />}
              Add item
            </Button>
          </div>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className={cn(
            "border-t border-outline-variant p-4 text-body-sm text-error",
          )}
        >
          {error}
        </p>
      )}

      <dl className="space-y-1 border-t border-outline-variant p-4 text-body-md">
        <div className="flex justify-between">
          <dt className="text-on-surface-variant">Subtotal</dt>
          <dd className="text-on-surface">{formatMoney(invoice.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-on-surface-variant">Tax ({invoice.taxRate}%)</dt>
          <dd className="text-on-surface">{formatMoney(invoice.taxAmount)}</dd>
        </div>
        <div className="flex justify-between text-label-md">
          <dt className="font-medium text-on-surface">Total</dt>
          <dd className="font-medium text-on-surface">
            {formatMoney(invoice.total)}
          </dd>
        </div>
      </dl>
    </Card>
  );
}

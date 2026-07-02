"use client";

import { useState } from "react";
import { Button, Card } from "@/components/ui";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api";
import {
  createCustomer,
  updateCustomer,
} from "../services/customers.service";
import { getStoredToken } from "../services/token";
import type { Customer, CustomerInput } from "../types";

export interface CustomerFormProps {
  /** When provided the form edits this customer; otherwise it creates one. */
  customer?: Customer;
  /** Called with the persisted record after a successful create/update. */
  onSuccess: (customer: Customer, mode: "create" | "edit") => void;
  /** Called when the user dismisses the form without saving. */
  onCancel: () => void;
}

type FieldErrors = Partial<Record<"name" | "email", string>>;

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Trims a string field, collapsing empties to `undefined` for the API. */
function clean(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

/**
 * Create / edit form for a customer (client component).
 *
 * Validates required/format rules inline (`text-error` messages), shows a
 * {@link Button} spinner while submitting, and surfaces backend
 * {@link ApiError}s without losing the user's input.
 */
export function CustomerForm({ customer, onSuccess, onCancel }: CustomerFormProps) {
  const isEdit = Boolean(customer);

  const [name, setName] = useState(customer?.name ?? "");
  const [email, setEmail] = useState(customer?.email ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [company, setCompany] = useState(customer?.company ?? "");
  const [address, setAddress] = useState(customer?.address ?? "");
  const [notes, setNotes] = useState(customer?.notes ?? "");
  const [isActive, setIsActive] = useState(customer?.isActive ?? true);

  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const next: FieldErrors = {};
    if (name.trim() === "") next.name = "Name is required.";
    if (email.trim() !== "" && !EMAIL_RE.test(email.trim()))
      next.email = "Enter a valid email address.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    const payload: CustomerInput = {
      name: name.trim(),
      email: clean(email),
      phone: clean(phone),
      company: clean(company),
      address: clean(address),
      notes: clean(notes),
      // `isActive` is only accepted on update — the create endpoint rejects
      // unknown properties and defaults new customers to active server-side.
      ...(isEdit ? { isActive } : {}),
    };

    setSubmitting(true);
    try {
      const token = getStoredToken();
      const saved =
        isEdit && customer
          ? await updateCustomer(customer.id, payload, token)
          : await createCustomer(payload, token);
      onSuccess(saved, isEdit ? "edit" : "create");
    } catch (err) {
      setSubmitError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-md border border-outline-variant bg-surface-container-lowest px-3 py-2 text-body-md text-on-surface placeholder:text-on-surface-variant focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-headline-lg">
          {isEdit ? "Edit customer" : "New customer"}
        </h1>
        <p className="text-body-md text-on-surface-variant">
          {isEdit
            ? "Update the customer's details."
            : "Add a new customer to your directory."}
        </p>
      </div>

      <Card className="p-5">
        <form noValidate onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="customer-name" className="text-label-md text-on-surface">
                Name <span className="text-error">*</span>
              </label>
              <input
                id="customer-name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "customer-name-error" : undefined}
                className={cn(inputClass, errors.name && "border-error")}
                placeholder="Acme Corp"
              />
              {errors.name && (
                <p id="customer-name-error" className="text-body-sm text-error">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="customer-email" className="text-label-md text-on-surface">
                Email
              </label>
              <input
                id="customer-email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "customer-email-error" : undefined}
                className={cn(inputClass, errors.email && "border-error")}
                placeholder="hello@acme.com"
              />
              {errors.email && (
                <p id="customer-email-error" className="text-body-sm text-error">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="customer-phone" className="text-label-md text-on-surface">
                Phone
              </label>
              <input
                id="customer-phone"
                name="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
                placeholder="+1 555 0100"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="customer-company" className="text-label-md text-on-surface">
                Company
              </label>
              <input
                id="customer-company"
                name="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className={inputClass}
                placeholder="Acme Corp"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="customer-address" className="text-label-md text-on-surface">
              Address
            </label>
            <input
              id="customer-address"
              name="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={inputClass}
              placeholder="123 Market St, Springfield"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="customer-notes" className="text-label-md text-on-surface">
              Notes
            </label>
            <textarea
              id="customer-notes"
              name="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className={cn(inputClass, "resize-y")}
              placeholder="Anything worth remembering about this customer."
            />
          </div>

          {isEdit && (
            <label className="flex items-center gap-2 text-body-md text-on-surface">
              <input
                type="checkbox"
                name="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              Active
            </label>
          )}

          {submitError && (
            <p role="alert" className="text-body-sm text-error">
              {submitError}
            </p>
          )}

          <div className="flex items-center gap-3">
            <Button type="submit" isLoading={submitting}>
              {isEdit ? "Save changes" : "Create customer"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
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

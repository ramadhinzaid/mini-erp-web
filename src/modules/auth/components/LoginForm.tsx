"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Icon } from "@/components/ui";
import { ApiError } from "@/lib/api";
import { faEnvelope, faLock } from "@/lib/icons";
import { useAuth } from "./AuthProvider";

/** Basic shape check — the backend does the authoritative validation. */
function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Email + password sign-in form (client component).
 *
 * Validates inline before calling `useAuth().login`. While the request is in
 * flight the submit button shows a {@link Spinner}; a 401 surfaces a friendly
 * `text-error` message. On success it redirects to the dashboard (`/`).
 */
export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): boolean {
    const next: { email?: string; password?: string } = {};
    if (!email.trim()) next.email = "Email is required.";
    else if (!isValidEmail(email)) next.email = "Enter a valid email address.";
    if (!password) next.password = "Password is required.";
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await login({ email, password });
      router.push("/");
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setFormError("Incorrect email or password.");
      } else {
        setFormError("Something went wrong. Please try again.");
      }
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <Card.Body className="flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-headline-sm text-on-surface">Sign in</h1>
          <p className="text-body-sm text-on-surface-variant">
            Welcome back. Enter your credentials to continue.
          </p>
        </header>

        <form noValidate className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-label-md text-on-surface">
              Email
            </label>
            <div className="relative">
              <Icon
                icon={faEnvelope}
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant"
              />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={fieldErrors.email ? true : undefined}
                aria-describedby={fieldErrors.email ? "email-error" : undefined}
                className="h-10 w-full rounded-md border border-outline-variant bg-surface-container-low pl-9 pr-3 text-body-md text-on-surface outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="you@example.com"
              />
            </div>
            {fieldErrors.email && (
              <p id="email-error" className="text-body-sm text-error">
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-label-md text-on-surface">
              Password
            </label>
            <div className="relative">
              <Icon
                icon={faLock}
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant"
              />
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={fieldErrors.password ? true : undefined}
                aria-describedby={
                  fieldErrors.password ? "password-error" : undefined
                }
                className="h-10 w-full rounded-md border border-outline-variant bg-surface-container-low pl-9 pr-3 text-body-md text-on-surface outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="••••••••"
              />
            </div>
            {fieldErrors.password && (
              <p id="password-error" className="text-body-sm text-error">
                {fieldErrors.password}
              </p>
            )}
          </div>

          {formError && (
            <p role="alert" className="text-body-sm text-error">
              {formError}
            </p>
          )}

          <Button type="submit" fullWidth isLoading={isSubmitting}>
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </Card.Body>
    </Card>
  );
}

/**
 * Centralized, typed access to public runtime configuration.
 *
 * Only `NEXT_PUBLIC_*` variables are readable in the browser. Read env vars
 * here (never `process.env.X` scattered across the app) so defaults and naming
 * live in one place.
 */
export const env = {
  /**
   * Base URL of the Mini ERP backend (NestJS).
   * The backend listens on port 3000 with a global `/api` prefix.
   * Override per-environment via `NEXT_PUBLIC_API_URL`.
   */
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api",
} as const;

export type Env = typeof env;

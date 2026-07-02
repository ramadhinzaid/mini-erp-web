/**
 * Minimal bridge to the stored auth token.
 *
 * The dashboard fetches an authenticated summary, so it needs the Bearer token
 * the auth module (`@/modules/auth`) persists on login. It reads that value
 * through this tiny helper and passes it to the token-based service function.
 * Once `useAuth()` exposes the raw token, callers swap `getStoredToken()` for
 * it with no change to the service signature — mirrors the invoices/customers
 * modules' bridge.
 */

/**
 * `localStorage` key the auth module persists the access token under
 * (`ACCESS_TOKEN_KEY` in `modules/auth`). Duplicated here as a constant rather
 * than deep-imported, to respect the module boundary.
 */
export const ACCESS_TOKEN_KEY = "mini-erp.accessToken";

/**
 * Reads the persisted Bearer token, or `undefined` when none is stored or when
 * running on the server (no `window`). Never throws — storage access is guarded
 * so SSR and privacy-mode browsers degrade gracefully.
 */
export function getStoredToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return window.localStorage.getItem(ACCESS_TOKEN_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

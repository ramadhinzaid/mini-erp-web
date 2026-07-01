/**
 * Minimal bridge to the stored auth token.
 *
 * Invoice components read the persisted JWT through this tiny helper and pass it
 * to the token-based service functions. The value is the access token the auth
 * module (`@/modules/auth`) stores on login, so once `useAuth()` exposes the raw
 * token, callers swap `getStoredToken()` for it with no change to the service
 * signatures.
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

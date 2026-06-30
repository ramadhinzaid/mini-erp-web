/**
 * Minimal bridge to the stored auth token.
 *
 * The dedicated auth module (`useAuth()`, see the `web-login` plan) is not
 * merged yet. Until it is, components read the persisted JWT through this tiny
 * helper and pass it to the token-based service functions. When auth lands,
 * callers swap `getStoredToken()` for `useAuth().token` with no change to the
 * service signatures.
 */

/** localStorage key the auth module persists the JWT under. */
export const TOKEN_STORAGE_KEY = "mini-erp.token";

/**
 * Reads the persisted Bearer token, or `undefined` when none is stored or when
 * running on the server (no `window`). Never throws — storage access is guarded
 * so SSR and privacy-mode browsers degrade gracefully.
 */
export function getStoredToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

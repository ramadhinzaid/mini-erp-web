import { api, setAuthRefreshHandler } from "@/lib/api";
import type { AuthTokens, AuthUser, Credentials } from "../types";

/**
 * Data-access layer for the Auth module.
 *
 * Talks to the NestJS backend through the typed client in `@/lib/api`. The
 * backend wraps every response in `{ success, data }` via a global
 * interceptor, so each call unwraps `data` here — components and the auth
 * context only deal with the domain shapes (`AuthTokens`, `AuthUser`).
 *
 * Token persistence lives here too (the single seam that touches
 * `localStorage`), guarded for SSR so it is safe to import anywhere.
 */

/** Envelope every backend response is wrapped in by the global interceptor. */
interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

/** `localStorage` keys for the persisted JWT pair. */
export const ACCESS_TOKEN_KEY = "mini-erp.accessToken";
export const REFRESH_TOKEN_KEY = "mini-erp.refreshToken";

/**
 * Exchange credentials for a token pair via `POST /auth/login`.
 * Unwraps the `{ success, data }` envelope and returns the tokens.
 */
export async function login(credentials: Credentials): Promise<AuthTokens> {
  const response = await api.post<ApiEnvelope<AuthTokens>>(
    "/auth/login",
    credentials,
  );
  return response.data;
}

/**
 * Fetch the current user via `GET /auth/me`, authenticated with `token`
 * (sent as `Authorization: Bearer <token>`). Unwraps the envelope.
 */
export async function getCurrentUser(token: string): Promise<AuthUser> {
  const response = await api.get<ApiEnvelope<AuthUser>>("/auth/me", { token });
  return response.data;
}

/** Persist the token pair. No-op during SSR (no `window`). */
export function storeTokens(tokens: AuthTokens): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

/** Read the stored access token, or `null` (during SSR or when unset). */
export function readAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

/** Read the stored refresh token, or `null` (during SSR or when unset). */
export function readRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

/** Remove both tokens. No-op during SSR. */
export function clearTokens(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * Exchange the stored refresh token for a fresh pair via `POST /auth/refresh`
 * and persist it. `skipAuthRefresh` keeps a 401 here from recursing into the
 * silent-refresh retry. Throws when no refresh token is stored.
 */
export async function refresh(): Promise<AuthTokens> {
  const refreshToken = readRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token stored");
  }
  const response = await api.post<ApiEnvelope<AuthTokens>>(
    "/auth/refresh",
    { refreshToken },
    { skipAuthRefresh: true },
  );
  storeTokens(response.data);
  return response.data;
}

/** In-flight refresh, so concurrent 401s trigger a single token exchange. */
let refreshInFlight: Promise<string | null> | null = null;

/**
 * Silent-refresh handler wired into the API client (see {@link installAuthRefresh}).
 * Deduped so a burst of 401s refreshes once; resolves to the new access token,
 * or `null` after clearing the stored pair when refresh is impossible.
 */
export function handleAuthRefresh(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = refresh()
      .then((tokens) => tokens.accessToken)
      .catch(() => {
        clearTokens();
        return null;
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

/**
 * Register {@link handleAuthRefresh} with the API client so any authenticated
 * request that 401s transparently refreshes and retries once. Call once at app
 * startup (the AuthProvider does this on import).
 */
export function installAuthRefresh(): void {
  setAuthRefreshHandler(handleAuthRefresh);
}

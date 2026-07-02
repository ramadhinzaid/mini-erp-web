import { env } from "@/config/env";

/** Error thrown for any non-2xx response from the backend. */
export class ApiError extends Error {
  constructor(
    message: string,
    /** HTTP status code returned by the backend. */
    public readonly status: number,
    /** Parsed error payload, when the backend returned one. */
    public readonly data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  /** JSON-serializable request body. */
  body?: unknown;
  /** Bearer token for authenticated requests (NestJS JWT auth). */
  token?: string;
  /**
   * Skip the silent-refresh-on-401 retry for this request. Set on the refresh
   * call itself (and the login/register calls) so a 401 there can't recurse.
   */
  skipAuthRefresh?: boolean;
}

/**
 * Exchanges an expired session for a fresh access token. Returns the new access
 * token to retry with, or `null` when refresh is impossible (no/expired refresh
 * token). Registered by the auth module via {@link setAuthRefreshHandler} — the
 * client stays decoupled from it to avoid an import cycle.
 */
export type AuthRefreshHandler = () => Promise<string | null>;

let authRefreshHandler: AuthRefreshHandler | null = null;

/**
 * Register (or clear, with `null`) the handler {@link apiFetch} calls once when
 * an authenticated request comes back `401`, to silently refresh the token and
 * retry. The auth module installs this at startup.
 */
export function setAuthRefreshHandler(handler: AuthRefreshHandler | null): void {
  authRefreshHandler = handler;
}

/**
 * Typed `fetch` wrapper for the Mini ERP backend.
 *
 * - Prefixes requests with {@link env.apiUrl}.
 * - Serializes JSON bodies and sets JSON headers.
 * - Attaches a Bearer token when provided.
 * - Throws {@link ApiError} on non-2xx responses; returns parsed JSON otherwise.
 *
 * The backend (NestJS) is a separate service — see the README "Backend / API"
 * section. This is the single seam through which features talk to it.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, token, headers, skipAuthRefresh, ...rest } = options;
  const url = `${env.apiUrl}${path.startsWith("/") ? path : `/${path}`}`;

  const send = (bearer?: string) =>
    fetch(url, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

  let response = await send(token);

  // The access token likely expired: run a one-shot silent refresh and, if it
  // yields a new token, retry the request once. Only for authenticated requests
  // that opted in (a `token` was sent) and not the refresh call itself.
  if (
    response.status === 401 &&
    token !== undefined &&
    !skipAuthRefresh &&
    authRefreshHandler
  ) {
    const newToken = await authRefreshHandler();
    if (newToken) {
      response = await send(newToken);
    }
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    const message =
      (data && typeof data === "object" && "message" in data
        ? String((data as { message: unknown }).message)
        : null) ?? response.statusText;
    throw new ApiError(message, response.status, data);
  }

  // 204 No Content has no body to parse.
  if (response.status === 204) return undefined as T;

  return (await response.json()) as T;
}

/** Convenience verb helpers over {@link apiFetch}. */
export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: "PATCH", body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: "PUT", body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    apiFetch<T>(path, { ...options, method: "DELETE" }),
};

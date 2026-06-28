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
  const { body, token, headers, ...rest } = options;
  const url = `${env.apiUrl}${path.startsWith("/") ? path : `/${path}`}`;

  const response = await fetch(url, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

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

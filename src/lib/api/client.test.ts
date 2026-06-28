import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { api, apiFetch, ApiError } from "./client";

const API_BASE = "http://localhost:3000/api";

function mockResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init,
  });
}

describe("apiFetch", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("prefixes the configured base URL and returns parsed JSON", async () => {
    vi.mocked(fetch).mockResolvedValue(mockResponse({ ok: true }));

    const data = await apiFetch<{ ok: boolean }>("/health");

    expect(fetch).toHaveBeenCalledWith(`${API_BASE}/health`, expect.anything());
    expect(data).toEqual({ ok: true });
  });

  it("normalizes paths that omit the leading slash", async () => {
    vi.mocked(fetch).mockResolvedValue(mockResponse({}));
    await apiFetch("health");
    expect(fetch).toHaveBeenCalledWith(`${API_BASE}/health`, expect.anything());
  });

  it("serializes the body and attaches a bearer token", async () => {
    vi.mocked(fetch).mockResolvedValue(mockResponse({ id: "1" }));

    await api.post("/users", { name: "Ada" }, { token: "jwt-123" });

    const [, init] = vi.mocked(fetch).mock.calls[0];
    expect(init?.method).toBe("POST");
    expect(init?.body).toBe(JSON.stringify({ name: "Ada" }));
    expect(init?.headers).toMatchObject({
      "Content-Type": "application/json",
      Authorization: "Bearer jwt-123",
    });
  });

  it("throws an ApiError carrying status and payload on non-2xx", async () => {
    vi.mocked(fetch).mockResolvedValue(
      mockResponse({ message: "Unauthorized" }, { status: 401 }),
    );

    await expect(apiFetch("/secret")).rejects.toMatchObject({
      name: "ApiError",
      status: 401,
      message: "Unauthorized",
    });
    await expect(apiFetch("/secret")).rejects.toBeInstanceOf(ApiError);
  });

  it("returns undefined for 204 No Content", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(null, { status: 204 }),
    );
    await expect(api.delete("/users/1")).resolves.toBeUndefined();
  });
});

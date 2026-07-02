import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { api } from "@/lib/api";
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  clearTokens,
  getCurrentUser,
  handleAuthRefresh,
  login,
  readAccessToken,
  readRefreshToken,
  refresh,
  storeTokens,
} from "../services/auth.service";

// Mock the API client so the service is tested in isolation from the network.
vi.mock("@/lib/api", async (importActual) => {
  const actual = await importActual<typeof import("@/lib/api")>();
  return {
    ...actual,
    api: { get: vi.fn(), post: vi.fn() },
  };
});

const post = vi.mocked(api.post);
const get = vi.mocked(api.get);

describe("auth.service", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("login", () => {
    it("posts credentials and unwraps the { success, data } envelope", async () => {
      const tokens = { accessToken: "acc-1", refreshToken: "ref-1" };
      post.mockResolvedValue({ success: true, data: tokens });

      const result = await login({ email: "a@b.com", password: "secret" });

      expect(post).toHaveBeenCalledWith("/auth/login", {
        email: "a@b.com",
        password: "secret",
      });
      expect(result).toEqual(tokens);
    });

    it("propagates errors from the API client", async () => {
      post.mockRejectedValue(new Error("boom"));
      await expect(
        login({ email: "a@b.com", password: "x" }),
      ).rejects.toThrow("boom");
    });
  });

  describe("getCurrentUser", () => {
    it("gets /auth/me with the bearer token and unwraps data", async () => {
      const user = {
        id: "1",
        email: "a@b.com",
        role: "admin",
        firstName: "Ada",
        lastName: "Lovelace",
      };
      get.mockResolvedValue({ success: true, data: user });

      const result = await getCurrentUser("acc-1");

      expect(get).toHaveBeenCalledWith("/auth/me", { token: "acc-1" });
      expect(result).toEqual(user);
    });
  });

  describe("refresh", () => {
    it("posts the stored refresh token (skipping re-refresh) and persists the new pair", async () => {
      storeTokens({ accessToken: "acc-1", refreshToken: "ref-1" });
      const next = { accessToken: "acc-2", refreshToken: "ref-2" };
      post.mockResolvedValue({ success: true, data: next });

      const result = await refresh();

      expect(post).toHaveBeenCalledWith(
        "/auth/refresh",
        { refreshToken: "ref-1" },
        { skipAuthRefresh: true },
      );
      expect(result).toEqual(next);
      expect(readAccessToken()).toBe("acc-2");
      expect(readRefreshToken()).toBe("ref-2");
    });

    it("throws when no refresh token is stored", async () => {
      await expect(refresh()).rejects.toThrow(/no refresh token/i);
      expect(post).not.toHaveBeenCalled();
    });
  });

  describe("handleAuthRefresh", () => {
    it("returns the new access token and dedupes concurrent calls", async () => {
      storeTokens({ accessToken: "acc-1", refreshToken: "ref-1" });
      post.mockResolvedValue({
        success: true,
        data: { accessToken: "acc-2", refreshToken: "ref-2" },
      });

      const [a, b] = await Promise.all([
        handleAuthRefresh(),
        handleAuthRefresh(),
      ]);

      expect(a).toBe("acc-2");
      expect(b).toBe("acc-2");
      // A burst of 401s triggers a single token exchange.
      expect(post).toHaveBeenCalledTimes(1);
    });

    it("clears tokens and resolves null when refresh fails", async () => {
      storeTokens({ accessToken: "acc-1", refreshToken: "ref-1" });
      post.mockRejectedValue(new Error("invalid refresh token"));

      await expect(handleAuthRefresh()).resolves.toBeNull();
      expect(readAccessToken()).toBeNull();
      expect(readRefreshToken()).toBeNull();
    });
  });

  describe("token persistence", () => {
    it("stores and reads both tokens", () => {
      storeTokens({ accessToken: "acc-1", refreshToken: "ref-1" });

      expect(window.localStorage.getItem(ACCESS_TOKEN_KEY)).toBe("acc-1");
      expect(window.localStorage.getItem(REFRESH_TOKEN_KEY)).toBe("ref-1");
      expect(readAccessToken()).toBe("acc-1");
      expect(readRefreshToken()).toBe("ref-1");
    });

    it("returns null when no token is stored", () => {
      expect(readAccessToken()).toBeNull();
      expect(readRefreshToken()).toBeNull();
    });

    it("clears both tokens", () => {
      storeTokens({ accessToken: "acc-1", refreshToken: "ref-1" });
      clearTokens();

      expect(readAccessToken()).toBeNull();
      expect(readRefreshToken()).toBeNull();
      expect(window.localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
    });
  });
});

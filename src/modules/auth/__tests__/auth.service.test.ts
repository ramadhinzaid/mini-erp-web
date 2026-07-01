import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { api } from "@/lib/api";
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  clearTokens,
  getCurrentUser,
  login,
  readAccessToken,
  readRefreshToken,
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

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import type { AuthUser, Credentials } from "../types";
import {
  clearTokens,
  getCurrentUser,
  login as loginRequest,
  readAccessToken,
  storeTokens,
} from "../services/auth.service";

export interface AuthContextValue {
  /** The signed-in user, or `null` when logged out. */
  user: AuthUser | null;
  /** Authenticate, persist tokens and hydrate the user. */
  login: (credentials: Credentials) => Promise<void>;
  /** Clear tokens, drop the user and redirect to `/login`. */
  logout: () => void;
  /** True while the initial token → user hydration is in flight. */
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Client-side auth context.
 *
 * On mount it hydrates the user from a token stored in `localStorage` (via
 * `getCurrentUser`); a missing or rejected token simply resolves to a
 * logged-out state. Tokens live in the browser, so consumers gate UI on
 * `user`/`isLoading` rather than relying on the server.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore the session from a persisted token, once, on mount. All state
  // updates happen inside the async closure (never synchronously in the effect
  // body) so a missing token doesn't trigger a cascading synchronous render.
  useEffect(() => {
    let active = true;

    (async () => {
      const token = readAccessToken();
      try {
        if (token) {
          const me = await getCurrentUser(token);
          if (active) setUser(me);
        }
      } catch {
        // Token expired/invalid — drop it and stay logged out.
        clearTokens();
        if (active) setUser(null);
      } finally {
        if (active) setIsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (credentials: Credentials) => {
    const tokens = await loginRequest(credentials);
    storeTokens(tokens);
    const me = await getCurrentUser(tokens.accessToken);
    setUser(me);
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    router.push("/login");
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, login, logout, isLoading }),
    [user, login, logout, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Access the auth context. Must be used within an {@link AuthProvider}. */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

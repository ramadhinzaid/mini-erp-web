/**
 * Public API of the Auth module.
 *
 * The host (App Router today, a micro-frontend shell tomorrow) consumes auth
 * exclusively through these exports. Internal files (`components/`,
 * `services/`, `types/`) are implementation details — never deep-import them.
 */
export { LoginForm } from "./components/LoginForm";
export { AuthProvider, useAuth } from "./components/AuthProvider";
export type { AuthContextValue } from "./components/AuthProvider";
export type { AuthTokens, AuthUser, Credentials } from "./types";

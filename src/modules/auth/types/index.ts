/**
 * Types owned by the Auth module.
 *
 * These mirror the contract of the NestJS backend's `/auth/*` endpoints. The
 * backend wraps every response in `{ success, data }` (a global interceptor);
 * the envelope is unwrapped in the service layer so callers only ever see the
 * shapes below.
 */

/** Login form payload sent to `POST /auth/login`. */
export interface Credentials {
  email: string;
  password: string;
}

/** Token pair returned by `POST /auth/login`. */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/** The signed-in user, as returned by `GET /auth/me`. */
export interface AuthUser {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

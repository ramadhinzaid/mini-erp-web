/**
 * Cross-cutting types shared by multiple modules. Module-specific types live
 * inside that module's `types/` folder to preserve clear ownership boundaries.
 */

/** Standard envelope for async UI state machines. */
export type AsyncStatus = "idle" | "loading" | "success" | "error";

/** Visual sizing scale reused across UI primitives. */
export type Size = "sm" | "md" | "lg";

/** Generic record with a stable identity. */
export interface Entity {
  id: string;
}

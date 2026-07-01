import type { Metadata } from "next";
import { LoginForm } from "@/modules/auth";

export const metadata: Metadata = {
  title: "Sign in",
};

/**
 * Login route (thin). Public — the shell/guard in `AppShell` lets `/login`
 * through unauthenticated. Centers the module's `LoginForm`.
 */
export default function LoginPage() {
  return (
    <div className="grid min-h-dvh place-items-center bg-background p-4">
      <LoginForm />
    </div>
  );
}

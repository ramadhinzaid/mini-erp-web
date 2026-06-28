import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

/**
 * Vitest configuration.
 *
 * - `jsdom` gives component tests a browser-like DOM.
 * - `vite-tsconfig-paths` keeps the `@/*` alias working inside tests.
 * - `globals: true` exposes `describe`/`it`/`expect` without imports.
 * - `setupFiles` registers jest-dom matchers and cleanup.
 */
export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    css: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.{test,spec}.{ts,tsx}",
        "src/**/index.ts",
        "src/**/*.d.ts",
        "src/test/**",
        "src/app/**/layout.tsx",
      ],
    },
  },
});

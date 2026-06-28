import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Pin the workspace root so Next doesn't infer it from an unrelated parent
  // lockfile (avoids the "inferred workspace root" build warning).
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;

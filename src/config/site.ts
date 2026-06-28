/**
 * Global, environment-agnostic application metadata.
 * Keep values that describe the product (not secrets) here.
 */
export const siteConfig = {
  name: "Mini ERP",
  description:
    "A modular, production-oriented ERP starter built with Next.js App Router.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
} as const;

export type SiteConfig = typeof siteConfig;

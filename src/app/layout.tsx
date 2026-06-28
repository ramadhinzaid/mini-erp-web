import type { Metadata } from "next";
import { Inter } from "next/font/google";

// Import Font Awesome's stylesheet once, app-wide. `config.autoAddCss = false`
// (set in @/lib/icons) prevents the duplicate, layout-shifting auto-injection.
import "@fortawesome/fontawesome-svg-core/styles.css";
import "@/lib/icons";
import "./globals.css";

import { AppShell } from "@/components/layout";
import { siteConfig } from "@/config/site";

// ErgoSoft design system specifies Inter for its legibility in data-heavy UIs.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-dvh bg-background text-on-background">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

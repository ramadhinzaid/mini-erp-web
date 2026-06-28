import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

// Import Font Awesome's stylesheet once, app-wide. `config.autoAddCss = false`
// (set in @/lib/icons) prevents the duplicate, layout-shifting auto-injection.
import "@fortawesome/fontawesome-svg-core/styles.css";
import "@/lib/icons";
import "./globals.css";

import { AppShell } from "@/components/layout";
import { siteConfig } from "@/config/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-dvh">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

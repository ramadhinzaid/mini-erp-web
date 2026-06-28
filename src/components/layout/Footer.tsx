import { siteConfig } from "@/config/site";

/** Application footer shown beneath the routed page content. */
export function Footer() {
  return (
    <footer className="border-t border-outline-variant px-4 py-4 text-center text-body-sm text-on-surface-variant">
      <p>
        {siteConfig.name} &middot; Built with Next.js App Router &middot;{" "}
        <span className="text-outline">Starter architecture</span>
      </p>
    </footer>
  );
}

import { siteConfig } from "@/config/site";

/** Application footer shown beneath the routed page content. */
export function Footer() {
  return (
    <footer className="border-t border-zinc-200 px-4 py-4 text-center text-sm text-zinc-500 dark:border-zinc-800">
      <p>
        {siteConfig.name} &middot; Built with Next.js App Router &middot;{" "}
        <span className="text-zinc-400">Starter architecture</span>
      </p>
    </footer>
  );
}

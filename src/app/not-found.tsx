import Link from "next/link";
import { Button } from "@/components/ui";

/** Global 404 page rendered for unmatched routes. */
export default function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center text-center">
      <div className="max-w-sm space-y-4">
        <p className="text-5xl font-bold text-brand-600">404</p>
        <h2 className="text-xl font-semibold">Page not found</h2>
        <p className="text-sm text-zinc-500">
          The page you’re looking for doesn’t exist or has moved.
        </p>
        <Link href="/">
          <Button>Back to dashboard</Button>
        </Link>
      </div>
    </div>
  );
}

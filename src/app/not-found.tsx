import Link from "next/link";
import { Button } from "@/components/ui";

/** Global 404 page rendered for unmatched routes. */
export default function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center text-center">
      <div className="max-w-sm space-y-4">
        <p className="text-5xl font-bold text-primary">404</p>
        <h2 className="text-headline-sm">Page not found</h2>
        <p className="text-body-md text-on-surface-variant">
          The page you’re looking for doesn’t exist or has moved.
        </p>
        <Link href="/">
          <Button>Back to dashboard</Button>
        </Link>
      </div>
    </div>
  );
}

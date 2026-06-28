"use client";

import { useEffect } from "react";
import { Button, Icon } from "@/components/ui";
import { faTriangleExclamation } from "@/lib/icons";

/**
 * Route segment error boundary. Required to be a Client Component.
 * Catches render/data errors in the segment and offers a recovery action.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Hook a real error reporter (Sentry, etc.) in here.
    console.error(error);
  }, [error]);

  return (
    <div className="grid min-h-[60vh] place-items-center text-center">
      <div className="max-w-sm space-y-4">
        <Icon
          icon={faTriangleExclamation}
          className="h-10 w-10 text-amber-500"
        />
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="text-sm text-zinc-500">
          An unexpected error occurred while loading this page.
        </p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}

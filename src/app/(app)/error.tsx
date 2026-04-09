'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function AppError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh] space-y-4 text-center px-4">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground text-sm max-w-sm">
        An error occurred loading this page. Your data is safe — please try again.
      </p>
      {error.digest && (
        <p className="text-xs text-muted-foreground font-mono">
          Error ID: {error.digest}
        </p>
      )}
      <div className="flex gap-3">
        <button
          onClick={unstable_retry}
          className="px-4 py-2 text-sm bg-foreground text-background rounded-md hover:opacity-80 transition-opacity"
        >
          Try again
        </button>
        <Link
          href="/output"
          className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors"
        >
          Go to Output
        </Link>
      </div>
    </div>
  );
}

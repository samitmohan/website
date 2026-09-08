"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md text-center">
        <p className="label mb-4">
          Error
        </p>
        <h1 className="display text-balance text-title text-ink md:text-head">
          Something went wrong
        </h1>
        <p className="mt-4 text-small text-ink-2">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <button onClick={reset} className="pill pill-solid mt-7">
          Try Again
        </button>
        {error.digest && (
          <p className="meta mt-5">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}

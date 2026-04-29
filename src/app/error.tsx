"use client";
import { useEffect } from "react";

export default function Error({
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
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-4xl font-bold">Service Unavailable</h1>
      <p className="text-base-content/60 text-center max-w-sm">
        Weather data could not be loaded. The service may be temporarily unavailable.
      </p>
      <button className="btn btn-primary" onClick={() => unstable_retry()}>
        Try again
      </button>
    </main>
  );
}

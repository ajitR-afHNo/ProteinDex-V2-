"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global boundary caught runtime error:", error);
  }, [error]);

  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <div className="inline-flex p-3 rounded-full bg-rose-50 text-rose-600 mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h2 className="text-lg font-bold text-slate-800 mb-2">Telemetry Error</h2>
      <p className="text-xs font-mono text-slate-500 mb-6">
        An unexpected error occurred while communicating with database nodes.
      </p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 rounded bg-slate-900 text-white font-mono text-xs font-semibold"
      >
        Retry Request
      </button>
    </div>
  );
}

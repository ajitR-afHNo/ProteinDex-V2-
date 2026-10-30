import React, { Suspense } from "react";
import { CompareClientView } from "./CompareClientView";

export default function ComparePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          Cross-Product Comparison Matrix
        </h1>
        <p className="text-xs font-mono text-slate-500 mt-1">
          Side-by-side quantitative breakdown of purity, serving economics, and formulation specs.
        </p>
      </div>

      <Suspense fallback={<div className="font-mono text-xs text-slate-400">Loading matrix...</div>}>
        <CompareClientView />
      </Suspense>
    </div>
  );
}

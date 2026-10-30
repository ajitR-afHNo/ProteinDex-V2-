"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CompareTable } from "@/components/compare/CompareTable";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function CompareClientView() {
  const searchParams = useSearchParams();
  const ids = searchParams.get("ids") || "";
  const [variants, setVariants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadComparison() {
      if (!ids) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/compare?ids=${encodeURIComponent(ids)}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.items)) {
          setVariants(json.items);
        } else {
          setError(json.error || "Failed to load comparison data");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load comparison");
      } finally {
        setLoading(false);
      }
    }

    loadComparison();
  }, [ids]);

  if (!ids) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
        <p className="text-slate-600 font-medium">
          No products selected. Go to the screener to add products to the compare tray.
        </p>
        <Link
          href="/catalog"
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded bg-emerald-600 text-white font-mono text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Screener</span>
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-12 text-center font-mono text-xs text-slate-500">
        Fetching verified comparison telemetry from database...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-rose-200 rounded-lg p-8 text-center text-xs font-mono text-rose-700">
        {error}
      </div>
    );
  }

  return <CompareTable variants={variants} />;
}

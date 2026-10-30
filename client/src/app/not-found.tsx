import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <div className="font-mono text-4xl font-black text-slate-400 mb-2">404</div>
      <h2 className="text-lg font-bold text-slate-800 mb-2">Resource Not Found</h2>
      <p className="text-xs font-mono text-slate-500 mb-6">
        The requested commodity record or comparison matrix does not exist or has expired.
      </p>
      <Link
        href="/catalog"
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-slate-900 text-white font-mono text-xs font-semibold"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Catalog</span>
      </Link>
    </div>
  );
}

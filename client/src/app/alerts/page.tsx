import Link from "next/link";
import { Bell, ArrowLeft } from "lucide-react";

export default function AlertsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="inline-flex p-3 rounded-full bg-slate-100 text-slate-700 mb-4">
        <Bell className="w-6 h-6" />
      </div>
      <h1 className="text-2xl font-black text-slate-900 mb-2">Price Drop Alerts</h1>
      <p className="text-xs font-mono text-slate-500 mb-6 max-w-md mx-auto">
        Device Watchlist (Browser Stored). Automated SMS/WhatsApp notifications are currently unconfigured to guarantee zero-synthetic promises.
      </p>

      <div className="bg-white border border-slate-200 rounded-lg p-6 text-xs font-mono text-slate-600 text-left space-y-3">
        <div className="flex justify-between border-b border-slate-100 pb-2 font-bold text-slate-800">
          <span>Infrastructure Status</span>
          <span className="text-emerald-700">Client-Side Watchlist Active</span>
        </div>
        <p>
          Products added to your watchlist track price shifts during your browsing session. Real-time background delivery webhooks will activate in future infrastructure releases.
        </p>
      </div>

      <div className="mt-8">
        <Link
          href="/catalog"
          className="inline-flex items-center gap-2 px-4 py-2 rounded bg-emerald-600 text-white font-mono text-xs font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Screener</span>
        </Link>
      </div>
    </div>
  );
}

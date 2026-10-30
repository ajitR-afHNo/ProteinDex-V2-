import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { LiveMarketPulse } from "@/components/common/LiveMarketPulse";
import { Scale, BarChart2, Calculator, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "ProteIndex V2 | Sports Nutrition Screener & Price Aggregator",
  description:
    "Institutional sports nutrition screener, true protein cost calculator, and real-time authenticity intelligence for the Indian market.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-emerald-100 selection:text-emerald-900">
        <LiveMarketPulse />
        <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded bg-emerald-600 flex items-center justify-center text-white font-black font-mono text-lg tracking-wider">
                PX
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900">
                  Prote<span className="text-emerald-600">Index</span>
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs font-mono uppercase tracking-widest text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                  v2.0 PROD
                </span>
              </div>
            </Link>

            <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
              <Link
                href="/catalog"
                className="hover:text-emerald-700 transition flex items-center gap-1.5"
              >
                <BarChart2 className="w-4 h-4 text-slate-400" />
                Screener
              </Link>
              <Link
                href="/compare"
                className="hover:text-emerald-700 transition flex items-center gap-1.5"
              >
                <Scale className="w-4 h-4 text-slate-400" />
                Compare
              </Link>
              <Link
                href="/calculator"
                className="hover:text-emerald-700 transition flex items-center gap-1.5"
              >
                <Calculator className="w-4 h-4 text-slate-400" />
                Cost Calculator
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              ProteIndex V2 &mdash; Quantitative nutrition screener with strict zero-synthetic data policy.
            </p>
            <p className="font-mono text-slate-400">
              Deterministic Ingestion &bull; Thermodynamic Atwater Verifications
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

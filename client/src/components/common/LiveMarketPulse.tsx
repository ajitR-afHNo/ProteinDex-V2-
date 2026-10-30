"use client";

import React from "react";
import { Activity, ShieldCheck } from "lucide-react";

export function LiveMarketPulse() {
  return (
    <div className="w-full bg-slate-900 text-slate-300 border-b border-slate-800 text-xs py-1.5 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-mono text-slate-400">MARKET FEED:</span>
          <span className="text-emerald-400 font-medium">LIVE D2C & MARKETPLACE ARBITRAGE ACTIVE</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Zero Synthetic Data Protocol Enforced
          </span>
          <span className="font-mono text-slate-500">INDIA COMMODITY SCREENER</span>
        </div>
      </div>
    </div>
  );
}

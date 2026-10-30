"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, BarChart3, Database, CheckCircle2 } from "lucide-react";

export function LandingHero() {
  return (
    <div className="relative overflow-hidden bg-white border-b border-slate-200 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-xs font-mono font-semibold text-emerald-800 mb-6">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Zero Synthetic Data Protocol Enforced
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 leading-[1.1] mb-6">
            Institutional Sports Nutrition Screener for India.
          </h1>

          <p className="text-base sm:text-lg text-slate-600 mb-8 leading-relaxed">
            Eliminate marketing distortion. ProteIndex normalizes retail prices against verified bioavailable macronutrients, calculates true cost per pure gram, and screens unauthorized marketplace sellers.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-sm font-bold transition shadow-sm"
            >
              <span>Launch Screener</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/calculator"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono text-sm font-semibold transition"
            >
              <span>True Cost Calculator</span>
            </Link>
          </div>
        </div>

        {/* Feature Grid Highlights */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-lg border border-slate-200 bg-slate-50/50">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-700 uppercase mb-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Thermodynamic Verification</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every nutrition factsheet passes Atwater mass-balance conservation and biological purity ceilings before publication.
            </p>
          </div>

          <div className="p-5 rounded-lg border border-slate-200 bg-slate-50/50">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-700 uppercase mb-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>Standardized Equalizer</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ranks protein by ₹/g bioavailable protein (DIAAS-adjusted) and creatine by ₹/3g dose, eliminating tub weight trickery.
            </p>
          </div>

          <div className="p-5 rounded-lg border border-slate-200 bg-slate-50/50">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-700 uppercase mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Authorized Supply Chains</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Whitelists official D2C and verified marketplace sellers while flagging grey-market sellers and amino-spiked formulations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

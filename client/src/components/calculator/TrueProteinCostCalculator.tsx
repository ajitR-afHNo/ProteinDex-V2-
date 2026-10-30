"use client";

import React, { useState } from "react";
import { Calculator, ShieldCheck, ArrowRight } from "lucide-react";

export function TrueProteinCostCalculator() {
  const [mode, setMode] = useState<"percentage" | "scoop">("scoop");
  const [netWeightG, setNetWeightG] = useState(2000);
  const [priceInr, setPriceInr] = useState(5499);
  const [proteinPct, setProteinPct] = useState(80);
  const [servingSizeG, setServingSizeG] = useState(30.4);
  const [proteinPerServingG, setProteinPerServingG] = useState(24);

  // Computations
  let totalProteinG = 0;
  let effectivePurity = 0;

  if (mode === "percentage") {
    totalProteinG = (netWeightG * proteinPct) / 100.0;
    effectivePurity = proteinPct;
  } else {
    const servings = netWeightG / (servingSizeG || 1);
    totalProteinG = servings * proteinPerServingG;
    effectivePurity = servingSizeG > 0 ? (proteinPerServingG / servingSizeG) * 100.0 : 0;
  }

  const costPerGram = totalProteinG > 0 ? priceInr / totalProteinG : 0;
  const costPer100gPure = costPerGram * 100.0;
  const costPer24gDose = costPerGram * 24.0;
  const monthlyCost1Scoop = costPer24gDose * 30.0;
  const monthlyCost2Scoops = costPer24gDose * 60.0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-emerald-600 text-white">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                True Protein Cost Calculator
              </h1>
              <p className="text-xs font-mono text-slate-500">
                Normalize tub price against pure bioavailable grams & calculate daily budget.
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-xs font-mono text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Zero Marketing Distortion
          </div>
        </div>

        {/* Input Form */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-5">
            {/* Mode Selector */}
            <div>
              <label className="text-xs font-mono uppercase text-slate-500 font-bold block mb-1.5">
                Calculation Input Method
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode("scoop")}
                  className={`py-2 text-xs font-medium rounded border transition ${
                    mode === "scoop"
                      ? "bg-emerald-50 border-emerald-600 text-emerald-800 font-bold"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  By Scoop Label
                </button>
                <button
                  type="button"
                  onClick={() => setMode("percentage")}
                  className={`py-2 text-xs font-medium rounded border transition ${
                    mode === "percentage"
                      ? "bg-emerald-50 border-emerald-600 text-emerald-800 font-bold"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  By Protein %
                </button>
              </div>
            </div>

            {/* Price Slider */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-600">Product Price:</span>
                <span className="font-bold text-slate-900">₹{priceInr.toLocaleString("en-IN")}</span>
              </div>
              <input
                type="range"
                min="500"
                max="15000"
                step="100"
                value={priceInr}
                onChange={(e) => setPriceInr(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-600"
              />
            </div>

            {/* Net Weight Slider */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-slate-600">Tub / Bag Net Weight:</span>
                <span className="font-bold text-slate-900">{netWeightG}g ({(netWeightG / 1000).toFixed(1)}kg)</span>
              </div>
              <input
                type="range"
                min="250"
                max="10000"
                step="50"
                value={netWeightG}
                onChange={(e) => setNetWeightG(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-600"
              />
            </div>

            {mode === "scoop" ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-slate-600 block mb-1">
                    Serving Size (g)
                  </label>
                  <input
                    type="number"
                    value={servingSizeG}
                    onChange={(e) => setServingSizeG(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-200 rounded"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-slate-600 block mb-1">
                    Protein / Scoop (g)
                  </label>
                  <input
                    type="number"
                    value={proteinPerServingG}
                    onChange={(e) => setProteinPerServingG(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-200 rounded"
                  />
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-600">Protein Concentration:</span>
                  <span className="font-bold text-slate-900">{proteinPct}%</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="95"
                  step="1"
                  value={proteinPct}
                  onChange={(e) => setProteinPct(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-600"
                />
              </div>
            )}
          </div>

          {/* Results Panel */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 flex flex-col justify-between">
            <div>
              <div className="text-xs font-mono uppercase text-slate-500 font-bold mb-4">
                Quantitative Equalizer Outputs
              </div>

              <div className="space-y-4 font-mono">
                <div className="bg-white border border-slate-200 p-3 rounded">
                  <div className="text-[11px] text-slate-500 uppercase">True Cost per Gram Protein</div>
                  <div className="text-2xl font-black text-emerald-800 tabular-nums">
                    ₹{costPerGram.toFixed(2)}/g
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white border border-slate-200 p-3 rounded">
                    <div className="text-[10px] text-slate-500 uppercase">Per 100g Pure</div>
                    <div className="text-base font-bold text-slate-800 tabular-nums">
                      ₹{costPer100gPure.toFixed(1)}
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 p-3 rounded">
                    <div className="text-[10px] text-slate-500 uppercase">Standard 24g Scoop</div>
                    <div className="text-base font-bold text-slate-800 tabular-nums">
                      ₹{costPer24gDose.toFixed(1)}
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-3 text-xs space-y-1 text-slate-600">
                  <div className="flex justify-between">
                    <span>Effective Purity:</span>
                    <span className="font-bold text-slate-800">{effectivePurity.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly (1 Scoop/day):</span>
                    <span className="font-bold text-slate-800">₹{Math.round(monthlyCost1Scoop)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly (2 Scoops/day):</span>
                    <span className="font-bold text-slate-800">₹{Math.round(monthlyCost2Scoops)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] font-mono text-slate-400">
              ProteIndex Math Engine &bull; Strictly calculated without synthetic padding
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

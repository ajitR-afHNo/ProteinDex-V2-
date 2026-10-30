"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ShieldCheck, Check, X, ArrowUpDown } from "lucide-react";

interface CompareTableProps {
  variants: any[];
}

export function CompareTable({ variants }: CompareTableProps) {
  const [highlightDiffs, setHighlightDiffs] = useState(false);

  if (!variants || variants.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-slate-500 font-mono text-xs">
        No variants selected for comparison matrix. Select 2 to 4 items from the catalog.
      </div>
    );
  }

  const rows = [
    {
      label: "Brand",
      getValue: (v: any) => v.products?.brand || "-",
    },
    {
      label: "Category / Form",
      getValue: (v: any) => v.products?.sub_category || "-",
    },
    {
      label: "Flavor",
      getValue: (v: any) => v.flavor || "unflavored",
    },
    {
      label: "Net Weight",
      getValue: (v: any) => `${v.weight_grams}g`,
    },
    {
      label: "Best Price (INR)",
      getValue: (v: any) =>
        v.lowest_price_inr ? `₹${parseFloat(v.lowest_price_inr).toLocaleString("en-IN")}` : "Out of Stock",
    },
    {
      label: "Serving Size",
      getValue: (v: any) => (v.label_serving_size_g ? `${v.label_serving_size_g}g` : "N/A"),
    },
    {
      label: "Protein / Serving",
      getValue: (v: any) =>
        v.label_protein_per_serving_g ? `${v.label_protein_per_serving_g}g` : "Pending Verification",
    },
    {
      label: "Calculated Purity",
      getValue: (v: any) =>
        v.label_serving_size_g && v.label_protein_per_serving_g
          ? `${((v.label_protein_per_serving_g / v.label_serving_size_g) * 100).toFixed(1)}%`
          : "N/A",
    },
    {
      label: "Total Servings",
      getValue: (v: any) => v.servings_count || "N/A",
    },
    {
      label: "Calories / Serving",
      getValue: (v: any) => (v.calories_per_serving ? `${v.calories_per_serving} kcal` : "N/A"),
    },
    {
      label: "Carbs / Serving",
      getValue: (v: any) => (v.carbs_per_serving_g != null ? `${v.carbs_per_serving_g}g` : "N/A"),
    },
    {
      label: "Fat / Serving",
      getValue: (v: any) => (v.fat_per_serving_g != null ? `${v.fat_per_serving_g}g` : "N/A"),
    },
    {
      label: "FSSAI License",
      getValue: (v: any) => v.products?.fssai_license_number || "Unregistered",
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold uppercase text-slate-700">
            Direct Quantitative Matrix ({variants.length} items)
          </span>
        </div>
        <button
          onClick={() => setHighlightDiffs(!highlightDiffs)}
          className={`px-3 py-1.5 rounded text-xs font-mono font-medium border transition ${
            highlightDiffs
              ? "bg-slate-900 border-slate-900 text-white"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
          }`}
        >
          {highlightDiffs ? "Highlighting Differences" : "Highlight Differences"}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50">
              <th className="p-4 w-48 sticky left-0 bg-slate-50 z-20 font-bold text-slate-700 uppercase tracking-wider">
                Attribute
              </th>
              {variants.map((v) => (
                <th key={v.id} className="p-4 min-w-[220px] align-top">
                  <div className="font-bold text-slate-900 text-sm mb-1">
                    {v.products?.base_name || v.sku_id}
                  </div>
                  <div className="text-slate-500 font-semibold">{v.products?.brand}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, rIdx) => {
              const vals = variants.map(row.getValue);
              const isDiff = new Set(vals).size > 1;
              const rowBg = highlightDiffs && isDiff ? "bg-amber-50/40" : "hover:bg-slate-50/60";

              return (
                <tr key={rIdx} className={rowBg}>
                  <td className="p-3.5 font-bold text-slate-600 sticky left-0 bg-white border-r border-slate-100 z-10">
                    {row.label}
                  </td>
                  {vals.map((val, cIdx) => (
                    <td key={cIdx} className="p-3.5 text-slate-800">
                      {val}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

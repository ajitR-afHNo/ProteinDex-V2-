"use client";

import React from "react";
import { CategorySilo } from "@/types/products";
import { Filter, RotateCcw } from "lucide-react";

interface DecathlonSidebarProps {
  selectedSilo: CategorySilo | "all";
  onSelectSilo: (silo: CategorySilo | "all") => void;
  brandQuery: string;
  onBrandQueryChange: (q: string) => void;
  minPrice: number;
  maxPrice: number;
  onPriceChange: (min: number, max: number) => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
  onReset: () => void;
}

const SILOS: { id: CategorySilo | "all"; label: string }[] = [
  { id: "all", label: "All Categories" },
  { id: "protein", label: "Protein Powders" },
  { id: "creatine", label: "Creatine Monohydrate" },
  { id: "mass_gainers", label: "Mass Gainers" },
  { id: "pre_workout", label: "Pre-Workouts" },
  { id: "snacks", label: "Protein Snacks" },
];

export function DecathlonSidebar({
  selectedSilo,
  onSelectSilo,
  brandQuery,
  onBrandQueryChange,
  minPrice,
  maxPrice,
  onPriceChange,
  sortBy,
  onSortByChange,
  onReset,
}: DecathlonSidebarProps) {
  return (
    <aside className="w-full md:w-64 bg-white border border-slate-200 rounded-lg p-4 space-y-6 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Filter className="w-4 h-4 text-emerald-600" />
          <span>Filters & Sort</span>
        </div>
        <button
          onClick={onReset}
          className="text-xs font-mono text-slate-500 hover:text-slate-800 flex items-center gap-1 transition"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      {/* Category Silo Accordion / List */}
      <div className="space-y-2">
        <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
          Category Silo
        </label>
        <div className="space-y-1">
          {SILOS.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelectSilo(s.id)}
              className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-medium transition ${
                selectedSilo === s.id
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Brand Search */}
      <div className="space-y-2">
        <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
          Brand Filter
        </label>
        <input
          type="text"
          value={brandQuery}
          onChange={(e) => onBrandQueryChange(e.target.value)}
          placeholder="e.g. Optimum Nutrition, MuscleBlaze"
          className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:border-emerald-600 text-slate-800"
        />
      </div>

      {/* Sort By Dropdown */}
      <div className="space-y-2">
        <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
          Sort Order
        </label>
        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
          className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded text-slate-800 focus:outline-none focus:border-emerald-600"
        >
          <option value="featured">Featured (Recent Ingestion)</option>
          <option value="value_asc">Best Value (Lowest ₹/g Protein)</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {/* Price Bound Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-slate-500">
          <span>Max Price:</span>
          <span className="font-bold text-slate-800">₹{maxPrice.toLocaleString("en-IN")}</span>
        </div>
        <input
          type="range"
          min="500"
          max="15000"
          step="500"
          value={maxPrice}
          onChange={(e) => onPriceChange(minPrice, parseInt(e.target.value, 10))}
          className="w-full accent-emerald-600 cursor-pointer"
        />
      </div>
    </aside>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ProductItem } from "@/types/products";
import { X, ArrowRight, Scale } from "lucide-react";

interface CompareTrayProps {
  selectedProducts: ProductItem[];
  onRemove: (productId: string) => void;
  onClear: () => void;
}

export function CompareTray({
  selectedProducts,
  onRemove,
  onClear,
}: CompareTrayProps) {
  if (selectedProducts.length === 0) return null;

  const compareUrl = `/compare?ids=${selectedProducts.map((p) => p.variantId).join(",")}`;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-slate-900 border-t border-slate-800 text-white shadow-2xl animate-in slide-in-from-bottom duration-300">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
            <Scale className="w-4 h-4" />
            <span>Compare Matrix ({selectedProducts.length}/4)</span>
          </div>

          <div className="flex items-center gap-2">
            {selectedProducts.map((p) => (
              <div
                key={p.variantId}
                className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded text-xs"
              >
                <span className="font-medium truncate max-w-[120px]">{p.productName}</span>
                <span className="font-mono text-slate-400">({p.packaging.weightGrams}g)</span>
                <button
                  onClick={() => onRemove(p.productId)}
                  aria-label="Remove item"
                  className="text-slate-400 hover:text-white transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={onClear}
            className="text-xs text-slate-400 hover:text-white underline transition"
          >
            Clear All
          </button>

          <Link
            href={compareUrl}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded text-xs font-bold font-mono transition ${
              selectedProducts.length >= 2
                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow"
                : "bg-slate-700 text-slate-400 cursor-not-allowed pointer-events-none"
            }`}
          >
            <span>Launch Matrix</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

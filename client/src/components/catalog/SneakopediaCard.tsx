"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ProductItem } from "@/types/products";
import { ShieldCheck, AlertTriangle, ExternalLink, Scale, Check } from "lucide-react";

interface SneakopediaCardProps {
  product: ProductItem;
  onOpenMatrix?: (product: ProductItem) => void;
  onToggleCompare?: (product: ProductItem) => void;
  isCompared?: boolean;
}

export function SneakopediaCard({
  product,
  onOpenMatrix,
  onToggleCompare,
  isCompared = false,
}: SneakopediaCardProps) {
  const [imgError, setImgError] = useState(false);
  const lowestOffer = product.pricing.vendorOffers[0];

  return (
    <div className="group relative bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
      {/* Top Banner / Image Area */}
      <div className="relative h-44 w-full bg-slate-50 border-b border-slate-100 flex items-center justify-center p-4">
        {product.imageUrl && !imgError ? (
          <Image
            src={product.imageUrl}
            alt={product.productName}
            fill
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
            sizes="(max-width: 768px) 100vw, 300px"
          />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 bg-slate-100 rounded">
            <span className="font-mono text-xl font-bold tracking-wider text-slate-500">
              {product.brand.slice(0, 2).toUpperCase()}
            </span>
            <span className="text-[10px] uppercase font-mono tracking-wider mt-1">Verified SKU</span>
          </div>
        )}

        {/* Compare Toggle Button */}
        {onToggleCompare && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare(product);
            }}
            aria-label="Toggle comparison"
            className={`absolute top-2 right-2 p-1.5 rounded text-xs font-mono flex items-center gap-1 transition ${
              isCompared
                ? "bg-slate-900 text-white shadow"
                : "bg-white/90 text-slate-700 hover:bg-slate-900 hover:text-white border border-slate-200"
            }`}
          >
            {isCompared ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Scale className="w-3.5 h-3.5" />}
            <span className="text-[11px] font-medium">{isCompared ? "Added" : "Compare"}</span>
          </button>
        )}

        {/* Verification Tier Pill */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/95 border border-slate-200 text-[10px] font-mono font-medium text-slate-700 shadow-xs">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          <span>{product.verification.tier.toUpperCase()} TIER</span>
        </div>
      </div>

      {/* Body Info */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono mb-1">
            <span className="font-semibold text-slate-700">{product.brand}</span>
            <span>{product.packaging.weightGrams}g</span>
          </div>

          <h3
            onClick={() => onOpenMatrix && onOpenMatrix(product)}
            className="text-sm font-bold text-slate-900 hover:text-emerald-700 cursor-pointer line-clamp-2 transition-colors mb-2"
          >
            {product.productName}
          </h3>

          <div className="text-xs text-slate-500 font-mono mb-3">
            Flavor: <span className="text-slate-800 font-medium capitalize">{product.flavor}</span>
          </div>
        </div>

        {/* Equalizer Primary Metric Box */}
        <div className="bg-slate-50 border border-slate-100 rounded p-2.5 mb-3">
          <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-0.5">
            {product.equalizerMetrics.primaryMetricLabel}
          </div>
          <div className="flex items-baseline justify-between">
            {product.equalizerMetrics.isReliable && product.equalizerMetrics.primaryMetricValue != null ? (
              <span className="text-xl font-mono font-black text-emerald-800 tabular-nums">
                ₹{product.equalizerMetrics.primaryMetricValue.toFixed(2)}
              </span>
            ) : (
              <span className="text-xs font-mono font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                Pending Verification
              </span>
            )}

            {product.equalizerMetrics.secondaryMetricValue != null && (
              <span className="text-xs font-mono text-slate-600">
                {product.equalizerMetrics.secondaryMetricValue}% {product.equalizerMetrics.secondaryMetricLabel}
              </span>
            )}
          </div>
        </div>

        {/* Price & Buy Action */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">Best Price</div>
            <div className="text-base font-bold font-mono text-slate-900 tabular-nums">
              ₹{product.pricing.lowestPriceInr.toLocaleString("en-IN")}
            </div>
          </div>

          {lowestOffer ? (
            <a
              href={lowestOffer.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition shadow-xs"
            >
              <span>Buy ({lowestOffer.platform})</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <span className="text-xs font-mono text-slate-400">Out of Stock</span>
          )}
        </div>
      </div>
    </div>
  );
}

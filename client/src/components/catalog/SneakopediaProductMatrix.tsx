"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { ProductItem } from "@/types/products";
import { X, ShieldCheck, AlertTriangle, ExternalLink, Activity } from "lucide-react";

interface SneakopediaProductMatrixProps {
  product: ProductItem | null;
  onClose: () => void;
}

export function SneakopediaProductMatrix({
  product,
  onClose,
}: SneakopediaProductMatrixProps) {
  // Modal scroll lock invariant
  useEffect(() => {
    if (product) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [product]);

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
          <div>
            <div className="text-xs font-mono uppercase text-slate-500 font-semibold">
              {product.brand} &bull; {product.subCategory}
            </div>
            <h2 className="text-lg font-bold text-slate-900">{product.productName}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Main Top Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative h-60 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center p-4">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.productName}
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 768px) 100vw, 350px"
                />
              ) : (
                <span className="font-mono text-2xl font-bold text-slate-400">
                  {product.brand}
                </span>
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="text-xs font-mono text-slate-500 uppercase">
                  {product.equalizerMetrics.primaryMetricLabel}
                </div>
                <div className="text-2xl font-mono font-black text-emerald-800 tabular-nums">
                  {product.equalizerMetrics.isReliable && product.equalizerMetrics.primaryMetricValue != null
                    ? `₹${product.equalizerMetrics.primaryMetricValue.toFixed(2)}`
                    : "Pending Verification"}
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  Purity: {product.equalizerMetrics.secondaryMetricValue ?? "N/A"}% &bull; Net Weight: {product.packaging.weightGrams}g
                </div>
              </div>

              {/* FSSAI & Lab Info */}
              <div className="border border-slate-200 rounded-lg p-3 text-xs space-y-1.5 font-mono">
                <div className="flex items-center justify-between text-slate-600">
                  <span>FSSAI License:</span>
                  <span className="font-bold text-slate-800">
                    {product.verification.fssai.licenseNumber || "Pending Registration"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>FSSAI Status:</span>
                  <span className="text-emerald-700 font-semibold">
                    {product.verification.fssai.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Amino Spiking Risk:</span>
                  <span className={product.usefulDoseAnalysis.aminoSpikeRisk ? "text-rose-700 font-bold" : "text-emerald-700"}>
                    {product.usefulDoseAnalysis.aminoSpikeRisk ? "High Risk" : "Zero Spiking Detected"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Real Retailer Offers Matrix */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-700 font-bold mb-3">
              Real-Time Verified Retailer Matrix
            </h4>
            <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 overflow-hidden">
              {product.pricing.vendorOffers.length > 0 ? (
                product.pricing.vendorOffers.map((offer, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white flex items-center justify-between hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          {offer.platform}
                          {offer.isAuthorizedSeller && (
                            <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-1 rounded">
                              Authorized
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          Seller: {offer.sellerName || "Direct Official"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
                        ₹{offer.priceInr.toLocaleString("en-IN")}
                      </span>
                      <a
                        href={offer.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-medium transition"
                      >
                        Buy Now
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs font-mono text-slate-500">
                  No real-time market offers currently tracked for this SKU.
                </div>
              )}
            </div>
          </div>

          {/* Honest Price Tracking State */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 font-mono flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-400 shrink-0" />
            <span>
              Price tracking initiated recently &mdash; historical trendlines will render once multiple scheduled scrape cycles record price shifts. Zero synthetic noise.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

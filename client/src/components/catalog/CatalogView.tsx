"use client";

import React, { useState, useEffect } from "react";
import { ProductItem, CategorySilo } from "@/types/products";
import { SneakopediaCard } from "./SneakopediaCard";
import { SneakopediaProductMatrix } from "./SneakopediaProductMatrix";
import { DecathlonSidebar } from "./DecathlonSidebar";
import { CatalogSkeleton } from "./CatalogSkeleton";
import { CompareTray } from "@/components/compare/CompareTray";

export function CatalogView() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSilo, setSelectedSilo] = useState<CategorySilo | "all">("all");
  const [brandQuery, setBrandQuery] = useState("");
  const [minPrice, setMinPrice] = useState(500);
  const [maxPrice, setMaxPrice] = useState(15000);
  const [sortBy, setSortBy] = useState("featured");

  const [activeModalProduct, setActiveModalProduct] = useState<ProductItem | null>(null);
  const [comparedProducts, setComparedProducts] = useState<ProductItem[]>([]);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedSilo !== "all") params.set("silo", selectedSilo);
        if (brandQuery.trim()) params.set("brand", brandQuery.trim());
        if (maxPrice < 15000) params.set("max_price", maxPrice.toString());
        if (sortBy) params.set("sort", sortBy);

        const res = await fetch(`/api/products?${params.toString()}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setProducts(json.data);
        } else {
          setProducts([]);
        }
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(fetchProducts, 150);
    return () => clearTimeout(timer);
  }, [selectedSilo, brandQuery, maxPrice, sortBy]);

  const handleToggleCompare = (product: ProductItem) => {
    setComparedProducts((prev) => {
      const exists = prev.some((p) => p.productId === product.productId);
      if (exists) {
        return prev.filter((p) => p.productId !== product.productId);
      }
      if (prev.length >= 4) {
        alert("Maximum 4 products allowed in comparison matrix.");
        return prev;
      }
      return [...prev, product];
    });
  };

  const handleReset = () => {
    setSelectedSilo("all");
    setBrandQuery("");
    setMinPrice(500);
    setMaxPrice(15000);
    setSortBy("featured");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          Sports Nutrition Screener
        </h1>
        <p className="text-xs font-mono text-slate-500 mt-1">
          Quantitative multi-platform price & authenticity screener for Indian commodities.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Sidebar Filters */}
        <DecathlonSidebar
          selectedSilo={selectedSilo}
          onSelectSilo={setSelectedSilo}
          brandQuery={brandQuery}
          onBrandQueryChange={setBrandQuery}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onPriceChange={(min, max) => {
            setMinPrice(min);
            setMaxPrice(max);
          }}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          onReset={handleReset}
        />

        {/* Product Grid Area */}
        <div className="flex-1 w-full">
          {loading ? (
            <CatalogSkeleton />
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <SneakopediaCard
                  key={p.variantId}
                  product={p}
                  onOpenMatrix={(prod) => setActiveModalProduct(prod)}
                  onToggleCompare={handleToggleCompare}
                  isCompared={comparedProducts.some((c) => c.productId === p.productId)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
              <p className="text-slate-600 font-medium">No verified listings match your active filters.</p>
              <button
                onClick={handleReset}
                className="mt-3 inline-flex items-center text-xs font-mono text-emerald-700 underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Product Detail Matrix Modal */}
      <SneakopediaProductMatrix
        product={activeModalProduct}
        onClose={() => setActiveModalProduct(null)}
      />

      {/* Floating Compare Tray */}
      <CompareTray
        selectedProducts={comparedProducts}
        onRemove={(id) => setComparedProducts((prev) => prev.filter((p) => p.productId !== id))}
        onClear={() => setComparedProducts([])}
      />
    </div>
  );
}

"use client";

import React from "react";

export function CatalogSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((idx) => (
        <div
          key={idx}
          className="bg-white border border-slate-200 rounded-lg overflow-hidden h-96 flex flex-col justify-between p-4"
        >
          <div className="h-44 bg-slate-100 rounded w-full mb-4"></div>
          <div className="space-y-2 flex-1">
            <div className="h-3 bg-slate-200 rounded w-1/3"></div>
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="h-3 bg-slate-100 rounded w-1/2"></div>
          </div>
          <div className="h-16 bg-slate-50 border border-slate-100 rounded w-full my-3"></div>
          <div className="h-8 bg-slate-200 rounded w-full"></div>
        </div>
      ))}
    </div>
  );
}

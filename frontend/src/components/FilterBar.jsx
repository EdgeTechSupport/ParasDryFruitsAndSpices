import React from "react";
import { SlidersHorizontal } from "lucide-react";

export default function FilterBar({
  sortBy,
  setSortBy,
  showOrganicOnly,
  setShowOrganicOnly,
}) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
      <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
        <SlidersHorizontal className="w-4 h-4 text-[#2B4C3F]" />
        <span>Filter & Sort Catalog:</span>
      </div>

      <div className="flex items-center gap-4 w-full sm:w-auto">
        {/* Organic Only Checkbox */}
        <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showOrganicOnly}
            onChange={(e) => setShowOrganicOnly(e.target.checked)}
            className="w-4 h-4 accent-[#2B4C3F] rounded"
          />
          <span>Organic Certified Only</span>
        </label>

        {/* Sort Select */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-700 rounded-xl px-3 py-2 focus:outline-none focus:border-[#2B4C3F]"
        >
          <option value="featured">Featured / Default</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>
    </div>
  );
}

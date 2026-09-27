"use client";

import { BrandDropdown } from "@/components/BrandDropdown";

type CatalogFiltersProps = {
  query: string;
  brand: string;
  onQueryChange: (value: string) => void;
  onBrandChange: (value: string) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
};

function SearchIcon() {
  return (
    <svg aria-hidden className="h-4 w-4 text-[#6b5d52]" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function CatalogFilters({
  query,
  brand,
  onQueryChange,
  onBrandChange,
  onClear,
  hasActiveFilters,
}: CatalogFiltersProps) {
  return (
    <div className="rounded-2xl border border-[#2c2119] bg-[#1a1410]/80 p-4 shadow-[inset_0_1px_0_rgba(255,122,26,0.06)] backdrop-blur-sm sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <label className="flex-1">
          <span className="mb-1.5 block text-xs font-semibold tracking-wide text-[#a89a8c] uppercase">
            Search
          </span>
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2">
              <SearchIcon />
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Shoe name, style, color…"
              className="w-full rounded-xl border border-[#2c2119] bg-[#120e0c] py-3 pr-4 pl-10 text-sm text-[#f3ece4] placeholder:text-[#6b5d52] outline-none transition focus:border-[#ff7a1a]/50 focus:ring-2 focus:ring-[#ff7a1a]/20"
            />
          </div>
        </label>

        <div className="w-full lg:w-64">
          <span className="mb-1.5 block text-xs font-semibold tracking-wide text-[#a89a8c] uppercase">
            Brand
          </span>
          <BrandDropdown
            value={brand}
            onChange={onBrandChange}
            includeAllOption
            extraBrands={brand ? [brand] : []}
          />
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 rounded-xl border border-[#2c2119] px-4 py-3 text-sm font-medium text-[#a89a8c] transition hover:border-[#ff7a1a]/40 hover:text-[#ff9a4d] lg:mb-0"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}

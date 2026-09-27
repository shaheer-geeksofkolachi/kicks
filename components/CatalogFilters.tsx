"use client";

type CatalogFiltersProps = {
  brands: string[];
  query: string;
  brand: string;
  onQueryChange: (value: string) => void;
  onBrandChange: (value: string) => void;
};

export function CatalogFilters({
  brands,
  query,
  brand,
  onQueryChange,
  onBrandChange,
}: CatalogFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <label className="flex-1">
        <span className="sr-only">Search by name</span>
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search by shoe name…"
          className="w-full rounded-lg border border-zinc-700 bg-[#141414] px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none ring-[#FF8C00] focus:ring-2"
        />
      </label>
      <label className="sm:w-56">
        <span className="sr-only">Filter by brand</span>
        <select
          value={brand}
          onChange={(e) => onBrandChange(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-[#141414] px-4 py-2.5 text-sm text-white outline-none ring-[#FF8C00] focus:ring-2"
        >
          <option value="">All brands</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

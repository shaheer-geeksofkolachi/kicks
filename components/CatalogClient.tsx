"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CatalogFilters } from "@/components/CatalogFilters";
import { LoadingSplash } from "@/components/LoadingSplash";
import { ProductCard } from "@/components/ProductCard";
import { filterDiscountedProducts } from "@/lib/catalog-helpers";
import { SITE_DISPLAY_NAME } from "@/lib/site-url";
import type { Product } from "@/lib/types";
import { productIncludesSize } from "@/lib/sizes";

const MIN_SPLASH_MS = 800;

type CatalogMode = "all" | "deals";

type CatalogClientProps = {
  products: Product[];
  configError?: boolean;
  mode?: CatalogMode;
};

const CATALOG_BASE = "/catalog";

export function CatalogClient({ products, configError, mode = "all" }: CatalogClientProps) {
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [brand, setBrand] = useState(searchParams.get("brand") ?? "");
  const [size, setSize] = useState(searchParams.get("size") ?? "");

  const catalogProducts = useMemo(
    () => (mode === "deals" ? filterDiscountedProducts(products) : products),
    [products, mode],
  );

  useEffect(() => {
    const start = Date.now();
    const timer = setTimeout(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, MIN_SPLASH_MS - elapsed);
      setTimeout(() => setReady(true), remaining);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (mode !== "all") return;
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (brand) params.set("brand", brand);
    if (size) params.set("size", size);
    const qs = params.toString();
    const url = qs ? `${CATALOG_BASE}?${qs}` : CATALOG_BASE;
    window.history.replaceState(null, "", url);
  }, [query, brand, size, mode]);

  const filtered = useMemo(() => {
    if (mode === "deals") return catalogProducts;
    const q = query.trim().toLowerCase();
    return catalogProducts.filter((p) => {
      const matchesBrand = !brand || p.brand === brand;
      const matchesSize = productIncludesSize(p.sizes, p.size_unit, size);
      const matchesQuery = !q || p.name.toLowerCase().includes(q);
      return matchesBrand && matchesSize && matchesQuery;
    });
  }, [catalogProducts, query, brand, size, mode]);

  const hasActiveFilters = Boolean(query.trim() || brand || size);
  const availableCount = useMemo(
    () => catalogProducts.filter((p) => !p.is_sold).length,
    [catalogProducts],
  );

  function clearFilters() {
    setQuery("");
    setBrand("");
    setSize("");
  }

  if (!ready) {
    return <LoadingSplash />;
  }

  const isDeals = mode === "deals";
  const title = isDeals ? "Deals & discounts" : "Shop catalog";
  const subtitle = isDeals
    ? catalogProducts.length > 0
      ? `${catalogProducts.length} ${catalogProducts.length === 1 ? "pair" : "pairs"} on sale right now.`
      : "No active discounts at the moment — check the full catalog."
    : "Premium kicks — filter by brand, size, or search by name. Fresh pairs added regularly.";

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(255,122,26,0.12),transparent)]"
      />

      <div className="relative mx-auto max-w-[1120px] px-[18px] pt-8 sm:px-10 sm:pt-10">
        <header className="mb-8 scroll-mt-24 sm:mb-10">
          <p className="text-xs font-semibold tracking-[0.2em] text-[#ff7a1a] uppercase">{SITE_DISPLAY_NAME}</p>
          <h1 className="mt-2 font-display text-4xl leading-tight tracking-tight text-[#f3ece4] sm:text-5xl">
            {title}
          </h1>
          <p className="mt-3 max-w-xl text-base text-[#a89a8c]">{subtitle}</p>

          {!configError && catalogProducts.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-[#2c2119] bg-[#1a1410]/90 px-3 py-1 text-xs font-medium text-[#c4b5a6]">
                {catalogProducts.length} {catalogProducts.length === 1 ? "pair" : "pairs"}{" "}
                {isDeals ? "on sale" : "listed"}
              </span>
              {availableCount < catalogProducts.length && (
                <span className="rounded-full border border-[#2c2119] bg-[#1a1410]/90 px-3 py-1 text-xs font-medium text-[#6b5d52]">
                  {availableCount} available now
                </span>
              )}
            </div>
          )}
        </header>

        {configError && (
          <div className="mb-6 rounded-xl border border-amber-700/40 bg-amber-950/30 px-4 py-3 text-sm text-amber-200">
            Supabase is not configured. Add environment variables and run the SQL schema to load products.
          </div>
        )}

        {mode === "all" && (
          <div className="sticky top-[65px] z-30 mb-8">
            <CatalogFilters
              query={query}
              brand={brand}
              size={size}
              onQueryChange={setQuery}
              onBrandChange={setBrand}
              onSizeChange={setSize}
              onClear={clearFilters}
              hasActiveFilters={hasActiveFilters}
            />
          </div>
        )}

        <div className="mb-5 flex items-center justify-between gap-4">
          <p className="text-sm text-[#6b5d52]">
            {mode === "all" && hasActiveFilters ? (
              <>
                Showing <span className="font-medium text-[#c4b5a6]">{filtered.length}</span> of{" "}
                {catalogProducts.length}
              </>
            ) : (
              <>
                <span className="font-medium text-[#c4b5a6]">{filtered.length}</span>{" "}
                {filtered.length === 1 ? "sneaker" : "sneakers"}
              </>
            )}
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#2c2119] bg-[#1a1410]/40 px-6 py-16 text-center">
            <p className="font-display text-xl text-[#f3ece4]">
              {isDeals ? "No deals right now" : "No matches"}
            </p>
            <p className="mt-2 text-sm text-[#6b5d52]">
              {isDeals
                ? "Browse the full catalog for every pair we have listed."
                : "Try another brand, size, or search term — or clear your filters."}
            </p>
            {hasActiveFilters && mode === "all" && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 rounded-xl bg-[#ff7a1a] px-5 py-2.5 text-sm font-semibold text-[#120e0c] transition hover:bg-[#ff9a4d]"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 pb-12 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

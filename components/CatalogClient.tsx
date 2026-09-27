"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CatalogFilters } from "@/components/CatalogFilters";
import { LoadingSplash } from "@/components/LoadingSplash";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/types";

const MIN_SPLASH_MS = 800;

type CatalogClientProps = {
  products: Product[];
  configError?: boolean;
};

export function CatalogClient({ products, configError }: CatalogClientProps) {
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [brand, setBrand] = useState(searchParams.get("brand") ?? "");

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
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (brand) params.set("brand", brand);
    const qs = params.toString();
    const url = qs ? `?${qs}` : "/";
    window.history.replaceState(null, "", url);
  }, [query, brand]);

  const brands = useMemo(() => {
    const set = new Set(products.map((p) => p.brand));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const matchesBrand = !brand || p.brand === brand;
      const matchesQuery = !q || p.name.toLowerCase().includes(q);
      return matchesBrand && matchesQuery;
    });
  }, [products, query, brand]);

  if (!ready) {
    return <LoadingSplash />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="font-display text-3xl text-white sm:text-4xl">Our Catalog</h1>
        <p className="mt-2 text-zinc-400">Premium kicks — filter by brand or name.</p>
      </div>

      {configError && (
        <div className="mb-6 rounded-lg border border-amber-700/50 bg-amber-950/40 px-4 py-3 text-sm text-amber-200">
          Supabase is not configured. Add environment variables and run the SQL schema to load products.
        </div>
      )}

      <CatalogFilters
        brands={brands}
        query={query}
        brand={brand}
        onQueryChange={setQuery}
        onBrandChange={setBrand}
      />

      {filtered.length === 0 ? (
        <p className="mt-12 text-center text-zinc-500">No shoes match your filters.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

import { Suspense } from "react";
import { CatalogClient } from "@/components/CatalogClient";
import { SiteHeader } from "@/components/SiteHeader";
import { fetchProducts } from "@/lib/products";

function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export default async function HomePage() {
  const configError = !isSupabaseConfigured();
  const products = configError ? [] : await fetchProducts();

  return (
    <div className="min-h-screen bg-[#120e0c] text-[#f3ece4]">
      <SiteHeader />
      <Suspense fallback={null}>
        <CatalogClient products={products} configError={configError} />
      </Suspense>
    </div>
  );
}

import { HomePageClient } from "@/components/home/HomePageClient";
import { PublicShell } from "@/components/PublicShell";
import { fetchProductReviews } from "@/lib/product-reviews";
import { fetchProducts } from "@/lib/products";

function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export default async function HomePage() {
  const configError = !isSupabaseConfigured();
  const products = configError ? [] : await fetchProducts();
  const reviews = configError ? [] : await fetchProductReviews(24);

  return (
    <PublicShell>
      <HomePageClient products={products} reviews={reviews} configError={configError} />
    </PublicShell>
  );
}

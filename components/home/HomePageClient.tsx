"use client";

import { useMemo } from "react";
import { ProductCard } from "@/components/ProductCard";
import { ReviewsCarousel } from "@/components/ReviewsCarousel";
import { SectionHeader } from "@/components/home/SectionHeader";
import { homeAllPreview, homeDealsPreview, homeSoldPreview } from "@/lib/catalog-helpers";
import type { Product, ProductReviewWithListing } from "@/lib/types";

type HomePageClientProps = {
  products: Product[];
  reviews: ProductReviewWithListing[];
  configError?: boolean;
};

const HOME_PRODUCT_GRID =
  "grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 [&>*]:min-w-0";

/** Up to 4 sold items in a single row on large screens. */
const HOME_SOLD_GRID =
  "grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5 [&>*]:min-w-0";

export function HomePageClient({ products, reviews, configError }: HomePageClientProps) {
  const deals = useMemo(() => homeDealsPreview(products), [products]);
  const latest = useMemo(() => homeAllPreview(products), [products]);
  const sold = useMemo(() => homeSoldPreview(products), [products]);

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(255,122,26,0.12),transparent)]"
      />

      <div className="relative mx-auto max-w-[1120px] px-[18px] pt-8 pb-4 sm:px-10 sm:pt-10">
        {configError && (
          <div className="mb-8 rounded-xl border border-amber-700/40 bg-amber-950/30 px-4 py-3 text-sm text-amber-200">
            Supabase is not configured. Add environment variables and run the SQL schema to load products.
          </div>
        )}

        {deals.length > 0 && (
          <section className="mb-12 sm:mb-14" aria-labelledby="home-deals-heading">
            <SectionHeader
              label="Hot deals"
              title="Discounted kicks"
              description="Limited-time prices on select pairs."
              viewAllHref="/catalog/deals"
              viewAllLabel="View all discounted products"
            />
            <h2 id="home-deals-heading" className="sr-only">Discounted products</h2>
            <div className={HOME_PRODUCT_GRID}>
              {deals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        <section className="mb-12 sm:mb-14" aria-labelledby="home-all-heading">
          <SectionHeader
            label="Fresh drops"
            title="All products"
            description="Newest listings first — sold and available."
            viewAllHref="/catalog"
            viewAllLabel="View all products"
          />
          <h2 id="home-all-heading" className="sr-only">Latest products</h2>
          {latest.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#2c2119] bg-[#1a1410]/40 px-6 py-12 text-center">
              <p className="font-display text-xl text-[#f3ece4]">No products yet</p>
              <p className="mt-2 text-sm text-[#6b5d52]">Check back soon for new kicks.</p>
            </div>
          ) : (
            <div className={HOME_PRODUCT_GRID}>
              {latest.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        {sold.length > 0 && (
          <section className="mb-12 sm:mb-14" aria-labelledby="home-sold-heading">
            <SectionHeader
              label="Archive"
              title="Sold kicks"
              description="Recently sold pairs — gone but not forgotten."
              viewAllHref="/catalog/sold"
              viewAllLabel="View all"
            />
            <h2 id="home-sold-heading" className="sr-only">Sold products</h2>
            <div className={HOME_SOLD_GRID}>
              {sold.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        <ReviewsCarousel reviews={reviews} />
      </div>
    </div>
  );
}

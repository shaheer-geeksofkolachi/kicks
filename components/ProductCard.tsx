"use client";

import Image from "next/image";
import Link, { useLinkStatus } from "next/link";
import { ProductPrice } from "@/components/ProductPrice";
import { primaryImageUrl } from "@/lib/media";
import { getProductPricing } from "@/lib/pricing";
import type { Product } from "@/lib/types";
import { LoadingSplash } from "@/components/LoadingSplash";
import { CATALOG_SIZE_UNIT, sizesToSelectableValues } from "@/lib/sizes";
import { SoldOverlay } from "@/components/SoldOverlay";

function ProductCardContent({ product }: { product: Product }) {
  const { pending } = useLinkStatus();
  const imageUrl = primaryImageUrl(product.product_media);
  const sizeUnit = product.size_unit ?? CATALOG_SIZE_UNIT;
  const sizeValues = sizesToSelectableValues(product.sizes ?? [], sizeUnit);
  const pricing = getProductPricing(product);
  const onSale = pricing.hasDiscount && !product.is_sold;

  return (
    <>
      {pending && <LoadingSplash message="Loading product…" />}
      <div
        className={`relative flex flex-col overflow-hidden rounded-2xl border bg-[#1a1410] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_16px_48px_rgba(0,0,0,0.5)] ${
          onSale
            ? "border-[#ff7a1a]/45 shadow-[0_0_0_1px_rgba(255,122,26,0.12),inset_0_1px_0_rgba(255,154,77,0.08)] group-hover:border-[#ff9a4d]/55 group-hover:shadow-[0_16px_48px_rgba(0,0,0,0.5),0_0_24px_rgba(255,122,26,0.12)]"
            : "border-[#2c2119] group-hover:border-[#ff7a1a]/35 group-hover:shadow-[0_12px_40px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,122,26,0.08)]"
        }`}
      >
        <div className="relative aspect-square overflow-hidden bg-[#120e0c]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.05]"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 bg-[linear-gradient(145deg,#1a1410_0%,#120e0c_50%,#1f1814_100%)] px-4 text-center">
              <span className="text-3xl opacity-40" aria-hidden>👟</span>
              <span className="text-xs font-medium tracking-wide text-[#6b5d52] uppercase">No photo</span>
            </div>
          )}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(18,14,12,0.65)_0%,transparent_50%)]"
          />
          {onSale && (
            <div
              className="absolute top-0 left-0 z-10 flex flex-col items-start"
              aria-label={`${pricing.discountPercent} percent off`}
            >
              <span
                className="rounded-br-xl bg-gradient-to-br from-[#ff6a00] via-[#ff5500] to-[#e63e00] px-3 py-1.5 text-[11px] font-black tracking-wider text-white shadow-[0_4px_16px_rgba(255,80,0,0.5)] sm:text-xs"
              >
                SALE
              </span>
              <span
                className="ml-0 rounded-br-lg bg-[#120e0c]/90 px-2.5 py-1 text-[10px] font-extrabold text-[#ffb347] backdrop-blur-sm sm:text-[11px]"
              >
                −{pricing.discountPercent}%
              </span>
            </div>
          )}
          {product.is_sold && <SoldOverlay />}
          <span
            className="absolute right-2.5 bottom-2.5 z-10 rounded-lg border border-white/10 bg-[#120e0c]/90 px-2.5 py-1 text-[10px] font-bold tracking-wide text-[#ff9a4d] uppercase opacity-0 backdrop-blur-md transition group-hover:opacity-100"
          >
            View
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-1.5 p-4">
          {product.brand ? (
            <p className="text-[10px] font-bold tracking-[0.14em] text-[#ff7a1a] uppercase sm:text-[11px]">
              {product.brand}
            </p>
          ) : null}
          <h2 className="line-clamp-2 font-display text-[15px] leading-snug font-semibold text-[#f8f2eb] sm:text-[17px]">
            {product.name}
          </h2>
          {sizeValues.length > 0 && (
            <div className="mt-0.5">
              <p className="mb-1.5 text-[9px] font-semibold tracking-wide text-[#6b5d52] uppercase sm:text-[10px]">
                Sizes ({sizeUnit})
              </p>
              <div className="flex flex-wrap gap-1">
                {sizeValues.map((size) => (
                  <span
                    key={size}
                    className="inline-flex min-w-[1.85rem] items-center justify-center rounded-md border border-[#3d3229] bg-[#120e0c]/80 px-1.5 py-0.5 text-[10px] font-semibold text-[#d4c4b5] sm:text-[11px]"
                  >
                    {size}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div
            className={`mt-auto pt-3 ${onSale ? "border-t border-[#ff7a1a]/20 bg-gradient-to-t from-[#ff7a1a]/[0.06] to-transparent -mx-4 px-4 pb-0.5" : "border-t border-[#2c2119]/80"}`}
          >
            <ProductPrice product={product} size="sm" variant="card" />
          </div>
        </div>
      </div>
    </>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const href = `/products/${product.id}`;

  return (
    <Link href={href} className="group relative flex flex-col">
      <ProductCardContent product={product} />
    </Link>
  );
}

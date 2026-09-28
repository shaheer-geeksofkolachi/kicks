"use client";

import Image from "next/image";
import Link, { useLinkStatus } from "next/link";
import { formatPkr } from "@/lib/format";
import { primaryImageUrl } from "@/lib/media";
import type { Product } from "@/lib/types";
import { LoadingSplash } from "@/components/LoadingSplash";
import { CATALOG_SIZE_UNIT, sizesToSelectableValues } from "@/lib/sizes";
import { SoldOverlay } from "@/components/SoldOverlay";

function ProductCardContent({ product }: { product: Product }) {
  const { pending } = useLinkStatus();
  const imageUrl = primaryImageUrl(product.product_media);
  const sizeUnit = product.size_unit ?? CATALOG_SIZE_UNIT;
  const sizeValues = sizesToSelectableValues(product.sizes ?? [], sizeUnit);

  return (
    <>
      {pending && <LoadingSplash message="Loading product…" />}
      <div className="relative flex flex-col overflow-hidden rounded-2xl border border-[#2c2119] bg-[#1a1410] transition duration-300 group-hover:-translate-y-0.5 group-hover:border-[#ff7a1a]/35 group-hover:shadow-[0_12px_40px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,122,26,0.08)]">
        <div className="relative aspect-square overflow-hidden bg-[#120e0c]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.04]"
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
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(18,14,12,0.5)_0%,transparent_45%)] opacity-0 transition group-hover:opacity-100"
          />
          {product.is_sold && <SoldOverlay />}
          <span
            className="absolute right-2.5 bottom-2.5 rounded-lg bg-[#120e0c]/85 px-2 py-1 text-[10px] font-semibold tracking-wide text-[#ff9a4d] uppercase opacity-0 backdrop-blur-sm transition group-hover:opacity-100"
          >
            View
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-1 p-3.5 sm:p-4">
          <p className="text-[10px] font-semibold tracking-[0.12em] text-[#ff7a1a] uppercase sm:text-xs">
            {product.brand}
          </p>
          <h2 className="line-clamp-2 font-display text-base leading-snug text-[#f3ece4] sm:text-lg">
            {product.name}
          </h2>
          {sizeValues.length > 0 && (
            <div className="mt-1.5">
              <p className="mb-1 text-[9px] font-semibold tracking-wide text-[#6b5d52] uppercase sm:text-[10px]">
                Sizes ({sizeUnit})
              </p>
              <div className="flex flex-wrap gap-1">
                {sizeValues.map((size) => (
                  <span
                    key={size}
                    className="inline-flex min-w-[1.75rem] items-center justify-center rounded-md border border-[#2c2119] bg-[#120e0c] px-1.5 py-0.5 text-[10px] font-semibold text-[#c4b5a6] sm:text-[11px]"
                  >
                    {size}
                  </span>
                ))}
              </div>
            </div>
          )}
          <p className="mt-auto pt-2 text-sm font-bold text-[#ffd700]">{formatPkr(product.price_pkr)}</p>
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

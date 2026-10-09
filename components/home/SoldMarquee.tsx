"use client";

import type { CSSProperties } from "react";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/types";

type SoldMarqueeProps = {
  products: Product[];
};

const CARD_WIDTH_CLASS = "w-[min(72vw,240px)] shrink-0 sm:w-[260px] lg:w-[272px]";

export function SoldMarquee({ products }: SoldMarqueeProps) {
  if (!products.length) return null;

  const loop = [...products, ...products];
  const durationSec = Math.max(32, products.length * 7);

  return (
    <div
      className="sold-marquee group/marquee relative overflow-hidden"
      aria-label="Recently sold products"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent sm:w-16"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent sm:w-16"
      />

      <div
        className="sold-marquee-track flex w-max gap-3 sm:gap-5"
        style={{ "--sold-marquee-duration": `${durationSec}s` } as CSSProperties}
      >
        {loop.map((product, index) => {
          const isDuplicate = index >= products.length;
          return (
            <div
              key={`${product.id}-${index}`}
              className={`${CARD_WIDTH_CLASS} py-1 ${isDuplicate ? "sold-marquee-duplicate" : ""}`}
              aria-hidden={isDuplicate ? true : undefined}
            >
              <ProductCard product={product} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

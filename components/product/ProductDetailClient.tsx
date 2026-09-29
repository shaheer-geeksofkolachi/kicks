"use client";

import { useMemo, useState } from "react";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductPrice } from "@/components/ProductPrice";
import { getProductPricing } from "@/lib/pricing";
import type { Product } from "@/lib/types";
import { formatSizeLabel } from "@/lib/sizes";
import { buildWhatsAppOrderUrl, getWhatsAppNumber } from "@/lib/whatsapp";

type ProductDetailClientProps = {
  product: Product;
  pageUrl: string;
};

export function ProductDetailClient({ product, pageUrl }: ProductDetailClientProps) {
  const sizes = product.sizes ?? [];
  const sizeUnit = product.size_unit ?? "UK";
  const [selectedSize, setSelectedSize] = useState(sizes[0] ?? "");
  const selectedSizeLabel = selectedSize
    ? formatSizeLabel(sizeUnit, selectedSize)
    : undefined;

  const whatsappConfigured = Boolean(getWhatsAppNumber());
  const canOrder = !product.is_sold && whatsappConfigured;

  const pricing = getProductPricing(product);

  const whatsappUrl = useMemo(
    () =>
      buildWhatsAppOrderUrl({
        productName: product.name,
        brand: product.brand,
        pricePkr: pricing.effectivePrice,
        originalPricePkr: pricing.hasDiscount ? pricing.originalPrice : undefined,
        size: selectedSizeLabel,
        pageUrl,
      }),
    [product, pricing.effectivePrice, pricing.hasDiscount, pricing.originalPrice, selectedSizeLabel, pageUrl],
  );

  function openWhatsApp() {
    if (!whatsappUrl || !canOrder) return;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
        <ProductGallery
          media={product.product_media ?? []}
          alt={product.name}
          isSold={product.is_sold}
          inStock={!product.is_sold}
        />

        <div className="pb-24 md:pb-0">
          {product.brand ? (
            <p className="mb-2 flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-[#ff7a1a] uppercase">
              <span className="rounded-full bg-[#3a2311] px-2.5 py-0.5 text-[11px] tracking-wide text-[#ffb27a] normal-case">
                {product.brand}
              </span>
            </p>
          ) : null}

          <h1 className="mb-2.5 text-[34px] leading-[1.15] font-extrabold tracking-tight text-[#f3ece4]">
            {product.name}
          </h1>

          <div className="mb-5">
            <ProductPrice product={product} size="lg" variant="card" />
          </div>

          {product.is_sold && (
            <p className="mb-4 text-sm font-semibold text-[#ff7a1a]">This pair has been sold.</p>
          )}

          {sizes.length > 0 && (
            <>
              <p className="mt-5 mb-2.5 text-[13px] font-semibold text-[#a89a8c]">
                Available sizes ({sizeUnit})
              </p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => {
                  const selected = size === selectedSize;
                  const label = formatSizeLabel(sizeUnit, size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      disabled={product.is_sold}
                      className={`flex h-11 min-w-[52px] items-center justify-center rounded-[10px] border px-3 text-[13px] transition ${
                        selected
                          ? "border-[#ff7a1a] bg-[#3a2311] font-bold text-[#ffb27a]"
                          : "border-[#3d2b1c] text-[#f3ece4] hover:border-[#ff7a1a]/60"
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {product.description && (
            <>
              <p className="mt-5 mb-2.5 text-[13px] font-semibold text-[#a89a8c]">Description</p>
              <p className="max-w-[46ch] text-[14.5px] leading-[1.7] text-[#a89a8c] whitespace-pre-wrap">
                {product.description}
              </p>
            </>
          )}

          <div className="mt-7 hidden sm:block">
            <button
              type="button"
              onClick={openWhatsApp}
              disabled={!canOrder}
              className="flex w-full max-w-md items-center justify-center gap-2 rounded-[10px] bg-[#ff7a1a] px-6 py-3 text-[15px] font-extrabold tracking-wide text-[#1c0a00] transition hover:bg-[#ff8c3d] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Order on WhatsApp
            </button>
          </div>

          {!whatsappConfigured && !product.is_sold && (
            <p className="mt-4 text-sm text-[#6f6154]">
              WhatsApp ordering is not configured yet (set NEXT_PUBLIC_WHATSAPP_NUMBER).
            </p>
          )}

          <div className="mt-6 grid grid-cols-2 gap-2.5 border-t border-[#2c2119] pt-5 sm:mt-7 sm:pt-5">
            <TrustItem icon="🚚" label="3–5 day delivery" />
            <TrustItem icon="💵" label="Cash on delivery" />
          </div>
        </div>
      </div>

      <div
        className="fixed right-0 bottom-0 left-0 z-40 flex items-center justify-between gap-3.5 border-t border-[#2c2119] bg-[#181310] px-4 py-3 sm:hidden"
        style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))" }}
      >
        <ProductPrice product={product} size="md" />
        <button
          type="button"
          onClick={openWhatsApp}
          disabled={!canOrder}
          className="rounded-[10px] bg-[#ff7a1a] px-5 py-3 text-sm font-extrabold text-[#1c0a00] disabled:opacity-50"
        >
          WhatsApp
        </button>
      </div>
    </>
  );
}

function TrustItem({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex flex-col items-start gap-1.5 text-xs text-[#a89a8c]">
      <span className="text-[17px]" aria-hidden>{icon}</span>
      <span>{label}</span>
    </div>
  );
}

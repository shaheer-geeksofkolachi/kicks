"use client";

import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ProductMediaLightbox } from "@/components/product/ProductMediaLightbox";
import { SoldOverlay } from "@/components/SoldOverlay";
import { getStoragePublicUrl, productDetailGalleryMedia } from "@/lib/media";
import type { ProductMedia } from "@/lib/types";

type ProductGalleryProps = {
  media: ProductMedia[];
  alt: string;
  isSold?: boolean;
  inStock?: boolean;
};

export function ProductGallery({ media, alt, isSold, inStock }: ProductGalleryProps) {
  const sorted = useMemo(() => productDetailGalleryMedia(media), [media]);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: sorted.length > 1 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    emblaApi.reInit();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, sorted.length]);

  const showStockBadge = inStock && !isSold;

  if (!sorted.length) {
    return (
      <div className="relative">
        <div
          className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[18px] text-[#6f6154]"
          style={{
            background:
              "radial-gradient(ellipse at 60% 40%, #e8481f 0%, #a82f10 45%, #3a0f04 100%)",
          }}
        >
          No photos yet
          {isSold && <SoldOverlay large />}
        </div>
      </div>
    );
  }

  function openLightbox(index: number) {
    setLightboxIndex(index);
  }

  return (
    <div>
      <div
        className="relative overflow-hidden rounded-[18px]"
        style={{
          background:
            "radial-gradient(ellipse at 60% 40%, #e8481f 0%, #a82f10 45%, #3a0f04 100%)",
        }}
      >
        {showStockBadge && (
          <span
            className="absolute top-4 left-4 z-20 rounded-full border border-[#3d2b1c] bg-[#120e0c] px-3 py-1.5 text-[11px] font-bold tracking-wide text-[#ff7a1a]"
          >
            In stock
          </span>
        )}
        <button
          type="button"
          className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/35 text-base text-white"
          aria-label="Save to favorites"
        >
          ♡
        </button>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex touch-pan-y">
            {sorted.map((item, slideIndex) => {
              const url = getStoragePublicUrl(item.storage_path);
              return (
                <div key={item.id} className="relative min-w-0 flex-[0_0_100%]">
                  <div className="relative aspect-square">
                    {item.kind === "video" ? (
                      <video
                        src={url}
                        className="h-full w-full object-contain"
                        controls
                        playsInline
                        preload="metadata"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => openLightbox(slideIndex)}
                        className="relative block h-full w-full cursor-zoom-in"
                        aria-label="View full size image"
                      >
                        <Image
                          src={url}
                          alt={alt}
                          fill
                          className="object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]"
                          sizes="(max-width: 860px) 100vw, 55vw"
                          priority={slideIndex === 0}
                        />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {isSold && <SoldOverlay large />}
      </div>

      {sorted.length > 1 && (
        <div className="mt-3.5 flex gap-3 overflow-x-auto pb-1">
          {sorted.map((item, i) => {
            const url = getStoragePublicUrl(item.storage_path);
            const active = i === selectedIndex;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollTo(i)}
                className={`relative aspect-square w-[72px] shrink-0 overflow-hidden rounded-[10px] border bg-gradient-to-br from-[#241a12] to-[#171009] sm:w-auto sm:flex-1 ${
                  active ? "border-[#ff7a1a]" : "border-[#2c2119]"
                }`}
                aria-label={`View image ${i + 1}`}
              >
                {item.kind === "video" ? (
                  <video src={url} className="h-full w-full object-cover" muted playsInline />
                ) : (
                  <Image src={url} alt="" fill className="object-cover" sizes="120px" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {lightboxIndex != null && (
        <ProductMediaLightbox
          items={sorted}
          index={lightboxIndex}
          alt={alt}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
        />
      )}
    </div>
  );
}

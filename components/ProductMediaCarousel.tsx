"use client";

import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { getStoragePublicUrl, sortMedia } from "@/lib/media";
import type { ProductMedia } from "@/lib/types";
import { SoldOverlay } from "@/components/SoldOverlay";

type ProductMediaCarouselProps = {
  media: ProductMedia[];
  alt: string;
  isSold?: boolean;
};

export function ProductMediaCarousel({ media, alt, isSold }: ProductMediaCarouselProps) {
  const sorted = sortMedia(media);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: sorted.length > 1 });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  if (!sorted.length) {
    return (
      <div className="relative flex aspect-square items-center justify-center rounded-xl bg-zinc-900 text-zinc-500">
        No media
        {isSold && <SoldOverlay large />}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-xl bg-zinc-900" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {sorted.map((item) => {
            const url = getStoragePublicUrl(item.storage_path);
            return (
              <div key={item.id} className="relative min-w-0 flex-[0_0_100%]">
                <div className="relative aspect-square">
                  {item.kind === "video" ? (
                    <video
                      src={url}
                      className="h-full w-full object-contain bg-black"
                      controls
                      playsInline
                      preload="metadata"
                    />
                  ) : (
                    <Image src={url} alt={alt} fill className="object-contain" sizes="100vw" priority />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isSold && <SoldOverlay large />}

      {sorted.length > 1 && (
        <>
          <button
            type="button"
            onClick={scrollPrev}
            className="absolute top-1/2 left-2 z-20 -translate-y-1/2 rounded-full border border-zinc-600 bg-black/70 p-2 text-white transition hover:border-[#FF8C00] hover:text-[#FF8C00]"
            aria-label="Previous slide"
          >
            <ChevronLeft />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            className="absolute top-1/2 right-2 z-20 -translate-y-1/2 rounded-full border border-zinc-600 bg-black/70 p-2 text-white transition hover:border-[#FF8C00] hover:text-[#FF8C00]"
            aria-label="Next slide"
          >
            <ChevronRight />
          </button>
          <div className="mt-4 flex justify-center gap-2">
            {sorted.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollTo(i)}
                className={`h-2 rounded-full transition-all ${
                  i === selectedIndex ? "w-6 bg-[#FF8C00]" : "w-2 bg-zinc-600 hover:bg-zinc-400"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ChevronLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

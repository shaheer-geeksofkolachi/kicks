"use client";

import Image from "next/image";
import { useCallback, useEffect } from "react";
import { getStoragePublicUrl } from "@/lib/media";
import type { ProductMedia } from "@/lib/types";

type ProductMediaLightboxProps = {
  items: ProductMedia[];
  index: number;
  alt: string;
  onClose: () => void;
  onIndexChange: (index: number) => void;
};

export function ProductMediaLightbox({
  items,
  index,
  alt,
  onClose,
  onIndexChange,
}: ProductMediaLightboxProps) {
  const item = items[index];
  const hasPrev = index > 0;
  const hasNext = index < items.length - 1;

  const goPrev = useCallback(() => {
    if (hasPrev) onIndexChange(index - 1);
  }, [hasPrev, index, onIndexChange]);

  const goNext = useCallback(() => {
    if (hasNext) onIndexChange(index + 1);
  }, [hasNext, index, onIndexChange]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, goPrev, goNext]);

  if (!item) return null;

  const url = getStoragePublicUrl(item.storage_path);

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/92 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Product image viewer"
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <p className="text-sm text-zinc-400">
          {index + 1} / {items.length}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-xl text-white hover:border-[#ff7a1a] hover:text-[#ff7a1a]"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-6 sm:px-14">
        {items.length > 1 && (
          <button
            type="button"
            onClick={goPrev}
            disabled={!hasPrev}
            className="absolute left-2 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white transition hover:border-[#ff7a1a] disabled:pointer-events-none disabled:opacity-25 sm:left-4"
            aria-label="Previous image"
          >
            ‹
          </button>
        )}

        <div className="relative h-full w-full max-h-[min(78vh,900px)] max-w-5xl">
          {item.kind === "video" ? (
            <video
              src={url}
              className="mx-auto max-h-full max-w-full object-contain"
              controls
              playsInline
              autoPlay
            />
          ) : (
            <Image
              src={url}
              alt={alt}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          )}
        </div>

        {items.length > 1 && (
          <button
            type="button"
            onClick={goNext}
            disabled={!hasNext}
            className="absolute right-2 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white transition hover:border-[#ff7a1a] disabled:pointer-events-none disabled:opacity-25 sm:right-4"
            aria-label="Next image"
          >
            ›
          </button>
        )}
      </div>

      {items.length > 1 && (
        <div className="flex justify-center gap-2 overflow-x-auto px-4 pb-6">
          {items.map((thumb, i) => {
            const thumbUrl = getStoragePublicUrl(thumb.storage_path);
            const active = i === index;
            return (
              <button
                key={thumb.id}
                type="button"
                onClick={() => onIndexChange(i)}
                className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                  active ? "border-[#ff7a1a]" : "border-transparent opacity-70 hover:opacity-100"
                }`}
                aria-label={`View image ${i + 1}`}
              >
                {thumb.kind === "video" ? (
                  <video src={thumbUrl} className="h-full w-full object-cover" muted playsInline />
                ) : (
                  <Image src={thumbUrl} alt="" fill className="object-cover" sizes="56px" />
                )}
              </button>
            );
          })}
        </div>
      )}

      <button
        type="button"
        className="absolute inset-0 -z-10"
        aria-label="Close"
        onClick={onClose}
      />
    </div>
  );
}

"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { ProductReviewWithListing } from "@/lib/types";

type ReviewsCarouselProps = {
  reviews: ProductReviewWithListing[];
};

type LightboxState = {
  url: string;
  alt: string;
  listingLabel: string;
};

export function ReviewsCarousel({ reviews }: ReviewsCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: reviews.length > 1, align: "start", dragFree: true },
    [Autoplay({ delay: 5500, stopOnInteraction: true, stopOnMouseEnter: true })],
  );
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const update = () => {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };
    emblaApi.on("select", update);
    emblaApi.on("reInit", update);
    update();
    return () => {
      emblaApi.off("select", update);
      emblaApi.off("reInit", update);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [lightbox]);

  if (!reviews.length) return null;

  return (
    <section className="mt-14 sm:mt-16" aria-labelledby="reviews-heading">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-[#ff7a1a] uppercase">Reviews</p>
          <h2 id="reviews-heading" className="mt-1 font-display text-2xl text-[#f3ece4] sm:text-3xl">
            What our customers say
          </h2>
          <p className="mt-2 max-w-lg text-sm text-[#a89a8c]">
            Real feedback from sneaker lovers — tied to the pairs they picked up.
          </p>
        </div>
        {reviews.length > 1 && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#2c2119] bg-[#1a1410] text-[#c4b5a6] transition hover:border-[#ff7a1a]/40 hover:text-[#ff9a4d] disabled:opacity-30"
              aria-label="Previous reviews"
            >
              ←
            </button>
            <button
              type="button"
              onClick={scrollNext}
              disabled={!canScrollNext}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#2c2119] bg-[#1a1410] text-[#c4b5a6] transition hover:border-[#ff7a1a]/40 hover:text-[#ff9a4d] disabled:opacity-30"
              aria-label="Next reviews"
            >
              →
            </button>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#2c2119]/80 bg-[#14100e]/60 py-3 sm:py-4" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {reviews.map((review) => (
            <ReviewSlide
              key={review.id}
              review={review}
              onExpandImage={(state) => setLightbox(state)}
            />
          ))}
        </div>
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-black/95 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Review image"
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <p className="text-sm font-medium text-[#ff9a4d]">{lightbox.listingLabel}</p>
            <button
              type="button"
              onClick={() => setLightbox(null)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 text-xl text-white hover:border-[#ff7a1a]"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <div className="relative min-h-0 flex-1">
            <Image
              src={lightbox.url}
              alt={lightbox.alt}
              fill
              unoptimized
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>
        </div>
      )}
    </section>
  );
}

function ReviewSlide({
  review,
  onExpandImage,
}: {
  review: ProductReviewWithListing;
  onExpandImage: (state: LightboxState) => void;
}) {
  const imageUrl = review.image_url?.trim() || null;
  const listingLabel = review.product_brand
    ? `${review.product_brand} · ${review.product_name}`
    : review.product_name;
  const isImage = review.kind === "image";
  const slideBasis = isImage
    ? "basis-[min(92vw,540px)] sm:basis-[min(72vw,560px)] lg:basis-[min(48vw,520px)]"
    : "basis-[min(88vw,400px)] sm:basis-[min(55vw,420px)] lg:basis-[min(36vw,380px)]";

  const imageAlt = review.customer_name ? `Review from ${review.customer_name}` : "Customer review";

  return (
    <article className={`min-w-0 shrink-0 grow-0 pl-4 ${slideBasis}`}>
      <div
        className={`mr-4 flex h-full flex-col overflow-hidden rounded-2xl border bg-[#1a1410] shadow-[0_12px_40px_rgba(0,0,0,0.35)] ${
          isImage ? "min-h-[420px] border-[#ff7a1a]/25 ring-1 ring-[#ff7a1a]/10" : "border-[#2c2119]"
        }`}
      >
        <div className="border-b border-[#2c2119]/80 bg-[#120e0c]/80 px-4 py-3 sm:px-5">
          <Link
            href={`/products/${review.product_id}`}
            className="inline-block max-w-full truncate text-[11px] font-bold tracking-wide text-[#ff7a1a] uppercase hover:text-[#ff9a4d] sm:text-xs"
          >
            {listingLabel}
          </Link>
        </div>

        <div className="flex flex-1 flex-col px-4 py-4 sm:px-5 sm:py-5">
          {isImage ? (
            imageUrl ? (
              <button
                type="button"
                onClick={() =>
                  onExpandImage({ url: imageUrl, alt: imageAlt, listingLabel })
                }
                className="group/review-img flex min-h-0 flex-1 flex-col text-left"
              >
                <div
                  className="relative flex min-h-[280px] flex-1 items-center justify-center overflow-hidden rounded-xl bg-[#f5f5f4] p-2 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] sm:min-h-[320px] sm:p-3"
                >
                  <div className="relative h-full w-full min-h-[260px]">
                    <Image
                      src={imageUrl}
                      alt={imageAlt}
                      fill
                      unoptimized
                      className="object-contain object-center"
                      sizes="(max-width: 640px) 92vw, 520px"
                    />
                  </div>
                  <span
                    className="absolute right-2 bottom-2 rounded-full bg-black/65 px-2.5 py-1 text-[10px] font-semibold text-white opacity-90 backdrop-blur-sm transition group-hover/review-img:bg-[#ff7a1a] group-hover/review-img:text-[#1c0a00]"
                  >
                    Tap to enlarge
                  </span>
                </div>
              </button>
            ) : (
              <p className="text-sm text-[#a89a8c]">
                Review image is unavailable. Re-save the review from admin to refresh the photo.
              </p>
            )
          ) : (
            <blockquote className="flex-1 text-[15px] leading-relaxed text-[#e8ddd3] sm:text-base">
              <span className="font-display text-3xl leading-none text-[#ff7a1a]/40" aria-hidden>
                &ldquo;
              </span>
              <span className="-mt-2 block pl-1">{review.body_text}</span>
            </blockquote>
          )}
        </div>

        <footer className="mt-auto border-t border-[#2c2119] bg-[#120e0c]/50 px-4 py-3.5 sm:px-5">
          {review.customer_name ? (
            <p className="text-sm font-semibold text-[#f3ece4]">{review.customer_name}</p>
          ) : (
            <p className="text-sm text-[#a89a8c]">Verified customer</p>
          )}
        </footer>
      </div>
    </article>
  );
}

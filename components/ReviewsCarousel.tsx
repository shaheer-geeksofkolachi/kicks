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

export function ReviewsCarousel({ reviews }: ReviewsCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: reviews.length > 1, align: "start", dragFree: true },
    [Autoplay({ delay: 4500, stopOnInteraction: true, stopOnMouseEnter: true })],
  );
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

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

  if (!reviews.length) return null;

  return (
    <section className="mt-14 sm:mt-16" aria-labelledby="reviews-heading">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-[#ff7a1a] uppercase">Reviews</p>
          <h2 id="reviews-heading" className="mt-1 font-display text-2xl text-[#f3ece4] sm:text-3xl">
            What our customers say
          </h2>
          <p className="mt-2 max-w-lg text-sm text-[#6b5d52]">
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

      <div className="overflow-hidden rounded-2xl border border-[#2c2119] bg-[#1a1410]/50 py-1" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {reviews.map((review) => {
            const imageUrl = review.image_url?.trim() || null;
            const listingLabel = review.product_brand
              ? `${review.product_brand} · ${review.product_name}`
              : review.product_name;

            return (
              <article
                key={review.id}
                className="min-w-0 shrink-0 grow-0 basis-[85%] pl-4 sm:basis-[48%] lg:basis-[32%] xl:basis-[28%]"
              >
                <div className="mr-4 flex h-full flex-col rounded-xl border border-[#2c2119] bg-[#120e0c] p-5 shadow-[inset_0_1px_0_rgba(255,122,26,0.06)]">
                  <Link
                    href={`/products/${review.product_id}`}
                    className="text-xs font-semibold tracking-wide text-[#ff7a1a] uppercase hover:text-[#ff9a4d]"
                  >
                    {listingLabel}
                  </Link>

                  {review.kind === "image" ? (
                    imageUrl ? (
                      <div className="relative mt-3 aspect-[4/3] overflow-hidden rounded-lg border border-[#2c2119] bg-black/40">
                        <Image
                          src={imageUrl}
                          alt={review.customer_name ? `Review from ${review.customer_name}` : "Customer review"}
                          fill
                          unoptimized
                          className="object-contain"
                          sizes="(max-width: 640px) 85vw, 320px"
                        />
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-[#6b5d52]">
                        Review image is unavailable. Re-save the review from admin to refresh the photo.
                      </p>
                    )
                  ) : (
                    <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-[#c4b5a6]">
                      &ldquo;{review.body_text}&rdquo;
                    </blockquote>
                  )}

                  <footer className="mt-4 border-t border-[#2c2119] pt-4">
                    {review.customer_name ? (
                      <p className="font-semibold text-[#f3ece4]">{review.customer_name}</p>
                    ) : (
                      <p className="text-sm text-[#6b5d52]">Verified customer</p>
                    )}
                  </footer>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

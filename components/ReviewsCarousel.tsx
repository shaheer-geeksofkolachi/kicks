"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback, useEffect, useState } from "react";
import { CUSTOMER_REVIEWS } from "@/lib/reviews";

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`text-sm ${i < count ? "text-[#ffd700]" : "text-[#3d3028]"}`}
          aria-hidden
        >
          ★
        </span>
      ))}
    </div>
  );
}

export function ReviewsCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", dragFree: true },
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

  return (
    <section className="mt-14 sm:mt-16" aria-labelledby="reviews-heading">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-[#ff7a1a] uppercase">Reviews</p>
          <h2 id="reviews-heading" className="mt-1 font-display text-2xl text-[#f3ece4] sm:text-3xl">
            What our customers say
          </h2>
          <p className="mt-2 max-w-lg text-sm text-[#6b5d52]">
            Real feedback from sneaker lovers across Pakistan — thrift quality you can trust.
          </p>
        </div>
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
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#2c2119] bg-[#1a1410]/50 py-1" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {CUSTOMER_REVIEWS.map((review) => (
            <article
              key={review.id}
              className="min-w-0 shrink-0 grow-0 basis-[85%] pl-4 sm:basis-[48%] lg:basis-[32%] xl:basis-[28%]"
            >
              <div className="mr-4 flex h-full flex-col rounded-xl border border-[#2c2119] bg-[#120e0c] p-5 shadow-[inset_0_1px_0_rgba(255,122,26,0.06)]">
                <Stars count={review.rating} />
                <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-[#c4b5a6]">
                  &ldquo;{review.text}&rdquo;
                </blockquote>
                <footer className="mt-4 border-t border-[#2c2119] pt-4">
                  <p className="font-semibold text-[#f3ece4]">{review.name}</p>
                  <p className="text-xs text-[#6b5d52]">{review.city}, Pakistan</p>
                </footer>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

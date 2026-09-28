import { formatPkr } from "@/lib/format";
import { getProductPricing } from "@/lib/pricing";
import type { Product } from "@/lib/types";

type ProductPriceProps = {
  product: Pick<Product, "price_pkr" | "discount_price_pkr">;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "card";
  className?: string;
};

const sizeClasses = {
  sm: {
    sale: "text-sm font-bold text-[#ffd700]",
    original: "text-xs text-zinc-500 line-through",
    badge: "text-[10px] font-bold",
  },
  md: {
    sale: "text-base font-bold text-[#ffd700]",
    original: "text-sm text-zinc-500 line-through",
    badge: "text-xs font-bold",
  },
  lg: {
    sale: "text-[28px] font-extrabold text-white",
    original: "text-lg text-[#6b5d52] line-through",
    badge: "text-sm font-bold",
  },
};

function DiscountBadge({
  percent,
  className = "",
  label = "compact",
}: {
  percent: number;
  className?: string;
  label?: "compact" | "prominent";
}) {
  if (label === "prominent") {
    return (
      <span
        className={`inline-flex shrink-0 items-center rounded-full bg-gradient-to-r from-[#ff6a00] to-[#ff3d00] px-2.5 py-1 text-[11px] font-black tracking-wide text-white shadow-[0_4px_14px_rgba(255,90,0,0.45)] sm:text-xs ${className}`}
      >
        −{percent}% OFF
      </span>
    );
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full bg-gradient-to-r from-[#ff7a1a] to-[#ff5500] px-2 py-0.5 font-black text-white shadow-[0_2px_8px_rgba(255,122,26,0.35)] ${className}`}
    >
      −{percent}%
    </span>
  );
}

export function ProductPrice({
  product,
  size = "sm",
  variant = "default",
  className = "",
}: ProductPriceProps) {
  const pricing = getProductPricing(product);
  const styles = sizeClasses[size];

  if (!pricing.hasDiscount) {
    const singleClass =
      variant === "card" && size === "sm"
        ? "text-lg font-extrabold tracking-tight text-[#ffd700] sm:text-xl"
        : `font-bold text-[#ffd700] ${styles.sale}`;
    return <span className={`${singleClass} ${className}`}>{formatPkr(pricing.originalPrice)}</span>;
  }

  if (variant === "card" && size === "sm") {
    return (
      <div className={`space-y-1.5 ${className}`}>
        <p className="text-lg font-extrabold leading-none tracking-tight text-white sm:text-xl">
          {formatPkr(pricing.effectivePrice)}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-[#8a7a6c] line-through decoration-[#6b5d52]/80">
            {formatPkr(pricing.originalPrice)}
          </span>
          <DiscountBadge percent={pricing.discountPercent} label="prominent" />
        </div>
      </div>
    );
  }

  if (variant === "card" && size === "lg") {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex flex-wrap items-end gap-3">
          <p className="text-[28px] font-extrabold leading-none tracking-tight text-white">
            {formatPkr(pricing.effectivePrice)}
          </p>
          <DiscountBadge percent={pricing.discountPercent} label="prominent" className="mb-1 text-sm" />
        </div>
        <p className="text-lg font-medium text-[#6b5d52] line-through">{formatPkr(pricing.originalPrice)}</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className={styles.sale}>{formatPkr(pricing.effectivePrice)}</span>
      <span className={styles.original}>{formatPkr(pricing.originalPrice)}</span>
      <DiscountBadge percent={pricing.discountPercent} className={styles.badge} />
    </div>
  );
}

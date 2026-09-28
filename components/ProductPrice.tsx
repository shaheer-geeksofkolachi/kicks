import { formatPkr } from "@/lib/format";
import { getProductPricing } from "@/lib/pricing";
import type { Product } from "@/lib/types";

type ProductPriceProps = {
  product: Pick<Product, "price_pkr" | "discount_price_pkr">;
  size?: "sm" | "md" | "lg";
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

export function ProductPrice({ product, size = "sm", className = "" }: ProductPriceProps) {
  const pricing = getProductPricing(product);
  const styles = sizeClasses[size];

  if (!pricing.hasDiscount) {
    return <span className={`font-bold text-[#ffd700] ${className}`}>{formatPkr(pricing.originalPrice)}</span>;
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className={styles.sale}>{formatPkr(pricing.effectivePrice)}</span>
      <span className={styles.original}>{formatPkr(pricing.originalPrice)}</span>
      <span
        className={`rounded-md bg-[#ff7a1a]/20 px-2 py-0.5 text-[#ff9a4d] ${styles.badge}`}
      >
        −{pricing.discountPercent}%
      </span>
    </div>
  );
}

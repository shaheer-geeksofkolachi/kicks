import type { Product } from "@/lib/types";

export type ProductPricing = {
  originalPrice: number;
  salePrice: number | null;
  effectivePrice: number;
  discountPercent: number;
  hasDiscount: boolean;
};

export function getProductPricing(product: Pick<Product, "price_pkr" | "discount_price_pkr">): ProductPricing {
  const originalPrice = product.price_pkr;
  const salePrice =
    product.discount_price_pkr != null && product.discount_price_pkr < originalPrice
      ? product.discount_price_pkr
      : null;
  const effectivePrice = salePrice ?? originalPrice;
  const discountPercent =
    salePrice != null ? Math.round(((originalPrice - salePrice) / originalPrice) * 100) : 0;

  return {
    originalPrice,
    salePrice,
    effectivePrice,
    discountPercent,
    hasDiscount: salePrice != null,
  };
}

export function parseDiscountPricePkr(
  raw: string,
  pricePkr: number,
): { ok: true; value: number | null } | { ok: false; error: string } {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: true, value: null };
  }

  const discount = Number(trimmed);
  if (!Number.isFinite(discount) || discount < 0) {
    return { ok: false, error: "Discounted price must be a valid amount." };
  }

  const rounded = Math.round(discount);
  if (rounded >= pricePkr) {
    return { ok: false, error: "Discounted price must be less than the original price." };
  }

  return { ok: true, value: rounded };
}

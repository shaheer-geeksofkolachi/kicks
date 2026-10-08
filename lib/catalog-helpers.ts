import { getProductPricing } from "@/lib/pricing";
import type { Product } from "@/lib/types";

export const HOME_DEALS_LIMIT = 8;
export const HOME_ALL_LIMIT = 8;
export const HOME_SOLD_LIMIT = 4;

export function filterDiscountedProducts(products: Product[]): Product[] {
  return products.filter((p) => getProductPricing(p).hasDiscount);
}

export function filterSoldProducts(products: Product[]): Product[] {
  return products.filter((p) => p.is_sold);
}

export function sortDealsByDiscount(products: Product[]): Product[] {
  return [...products].sort((a, b) => {
    const pa = getProductPricing(a);
    const pb = getProductPricing(b);
    if (pb.discountPercent !== pa.discountPercent) {
      return pb.discountPercent - pa.discountPercent;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

export function sortByNewest(products: Product[]): Product[] {
  return [...products].sort((a, b) => {
    const createdDiff =
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (createdDiff !== 0) return createdDiff;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });
}

export function homeDealsPreview(products: Product[]): Product[] {
  return sortDealsByDiscount(filterDiscountedProducts(products)).slice(0, HOME_DEALS_LIMIT);
}

export function homeAllPreview(products: Product[]): Product[] {
  return sortByNewest(products).slice(0, HOME_ALL_LIMIT);
}

export function homeSoldPreview(products: Product[]): Product[] {
  return sortByNewest(filterSoldProducts(products)).slice(0, HOME_SOLD_LIMIT);
}

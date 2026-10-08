import { getStoragePublicUrl } from "@/lib/media";
import type { ProductReviewWithListing } from "@/lib/types";

export function reviewImageUrl(review: ProductReviewWithListing): string | null {
  if (review.kind !== "image" || !review.image_storage_path) return null;
  return getStoragePublicUrl(review.image_storage_path);
}

export type MediaKind = "image" | "video";

export type ProductMedia = {
  id: string;
  product_id: string;
  kind: MediaKind;
  storage_path: string;
  sort_order: number;
};

export type Product = {
  id: string;
  name: string;
  brand: string;
  description: string | null;
  price_pkr: number;
  discount_price_pkr: number | null;
  sizes: string[];
  size_unit: string;
  is_sold: boolean;
  created_at: string;
  updated_at: string;
  product_media?: ProductMedia[];
};

export type ReviewKind = "text" | "image";

export type ProductReview = {
  id: string;
  product_id: string;
  customer_name: string | null;
  kind: ReviewKind;
  body_text: string | null;
  image_storage_path: string | null;
  created_at: string;
};

export type ProductReviewWithListing = ProductReview & {
  product_name: string;
  product_brand: string;
};

export type SessionData = {
  isAdmin?: boolean;
};

import { getStoragePublicUrl } from "@/lib/media";
import { createClient } from "@/lib/supabase/server";
import type { ProductReviewAdmin, ProductReviewWithListing } from "@/lib/types";

const REVIEW_SELECT = `
  id,
  product_id,
  customer_name,
  kind,
  body_text,
  image_storage_path,
  created_at,
  products (
    name,
    brand
  )
`;

type ReviewRow = {
  id: string;
  product_id: string;
  customer_name: string | null;
  kind: "text" | "image";
  body_text: string | null;
  image_storage_path: string | null;
  created_at: string;
  products: { name: string; brand: string } | { name: string; brand: string }[] | null;
};

function mapReview(row: ReviewRow): ProductReviewWithListing | null {
  const product = Array.isArray(row.products) ? row.products[0] : row.products;
  if (!product) return null;
  const imageUrl =
    row.kind === "image" && row.image_storage_path
      ? getStoragePublicUrl(row.image_storage_path)
      : null;

  return {
    id: row.id,
    product_id: row.product_id,
    customer_name: row.customer_name,
    kind: row.kind,
    body_text: row.body_text,
    image_storage_path: row.image_storage_path,
    created_at: row.created_at,
    product_name: product.name,
    product_brand: product.brand,
    image_url: imageUrl || null,
  };
}

export async function fetchProductReviews(limit?: number): Promise<ProductReviewWithListing[]> {
  const supabase = await createClient();
  let query = supabase
    .from("product_reviews")
    .select(REVIEW_SELECT)
    .order("created_at", { ascending: false });

  if (limit != null) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) {
    console.error("fetchProductReviews:", error.message);
    return [];
  }

  return (data as ReviewRow[]).map(mapReview).filter((r): r is ProductReviewWithListing => r != null);
}

function mapReviewAdmin(row: {
  id: string;
  product_id: string;
  customer_name: string | null;
  kind: "text" | "image";
  body_text: string | null;
  image_storage_path: string | null;
  created_at: string;
}): ProductReviewAdmin {
  const imageUrl =
    row.kind === "image" && row.image_storage_path
      ? getStoragePublicUrl(row.image_storage_path)
      : null;
  return {
    id: row.id,
    product_id: row.product_id,
    customer_name: row.customer_name,
    kind: row.kind,
    body_text: row.body_text,
    image_storage_path: row.image_storage_path,
    created_at: row.created_at,
    image_url: imageUrl || null,
  };
}

export async function fetchProductReviewByProductId(productId: string): Promise<ProductReviewAdmin | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_reviews")
    .select("id, product_id, customer_name, kind, body_text, image_storage_path, created_at")
    .eq("product_id", productId)
    .maybeSingle();
  if (error || !data) {
    if (error) console.error("fetchProductReviewByProductId:", error.message);
    return null;
  }
  return mapReviewAdmin(data as ProductReviewAdmin);
}

export async function fetchReviewsByProductId(): Promise<Record<string, ProductReviewAdmin>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("product_reviews").select(
    "id, product_id, customer_name, kind, body_text, image_storage_path, created_at",
  );
  if (error) {
    console.error("fetchReviewsByProductId:", error.message);
    return {};
  }
  const out: Record<string, ProductReviewAdmin> = {};
  for (const row of data ?? []) {
    const review = mapReviewAdmin(row as ProductReviewAdmin);
    out[review.product_id] = review;
  }
  return out;
}

export async function productHasReview(productId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_reviews")
    .select("id")
    .eq("product_id", productId)
    .maybeSingle();
  if (error) {
    console.error("productHasReview:", error.message);
    return false;
  }
  return Boolean(data);
}

export async function fetchReviewProductIds(): Promise<Set<string>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("product_reviews").select("product_id");
  if (error) {
    console.error("fetchReviewProductIds:", error.message);
    return new Set();
  }
  return new Set((data ?? []).map((r) => r.product_id as string));
}

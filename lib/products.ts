import type { Product } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

const PRODUCT_SELECT = `
  id,
  name,
  brand,
  description,
  price_pkr,
  sizes,
  size_unit,
  is_sold,
  created_at,
  updated_at,
  product_media (
    id,
    product_id,
    kind,
    storage_path,
    sort_order
  )
`;

export async function fetchProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("fetchProducts:", error.message);
    return [];
  }

  return (data ?? []) as Product[];
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as Product;
}

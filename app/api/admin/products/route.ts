import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { parseProductWriteRequest } from "@/lib/admin-product-payload";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      `id, name, brand, description, price_pkr, discount_price_pkr, sizes, size_unit, is_sold, created_at, updated_at,
      product_media (id, product_id, kind, storage_path, sort_order)`,
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ products: data ?? [] });
}

export async function POST(request: Request) {
  try {
    await requireAdmin(request);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = await parseProductWriteRequest(request);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  }

  const { data: payload } = parsed;
  const supabase = createAdminClient();
  const { data: product, error } = await supabase
    .from("products")
    .insert({
      name: payload.name,
      brand: payload.brand,
      description: payload.description,
      price_pkr: payload.price_pkr,
      discount_price_pkr: payload.discount_price_pkr,
      sizes: payload.sizes,
      size_unit: payload.size_unit,
      is_sold: payload.is_sold,
    })
    .select("id")
    .single();

  if (error || !product) {
    return NextResponse.json({ error: error?.message ?? "Create failed" }, { status: 500 });
  }

  return NextResponse.json({ id: product.id });
}

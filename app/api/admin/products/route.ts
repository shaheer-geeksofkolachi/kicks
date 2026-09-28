import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { uploadProductFiles } from "@/lib/admin-products";
import { isAllowedBrand } from "@/lib/brands";
import { parseDiscountPricePkr } from "@/lib/pricing";
import { CATALOG_SIZE_UNIT, parseAdminSizesInput } from "@/lib/sizes";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    await requireAdmin();
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
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const name = String(form.get("name") ?? "").trim();
  const brand = String(form.get("brand") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const priceRaw = Number(form.get("price_pkr"));
  const sizesParsed = parseAdminSizesInput(String(form.get("sizes") ?? ""));
  if (!sizesParsed.ok) {
    return NextResponse.json({ error: sizesParsed.error }, { status: 400 });
  }
  const sizes = sizesParsed.sizes;
  const size_unit = CATALOG_SIZE_UNIT;
  const isSold = form.get("is_sold") === "true";
  const files = form.getAll("media").filter((f): f is File => f instanceof File && f.size > 0);

  if (!name || !brand || !Number.isFinite(priceRaw) || priceRaw < 0) {
    return NextResponse.json({ error: "Name, brand, and valid price are required" }, { status: 400 });
  }
  if (!isAllowedBrand(brand)) {
    return NextResponse.json({ error: "Please select a valid brand" }, { status: 400 });
  }

  const price_pkr = Math.round(priceRaw);
  const discountParsed = parseDiscountPricePkr(String(form.get("discount_price_pkr") ?? ""), price_pkr);
  if (!discountParsed.ok) {
    return NextResponse.json({ error: discountParsed.error }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: product, error } = await supabase
    .from("products")
    .insert({
      name,
      brand,
      description: description || null,
      price_pkr,
      discount_price_pkr: discountParsed.value,
      sizes,
      size_unit,
      is_sold: isSold,
    })
    .select("id")
    .single();

  if (error || !product) {
    return NextResponse.json({ error: error?.message ?? "Create failed" }, { status: 500 });
  }

  try {
    if (files.length) {
      await uploadProductFiles(product.id, files, 0);
    }
  } catch (e) {
    await supabase.from("products").delete().eq("id", product.id);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Upload failed" }, { status: 500 });
  }

  return NextResponse.json({ id: product.id });
}

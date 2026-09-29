import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { deleteMediaByIds, deleteProductAndMedia, uploadProductFiles } from "@/lib/admin-products";
import { isAllowedBrand } from "@/lib/brands";
import { parseDiscountPricePkr } from "@/lib/pricing";
import { CATALOG_SIZE_UNIT, parseAdminSizesInput } from "@/lib/sizes";
import { createAdminClient } from "@/lib/supabase/admin";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
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
  const removeMediaIds = String(form.get("remove_media_ids") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const files = form.getAll("media").filter((f): f is File => f instanceof File && f.size > 0);

  if (!name || !Number.isFinite(priceRaw) || priceRaw < 0) {
    return NextResponse.json({ error: "Name and valid price are required" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: existing } = await supabase.from("products").select("brand").eq("id", id).single();
  if (!isAllowedBrand(brand, existing?.brand ? [existing.brand] : [])) {
    return NextResponse.json({ error: "Please select a valid brand" }, { status: 400 });
  }

  const price_pkr = Math.round(priceRaw);
  const discountParsed = parseDiscountPricePkr(String(form.get("discount_price_pkr") ?? ""), price_pkr);
  if (!discountParsed.ok) {
    return NextResponse.json({ error: discountParsed.error }, { status: 400 });
  }

  const { error } = await supabase
    .from("products")
    .update({
      name,
      brand,
      description: description || null,
      price_pkr,
      discount_price_pkr: discountParsed.value,
      sizes,
      size_unit,
      is_sold: isSold,
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  try {
    if (removeMediaIds.length) {
      await deleteMediaByIds(removeMediaIds);
    }
    if (files.length) {
      const { data: existing } = await supabase
        .from("product_media")
        .select("sort_order")
        .eq("product_id", id)
        .order("sort_order", { ascending: false })
        .limit(1);
      const start = existing?.[0]?.sort_order != null ? existing[0].sort_order + 1 : 0;
      await uploadProductFiles(id, files, start);
    }
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Media update failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    await deleteProductAndMedia(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Delete failed" }, { status: 500 });
  }
}

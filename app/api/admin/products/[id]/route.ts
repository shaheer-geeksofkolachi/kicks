import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { deleteMediaByIds, deleteProductAndMedia } from "@/lib/admin-products";
import { parseProductWriteRequest } from "@/lib/admin-product-payload";
import { createAdminClient } from "@/lib/supabase/admin";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdmin(request);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const supabase = createAdminClient();

  const { data: existingProduct } = await supabase
    .from("products")
    .select("brand")
    .eq("id", id)
    .single();

  if (!existingProduct) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const parsed = await parseProductWriteRequest(request, existingProduct.brand);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  }

  const payload = parsed.data;
  const { error } = await supabase
    .from("products")
    .update({
      name: payload.name,
      brand: payload.brand,
      description: payload.description,
      price_pkr: payload.price_pkr,
      discount_price_pkr: payload.discount_price_pkr,
      sizes: payload.sizes,
      size_unit: payload.size_unit,
      is_sold: payload.is_sold,
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  try {
    if (payload.remove_media_ids.length) {
      await deleteMediaByIds(payload.remove_media_ids);
    }
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Media update failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    await requireAdmin(request);
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

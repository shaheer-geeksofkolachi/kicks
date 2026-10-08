import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { sanitizeFilename } from "@/lib/admin-products";
import { requireAdmin } from "@/lib/auth";
import { uploadToS3 } from "@/lib/s3";
import { createAdminClient } from "@/lib/supabase/admin";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    await requireAdmin(request);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: productId } = await context.params;
  const supabase = createAdminClient();

  const { data: product } = await supabase.from("products").select("id, is_sold").eq("id", productId).maybeSingle();
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  if (!product.is_sold) {
    return NextResponse.json({ error: "Mark the product as sold before adding a review." }, { status: 400 });
  }

  const form = await request.formData();
  const customerName = String(form.get("customer_name") ?? "").trim();
  const kind = String(form.get("kind") ?? "").trim();
  const bodyText = String(form.get("body_text") ?? "").trim();
  const imageFile = form.get("image");

  if (kind !== "text" && kind !== "image") {
    return NextResponse.json({ error: "Review type must be text or image." }, { status: 400 });
  }

  let imageStoragePath: string | null = null;

  if (kind === "text") {
    if (!bodyText) {
      return NextResponse.json({ error: "Review text is required." }, { status: 400 });
    }
  } else {
    if (!(imageFile instanceof File) || imageFile.size <= 0) {
      return NextResponse.json({ error: "Review image is required." }, { status: 400 });
    }
    if (!imageFile.type.startsWith("image/")) {
      return NextResponse.json({ error: "Review file must be an image." }, { status: 400 });
    }
    const maxBytes = 4 * 1024 * 1024;
    if (imageFile.size > maxBytes) {
      return NextResponse.json({ error: "Review image must be under 4MB." }, { status: 413 });
    }
    imageStoragePath = `reviews/${productId}/${randomUUID()}-${sanitizeFilename(imageFile.name)}`;
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    await uploadToS3(imageStoragePath, buffer, imageFile.type);
  }

  const { data, error } = await supabase
    .from("product_reviews")
    .upsert(
      {
        product_id: productId,
        customer_name: customerName || null,
        kind,
        body_text: kind === "text" ? bodyText : null,
        image_storage_path: imageStoragePath,
      },
      { onConflict: "product_id" },
    )
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}

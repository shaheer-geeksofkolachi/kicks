import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { parseReviewFormData } from "@/lib/admin-product-review";
import { sanitizeFilename } from "@/lib/admin-products";
import { requireAdmin } from "@/lib/auth";
import { deleteFromS3, uploadToS3 } from "@/lib/s3";
import { createAdminClient } from "@/lib/supabase/admin";

type RouteContext = { params: Promise<{ id: string }> };

type ExistingReview = {
  id: string;
  kind: string;
  image_storage_path: string | null;
};

async function loadExistingReview(productId: string): Promise<ExistingReview | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("product_reviews")
    .select("id, kind, image_storage_path")
    .eq("product_id", productId)
    .maybeSingle();
  return data;
}

async function ensureSoldProduct(productId: string) {
  const supabase = createAdminClient();
  const { data: product } = await supabase.from("products").select("id, is_sold").eq("id", productId).maybeSingle();
  if (!product) {
    return { error: NextResponse.json({ error: "Product not found" }, { status: 404 }) };
  }
  if (!product.is_sold) {
    return {
      error: NextResponse.json({ error: "Mark the product as sold before managing a review." }, { status: 400 }),
    };
  }
  return { product };
}

export async function POST(request: Request, context: RouteContext) {
  try {
    await requireAdmin(request);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: productId } = await context.params;
  const soldCheck = await ensureSoldProduct(productId);
  if (soldCheck.error) return soldCheck.error;

  const existing = await loadExistingReview(productId);
  if (existing) {
    return NextResponse.json({ error: "A review already exists. Use edit instead." }, { status: 409 });
  }

  const form = await request.formData();
  const parsed = parseReviewFormData(form);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { customerName, kind, bodyText, imageFile } = parsed.data;
  let imageStoragePath: string | null = null;

  if (kind === "image") {
    if (!imageFile) {
      return NextResponse.json({ error: "Review image is required." }, { status: 400 });
    }
    imageStoragePath = `products/${productId}/reviews/${randomUUID()}-${sanitizeFilename(imageFile.name)}`;
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    await uploadToS3(imageStoragePath, buffer, imageFile.type);
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("product_reviews")
    .insert({
      product_id: productId,
      customer_name: customerName,
      kind,
      body_text: bodyText,
      image_storage_path: imageStoragePath,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdmin(request);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: productId } = await context.params;
  const soldCheck = await ensureSoldProduct(productId);
  if (soldCheck.error) return soldCheck.error;

  const existing = await loadExistingReview(productId);
  if (!existing) {
    return NextResponse.json({ error: "No review to update." }, { status: 404 });
  }

  const form = await request.formData();
  const parsed = parseReviewFormData(form);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { customerName, kind, bodyText, imageFile } = parsed.data;
  let imageStoragePath: string | null = kind === "image" ? existing.image_storage_path : null;
  const keysToDelete: string[] = [];

  if (kind === "image") {
    if (imageFile) {
      imageStoragePath = `products/${productId}/reviews/${randomUUID()}-${sanitizeFilename(imageFile.name)}`;
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      await uploadToS3(imageStoragePath, buffer, imageFile.type);
      if (existing.image_storage_path && existing.image_storage_path !== imageStoragePath) {
        keysToDelete.push(existing.image_storage_path);
      }
    } else if (!imageStoragePath) {
      return NextResponse.json({ error: "Review image is required." }, { status: 400 });
    }
  } else if (existing.image_storage_path) {
    keysToDelete.push(existing.image_storage_path);
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("product_reviews")
    .update({
      customer_name: customerName,
      kind,
      body_text: bodyText,
      image_storage_path: imageStoragePath,
    })
    .eq("product_id", productId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (keysToDelete.length) {
    await deleteFromS3(keysToDelete).catch(() => undefined);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    await requireAdmin(request);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: productId } = await context.params;
  const existing = await loadExistingReview(productId);
  if (!existing) {
    return NextResponse.json({ error: "No review to delete." }, { status: 404 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("product_reviews").delete().eq("product_id", productId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (existing.image_storage_path) {
    await deleteFromS3([existing.image_storage_path]).catch(() => undefined);
  }

  return NextResponse.json({ ok: true });
}

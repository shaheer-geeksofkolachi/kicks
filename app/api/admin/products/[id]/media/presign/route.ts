import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  buildProductMediaStoragePath,
  isAllowedUploadContentType,
  mediaKindFromContentType,
} from "@/lib/admin-products";
import { requireAdmin } from "@/lib/auth";
import { createPresignedProductUploadUrl } from "@/lib/s3-presign";
import { createAdminClient } from "@/lib/supabase/admin";

type RouteContext = { params: Promise<{ id: string }> };

type PresignBody = {
  startOrder?: number;
  /** When set, must match `files` length (e.g. `[0]` for thumbnail). */
  sortOrders?: number[];
  files?: { name: string; contentType: string }[];
};

export async function POST(request: Request, context: RouteContext) {
  try {
    await requireAdmin(request);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: productId } = await context.params;
  let body: PresignBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const files = body.files ?? [];
  if (!files.length) {
    return NextResponse.json({ error: "No files requested" }, { status: 400 });
  }
  if (files.length > 20) {
    return NextResponse.json({ error: "Too many files (max 20 per batch)" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id")
    .eq("id", productId)
    .maybeSingle();

  if (productError || !product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const explicitOrders = body.sortOrders;
  if (explicitOrders && explicitOrders.length !== files.length) {
    return NextResponse.json({ error: "sortOrders must match files length" }, { status: 400 });
  }

  let startOrder = 0;
  if (!explicitOrders) {
    if (body.startOrder != null && Number.isFinite(body.startOrder)) {
      startOrder = Math.max(0, Math.floor(body.startOrder));
    } else {
      const { data: last } = await supabase
        .from("product_media")
        .select("sort_order")
        .eq("product_id", productId)
        .order("sort_order", { ascending: false })
        .limit(1);
      startOrder = last?.[0]?.sort_order != null ? last[0].sort_order + 1 : 0;
    }
  }

  const uploads = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const contentType = (file.contentType || "application/octet-stream").trim();
    if (!isAllowedUploadContentType(contentType)) {
      return NextResponse.json({ error: `Unsupported file type: ${contentType}` }, { status: 400 });
    }
    const name = file.name?.trim() || `upload-${randomUUID()}`;
    const storagePath = buildProductMediaStoragePath(productId, name);
    const uploadUrl = await createPresignedProductUploadUrl(storagePath, contentType);
    const sortOrder = explicitOrders
      ? Math.max(0, Math.floor(explicitOrders[i]))
      : startOrder + i;
    uploads.push({
      storagePath,
      uploadUrl,
      kind: mediaKindFromContentType(contentType),
      sortOrder,
    });
  }

  return NextResponse.json({ uploads });
}

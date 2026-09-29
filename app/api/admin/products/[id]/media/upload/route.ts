import { NextResponse } from "next/server";
import { uploadProductFiles } from "@/lib/admin-products";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

type RouteContext = { params: Promise<{ id: string }> };

/** One file per request — stays under Vercel's ~4.5MB body limit (fallback when S3 CORS blocks browser PUT). */
export async function POST(request: Request, context: RouteContext) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: productId } = await context.params;
  const supabase = createAdminClient();
  const { data: product } = await supabase.from("products").select("id").eq("id", productId).maybeSingle();
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const form = await request.formData();
  const file = form.get("file");
  const sortOrderRaw = form.get("sortOrder");
  const sortOrder = Number.isFinite(Number(sortOrderRaw)) ? Math.max(0, Math.floor(Number(sortOrderRaw))) : 0;

  if (!(file instanceof File) || file.size <= 0) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const maxBytes = 4 * 1024 * 1024;
  if (file.size > maxBytes) {
    return NextResponse.json(
      {
        error:
          "This file is over 4MB. Configure S3 CORS (docs/s3-cors-example.json) for direct uploads, or use a smaller image.",
      },
      { status: 413 },
    );
  }

  try {
    await uploadProductFiles(productId, [file], sortOrder);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Upload failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

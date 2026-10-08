import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { MediaKind } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

type CommitBody = {
  items?: { storagePath: string; kind: MediaKind; sortOrder: number }[];
};

export async function POST(request: Request, context: RouteContext) {
  try {
    await requireAdmin(request);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: productId } = await context.params;
  let body: CommitBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const items = body.items ?? [];
  if (!items.length) {
    return NextResponse.json({ ok: true });
  }

  for (const item of items) {
    if (!item.storagePath?.startsWith(`products/${productId}/`)) {
      return NextResponse.json({ error: "Invalid storage path" }, { status: 400 });
    }
    if (item.kind !== "image" && item.kind !== "video") {
      return NextResponse.json({ error: "Invalid media kind" }, { status: 400 });
    }
  }

  const supabase = createAdminClient();
  const rows = items.map((item) => ({
    product_id: productId,
    kind: item.kind,
    storage_path: item.storagePath,
    sort_order: item.sortOrder,
  }));

  const { error } = await supabase.from("product_media").insert(rows);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

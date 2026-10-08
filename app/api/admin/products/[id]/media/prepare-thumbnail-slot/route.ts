import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

type RouteContext = { params: Promise<{ id: string }> };

/** Shift existing media sort_order +1 so a new thumbnail can use index 0. */
export async function POST(request: Request, context: RouteContext) {
  try {
    await requireAdmin(request);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: productId } = await context.params;
  const supabase = createAdminClient();

  const { data: rows, error: fetchError } = await supabase
    .from("product_media")
    .select("id, sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: false });

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!rows?.length) {
    return NextResponse.json({ ok: true, shifted: 0 });
  }

  for (const row of rows) {
    const { error } = await supabase
      .from("product_media")
      .update({ sort_order: row.sort_order + 1 })
      .eq("id", row.id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, shifted: rows.length });
}

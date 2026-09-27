import { randomUUID } from "crypto";
import { deleteFromS3, uploadToS3 } from "@/lib/s3";
import { createAdminClient } from "@/lib/supabase/admin";
import type { MediaKind } from "@/lib/types";

function mediaKindFromFile(file: File): MediaKind {
  return file.type.startsWith("video/") ? "video" : "image";
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function uploadProductFiles(productId: string, files: File[], startOrder: number) {
  const supabase = createAdminClient();
  const rows: { product_id: string; kind: MediaKind; storage_path: string; sort_order: number }[] =
    [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const path = `products/${productId}/${randomUUID()}-${sanitizeFilename(file.name)}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await uploadToS3(path, buffer, file.type || undefined);
    rows.push({
      product_id: productId,
      kind: mediaKindFromFile(file),
      storage_path: path,
      sort_order: startOrder + i,
    });
  }

  if (rows.length) {
    const { error } = await supabase.from("product_media").insert(rows);
    if (error) throw new Error(error.message);
  }
}

export async function deleteMediaByIds(mediaIds: string[]) {
  if (!mediaIds.length) return;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("product_media")
    .select("id, storage_path")
    .in("id", mediaIds);
  if (error) throw new Error(error.message);
  if (data?.length) {
    const paths = data.map((m) => m.storage_path);
    await deleteFromS3(paths);
    const { error: delError } = await supabase.from("product_media").delete().in("id", mediaIds);
    if (delError) throw new Error(delError.message);
  }
}

export async function deleteProductAndMedia(productId: string) {
  const supabase = createAdminClient();
  const { data: media } = await supabase
    .from("product_media")
    .select("storage_path")
    .eq("product_id", productId);
  if (media?.length) {
    await deleteFromS3(media.map((m) => m.storage_path));
  }
  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) throw new Error(error.message);
}

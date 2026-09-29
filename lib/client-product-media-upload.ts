import type { MediaKind } from "@/lib/types";

type PresignFile = { name: string; contentType: string };
type PresignUpload = {
  storagePath: string;
  uploadUrl: string;
  kind: MediaKind;
  sortOrder: number;
};

export async function uploadProductMediaClient(
  productId: string,
  files: File[],
  startOrder: number,
): Promise<void> {
  if (!files.length) return;

  const presignRes = await fetch(`/api/admin/products/${productId}/media/presign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      startOrder,
      files: files.map((f) => ({
        name: f.name,
        contentType: f.type || "application/octet-stream",
      })) satisfies PresignFile[],
    }),
  });

  const presignJson = await presignRes.json().catch(() => ({}));
  if (!presignRes.ok) {
    throw new Error(presignJson.error ?? "Could not start upload");
  }

  const uploads = presignJson.uploads as PresignUpload[];
  if (!Array.isArray(uploads) || uploads.length !== files.length) {
    throw new Error("Invalid upload response from server");
  }

  const results = await Promise.all(
    uploads.map(async (upload, index) => {
      const file = files[index];
      const putRes = await fetch(upload.uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
      });
      if (!putRes.ok) {
        throw new Error(`Upload failed for ${file.name}`);
      }
      return upload;
    }),
  );

  const commitRes = await fetch(`/api/admin/products/${productId}/media/commit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: results.map((u) => ({
        storagePath: u.storagePath,
        kind: u.kind,
        sortOrder: u.sortOrder,
      })),
    }),
  });

  const commitJson = await commitRes.json().catch(() => ({}));
  if (!commitRes.ok) {
    throw new Error(commitJson.error ?? "Could not save uploaded media");
  }
}

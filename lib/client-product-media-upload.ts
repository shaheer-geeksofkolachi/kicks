import type { MediaKind } from "@/lib/types";

type PresignUpload = {
  storagePath: string;
  uploadUrl: string;
  kind: MediaKind;
  sortOrder: number;
};

function isLikelyCorsOrNetworkError(err: unknown): boolean {
  if (err instanceof TypeError) return true;
  if (err instanceof Error) {
    const m = err.message.toLowerCase();
    return m.includes("failed to fetch") || m.includes("networkerror") || m.includes("load failed");
  }
  return false;
}

async function commitMediaItems(
  productId: string,
  items: { storagePath: string; kind: MediaKind; sortOrder: number }[],
) {
  const commitRes = await fetch(`/api/admin/products/${productId}/media/commit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  const commitJson = await commitRes.json().catch(() => ({}));
  if (!commitRes.ok) {
    throw new Error(commitJson.error ?? "Could not save uploaded media");
  }
}

async function uploadViaPresignedPut(upload: PresignUpload, file: File): Promise<void> {
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
}

async function uploadViaServerProxy(
  productId: string,
  file: File,
  sortOrder: number,
): Promise<void> {
  const form = new FormData();
  form.append("file", file);
  form.append("sortOrder", String(sortOrder));
  const res = await fetch(`/api/admin/products/${productId}/media/upload`, {
    method: "POST",
    body: form,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error ?? `Server upload failed for ${file.name}`);
  }
}

type UploadOneOptions = {
  sortOrder?: number;
};

async function uploadOneFile(productId: string, file: File, options?: UploadOneOptions): Promise<void> {
  const presignBody: Record<string, unknown> = {
    files: [{ name: file.name, contentType: file.type || "application/octet-stream" }],
  };
  if (options?.sortOrder != null) {
    presignBody.sortOrders = [options.sortOrder];
  }

  const presignRes = await fetch(`/api/admin/products/${productId}/media/presign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(presignBody),
  });

  const presignJson = await presignRes.json().catch(() => ({}));
  if (!presignRes.ok) {
    throw new Error(presignJson.error ?? "Could not start upload");
  }

  const uploads = presignJson.uploads as PresignUpload[];
  const upload = uploads?.[0];
  if (!upload) {
    throw new Error("Invalid upload response from server");
  }

  try {
    await uploadViaPresignedPut(upload, file);
    await commitMediaItems(productId, [
      { storagePath: upload.storagePath, kind: upload.kind, sortOrder: upload.sortOrder },
    ]);
  } catch (err) {
    const useProxy =
      isLikelyCorsOrNetworkError(err) ||
      (err instanceof Error && err.message.toLowerCase().includes("upload failed"));
    if (!useProxy) throw err;
    await uploadViaServerProxy(productId, file, upload.sortOrder);
  }
}

export async function uploadProductMediaClient(productId: string, files: File[]): Promise<void> {
  for (let i = 0; i < files.length; i++) {
    await uploadOneFile(productId, files[i]);
  }
}

export async function uploadProductThumbnailClient(
  productId: string,
  file: File,
  shiftExisting: boolean,
): Promise<void> {
  if (shiftExisting) {
    const slotRes = await fetch(`/api/admin/products/${productId}/media/prepare-thumbnail-slot`, {
      method: "POST",
    });
    const slotJson = await slotRes.json().catch(() => ({}));
    if (!slotRes.ok) {
      throw new Error(slotJson.error ?? "Could not prepare thumbnail slot");
    }
  }
  await uploadOneFile(productId, file, { sortOrder: 0 });
}

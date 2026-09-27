import type { ProductMedia } from "@/lib/types";

/** S3 object key stored in `product_media.storage_path` */
export function getStoragePublicUrl(storagePath: string): string {
  const customBase = process.env.NEXT_PUBLIC_S3_PUBLIC_URL_BASE;
  if (customBase) {
    return `${customBase.replace(/\/$/, "")}/${storagePath.split("/").map(encodeURIComponent).join("/")}`;
  }

  const bucket = process.env.NEXT_PUBLIC_AWS_S3_BUCKET;
  const region = process.env.NEXT_PUBLIC_AWS_REGION;
  if (!bucket || !region) return "";

  const encodedKey = storagePath.split("/").map(encodeURIComponent).join("/");
  return `https://${bucket}.s3.${region}.amazonaws.com/${encodedKey}`;
}

export function sortMedia(media: ProductMedia[]): ProductMedia[] {
  return [...media].sort((a, b) => a.sort_order - b.sort_order);
}

export function primaryImageUrl(media: ProductMedia[] | undefined): string | null {
  if (!media?.length) return null;
  const sorted = sortMedia(media);
  const firstImage = sorted.find((m) => m.kind === "image");
  const pick = firstImage ?? sorted[0];
  return getStoragePublicUrl(pick.storage_path);
}

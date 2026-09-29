"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getStoragePublicUrl, sortMedia } from "@/lib/media";
import { uploadProductMediaClient } from "@/lib/client-product-media-upload";
import type { Product } from "@/lib/types";
import { BrandSelect } from "@/components/BrandSelect";
import { MediaUploadField } from "@/components/admin/MediaUploadField";
import { PriceDiscountFields } from "@/components/admin/PriceDiscountFields";
import { SizeMultiSelect } from "@/components/admin/SizeMultiSelect";
import { CATALOG_SIZE_UNIT, SIZE_MAX, SIZE_MIN, sizesToSelectableValues } from "@/lib/sizes";

type ProductFormProps = {
  product?: Product;
};

function buildProductJson(form: HTMLFormElement, removeIds: string[]) {
  const data = new FormData(form);
  const isSoldEl = form.elements.namedItem("is_sold") as HTMLInputElement | null;
  return {
    name: String(data.get("name") ?? "").trim(),
    brand: String(data.get("brand") ?? "").trim(),
    description: String(data.get("description") ?? "").trim(),
    price_pkr: String(data.get("price_pkr") ?? ""),
    discount_price_pkr: String(data.get("discount_price_pkr") ?? ""),
    sizes: String(data.get("sizes") ?? ""),
    is_sold: isSoldEl?.checked ?? false,
    remove_media_ids: removeIds,
  };
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const isEdit = Boolean(product);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removeIds, setRemoveIds] = useState<string[]>([]);
  const [newMediaFiles, setNewMediaFiles] = useState<File[]>([]);
  const existingMedia = product?.product_media ? sortMedia(product.product_media) : [];
  const [selectedSizes, setSelectedSizes] = useState<string[]>(() =>
    product?.sizes?.length
      ? sizesToSelectableValues(product.sizes, product.size_unit ?? CATALOG_SIZE_UNIT)
      : [],
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const form = e.currentTarget;
    const payload = buildProductJson(form, removeIds);

    const url = isEdit ? `/api/admin/products/${product!.id}` : "/api/admin/products";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(json.error ?? "Save failed");
      setSaving(false);
      return;
    }

    const productId = isEdit ? product!.id : (json.id as string);

    if (newMediaFiles.length) {
      try {
        await uploadProductMediaClient(productId, newMediaFiles, 0);
      } catch (uploadErr) {
        if (!isEdit) {
          await fetch(`/api/admin/products/${productId}`, { method: "DELETE" }).catch(() => undefined);
        }
        setError(
          uploadErr instanceof Error
            ? `${uploadErr.message}. If uploads fail from the browser, add S3 CORS for your site domain (see docs/s3-cors-example.json).`
            : "Upload failed",
        );
        setSaving(false);
        return;
      }
    }

    router.push("/admin");
    router.refresh();
  }

  function toggleRemoveMedia(id: string) {
    setRemoveIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-5">
      {error && (
        <p className="rounded-lg border border-red-800 bg-red-950/50 px-4 py-2 text-sm text-red-200">{error}</p>
      )}

      <Field label="Name" name="name" required defaultValue={product?.name} />
      <div>
        <label className="mb-1 block text-sm text-zinc-400">
          Brand <span className="text-zinc-600">(optional)</span>
        </label>
        <BrandSelect
          name="brand"
          defaultValue={product?.brand ?? ""}
          extraBrands={product?.brand ? [product.brand] : []}
          placeholder="Search brands or leave empty…"
        />
      </div>
      <PriceDiscountFields
        initialPrice={product?.price_pkr}
        initialDiscount={product?.discount_price_pkr ?? null}
      />
      <div>
        <label className="mb-1 block text-sm text-zinc-400">Description</label>
        <textarea
          name="description"
          rows={4}
          defaultValue={product?.description ?? ""}
          className="w-full rounded-lg border border-zinc-700 bg-[#141414] px-3 py-2 text-sm text-white outline-none ring-[#FF8C00] focus:ring-2"
        />
      </div>
      <input type="hidden" name="size_unit" value={CATALOG_SIZE_UNIT} />
      <div>
        <label className="mb-1 block text-sm text-zinc-400">Size unit</label>
        <div
          className="w-full rounded-lg border border-zinc-700 bg-[#141414] px-3 py-2.5 text-sm font-semibold text-[#FFD700]"
          aria-readonly="true"
        >
          EU (fixed)
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm text-zinc-400">Sizes (EU)</label>
        <SizeMultiSelect name="sizes" value={selectedSizes} onChange={setSelectedSizes} required />
        <p className="mt-1 text-xs text-zinc-500">
          Choose one or more sizes from {SIZE_MIN} to {SIZE_MAX}.
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm text-zinc-300">
        <input
          type="checkbox"
          name="is_sold"
          defaultChecked={product?.is_sold}
          className="rounded border-zinc-600"
        />
        Mark as sold
      </label>

      {isEdit && existingMedia.length > 0 && (
        <div>
          <p className="mb-2 text-sm text-zinc-400">Existing media (check to remove on save)</p>
          <div className="grid grid-cols-3 gap-3">
            {existingMedia.map((m) => {
              const marked = removeIds.includes(m.id);
              const url = getStoragePublicUrl(m.storage_path);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggleRemoveMedia(m.id)}
                  className={`relative aspect-square overflow-hidden rounded-lg border-2 ${
                    marked ? "border-red-500 opacity-50" : "border-zinc-700"
                  }`}
                >
                  {m.kind === "video" ? (
                    <video src={url} className="h-full w-full object-cover" muted />
                  ) : (
                    <Image src={url} alt="" fill className="object-cover" sizes="120px" />
                  )}
                  {marked && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs text-red-300">
                      Remove
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm text-zinc-400">Images / videos</label>
        <MediaUploadField files={newMediaFiles} onChange={setNewMediaFiles} />
        <p className="mt-1 text-xs text-zinc-500">
          Photos upload directly to storage (not through Vercel), so large images are supported.
        </p>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[#FF8C00] px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-[#FFD700] disabled:opacity-50"
        >
          {saving
            ? newMediaFiles.length > 0
              ? "Uploading & saving…"
              : "Saving…"
            : isEdit
              ? "Update product"
              : "Create product"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="rounded-lg border border-zinc-600 px-6 py-2.5 text-sm text-zinc-300 hover:border-zinc-400"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  placeholder,
  min,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number;
  placeholder?: string;
  min?: number;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm text-zinc-400">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        min={min}
        className="w-full rounded-lg border border-zinc-700 bg-[#141414] px-3 py-2 text-sm text-white outline-none ring-[#FF8C00] focus:ring-2"
      />
    </div>
  );
}

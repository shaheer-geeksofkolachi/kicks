"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getStoragePublicUrl, sortMedia } from "@/lib/media";
import type { Product } from "@/lib/types";
import { SIZE_UNITS, sizesToInputValue } from "@/lib/sizes";

type ProductFormProps = {
  product?: Product;
};

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const isEdit = Boolean(product);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removeIds, setRemoveIds] = useState<string[]>([]);
  const existingMedia = product?.product_media ? sortMedia(product.product_media) : [];
  const sizeUnit = product?.size_unit && SIZE_UNITS.includes(product.size_unit as (typeof SIZE_UNITS)[number])
    ? product.size_unit
    : "UK";
  const sizesDefault =
    product?.sizes?.length
      ? sizesToInputValue(product.sizes, sizeUnit)
      : "";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const form = e.currentTarget;
    const data = new FormData(form);
    const isSoldEl = form.elements.namedItem("is_sold") as HTMLInputElement | null;
    data.set("is_sold", isSoldEl?.checked ? "true" : "false");
    if (isEdit) {
      data.set("remove_media_ids", removeIds.join(","));
    }

    const url = isEdit ? `/api/admin/products/${product!.id}` : "/api/admin/products";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, { method, body: data });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(json.error ?? "Save failed");
      setSaving(false);
      return;
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
      <Field label="Brand" name="brand" required defaultValue={product?.brand} />
      <Field
        label="Price (PKR)"
        name="price_pkr"
        type="number"
        min={0}
        required
        defaultValue={product?.price_pkr ?? ""}
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
      <div>
        <label className="mb-1 block text-sm text-zinc-400">Size unit</label>
        <select
          name="size_unit"
          defaultValue={sizeUnit}
          className="w-full rounded-lg border border-zinc-700 bg-[#141414] px-3 py-2 text-sm text-white outline-none ring-[#FF8C00] focus:ring-2"
        >
          {SIZE_UNITS.map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>
      </div>
      <Field
        label="Sizes (comma-separated numbers)"
        name="sizes"
        placeholder="8, 9, 10, 11"
        defaultValue={sizesDefault}
      />

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
        <label className="mb-1 block text-sm text-zinc-400">Add images / videos</label>
        <input
          type="file"
          name="media"
          accept="image/*,video/*"
          multiple
          className="block w-full text-sm text-zinc-400 file:mr-4 file:rounded file:border-0 file:bg-[#FF8C00] file:px-4 file:py-2 file:text-sm file:font-medium file:text-black"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[#FF8C00] px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-[#FFD700] disabled:opacity-50"
        >
          {saving ? "Saving…" : isEdit ? "Update product" : "Create product"}
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

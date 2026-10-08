"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";

type ReviewKind = "text" | "image";

type AddReviewModalProps = {
  product: Product;
  onClose: () => void;
};

export function AddReviewModal({ product, onClose }: AddReviewModalProps) {
  const router = useRouter();
  const [kind, setKind] = useState<ReviewKind>("text");
  const [customerName, setCustomerName] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const form = new FormData();
    form.set("kind", kind);
    if (customerName.trim()) form.set("customer_name", customerName.trim());
    if (kind === "text") form.set("body_text", bodyText.trim());
    else if (imageFile) form.set("image", imageFile);

    const res = await fetch(`/api/admin/products/${product.id}/reviews`, {
      method: "POST",
      credentials: "same-origin",
      body: form,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(json.error ?? "Could not save review");
      setSaving(false);
      return;
    }

    router.refresh();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-review-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-xl border border-zinc-700 bg-[#141414] p-5 shadow-xl">
        <h2 id="add-review-title" className="font-display text-xl text-white">Add customer review</h2>
        <p className="mt-1 text-sm text-zinc-400">
          For: <span className="text-zinc-200">{product.name}</span>
          {product.brand ? ` · ${product.brand}` : ""}
        </p>

        {error && (
          <p className="mt-3 rounded-lg border border-red-800 bg-red-950/50 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        )}

        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-zinc-400">
              Customer name <span className="text-zinc-600">(optional)</span>
            </label>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-[#0f0f0f] px-3 py-2 text-sm text-white outline-none ring-[#FF8C00] focus:ring-2"
              placeholder="e.g. Ahmed"
            />
          </div>

          <div>
            <p className="mb-2 text-sm text-zinc-400">Review format</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setKind("text")}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
                  kind === "text"
                    ? "border-[#FF8C00] bg-[#FF8C00]/15 text-[#FFD700]"
                    : "border-zinc-600 text-zinc-400 hover:border-zinc-500"
                }`}
              >
                Text
              </button>
              <button
                type="button"
                onClick={() => setKind("image")}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
                  kind === "image"
                    ? "border-[#FF8C00] bg-[#FF8C00]/15 text-[#FFD700]"
                    : "border-zinc-600 text-zinc-400 hover:border-zinc-500"
                }`}
              >
                Image
              </button>
            </div>
          </div>

          {kind === "text" ? (
            <div>
              <label className="mb-1 block text-sm text-zinc-400">Review text</label>
              <textarea
                required
                rows={4}
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-[#0f0f0f] px-3 py-2 text-sm text-white outline-none ring-[#FF8C00] focus:ring-2"
                placeholder="What did the customer say?"
              />
            </div>
          ) : (
            <div>
              <label className="mb-1 block text-sm text-zinc-400">Review screenshot / photo</label>
              <input
                type="file"
                accept="image/*"
                required
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                className="block w-full text-sm text-zinc-400 file:mr-3 file:rounded-lg file:border-0 file:bg-[#FF8C00] file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-black"
              />
              {previewUrl && (
                <div className="relative mt-3 aspect-[4/3] overflow-hidden rounded-lg border border-zinc-700">
                  <Image src={previewUrl} alt="Preview" fill className="object-contain" unoptimized />
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-[#FF8C00] py-2.5 text-sm font-semibold text-black hover:bg-[#FFD700] disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save review"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-600 px-4 py-2.5 text-sm text-zinc-300 hover:border-zinc-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

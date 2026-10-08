"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AddReviewModal } from "@/components/admin/AddReviewModal";
import { ProductPrice } from "@/components/ProductPrice";
import type { Product } from "@/lib/types";

type AdminProductTableProps = {
  products: Product[];
  reviewProductIds: string[];
};

export function AdminProductTable({ products, reviewProductIds }: AdminProductTableProps) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [reviewProduct, setReviewProduct] = useState<Product | null>(null);
  const reviewSet = new Set(reviewProductIds);

  async function toggleSold(product: Product) {
    const markingSold = !product.is_sold;
    setBusyId(product.id);
    const res = await fetch(`/api/admin/products/${product.id}/sold`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_sold: markingSold }),
    });
    setBusyId(null);
    if (res.ok && markingSold) {
      setReviewProduct({ ...product, is_sold: true });
    }
    router.refresh();
  }

  async function deleteProduct(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setBusyId(id);
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setBusyId(null);
    if (res.ok) router.refresh();
    else alert("Delete failed");
  }

  if (!products.length) {
    return <p className="text-zinc-500">No products yet. Add your first pair.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-[#141414] text-zinc-400">
          <tr>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Brand</th>
            <th className="px-4 py-3 font-medium">Price</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {products.map((p) => (
            <tr key={p.id} className="bg-[#0f0f0f]">
              <td className="px-4 py-3 text-white">{p.name}</td>
              <td className="px-4 py-3 text-zinc-300">{p.brand || "—"}</td>
              <td className="px-4 py-3">
                <ProductPrice product={p} size="sm" />
              </td>
              <td className="px-4 py-3">
                {p.is_sold ? (
                  <div className="flex flex-col items-start gap-1">
                    <span className="font-medium text-[#FF8C00]">Sold</span>
                    {!reviewSet.has(p.id) && (
                      <button
                        type="button"
                        onClick={() => setReviewProduct(p)}
                        className="rounded border border-[#FF8C00]/50 bg-[#FF8C00]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#FFD700] hover:bg-[#FF8C00]/20"
                      >
                        Add review
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="text-emerald-400">Available</span>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="rounded border border-zinc-600 px-2 py-1 text-xs hover:border-[#FF8C00]"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    disabled={busyId === p.id}
                    onClick={() => toggleSold(p)}
                    className="rounded border border-zinc-600 px-2 py-1 text-xs hover:border-[#FFD700] disabled:opacity-50"
                  >
                    {p.is_sold ? "Mark available" : "Mark sold"}
                  </button>
                  <button
                    type="button"
                    disabled={busyId === p.id}
                    onClick={() => deleteProduct(p.id, p.name)}
                    className="rounded border border-red-900 px-2 py-1 text-xs text-red-400 hover:bg-red-950/50 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {reviewProduct && (
        <AddReviewModal product={reviewProduct} onClose={() => setReviewProduct(null)} />
      )}
    </div>
  );
}

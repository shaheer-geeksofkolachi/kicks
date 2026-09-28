"use client";

import { useState } from "react";
import { formatPkr } from "@/lib/format";
import { getProductPricing } from "@/lib/pricing";

type PriceDiscountFieldsProps = {
  initialPrice?: number;
  initialDiscount?: number | null;
};

export function PriceDiscountFields({ initialPrice, initialDiscount = null }: PriceDiscountFieldsProps) {
  const [pricePkr, setPricePkr] = useState(initialPrice != null ? String(initialPrice) : "");
  const [discountPkr, setDiscountPkr] = useState<number | null>(initialDiscount);
  const [discountDraft, setDiscountDraft] = useState(
    initialDiscount != null ? String(initialDiscount) : "",
  );
  const [editingDiscount, setEditingDiscount] = useState(false);
  const [discountError, setDiscountError] = useState<string | null>(null);

  const priceNum = Number(pricePkr);
  const preview =
    Number.isFinite(priceNum) && priceNum > 0
      ? getProductPricing({ price_pkr: priceNum, discount_price_pkr: discountPkr })
      : null;

  function applyDiscount() {
    setDiscountError(null);
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      setDiscountError("Enter the original price first.");
      return;
    }
    const next = Number(discountDraft);
    if (!Number.isFinite(next) || next < 0) {
      setDiscountError("Enter a valid discounted amount.");
      return;
    }
    const rounded = Math.round(next);
    if (rounded >= priceNum) {
      setDiscountError("Discounted price must be less than the original price.");
      return;
    }
    setDiscountPkr(rounded);
    setEditingDiscount(false);
  }

  function removeDiscount() {
    setDiscountPkr(null);
    setDiscountDraft("");
    setEditingDiscount(false);
    setDiscountError(null);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="mb-1 block text-sm text-zinc-400">Price (PKR)</label>
          <input
            name="price_pkr"
            type="number"
            min={0}
            required
            value={pricePkr}
            onChange={(e) => {
              setPricePkr(e.target.value);
              if (discountPkr != null) {
                const p = Number(e.target.value);
                if (Number.isFinite(p) && discountPkr >= p) {
                  setDiscountPkr(null);
                  setDiscountDraft("");
                }
              }
            }}
            className="w-full rounded-lg border border-zinc-700 bg-[#141414] px-3 py-2 text-sm text-white outline-none ring-[#FF8C00] focus:ring-2"
          />
        </div>
        <div className="flex shrink-0 gap-2">
          {!discountPkr && !editingDiscount && (
            <button
              type="button"
              onClick={() => setEditingDiscount(true)}
              className="rounded-lg border border-[#FF8C00]/50 bg-[#FF8C00]/10 px-4 py-2 text-sm font-semibold text-[#FFD700] transition hover:bg-[#FF8C00]/20"
            >
              Add discount
            </button>
          )}
          {discountPkr != null && !editingDiscount && (
            <button
              type="button"
              onClick={() => {
                setDiscountDraft(String(discountPkr));
                setEditingDiscount(true);
              }}
              className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-300 hover:border-zinc-400"
            >
              Edit discount
            </button>
          )}
        </div>
      </div>

      <input type="hidden" name="discount_price_pkr" value={discountPkr ?? ""} />

      {editingDiscount && (
        <div className="rounded-lg border border-zinc-700 bg-[#141414] p-4">
          <label className="mb-1 block text-sm text-zinc-400">Discounted price (PKR)</label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="number"
              min={0}
              value={discountDraft}
              onChange={(e) => setDiscountDraft(e.target.value)}
              placeholder="Must be less than original price"
              className="flex-1 rounded-lg border border-zinc-700 bg-[#120e0c] px-3 py-2 text-sm text-white outline-none ring-[#FF8C00] focus:ring-2"
            />
            <button
              type="button"
              onClick={applyDiscount}
              className="rounded-lg bg-[#FF8C00] px-4 py-2 text-sm font-semibold text-black"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingDiscount(false);
                setDiscountError(null);
              }}
              className="rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-400"
            >
              Cancel
            </button>
          </div>
          {discountError && <p className="mt-2 text-sm text-red-300">{discountError}</p>}
        </div>
      )}

      {discountPkr != null && !editingDiscount && preview?.hasDiscount && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#FF8C00]/30 bg-[#FF8C00]/5 px-4 py-3">
          <div className="text-sm text-zinc-300">
            Customer sees:{" "}
            <span className="font-semibold text-[#FFD700]">{formatPkr(preview.effectivePrice)}</span>
            <span className="mx-2 text-zinc-500 line-through">{formatPkr(preview.originalPrice)}</span>
            <span className="text-[#ff9a4d]">−{preview.discountPercent}%</span>
          </div>
          <button type="button" onClick={removeDiscount} className="text-sm text-red-300 hover:text-red-200">
            Remove discount
          </button>
        </div>
      )}
    </div>
  );
}

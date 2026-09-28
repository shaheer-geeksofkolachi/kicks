"use client";

import { useEffect, useId, useRef, useState } from "react";
import { SIZE_MAX, SIZE_MIN, STANDARD_SHOE_SIZES } from "@/lib/sizes";

type SizeMultiSelectProps = {
  name: string;
  value: string[];
  onChange: (sizes: string[]) => void;
  required?: boolean;
};

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`}
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function SizeMultiSelect({ name, value, onChange, required }: SizeMultiSelectProps) {
  const reactId = useId();
  const listboxId = `${reactId}-sizes`;
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const selectedSet = new Set(value);
  const sortedSelected = [...value].sort((a, b) => Number(a) - Number(b));

  const options = STANDARD_SHOE_SIZES;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function toggleSize(size: string) {
    if (selectedSet.has(size)) {
      onChange(value.filter((s) => s !== size));
    } else {
      onChange([...value, size].sort((a, b) => Number(a) - Number(b)));
    }
  }

  const triggerLabel =
    sortedSelected.length === 0
      ? `Select sizes (${SIZE_MIN}–${SIZE_MAX})`
      : sortedSelected.length <= 4
        ? sortedSelected.join(", ")
        : `${sortedSelected.length} sizes selected`;

  return (
    <div ref={rootRef} className="relative">
      <input type="hidden" name={name} value={sortedSelected.join(", ")} required={required && sortedSelected.length === 0} />

      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between gap-2 rounded-lg border bg-[#141414] px-3 py-2.5 text-left text-sm transition outline-none focus:ring-2 focus:ring-[#FF8C00] ${
          open ? "border-[#FF8C00]/60" : "border-zinc-700"
        }`}
      >
        <span className={sortedSelected.length ? "text-white" : "text-zinc-500"}>{triggerLabel}</span>
        <Chevron open={open} />
      </button>

      {open && (
        <div
          className="absolute top-[calc(100%+6px)] right-0 left-0 z-50 overflow-hidden rounded-xl border border-zinc-700 bg-[#141414] shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
        >
          <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2">
            <span className="text-xs font-medium text-zinc-400">
              EU sizes {SIZE_MIN} – {SIZE_MAX}
            </span>
            {sortedSelected.length > 0 && (
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-xs text-[#FF8C00] hover:text-[#FFD700]"
              >
                Clear all
              </button>
            )}
          </div>
          <ul
            id={listboxId}
            role="listbox"
            aria-multiselectable="true"
            className="brand-dropdown-scroll max-h-56 overflow-y-auto p-2"
          >
            {options.map((size) => {
              const checked = selectedSet.has(size);
              return (
                <li key={size} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={checked}
                    onClick={() => toggleSize(size)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                      checked
                        ? "bg-[#FF8C00]/15 text-[#FFD700]"
                        : "text-zinc-300 hover:bg-zinc-800"
                    }`}
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                        checked ? "border-[#FF8C00] bg-[#FF8C00] text-black" : "border-zinc-600"
                      }`}
                      aria-hidden
                    >
                      {checked ? "✓" : ""}
                    </span>
                    {size}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

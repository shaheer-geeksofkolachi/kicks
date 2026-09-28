"use client";

import { useEffect, useId, useRef, useState } from "react";
import { SIZE_MAX, SIZE_MIN, STANDARD_SHOE_SIZES } from "@/lib/sizes";

type SizeFilterDropdownProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      className={`h-4 w-4 shrink-0 text-[#a89a8c] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
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

export function SizeFilterDropdown({ value, onChange, className = "" }: SizeFilterDropdownProps) {
  const reactId = useId();
  const listboxId = `${reactId}-sizes`;
  const triggerId = `${reactId}-trigger`;
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const displayLabel = value ? `Size ${value}` : "All sizes";

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

  function select(next: string) {
    onChange(next);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        id={triggerId}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border bg-[#1a1410] px-4 py-3 text-left text-sm transition ${
          open
            ? "border-[#ff7a1a]/60 ring-2 ring-[#ff7a1a]/25"
            : "border-[#2c2119] hover:border-[#3d3028]"
        }`}
      >
        <span className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#2c2119] text-[10px] font-bold text-[#ff9a4d]">
            EU
          </span>
          <span className={value ? "text-[#f3ece4]" : "text-[#6b5d52]"}>{displayLabel}</span>
        </span>
        <Chevron open={open} />
      </button>

      {open && (
        <div
          className="absolute top-[calc(100%+6px)] right-0 left-0 z-50 overflow-hidden rounded-xl border border-[#2c2119] bg-[#1a1410] shadow-[0_16px_48px_rgba(0,0,0,0.55)]"
        >
          <div className="border-b border-[#2c2119] px-3 py-2.5">
            <p className="text-xs font-semibold tracking-wide text-[#a89a8c] uppercase">Shoe size</p>
            <p className="text-[11px] text-[#6b5d52]">
              EU {SIZE_MIN} – {SIZE_MAX}
            </p>
          </div>

          <ul id={listboxId} role="listbox" aria-labelledby={triggerId} className="p-2">
            <li role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={!value}
                onClick={() => select("")}
                className={`mb-1 flex w-full rounded-lg px-3 py-2.5 text-left text-sm transition ${
                  !value
                    ? "bg-[#ff7a1a]/15 font-medium text-[#ff9a4d]"
                    : "text-[#c4b5a6] hover:bg-[#2c2119]/80 hover:text-[#f3ece4]"
                }`}
              >
                All sizes
              </button>
            </li>
          </ul>

          <div className="brand-dropdown-scroll max-h-[min(220px,40vh)] overflow-y-auto border-t border-[#2c2119] p-2">
            <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-3">
              {STANDARD_SHOE_SIZES.map((size) => {
                const selected = value === size;
                return (
                  <button
                    key={size}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => select(size)}
                    className={`flex h-11 items-center justify-center rounded-lg text-sm font-semibold transition ${
                      selected
                        ? "bg-[#ff7a1a] text-[#120e0c] shadow-[0_0_12px_rgba(255,122,26,0.35)]"
                        : "border border-[#2c2119] bg-[#120e0c] text-[#c4b5a6] hover:border-[#ff7a1a]/40 hover:text-[#f3ece4]"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { getBrandOptions } from "@/lib/brands";

type BrandDropdownProps = {
  value: string;
  onChange: (value: string) => void;
  name?: string;
  id?: string;
  required?: boolean;
  includeAllOption?: boolean;
  allOptionLabel?: string;
  placeholder?: string;
  extraBrands?: string[];
  /** Shown on the trigger when no value is selected (admin). */
  emptyLabel?: string;
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

export function BrandDropdown({
  value,
  onChange,
  name,
  id: idProp,
  required,
  includeAllOption,
  allOptionLabel = "All brands",
  placeholder = "Search brands…",
  emptyLabel = "Select a brand",
  extraBrands = [],
  className = "",
}: BrandDropdownProps) {
  const reactId = useId();
  const listboxId = `${reactId}-listbox`;
  const triggerId = idProp ?? `${reactId}-trigger`;

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const options = useMemo(() => getBrandOptions(extraBrands), [extraBrands]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((b) => b.toLowerCase().includes(q));
  }, [options, search]);

  const displayLabel = value || (includeAllOption ? allOptionLabel : emptyLabel);
  const hasSelection = Boolean(value);

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

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => searchRef.current?.focus());
  }, [open]);

  function select(next: string) {
    onChange(next);
    setSearch("");
    setOpen(false);
  }

  function toggle() {
    setOpen((wasOpen) => {
      if (!wasOpen) setSearch("");
      return !wasOpen;
    });
  }

  const showAllRow = includeAllOption && (!search.trim() || allOptionLabel.toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {name ? <input type="hidden" name={name} value={value} required={required} /> : null}

      <button
        id={triggerId}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={toggle}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border bg-[#1a1410] px-4 py-3 text-left text-sm transition ${
          open
            ? "border-[#ff7a1a]/60 ring-2 ring-[#ff7a1a]/25"
            : "border-[#2c2119] hover:border-[#3d3028]"
        }`}
      >
        <span className={hasSelection || includeAllOption ? "text-[#f3ece4]" : "text-[#6b5d52]"}>
          {displayLabel}
        </span>
        <Chevron open={open} />
      </button>

      {open && (
        <div
          className="absolute top-[calc(100%+6px)] right-0 left-0 z-50 overflow-hidden rounded-xl border border-[#2c2119] bg-[#1a1410] shadow-[0_16px_48px_rgba(0,0,0,0.55)]"
          role="presentation"
        >
          <div className="border-b border-[#2c2119] p-2">
            <input
              ref={searchRef}
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={placeholder}
              className="brand-dropdown-search w-full rounded-lg border border-[#2c2119] bg-[#120e0c] px-3 py-2 text-sm text-[#f3ece4] placeholder:text-[#6b5d52] outline-none focus:border-[#ff7a1a]/50 focus:ring-1 focus:ring-[#ff7a1a]/30"
              onKeyDown={(e) => {
                if (e.key === "Enter" && filtered.length === 1) {
                  e.preventDefault();
                  select(filtered[0]);
                }
              }}
            />
          </div>

          <ul
            id={listboxId}
            role="listbox"
            aria-labelledby={triggerId}
            className="brand-dropdown-scroll max-h-[min(280px,50vh)] overflow-y-auto overscroll-contain py-1"
          >
            {showAllRow && (
              <li role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={!value}
                  onClick={() => select("")}
                  className={`flex w-full px-3 py-2.5 text-left text-sm transition ${
                    !value
                      ? "bg-[#ff7a1a]/15 text-[#ff9a4d] font-medium"
                      : "text-[#c4b5a6] hover:bg-[#2c2119]/80 hover:text-[#f3ece4]"
                  }`}
                >
                  {allOptionLabel}
                </button>
              </li>
            )}

            {filtered.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-[#6b5d52]">No brands match</li>
            ) : (
              filtered.map((b) => {
                const selected = value === b;
                return (
                  <li key={b} role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => select(b)}
                      className={`flex w-full px-3 py-2.5 text-left text-sm transition ${
                        selected
                          ? "bg-[#ff7a1a]/15 text-[#ff9a4d] font-medium"
                          : "text-[#c4b5a6] hover:bg-[#2c2119]/80 hover:text-[#f3ece4]"
                      }`}
                    >
                      {b}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

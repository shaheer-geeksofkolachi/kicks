export const SIZE_UNITS = ["UK", "US", "EU"] as const;

export const CATALOG_SIZE_UNIT = "EU" as const;

export const SIZE_MIN = 35;
export const SIZE_MAX = 50;

/** Whole EU sizes for catalog filter chips (42 → also matches 41.5 & 42.5 on products). */
export const FILTER_SHOE_SIZES = Array.from({ length: SIZE_MAX - SIZE_MIN + 1 }, (_, i) =>
  String(SIZE_MIN + i),
);

/** EU sizes for admin picker: 35, 35.5, 36, … 49.5, 50 */
export const STANDARD_SHOE_SIZES = (() => {
  const sizes: string[] = [];
  for (let n = SIZE_MIN; n <= SIZE_MAX; n++) {
    sizes.push(String(n));
    if (n < SIZE_MAX) {
      sizes.push(`${n}.5`);
    }
  }
  return sizes;
})();

export type SizeUnit = (typeof SIZE_UNITS)[number];

export function isSizeUnit(value: string): value is SizeUnit {
  return (SIZE_UNITS as readonly string[]).includes(value);
}

/** Parse EU catalog size; only whole numbers or exactly .5 (e.g. 42, 42.5). */
export function parseCatalogSizeValue(value: string): number | null {
  const trimmed = value.trim().replace(/,/g, ".");
  if (!trimmed) return null;
  if (!/^\d+(\.5)?$/.test(trimmed)) return null;

  const n = Number(trimmed);
  if (!Number.isFinite(n) || n < SIZE_MIN || n > SIZE_MAX) return null;

  const frac = Math.round((n % 1) * 10) / 10;
  if (frac !== 0 && frac !== 0.5) return null;

  return frac === 0 ? Math.round(n) : Math.floor(n) + 0.5;
}

export function formatCatalogSizeNumber(n: number): string {
  if (n % 1 === 0) return String(Math.round(n));
  return `${Math.floor(n)}.5`;
}

export function isValidCatalogSize(value: string): boolean {
  return parseCatalogSizeValue(value) != null;
}

export function compareCatalogSizes(a: string, b: string): number {
  const na = parseCatalogSizeValue(a) ?? 0;
  const nb = parseCatalogSizeValue(b) ?? 0;
  return na - nb;
}

export function normalizeCatalogSize(value: string): string | null {
  const n = parseCatalogSizeValue(value);
  return n == null ? null : formatCatalogSizeNumber(n);
}

/** Sizes on a product that match a catalog filter value (whole filter includes ±0.5). */
export function expandSizeFilterMatch(filterSize: string): Set<string> {
  const n = parseCatalogSizeValue(filterSize);
  if (n == null) return new Set();

  const out = new Set<string>();
  const add = (num: number) => out.add(formatCatalogSizeNumber(num));

  if (n % 1 === 0) {
    add(n);
    if (n - 0.5 >= SIZE_MIN) add(n - 0.5);
    if (n + 0.5 <= SIZE_MAX) add(n + 0.5);
  } else {
    add(n);
  }

  return out;
}

export function parseAdminSizesInput(
  input: string,
): { ok: true; sizes: string[] } | { ok: false; error: string } {
  const raw = input
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (!raw.length) {
    return { ok: false, error: "Select at least one size (EU 35–50, half sizes like 42.5 allowed)." };
  }

  const sizes: string[] = [];
  for (const item of raw) {
    const numeric = item.replace(/^(UK|US|EU)\s*/i, "").trim();
    const normalized = normalizeCatalogSize(numeric);
    if (!normalized) {
      return {
        ok: false,
        error: `Invalid size "${item}". Use EU ${SIZE_MIN}–${SIZE_MAX} as whole numbers or .5 only (e.g. 42 or 42.5).`,
      };
    }
    if (!sizes.includes(normalized)) sizes.push(normalized);
  }

  sizes.sort(compareCatalogSizes);
  return { ok: true, sizes };
}

export function formatSizeLabel(unit: string, size: string): string {
  const trimmed = size.trim();
  if (/^(UK|US|EU)\s/i.test(trimmed)) {
    return trimmed;
  }
  const u = isSizeUnit(unit) ? unit : CATALOG_SIZE_UNIT;
  return `${u} ${trimmed}`;
}

/** Strip unit prefix for admin size input when editing */
export function sizesToInputValue(sizes: string[], unit: string): string {
  const prefix = new RegExp(`^${unit}\\s*`, "i");
  return sizes.map((s) => s.replace(prefix, "").trim()).join(", ");
}

/** Numeric size values for display / filters (strips stored unit prefix). */
export function sizesToSelectableValues(sizes: string[], unit: string): string[] {
  const prefix = new RegExp(`^${unit}\\s*`, "i");
  const normalized: string[] = [];
  for (const s of sizes ?? []) {
    const bare = s.replace(prefix, "").trim();
    const canon = normalizeCatalogSize(bare);
    if (canon && !normalized.includes(canon)) normalized.push(canon);
  }
  return normalized.sort(compareCatalogSizes);
}

/** True if product lists a size that matches the filter (whole filter includes ±0.5). */
export function productIncludesSize(
  sizes: string[],
  sizeUnit: string | null | undefined,
  filterSize: string,
): boolean {
  if (!filterSize) return true;
  const matchSet = expandSizeFilterMatch(filterSize);
  if (!matchSet.size) return true;

  const normalized = sizesToSelectableValues(sizes ?? [], sizeUnit ?? CATALOG_SIZE_UNIT);
  return normalized.some((s) => matchSet.has(s));
}

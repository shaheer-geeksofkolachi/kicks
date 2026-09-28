export const SIZE_UNITS = ["UK", "US", "EU"] as const;

export const CATALOG_SIZE_UNIT = "EU" as const;

export const SIZE_MIN = 35;
export const SIZE_MAX = 50;

/** Standard catalog sizes (EU, inclusive). */
export const STANDARD_SHOE_SIZES = Array.from({ length: SIZE_MAX - SIZE_MIN + 1 }, (_, i) =>
  String(SIZE_MIN + i),
);

export type SizeUnit = (typeof SIZE_UNITS)[number];

export function isSizeUnit(value: string): value is SizeUnit {
  return (SIZE_UNITS as readonly string[]).includes(value);
}

export function isValidCatalogSize(value: string): boolean {
  const n = Number(value.trim());
  return Number.isInteger(n) && n >= SIZE_MIN && n <= SIZE_MAX;
}

export function parseAdminSizesInput(
  input: string,
): { ok: true; sizes: string[] } | { ok: false; error: string } {
  const raw = input
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (!raw.length) {
    return { ok: false, error: "Select at least one size (EU 35–50)." };
  }

  const sizes: string[] = [];
  for (const item of raw) {
    const numeric = item.replace(/^(UK|US|EU)\s*/i, "").trim();
    if (!isValidCatalogSize(numeric)) {
      return {
        ok: false,
        error: `Invalid size "${item}". Use whole numbers from ${SIZE_MIN} to ${SIZE_MAX} (EU).`,
      };
    }
    if (!sizes.includes(numeric)) sizes.push(numeric);
  }

  sizes.sort((a, b) => Number(a) - Number(b));
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

/** Numeric size values for admin multi-select (strips stored unit prefix). */
export function sizesToSelectableValues(sizes: string[], unit: string): string[] {
  const prefix = new RegExp(`^${unit}\\s*`, "i");
  return sizes
    .map((s) => s.replace(prefix, "").trim())
    .filter(Boolean)
    .filter(isValidCatalogSize)
    .sort((a, b) => Number(a) - Number(b));
}

/** True if product lists the given numeric size (e.g. "42"). */
export function productIncludesSize(
  sizes: string[],
  sizeUnit: string | null | undefined,
  filterSize: string,
): boolean {
  if (!filterSize) return true;
  const normalized = sizesToSelectableValues(sizes ?? [], sizeUnit ?? CATALOG_SIZE_UNIT);
  return normalized.includes(filterSize);
}

export const SIZE_UNITS = ["UK", "US", "EU"] as const;

/** Standard admin catalog sizes (EU-style numeric range). */
export const STANDARD_SHOE_SIZES = Array.from({ length: 12 }, (_, i) => String(37 + i));

export type SizeUnit = (typeof SIZE_UNITS)[number];

export function isSizeUnit(value: string): value is SizeUnit {
  return (SIZE_UNITS as readonly string[]).includes(value);
}

export function formatSizeLabel(unit: string, size: string): string {
  const trimmed = size.trim();
  if (/^(UK|US|EU)\s/i.test(trimmed)) {
    return trimmed;
  }
  const u = isSizeUnit(unit) ? unit : "UK";
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
    .sort((a, b) => Number(a) - Number(b));
}

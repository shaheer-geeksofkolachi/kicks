export const SIZE_UNITS = ["UK", "US", "EU"] as const;

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

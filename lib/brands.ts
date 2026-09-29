/** Global sneaker and footwear brands for admin selection and catalog filters. */
export const SHOE_BRANDS = [
  "Adidas",
  "A Bathing Ape",
  "Alexander McQueen",
  "Anta",
  "Asics",
  "Balenciaga",
  "Bally",
  "Bata",
  "Berluti",
  "Birkenstock",
  "Bottega Veneta",
  "Brooks",
  "Burberry",
  "Camper",
  "Caterpillar",
  "Champion",
  "Clarks",
  "Coach",
  "Cole Haan",
  "Columbia",
  "Common Projects",
  "Converse",
  "Crocs",
  "Diadora",
  "Diesel",
  "Dior",
  "Dr. Martens",
  "ECCO",
  "Etnies",
  "Fila",
  "Geox",
  "Golden Goose",
  "Gucci",
  "Hoka",
  "Hummel",
  "Hugo Boss",
  "Jimmy Choo",
  "Joma",
  "Jordan",
  "Karhu",
  "K-Swiss",
  "Kappa",
  "Keen",
  "Lacoste",
  "Levi's",
  "Li-Ning",
  "Loewe",
  "Louis Vuitton",
  "Merrell",
  "Mizuno",
  "Moncler",
  "New Balance",
  "Nike",
  "Off-White",
  "Oofos",
  "On",
  "Onitsuka Tiger",
  "Palladium",
  "Prada",
  "Puma",
  "Reebok",
  "Salomon",
  "Saucony",
  "Salvatore Ferragamo",
  "Skechers",
  "Sorel",
  "Steve Madden",
  "Superga",
  "Ted Baker",
  "The North Face",
  "Timberland",
  "Tod's",
  "TOMS",
  "UGG",
  "Under Armour",
  "Valentino",
  "Vans",
  "Veja",
  "Versace",
  "Y-3",
] as const;

export type ShoeBrand = (typeof SHOE_BRANDS)[number];

const brandSet = new Set<string>(SHOE_BRANDS);

/** Sorted brand list, optionally including legacy/extra values (e.g. existing product brand). */
export function getBrandOptions(extra: string[] = []): string[] {
  const merged = new Set<string>(SHOE_BRANDS);
  for (const b of extra) {
    const trimmed = b.trim();
    if (trimmed) merged.add(trimmed);
  }
  return Array.from(merged).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}

export function isAllowedBrand(brand: string, extra: string[] = []): boolean {
  const trimmed = brand.trim();
  if (!trimmed) return true;
  if (brandSet.has(trimmed)) return true;
  return extra.some((e) => e.trim() === trimmed);
}

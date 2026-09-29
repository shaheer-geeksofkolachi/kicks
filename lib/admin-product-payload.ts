import { isAllowedBrand } from "@/lib/brands";
import { parseDiscountPricePkr } from "@/lib/pricing";
import { CATALOG_SIZE_UNIT, parseAdminSizesInput } from "@/lib/sizes";

export type ProductWritePayload = {
  name: string;
  brand: string;
  description: string | null;
  price_pkr: number;
  discount_price_pkr: number | null;
  sizes: string[];
  size_unit: string;
  is_sold: boolean;
  remove_media_ids: string[];
};

export type ParseProductResult =
  | { ok: true; data: ProductWritePayload }
  | { ok: false; error: string; status: number };

function readDiscountRaw(source: FormData | Record<string, unknown>): string {
  if (source instanceof FormData) {
    return String(source.get("discount_price_pkr") ?? "");
  }
  const v = source.discount_price_pkr;
  return v == null ? "" : String(v);
}

function readSizesRaw(source: FormData | Record<string, unknown>): string {
  if (source instanceof FormData) {
    return String(source.get("sizes") ?? "");
  }
  const v = source.sizes;
  if (Array.isArray(v)) return v.join(",");
  return v == null ? "" : String(v);
}

function readRemoveIds(source: FormData | Record<string, unknown>): string[] {
  if (source instanceof FormData) {
    return String(source.get("remove_media_ids") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  const v = source.remove_media_ids;
  if (!Array.isArray(v)) return [];
  return v.map((s) => String(s).trim()).filter(Boolean);
}

export async function parseProductWriteRequest(
  request: Request,
  existingBrand?: string | null,
): Promise<ParseProductResult> {
  const contentType = request.headers.get("content-type") ?? "";
  let raw: FormData | Record<string, unknown>;

  if (contentType.includes("application/json")) {
    try {
      raw = (await request.json()) as Record<string, unknown>;
    } catch {
      return { ok: false, error: "Invalid JSON body", status: 400 };
    }
  } else {
    raw = await request.formData();
  }

  const get = (key: string): string => {
    if (raw instanceof FormData) return String(raw.get(key) ?? "").trim();
    const v = raw[key];
    if (v == null) return "";
    return String(v).trim();
  };

  const name = get("name");
  const brand = get("brand");
  const description = get("description");
  const priceRaw = Number(get("price_pkr"));
  const isSold =
    raw instanceof FormData
      ? raw.get("is_sold") === "true"
      : raw.is_sold === true || raw.is_sold === "true";

  const sizesParsed = parseAdminSizesInput(readSizesRaw(raw));
  if (!sizesParsed.ok) {
    return { ok: false, error: sizesParsed.error, status: 400 };
  }

  if (!name || !Number.isFinite(priceRaw) || priceRaw < 0) {
    return { ok: false, error: "Name and valid price are required", status: 400 };
  }

  const extraBrands = existingBrand ? [existingBrand] : [];
  if (!isAllowedBrand(brand, extraBrands)) {
    return { ok: false, error: "Please select a valid brand", status: 400 };
  }

  const price_pkr = Math.round(priceRaw);
  const discountParsed = parseDiscountPricePkr(readDiscountRaw(raw), price_pkr);
  if (!discountParsed.ok) {
    return { ok: false, error: discountParsed.error, status: 400 };
  }

  return {
    ok: true,
    data: {
      name,
      brand,
      description: description || null,
      price_pkr,
      discount_price_pkr: discountParsed.value,
      sizes: sizesParsed.sizes,
      size_unit: CATALOG_SIZE_UNIT,
      is_sold: isSold,
      remove_media_ids: readRemoveIds(raw),
    },
  };
}

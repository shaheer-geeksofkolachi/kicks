import { formatPkr } from "@/lib/format";

type WhatsAppOrderParams = {
  productName: string;
  brand: string;
  pricePkr: number;
  originalPricePkr?: number;
  size?: string;
  quantity: number;
  pageUrl: string;
};

export function getWhatsAppNumber(): string | null {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "");
  return raw && raw.length >= 10 ? raw : null;
}

export function buildWhatsAppOrderUrl(params: WhatsAppOrderParams): string | null {
  const number = getWhatsAppNumber();
  if (!number) return null;

  const lines = [
    "Hi Kicksplosion.pk! I'd like to order:",
    "",
    `Product: ${params.productName}`,
    `Brand: ${params.brand}`,
    params.originalPricePkr != null && params.originalPricePkr > params.pricePkr
      ? `Price: ${formatPkr(params.pricePkr)} (was ${formatPkr(params.originalPricePkr)})`
      : `Price: ${formatPkr(params.pricePkr)}`,
    params.size ? `Size: ${params.size}` : null,
    `Quantity: ${params.quantity}`,
    "",
    `Link: ${params.pageUrl}`,
  ].filter(Boolean);

  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${number}?text=${text}`;
}

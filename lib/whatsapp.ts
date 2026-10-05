import { formatPkr } from "@/lib/format";
import { SITE_DISPLAY_NAME } from "@/lib/site-url";

type WhatsAppOrderParams = {
  productName: string;
  brand: string;
  pricePkr: number;
  originalPricePkr?: number;
  size?: string;
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
    `Hi ${SITE_DISPLAY_NAME}! I'd like to order:`,
    "",
    `Product: ${params.productName}`,
    params.brand.trim() ? `Brand: ${params.brand.trim()}` : null,
    params.originalPricePkr != null && params.originalPricePkr > params.pricePkr
      ? `Price: ${formatPkr(params.pricePkr)} (was ${formatPkr(params.originalPricePkr)})`
      : `Price: ${formatPkr(params.pricePkr)}`,
    params.size ? `Size: ${params.size}` : null,
    "",
    `Link: ${params.pageUrl}`,
  ].filter(Boolean);

  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${number}?text=${text}`;
}

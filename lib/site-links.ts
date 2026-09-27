import { getWhatsAppNumber } from "@/lib/whatsapp";

/** Official social profiles */
export const INSTAGRAM_URL = "https://www.instagram.com/kicksplosion.pk";
export const FACEBOOK_URL = "https://www.facebook.com/share/1De4vfnaaF/";
export const INSTAGRAM_HANDLE = "@kicksplosion.pk";

export function getWhatsAppChatUrl(): string | null {
  const number = getWhatsAppNumber();
  return number ? `https://wa.me/${number}` : null;
}

export function getWhatsAppDisplayNumber(): string | null {
  const digits = getWhatsAppNumber();
  if (!digits) return null;
  if (digits.startsWith("92") && digits.length >= 12) {
    const rest = digits.slice(2);
    if (rest.length === 10) {
      return `+92 ${rest.slice(0, 3)} ${rest.slice(3, 6)} ${rest.slice(6)}`;
    }
    return `+92 ${rest}`;
  }
  return `+${digits}`;
}

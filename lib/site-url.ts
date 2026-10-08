export const SITE_DISPLAY_NAME = "Kicksplosion.store";
export const SITE_TAGLINE = "Footwear Ignited";

/** Default canonical origin when env is unset (production SEO, sitemap, WhatsApp links). */
export const DEFAULT_SITE_URL = "https://kicksplosion.store";

/**
 * Canonical site origin (no trailing slash).
 * Priority: NEXT_PUBLIC_SITE_URL → production default → preview VERCEL_URL → localhost.
 */
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  if (process.env.VERCEL_ENV === "production") {
    return DEFAULT_SITE_URL;
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    return `https://${vercel.replace(/^https?:\/\//, "")}`;
  }

  return "http://localhost:3000";
}

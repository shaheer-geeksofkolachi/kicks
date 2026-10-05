import type { MetadataRoute } from "next";
import { fetchProducts } from "@/lib/products";
import { getSiteUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const products = await fetchProducts();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${base}/catalog`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${base}/catalog/deals`,
      changeFrequency: "daily",
      priority: 0.85,
    },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${base}/products/${product.id}`,
    lastModified: new Date(product.updated_at),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes];
}

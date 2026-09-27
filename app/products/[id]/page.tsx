import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";
import { SiteHeader } from "@/components/SiteHeader";
import { fetchProductById } from "@/lib/products";

type PageProps = { params: Promise<{ id: string }> };

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const product = await fetchProductById(id);
  if (!product) notFound();

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const pageUrl = `${baseUrl.replace(/\/$/, "")}/products/${id}`;

  return (
    <div className="product-page min-h-screen bg-[#120e0c] text-[#f3ece4]">
      <SiteHeader />
      <main className="mx-auto max-w-[1120px] px-[18px] py-6 pb-8 sm:px-10 sm:py-8">
        <Link
          href="/"
          className="mb-5 inline-flex items-center gap-1.5 text-[13px] text-[#a89a8c] transition hover:text-[#ff7a1a]"
        >
          ← Back to catalog
        </Link>
        <ProductDetailClient product={product} pageUrl={pageUrl} />
      </main>
    </div>
  );
}

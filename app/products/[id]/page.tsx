import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";
import { PublicShell } from "@/components/PublicShell";
import { fetchProductById } from "@/lib/products";

type PageProps = { params: Promise<{ id: string }> };

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const product = await fetchProductById(id);
  if (!product) notFound();

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const pageUrl = `${baseUrl.replace(/\/$/, "")}/products/${id}`;

  return (
    <PublicShell>
      <main className="product-page mx-auto max-w-[1120px] px-[18px] py-6 sm:px-10 sm:py-8">
        <Link
          href="/catalog"
          className="mb-5 inline-flex items-center gap-1.5 text-[13px] text-[#a89a8c] transition hover:text-[#ff7a1a]"
        >
          ← Back to catalog
        </Link>
        <ProductDetailClient product={product} pageUrl={pageUrl} />
      </main>
    </PublicShell>
  );
}

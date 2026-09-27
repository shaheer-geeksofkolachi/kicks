import Image from "next/image";
import Link from "next/link";
import { formatPkr } from "@/lib/format";
import { primaryImageUrl } from "@/lib/media";
import type { Product } from "@/lib/types";
import { SoldOverlay } from "@/components/SoldOverlay";

export function ProductCard({ product }: { product: Product }) {
  const imageUrl = primaryImageUrl(product.product_media);
  const href = `/products/${product.id}`;

  return (
    <Link
      href={href}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-[#141414] transition hover:border-[#FF8C00]/50 hover:shadow-[0_0_24px_rgba(255,140,0,0.15)]"
    >
      <div className="relative aspect-square bg-zinc-900">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-zinc-600">No image</div>
        )}
        {product.is_sold && <SoldOverlay />}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-xs font-medium tracking-wide text-[#FF8C00] uppercase">{product.brand}</p>
        <h2 className="font-display text-lg leading-tight text-white">{product.name}</h2>
        <p className="mt-auto pt-2 text-sm font-semibold text-[#FFD700]">{formatPkr(product.price_pkr)}</p>
      </div>
    </Link>
  );
}

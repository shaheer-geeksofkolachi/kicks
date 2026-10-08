import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { fetchProductReviewByProductId } from "@/lib/product-reviews";
import { fetchProductById } from "@/lib/products";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = await fetchProductById(id);
  if (!product) notFound();
  const productReview = await fetchProductReviewByProductId(id);

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl text-white">Edit product</h1>
      <ProductForm product={product} productReview={productReview} />
    </div>
  );
}

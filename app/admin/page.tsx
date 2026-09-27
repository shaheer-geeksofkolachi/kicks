import Link from "next/link";
import { AdminProductTable } from "@/components/admin/AdminProductTable";
import { fetchProducts } from "@/lib/products";

export default async function AdminDashboardPage() {
  const products = await fetchProducts();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl text-white">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded-lg bg-[#FF8C00] px-4 py-2 text-sm font-semibold text-black hover:bg-[#FFD700]"
        >
          Add product
        </Link>
      </div>
      <AdminProductTable products={products} />
    </div>
  );
}

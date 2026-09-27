import { AdminNav } from "@/components/admin/AdminNav";
import { SiteHeader } from "@/components/SiteHeader";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100">
      <SiteHeader />
      <AdminNav />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}

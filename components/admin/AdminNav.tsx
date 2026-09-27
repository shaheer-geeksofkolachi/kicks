"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNav() {
  const pathname = usePathname();
  if (pathname === "/admin/login") return null;

  return (
    <div className="border-b border-zinc-800 bg-[#111]">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-2 text-sm sm:px-6">
        <Link href="/admin" className="text-zinc-400 hover:text-[#FFD700]">Dashboard</Link>
        <Link href="/admin/products/new" className="text-zinc-400 hover:text-[#FFD700]">Add product</Link>
        <button
          type="button"
          className="ml-auto text-zinc-500 hover:text-red-400"
          onClick={async () => {
            await fetch("/api/admin/logout", { method: "POST" });
            window.location.href = "/admin/login";
          }}
        >
          Log out
        </button>
      </div>
    </div>
  );
}

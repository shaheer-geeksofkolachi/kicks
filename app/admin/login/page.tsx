"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = e.currentTarget;
    const username = (form.elements.namedItem("username") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Login failed");
      setLoading(false);
      return;
    }

    const from = searchParams.get("from") || "/admin";
    router.push(from);
    router.refresh();
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
      <Image src="/logo.png" alt="" width={80} height={80} className="mb-6 rounded-full" />
      <h1 className="font-display text-2xl text-white">Admin login</h1>
      <form onSubmit={onSubmit} className="mt-8 w-full max-w-sm space-y-4">
        {error && (
          <p className="rounded-lg border border-red-800 bg-red-950/40 px-3 py-2 text-sm text-red-200">{error}</p>
        )}
        <input
          name="username"
          autoComplete="username"
          required
          placeholder="Username"
          className="w-full rounded-lg border border-zinc-700 bg-[#141414] px-4 py-2.5 text-white outline-none ring-[#FF8C00] focus:ring-2"
        />
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="Password"
          className="w-full rounded-lg border border-zinc-700 bg-[#141414] px-4 py-2.5 text-white outline-none ring-[#FF8C00] focus:ring-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[#FF8C00] py-2.5 font-semibold text-black hover:bg-[#FFD700] disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

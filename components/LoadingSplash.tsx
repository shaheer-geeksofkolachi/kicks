import Image from "next/image";

export function LoadingSplash() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0a]">
      <div className="relative mb-10">
        <div
          className="absolute -inset-6 rounded-full border-2 border-transparent border-t-[#FF8C00] border-r-[#FFD700] animate-spin"
          aria-hidden
        />
        <Image
          src="/logo.png"
          alt="Kicksplosion.pk"
          width={160}
          height={160}
          className="relative rounded-full"
          priority
        />
      </div>
      <p className="font-display text-xl tracking-[0.35em] text-[#FFD700] uppercase">
        Footwear Ignited
      </p>
      <p className="mt-2 text-sm text-zinc-500">Loading catalog…</p>
    </div>
  );
}

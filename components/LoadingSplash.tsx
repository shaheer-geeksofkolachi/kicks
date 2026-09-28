import Image from "next/image";

type LoadingSplashProps = {
  message?: string;
};

export function LoadingSplash({ message = "Loading catalog…" }: LoadingSplashProps) {
  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0a0a]"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
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
      <p className="mt-2 text-sm text-zinc-500">{message}</p>
    </div>
  );
}

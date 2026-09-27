export function SoldOverlay({ large = false }: { large?: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/55">
      <span
        className={`rotate-[-12deg] border-4 border-[#FF8C00] bg-[#1a1a1a]/90 px-4 py-2 font-display font-bold tracking-widest text-[#FF8C00] uppercase shadow-lg ${
          large ? "text-4xl sm:text-5xl" : "text-2xl"
        }`}
      >
        Sold
      </span>
    </div>
  );
}

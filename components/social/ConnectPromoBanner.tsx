import { ConnectLinks } from "@/components/social/ConnectLinks";

export function ConnectPromoBanner() {
  return (
    <section
      aria-label="Connect with Kicksplosion.pk"
      className="border-b border-[#ff7a1a]/25 bg-gradient-to-r from-[#2a1810] via-[#1f1410] to-[#2a1810]"
    >
      <div className="mx-auto max-w-[1120px] px-[18px] py-5 sm:px-10 sm:py-6">
        <div className="text-center">
          <p className="text-[11px] font-bold tracking-[0.25em] text-[#ff7a1a] uppercase">Official channels</p>
          <h2 className="mt-1 font-display text-xl font-semibold text-[#f3ece4] sm:text-2xl">
            Follow us &amp; order on WhatsApp
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-[#a89a8c]">
            DM us on Instagram or Facebook for drops, or message us directly on WhatsApp for the fastest reply.
          </p>
        </div>
        <div className="mt-5">
          <ConnectLinks variant="banner" />
        </div>
      </div>
    </section>
  );
}

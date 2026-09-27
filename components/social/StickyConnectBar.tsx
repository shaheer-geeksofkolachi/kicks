import { ConnectLinks } from "@/components/social/ConnectLinks";

export function StickyConnectBar() {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[#2c2119] bg-[#120e0c]/95 shadow-[0_-8px_32px_rgba(0,0,0,0.55)] backdrop-blur-md pb-[env(safe-area-inset-bottom)]"
      role="region"
      aria-label="Quick contact"
    >
      <p className="bg-[#ff7a1a] py-1 text-center text-[10px] font-bold tracking-wide text-[#120e0c] uppercase sm:text-xs">
        Official Instagram · Facebook · WhatsApp
      </p>
      <ConnectLinks variant="sticky" />
    </div>
  );
}

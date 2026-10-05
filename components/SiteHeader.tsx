import Image from "next/image";
import Link from "next/link";
import { ConnectLinks } from "@/components/social/ConnectLinks";
import { SITE_DISPLAY_NAME, SITE_TAGLINE } from "@/lib/site-url";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#2c2119] bg-[#120e0c]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-3 px-[18px] py-3.5 sm:gap-4 sm:px-10 sm:py-[18px]">
        <Link href="/" className="brand flex min-w-0 items-center gap-3">
          <Image
            src="/logo.png"
            alt={SITE_DISPLAY_NAME}
            width={38}
            height={38}
            className="rounded-full"
            priority
          />
          <div>
            <p className="text-[17px] font-bold leading-tight tracking-wide text-[#f3ece4]">
              {SITE_DISPLAY_NAME}
            </p>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-[#ff7a1a] uppercase">
              {SITE_TAGLINE}
            </p>
          </div>
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-4">
          <ConnectLinks variant="header" />
          <nav className="flex items-center gap-4 border-l border-[#2c2119] pl-3 sm:gap-5 sm:pl-4">
            <Link href="/catalog" className="text-[13px] text-[#a89a8c] transition hover:text-[#ff7a1a]">
              Catalog
            </Link>
            <Link href="/admin/login" className="text-[13px] text-[#a89a8c] transition hover:text-[#ff7a1a]">
              Admin
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

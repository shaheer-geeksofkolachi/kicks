import Image from "next/image";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#2c2119] bg-[#120e0c]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-4 px-[18px] py-3.5 sm:px-10 sm:py-[18px]">
        <Link href="/" className="brand flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Kicksplosion.pk"
            width={38}
            height={38}
            className="rounded-full"
            priority
          />
          <div>
            <p className="text-[17px] font-bold leading-tight tracking-wide text-[#f3ece4]">
              Kicksplosion.pk
            </p>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-[#ff7a1a] uppercase">
              Footwear Ignited
            </p>
          </div>
        </Link>
        <nav className="flex items-center gap-5 sm:gap-[22px]">
          <Link
            href="/"
            className="text-[13px] text-[#a89a8c] transition hover:text-[#ff7a1a]"
          >
            Catalog
          </Link>
          <Link
            href="/admin/login"
            className="text-[13px] text-[#a89a8c] transition hover:text-[#ff7a1a]"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}

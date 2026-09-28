export function SiteFooter() {
  return (
    <footer className="border-t border-[#2c2119] bg-[#0d0a09]">
      <div className="mx-auto max-w-[1120px] px-[18px] py-10 sm:px-10 sm:py-12">
        <div className="text-center">
          <p className="font-display text-2xl font-semibold text-[#f3ece4]">Kicksplosion.pk</p>
          <p className="mt-1 text-sm text-[#ff7a1a]">Footwear Ignited</p>
          <p className="mx-auto mt-4 max-w-md text-sm text-[#6b5d52]">
            Pakistan&apos;s premium sneaker catalog — browse the latest drops and order your pair.
          </p>
        </div>
        <p className="mt-10 text-center text-xs text-[#4a4038]">
          © {new Date().getFullYear()} Kicksplosion.pk — All rights reserved.
        </p>
      </div>
    </footer>
  );
}

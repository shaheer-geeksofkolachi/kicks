import { HeroBanner } from "@/components/HeroBanner";
import { SiteFooter } from "@/components/social/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

type PublicShellProps = {
  children: React.ReactNode;
  /** Extra bottom padding so content isn’t hidden behind the sticky bar */
  contentClassName?: string;
};

export function PublicShell({ children, contentClassName = "" }: PublicShellProps) {
  return (
    <div className="min-h-screen bg-[#120e0c] text-[#f3ece4]">
      <SiteHeader />
      <HeroBanner />
      <div className={contentClassName}>{children}</div>
      <SiteFooter />
    </div>
  );
}

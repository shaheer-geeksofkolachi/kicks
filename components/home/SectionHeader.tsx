import Link from "next/link";

type SectionHeaderProps = {
  label: string;
  title: string;
  description?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
};

export function SectionHeader({
  label,
  title,
  description,
  viewAllHref,
  viewAllLabel = "View all",
}: SectionHeaderProps) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4 sm:mb-6">
      <div>
        <p className="text-xs font-semibold tracking-[0.2em] text-[#ff7a1a] uppercase">{label}</p>
        <h2 className="mt-2 font-display text-2xl leading-tight tracking-tight text-[#f3ece4] sm:text-3xl">
          {title}
        </h2>
        {description && <p className="mt-2 max-w-lg text-sm text-[#a89a8c]">{description}</p>}
      </div>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="shrink-0 rounded-xl border border-[#ff7a1a]/40 bg-[#ff7a1a]/10 px-4 py-2 text-sm font-semibold text-[#ff9a4d] transition hover:border-[#ff7a1a] hover:bg-[#ff7a1a]/20"
        >
          {viewAllLabel}
        </Link>
      )}
    </div>
  );
}

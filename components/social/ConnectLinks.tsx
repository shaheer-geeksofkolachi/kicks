import {
  FACEBOOK_URL,
  getWhatsAppChatUrl,
  getWhatsAppDisplayNumber,
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
} from "@/lib/site-links";
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from "@/components/social/SocialIcons";

type ConnectLinksProps = {
  variant: "header" | "banner" | "footer" | "sticky";
};

const linkBase =
  "inline-flex items-center justify-center gap-2 font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff7a1a]";

export function ConnectLinks({ variant }: ConnectLinksProps) {
  const whatsappUrl = getWhatsAppChatUrl();
  const whatsappLabel = getWhatsAppDisplayNumber();

  if (variant === "header") {
    return (
      <div className="flex items-center gap-1.5 sm:gap-2">
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`${linkBase} rounded-full border border-[#3d2b1c] bg-[#1a1410] p-2 text-[#f3ece4] hover:border-[#ff7a1a] hover:text-[#ff9a4d] sm:px-3 sm:py-2`}
          aria-label="Instagram — Kicksplosion.pk"
        >
          <InstagramIcon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
          <span className="hidden text-xs lg:inline">{INSTAGRAM_HANDLE}</span>
        </a>
        <a
          href={FACEBOOK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`${linkBase} rounded-full border border-[#3d2b1c] bg-[#1a1410] p-2 text-[#f3ece4] hover:border-[#1877f2] hover:text-[#6eb1ff] sm:px-3 sm:py-2`}
          aria-label="Facebook — Kicksplosion.pk"
        >
          <FacebookIcon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
          <span className="hidden text-xs lg:inline">Facebook</span>
        </a>
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${linkBase} rounded-full border border-[#25d366]/40 bg-[#25d366]/15 px-2.5 py-2 text-[#5dffa8] hover:bg-[#25d366]/25 sm:px-3`}
            aria-label={`WhatsApp ${whatsappLabel ?? ""}`}
          >
            <WhatsAppIcon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
            <span className="hidden text-xs font-bold md:inline">{whatsappLabel}</span>
          </a>
        )}
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`${linkBase} w-full rounded-xl bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] px-5 py-3.5 text-sm text-white shadow-lg hover:brightness-110 sm:w-auto sm:min-w-[200px]`}
        >
          <InstagramIcon className="h-5 w-5" />
          Follow on Instagram
        </a>
        <a
          href={FACEBOOK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`${linkBase} w-full rounded-xl bg-[#1877f2] px-5 py-3.5 text-sm text-white shadow-lg hover:bg-[#166fe5] sm:w-auto sm:min-w-[200px]`}
        >
          <FacebookIcon className="h-5 w-5" />
          Follow on Facebook
        </a>
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${linkBase} w-full rounded-xl bg-[#25d366] px-5 py-3.5 text-sm text-[#052e16] shadow-lg hover:bg-[#20bd5a] sm:w-auto sm:min-w-[220px]`}
          >
            <WhatsAppIcon className="h-5 w-5" />
            WhatsApp {whatsappLabel}
          </a>
        )}
      </div>
    );
  }

  if (variant === "sticky") {
    return (
      <div className="grid grid-cols-3 gap-1 px-2 py-2 sm:gap-2 sm:px-4">
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`${linkBase} flex-col rounded-lg bg-gradient-to-b from-[#f09433] to-[#bc1888] py-2.5 text-[10px] text-white sm:flex-row sm:py-3 sm:text-xs`}
        >
          <InstagramIcon className="h-5 w-5 sm:h-4 sm:w-4" />
          Instagram
        </a>
        <a
          href={FACEBOOK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={`${linkBase} flex-col rounded-lg bg-[#1877f2] py-2.5 text-[10px] text-white sm:flex-row sm:py-3 sm:text-xs`}
        >
          <FacebookIcon className="h-5 w-5 sm:h-4 sm:w-4" />
          Facebook
        </a>
        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${linkBase} flex-col rounded-lg bg-[#25d366] py-2.5 text-[10px] font-bold text-[#052e16] sm:flex-row sm:py-3 sm:text-xs`}
          >
            <WhatsAppIcon className="h-5 w-5 sm:h-4 sm:w-4" />
            <span className="text-center leading-tight">WhatsApp</span>
          </a>
        ) : (
          <span className="rounded-lg bg-zinc-800 py-2.5 text-center text-[10px] text-zinc-500">WhatsApp</span>
        )}
      </div>
    );
  }

  // footer
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:justify-center">
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`${linkBase} rounded-xl border border-[#3d2b1c] px-5 py-3 text-sm text-[#f3ece4] hover:border-[#ff7a1a]`}
      >
        <InstagramIcon className="h-5 w-5 text-[#ff6b9d]" />
        {INSTAGRAM_HANDLE}
      </a>
      <a
        href={FACEBOOK_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`${linkBase} rounded-xl border border-[#3d2b1c] px-5 py-3 text-sm text-[#f3ece4] hover:border-[#1877f2]`}
      >
        <FacebookIcon className="h-5 w-5 text-[#1877f2]" />
        Facebook Page
      </a>
      {whatsappUrl && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${linkBase} rounded-xl border border-[#25d366]/50 bg-[#25d366]/10 px-5 py-3 text-sm text-[#5dffa8] hover:bg-[#25d366]/20`}
        >
          <WhatsAppIcon className="h-5 w-5" />
          {whatsappLabel}
        </a>
      )}
    </div>
  );
}

import Link from "next/link";

const ACCENT = "#f07a2c";
const BANNER_ASPECT = 2400 / 340;

function HeroSneakerSvg() {
  return (
    <svg
      viewBox="-260 60 1140 380"
      className="pointer-events-none absolute overflow-visible"
      style={{
        left: "54.17%",
        top: "5.88%",
        width: "35.83%",
        height: "84.4%",
        transform: "rotate(-8deg)",
      }}
      aria-hidden
    >
      <path
        d="M120 400 C40 404 -60 380 -170 330 C-110 332 -70 322 -40 306 C-120 290 -180 250 -230 190 C-160 214 -100 214 -60 204 C-110 170 -140 120 -150 70 C-90 130 -20 160 60 180 C40 150 40 120 60 90 C80 150 110 180 130 200 Z"
        fill={ACCENT}
      />
      <path
        d="M120 390 C60 392 -10 376 -90 344 C-50 340 -20 330 0 316 C-60 300 -110 270 -140 230 C-90 244 -50 244 -20 236 C-50 210 -70 180 -76 150 C-30 190 20 212 80 226 L120 250 Z"
        fill="#f7a23a"
      />
      <path
        d="M120 380 C80 380 30 370 -20 350 C10 346 30 338 44 326 C0 314 -30 296 -50 272 C-10 282 30 282 60 276 L120 290 Z"
        fill="#ffd54a"
      />
      <path
        d="M70 360 C70 330 90 318 130 316 L780 316 C830 316 858 336 858 364 C858 392 832 404 790 404 L120 404 C88 404 70 390 70 360 Z"
        fill="#f4ede4"
      />
      <path d="M90 384 L840 384" stroke="#14110f" strokeWidth="4" strokeDasharray="14 12" />
      <path
        d="M110 318 C110 240 140 170 210 140 C260 118 300 150 340 170 C400 200 470 206 540 214 C640 226 740 252 800 292 C830 312 830 318 820 318 Z"
        fill="#2a2420"
        stroke="#f4ede4"
        strokeWidth="4"
      />
      <path
        d="M210 140 C230 110 270 96 300 104 C320 110 330 130 340 170 C300 150 260 118 210 140 Z"
        fill="#f4ede4"
      />
      <path
        d="M150 300 C220 230 330 220 470 262 C560 290 660 300 760 300"
        fill="none"
        stroke={ACCENT}
        strokeWidth="22"
        strokeLinecap="round"
      />
      <g stroke="#f4ede4" strokeWidth="7" strokeLinecap="round">
        <line x1="350" y1="182" x2="392" y2="160" />
        <line x1="388" y1="194" x2="430" y2="172" />
        <line x1="426" y1="204" x2="468" y2="182" />
        <line x1="464" y1="212" x2="506" y2="190" />
      </g>
      <circle cx="170" cy="250" r="14" fill="#f4ede4" />
    </svg>
  );
}

/** Live banner from `Website banner 2400×340-html/Banner.dc.html` (scales to full width). */
export function HeroBanner() {
  return (
    <section className="w-full border-b border-[#2c2119] bg-[#14110f]" aria-label="Kicksplosion.pk hero">
      <Link
        href="/catalog"
        className="group relative mx-auto block w-full max-w-[2400px] overflow-hidden transition hover:brightness-[1.03]"
        style={{ aspectRatio: String(BANNER_ASPECT) }}
      >
        <div
          className="absolute inset-0 text-[#f4ede4]"
          style={{
            background:
              "radial-gradient(ellipse 37.5% 123.5% at 71.67% 58.8%, #3a1d0e 0%, #14110f 70%)",
          }}
        >
          <div
            className="absolute inset-x-0 bottom-0 h-[2px] opacity-60"
            style={{ background: ACCENT }}
          />

          <div
            className="absolute top-0 bottom-0 flex flex-col justify-center"
            style={{
              left: "17.5%",
              width: "34.17%",
              gap: "clamp(6px, 0.58vw, 14px)",
            }}
          >
            <p
              className="m-0 font-medium uppercase"
              style={{
                color: ACCENT,
                fontSize: "clamp(9px, 0.75vw, 18px)",
                letterSpacing: "clamp(2px, 0.25vw, 6px)",
              }}
            >
              Thrifted · Pre-loved · Footwear ignited
            </p>
            <h2
              className="m-0 font-display font-bold uppercase leading-[0.95]"
              style={{
                fontSize: "clamp(26px, 5vw, 120px)",
                letterSpacing: "1px",
              }}
            >
              Second steps<span style={{ color: ACCENT }}>.</span>
            </h2>
            <p
              className="m-0 text-[#b9ada0]"
              style={{ fontSize: "clamp(11px, 0.92vw, 22px)" }}
            >
              Hand-picked pre-loved kicks. New pairs weekly.
            </p>
          </div>

          <HeroSneakerSvg />
        </div>
        <span className="sr-only">Shop the catalog</span>
      </Link>
    </section>
  );
}

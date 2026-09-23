import Link from "next/link";

export type AboutHeroData = {
  headline?: string | null;
  description?: string | null;
  primaryLabel?: string | null;
  primaryUrl?: string | null;
  secondaryLabel?: string | null;
  secondaryUrl?: string | null;
};

type AboutHeroProps = {
  pageTitle: string;
  hero?: AboutHeroData | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
};

export default function AboutHero({
  pageTitle,
  hero,
  imageUrl,
  imageAlt,
}: AboutHeroProps) {
  const headline = hero?.headline || pageTitle;
  const description = hero?.description;

  const showPrimary = Boolean(hero?.primaryLabel && hero?.primaryUrl);
  const showSecondary = Boolean(hero?.secondaryLabel && hero?.secondaryUrl);
  const hasImage = Boolean(imageUrl);

  return (
    <section className="codm-hero-section relative overflow-hidden">
      <div
        className={`mx-auto grid max-w-[1240px] items-center gap-12 px-6 pb-20 pt-[150px] ${
          hasImage ? "min-h-[620px] lg:grid-cols-2" : "min-h-[380px]"
        }`}
      >
        {/* ---------- Left: text ---------- */}
        <div>
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-[16px]"
          >
            <Link href="/" className="codm-hero-breadcrumb-link transition-colors">
              Home
            </Link>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              className="codm-hero-chevron"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
            <span aria-current="page" className="text-[#8b6cf6]">
              {pageTitle}
            </span>
          </nav>

          <h1 className="mt-6 max-w-[640px] text-[clamp(40px,5.2vw,68px)] font-normal leading-[1.05] tracking-[-0.035em] text-[var(--foreground)] [text-wrap:balance]">
            {headline}
          </h1>

          {description && (
            <p className="codm-hero-body mt-6 max-w-[560px] text-[clamp(16px,1.4vw,19px)] leading-[1.65]">
              {description}
            </p>
          )}

          {(showPrimary || showSecondary) && (
            <div className="mt-9 flex flex-wrap items-center gap-4">
              {showPrimary && (
                <Link
                  href={hero!.primaryUrl!}
                  className="inline-flex h-[54px] items-center justify-center rounded-full bg-[linear-gradient(90deg,#8b5cf6_0%,#6d4ff0_100%)] px-8 text-[17px] font-medium text-white shadow-[0_10px_30px_-10px_rgba(109,79,240,0.7)] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6d4ff0]"
                >
                  {hero!.primaryLabel}
                </Link>
              )}

              {showSecondary && (
                <Link
                  href={hero!.secondaryUrl!}
                  className="codm-hero-secondary-btn inline-flex h-[54px] items-center justify-center rounded-full px-7 text-[17px] font-medium backdrop-blur transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6d4ff0]"
                >
                  {hero!.secondaryLabel}
                </Link>
              )}
            </div>
          )}
        </div>

        {/* ---------- Right: image (only if a Featured image is set) ---------- */}
        {hasImage && (
          <div className="flex justify-center lg:justify-end">
            <img
              src={imageUrl!}
              alt={imageAlt || pageTitle}
              className="w-full max-w-[520px] select-none"
              draggable={false}
            />
          </div>
        )}
      </div>
    </section>
  );
}

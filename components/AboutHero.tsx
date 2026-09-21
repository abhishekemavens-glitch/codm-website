import Link from "next/link";

/*
 * Save as: components/AboutHero.tsx
 *
 * Needs one image in /public:
 *   public/about/about-orbit.png  (the orbit graphic exported from Figma)
 */

type AboutHeroProps = {
  titleLine1?: string;
  titleLine2?: string;
  description?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  orbitImage?: string;
};

export default function AboutHero({
  titleLine1 = "Turning complexity",
  titleLine2 = "into progress.",
  description = "Turn learner data into personalised experiences, proactive support, and measurable outcomes.",
  primaryCta = { label: "Book a Consultation", href: "/contact" },
  secondaryCta = { label: "Explore Services", href: "#services" },
  orbitImage = "/about/about-orbit.png",
}: AboutHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#eef0fc_0%,#e8e7fb_55%,#dcd5fa_100%)]">
      <div className="mx-auto grid min-h-[620px] max-w-[1240px] items-center gap-12 px-6 pb-20 pt-[150px] lg:grid-cols-2">
        {/* ---------- Left: text ---------- */}
        <div>
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-[16px]"
          >
            <Link
              href="/"
              className="text-[#3f4358] transition-colors hover:text-[#7c5cf0]"
            >
              Home
            </Link>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9aa0b4"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
            <span aria-current="page" className="text-[#8b6cf6]">
              About Us
            </span>
          </nav>

          <h1 className="mt-6 text-[clamp(40px,5.2vw,68px)] font-normal leading-[1.05] tracking-[-0.035em] text-[var(--foreground)]">
            {titleLine1}
            <br />
            {titleLine2}
          </h1>

          <p className="mt-6 max-w-[560px] text-[clamp(16px,1.4vw,19px)] leading-[1.65] text-[#6b7086]">
            {description}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href={primaryCta.href}
              className="inline-flex h-[54px] items-center justify-center rounded-full bg-[linear-gradient(90deg,#8b5cf6_0%,#6d4ff0_100%)] px-8 text-[17px] font-medium text-white shadow-[0_10px_30px_-10px_rgba(109,79,240,0.7)] transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6d4ff0]"
            >
              {primaryCta.label}
            </Link>

            <Link
              href={secondaryCta.href}
              className="inline-flex h-[54px] items-center justify-center rounded-full border border-white/70 bg-white/40 px-7 text-[17px] font-medium text-[#3f4358] backdrop-blur transition-colors hover:bg-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6d4ff0]"
            >
              {secondaryCta.label}
            </Link>
          </div>
        </div>

        {/* ---------- Right: orbit graphic ---------- */}
        <div className="flex justify-center lg:justify-end">
          <img
            src={orbitImage}
            alt="CodM at the centre of Salesforce, Agentforce, AI, .NET, Python, automation and MemberClicks"
            className="w-full max-w-[520px] select-none"
            draggable={false}
          />
        </div>
      </div>
    </section>
  );
}

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

  /*
   * IMPORTANT:
   * The rotating technology animation is ONLY enabled
   * on the About page.
   */
  const isAboutPage = pageTitle.trim().toLowerCase() === "about";

  return (
    <section className="codm-hero-section relative overflow-hidden">
      <div
        className={`mx-auto grid max-w-[1240px] items-center gap-12 px-6 pb-20 pt-[150px] ${
          hasImage ? "min-h-[620px] lg:grid-cols-2" : "min-h-[380px]"
        }`}
      >
        {/* =====================================================
            LEFT: TEXT
            ===================================================== */}
        <div>
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-[16px]"
          >
            <Link
              href="/"
              className="codm-hero-breadcrumb-link transition-colors"
            >
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

        {/* =====================================================
            RIGHT: IMAGE / ABOUT ORBIT
            ===================================================== */}
        {hasImage && (
          <div className="flex justify-center lg:justify-end">
            {isAboutPage ? (
              /* =================================================
                 ABOUT PAGE ONLY
                 Rotating technology ecosystem
                 ================================================= */
              <div className="codm-about-orbit-wrapper">
                <div className="codm-about-orbit">

                  {/* Background rings */}
                  <div className="codm-about-orbit-ring codm-ring-outer" />
                  <div className="codm-about-orbit-ring codm-ring-middle" />
                  <div className="codm-about-orbit-ring codm-ring-inner" />

                  {/* Center CODM */}
                  <div className="codm-about-center">
                    <div className="codm-about-center-logo">
                      cod<span>m</span>
                    </div>
                  </div>

                  {/* Rotating elements */}
                  <div className="codm-about-rotator">

                    {/* Salesforce */}
                    <div className="codm-about-orbit-item codm-about-salesforce">
                      <div className="codm-about-orbit-content">
                        <div className="codm-about-logo-circle">
                          <img
                            src="https://cdn.simpleicons.org/salesforce/00A1E0"
                            alt="Salesforce"
                          />
                        </div>
                        <span>Salesforce</span>
                      </div>
                    </div>

                    {/* Agentforce */}
                    <div className="codm-about-orbit-item codm-about-agentforce">
                      <div className="codm-about-orbit-content">
                        <div className="codm-about-logo-circle">
                          <img
                            src="https://cdn.simpleicons.org/salesforce/00A1E0"
                            alt="Agentforce"
                          />
                        </div>
                        <span>Agentforce</span>
                      </div>
                    </div>

                    {/* AI LLM */}
                    <div className="codm-about-orbit-item codm-about-llm">
                      <div className="codm-about-orbit-content">
                        <div className="codm-about-logo-circle">
                          <span className="codm-about-ai-icon">
                            AI
                          </span>
                        </div>
                        <span>AI LLM</span>
                      </div>
                    </div>

                    {/* .NET */}
                    <div className="codm-about-orbit-item codm-about-dotnet">
                      <div className="codm-about-orbit-content">
                        <div className="codm-about-logo-circle">
                          <img
                            src="https://cdn.simpleicons.org/dotnet/512BD4"
                            alt=".NET"
                          />
                        </div>
                        <span>.Net</span>
                      </div>
                    </div>

                    {/* Python */}
                    <div className="codm-about-orbit-item codm-about-python">
                      <div className="codm-about-orbit-content">
                        <div className="codm-about-logo-circle">
                          <img
                            src="https://cdn.simpleicons.org/python/3776AB"
                            alt="Python"
                          />
                        </div>
                        <span>Python</span>
                      </div>
                    </div>

                    {/* MemberClicks */}
                    <div className="codm-about-orbit-item codm-about-memberclicks">
                      <div className="codm-about-orbit-content">
                        <div className="codm-about-logo-circle">
                          <span className="codm-about-member-icon">
                            MC
                          </span>
                        </div>
                        <span>MemberClicks</span>
                      </div>
                    </div>

                    {/* Automation */}
                    <div className="codm-about-orbit-item codm-about-automation">
                      <div className="codm-about-orbit-content">
                        <div className="codm-about-logo-circle">
                          <span className="codm-about-automation-icon">
                            ⚙
                          </span>
                        </div>
                        <span>Automation</span>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            ) : (
              /* =================================================
                 ALL OTHER PAGES
                 Normal static featured image
                 ================================================= */
              <img
                src={imageUrl!}
                alt={imageAlt || pageTitle}
                className="w-full max-w-[520px] select-none"
                draggable={false}
              />
            )}
          </div>
        )}
      </div>

      {/* =======================================================
          ABOUT ORBIT CSS
          These styles only affect the About orbit.
          ======================================================= */}
      {isAboutPage && (
        <style>{`
          .codm-about-orbit-wrapper {
            width: 100%;
            max-width: 520px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .codm-about-orbit {
            position: relative;
            width: 520px;
            height: 520px;
            max-width: 100%;
            aspect-ratio: 1 / 1;
          }

          /* -----------------------------------------------
             BACKGROUND
             ----------------------------------------------- */

          .codm-about-orbit::before {
            content: "";
            position: absolute;
            inset: 5%;
            border-radius: 50%;
            background:
              radial-gradient(
                circle,
                rgba(139, 108, 246, 0.14) 0%,
                rgba(139, 108, 246, 0.08) 42%,
                rgba(139, 108, 246, 0.035) 65%,
                transparent 72%
              );
          }

          .codm-about-orbit-ring {
            position: absolute;
            border-radius: 50%;
            pointer-events: none;
          }

          .codm-ring-outer {
            inset: 5%;
            border: 1px solid rgba(139, 108, 246, 0.20);
          }

          .codm-ring-middle {
            inset: 15%;
            border: 1px solid rgba(139, 108, 246, 0.13);
          }

          .codm-ring-inner {
            inset: 29%;
            background: rgba(139, 108, 246, 0.06);
          }

          /* -----------------------------------------------
             CENTER CODM
             ----------------------------------------------- */

          .codm-about-center {
            position: absolute;
            left: 50%;
            top: 50%;
            width: 185px;
            height: 185px;

            transform: translate(-50%, -50%);

            border-radius: 50%;

            display: flex;
            align-items: center;
            justify-content: center;

            background:
              radial-gradient(
                circle,
                rgba(139, 108, 246, 0.17),
                rgba(139, 108, 246, 0.035) 70%
              );

            z-index: 20;
          }

          .codm-about-center-logo {
            font-size: 58px;
            line-height: 1;
            font-weight: 400;
            letter-spacing: -4px;
            color: #20283a;
          }

          .codm-about-center-logo span {
            color: #7967f5;
          }

          /* -----------------------------------------------
             ROTATING ORBIT
             ----------------------------------------------- */

          .codm-about-rotator {
            position: absolute;
            inset: 0;

            transform-origin: center center;

            animation:
              codmAboutOrbit 28s linear infinite;
          }

          @keyframes codmAboutOrbit {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          /* -----------------------------------------------
             INDIVIDUAL POSITION WRAPPER
             ----------------------------------------------- */

          .codm-about-orbit-item {
            position: absolute;
            width: 100px;
          }

          /* -----------------------------------------------
             KEEP CONTENT UPRIGHT
             ----------------------------------------------- */

          .codm-about-orbit-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;

            animation:
              codmAboutCounterRotate 28s linear infinite;
          }

          @keyframes codmAboutCounterRotate {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(-360deg);
            }
          }

          /* -----------------------------------------------
             LOGO CIRCLE
             ----------------------------------------------- */

          .codm-about-logo-circle {
            width: 68px;
            height: 68px;

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 50%;

            background: rgba(255, 255, 255, 0.92);

            border: 1px solid rgba(139, 108, 246, 0.16);

            box-shadow:
              0 8px 25px rgba(85, 75, 150, 0.12),
              0 0 20px rgba(139, 108, 246, 0.10);

            backdrop-filter: blur(8px);
          }

          .codm-about-logo-circle img {
            width: 42px;
            height: 42px;
            object-fit: contain;
          }

          /* -----------------------------------------------
             LABELS
             ----------------------------------------------- */

          .codm-about-orbit-content > span {
            margin-top: 7px;

            padding: 4px 10px;

            border-radius: 20px;

            background: rgba(255, 255, 255, 0.94);

            color: #4b5870;

            font-size: 12px;
            line-height: 1.2;

            white-space: nowrap;

            box-shadow:
              0 3px 12px rgba(60, 70, 100, 0.08);
          }

          /* -----------------------------------------------
             SPECIAL ICONS
             ----------------------------------------------- */

          .codm-about-ai-icon {
            font-size: 17px;
            font-weight: 700;
            color: #4f46e5;
          }

          .codm-about-member-icon {
            font-size: 14px;
            font-weight: 700;
            color: #4b8c55;
          }

          .codm-about-automation-icon {
            font-size: 30px;
            line-height: 1;
            color: #4f46e5;
          }

          /* -----------------------------------------------
             POSITIONS
             ----------------------------------------------- */

          .codm-about-salesforce {
            top: 1%;
            left: 50%;
            transform: translateX(-50%);
          }

          .codm-about-agentforce {
            top: 16%;
            left: 7%;
          }

          .codm-about-llm {
            top: 16%;
            right: 5%;
          }

          .codm-about-dotnet {
            top: 45%;
            right: 0%;
          }

          .codm-about-python {
            bottom: 7%;
            right: 17%;
          }

          .codm-about-memberclicks {
            bottom: 5%;
            left: 27%;
          }

          .codm-about-automation {
            top: 45%;
            left: 0%;
          }

          /* -----------------------------------------------
             MOBILE
             ----------------------------------------------- */

          @media (max-width: 768px) {
            .codm-about-orbit-wrapper {
              max-width: 430px;
            }

            .codm-about-orbit {
              width: 430px;
              height: 430px;
            }

            .codm-about-center {
              width: 145px;
              height: 145px;
            }

            .codm-about-center-logo {
              font-size: 45px;
            }

            .codm-about-logo-circle {
              width: 56px;
              height: 56px;
            }

            .codm-about-logo-circle img {
              width: 34px;
              height: 34px;
            }

            .codm-about-orbit-item {
              width: 80px;
            }

            .codm-about-orbit-content > span {
              font-size: 10px;
              padding: 3px 7px;
            }
          }

          @media (max-width: 480px) {
            .codm-about-orbit-wrapper {
              max-width: 340px;
            }

            .codm-about-orbit {
              width: 340px;
              height: 340px;
            }

            .codm-about-center {
              width: 112px;
              height: 112px;
            }

            .codm-about-center-logo {
              font-size: 34px;
              letter-spacing: -2px;
            }

            .codm-about-logo-circle {
              width: 47px;
              height: 47px;
            }

            .codm-about-logo-circle img {
              width: 28px;
              height: 28px;
            }

            .codm-about-orbit-item {
              width: 65px;
            }

            .codm-about-orbit-content > span {
              font-size: 8px;
              padding: 3px 6px;
            }
          }

          /* -----------------------------------------------
             REDUCED MOTION
             ----------------------------------------------- */

          @media (prefers-reduced-motion: reduce) {
            .codm-about-rotator,
            .codm-about-orbit-content {
              animation: none;
            }
          }
        `}</style>
      )}
    </section>
  );
}

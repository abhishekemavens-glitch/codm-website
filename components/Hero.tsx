"use client";

import { useEffect, useState } from "react";
import type { Ref } from "react";
import {
  useMagneticButton,
  useScrollScale,
  useRevealSequence,
} from "@/lib/codm-animations";

type HeroData = {
  id: string;
  databaseId: number;
  title: string;

  mainHeading: string;
  description: string;
  highlight: string;

  button1Text: string;
  button1Url: string;

  button2Text: string;
  button2Url: string;

  heroLogos?: { light?: string | null; dark?: string | null }[] | null;

  videoId?: string;
  videoUrl?: string;

  featuredImage: {
    node: {
      sourceUrl: string;
      altText: string;
    } | null;
  } | null;
};

const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

/* Detects the site's current theme (follows the theme toggle).
   Checks the usual signals (a "dark" class, data-theme, color-scheme),
   and falls back to how dark the page background actually is. */
function detectDark(): boolean {
  if (typeof document === "undefined") return false;

  const html = document.documentElement;
  const body = document.body;

  const attr = (
    html.getAttribute("data-theme") ||
    html.getAttribute("data-mode") ||
    body?.getAttribute("data-theme") ||
    ""
  ).toLowerCase();

  if (attr === "dark") return true;
  if (attr === "light") return false;

  if (html.classList.contains("dark") || body?.classList.contains("dark")) {
    return true;
  }
  if (html.classList.contains("light") || body?.classList.contains("light")) {
    return false;
  }

  // Fallback: measure the real background colour.
  const probe = getComputedStyle(body || html).backgroundColor;
  const match = probe.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    const [r, g, b] = [Number(match[1]), Number(match[2]), Number(match[3])];
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function useIsDark() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const update = () => setIsDark(detectDark());
    update();

    const observer = new MutationObserver(update);
    const opts = {
      attributes: true,
      attributeFilter: ["class", "data-theme", "data-mode", "style"],
    };
    observer.observe(document.documentElement, opts);
    if (document.body) observer.observe(document.body, opts);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", update);

    return () => {
      observer.disconnect();
      mq.removeEventListener("change", update);
    };
  }, []);

  return isDark;
}

export default function Hero() {
  const heroMediaRef = useScrollScale();
  const isDark = useIsDark();

const { ref: heroRevealRef, isVisible: heroVisible } =
  useRevealSequence<HTMLDivElement>(0);

  const [hero, setHero] = useState<HeroData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const primaryButtonRef = useMagneticButton(24);
  const secondaryButtonRef = useMagneticButton(24);

  useEffect(() => {
    async function loadHero() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(WORDPRESS_GRAPHQL_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
              query GetHero {
                heroes(first: 1) {
                  nodes {
                    id
                    databaseId
                    title
                    mainHeading
                    description
                    highlight
                    button1Text
                    button1Url
                    button2Text
                    button2Url
                    heroLogos {
                      light
                      dark
                    }
                    videoId
                    videoUrl
                    featuredImage {
                      node {
                        sourceUrl
                        altText
                      }
                    }
                  }
                }
              }
            `,
          }),
        });

        if (!response.ok) {
          throw new Error(
            `WordPress request failed: ${response.status}`
          );
        }

        const result = await response.json();

        console.log("HERO DATA:", result);

        if (result?.errors) {
          console.error(
            "HERO GRAPHQL ERRORS:",
            result.errors
          );

          setError(
            result.errors
              .map(
                (item: { message?: string }) =>
                  item.message ||
                  "Unknown GraphQL error"
              )
              .join(", ")
          );

          setHero(null);
          return;
        }

        const heroData =
          result?.data?.heroes?.nodes?.[0] ?? null;

        if (!heroData) {
          setError(
            "WordPress returned no Hero posts."
          );

          setHero(null);
          return;
        }

        setHero(heroData);
      } catch (err) {
        console.error(
          "HERO FETCH ERROR:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load Hero from WordPress."
        );

        setHero(null);
      } finally {
        setLoading(false);
      }
    }

    loadHero();
  }, []);

  /* =========================================
     LOADING
     ========================================= */

  if (loading) {
    return (
      <section
        className="
          relative
          min-h-[calc(100vh-78px)]
          overflow-hidden
          bg-[var(--background)]
          pt-[78px]
        "
        aria-hidden="true"
      >
        <div className="mx-auto max-w-[1200px] px-5">
          <div className="min-h-[calc(100vh-78px)]" />
        </div>
      </section>
    );
  }

  /* =========================================
     ERROR
     ========================================= */

  if (error) {
    return (
      <section className="bg-[var(--background)] py-20">
        <div className="mx-auto max-w-[1200px] px-5 text-center">
          <p className="mb-2 text-sm font-medium text-red-400">
            Unable to load Hero from WordPress.
          </p>

          <p className="text-xs text-red-300">
            {error}
          </p>
        </div>
      </section>
    );
  }

  if (!hero) {
    return null;
  }

  /* =========================================
     WORDPRESS CONTENT
     ========================================= */

  const mainHeading = hero.mainHeading || "";
  const highlight = hero.highlight || "";
  const description = hero.description || "";

  /* =========================================
     LOGOS
     ========================================= */

  /* Each logo has a light-mode image and an optional dark-mode image.
     If no dark image is uploaded in WordPress, the normal one is used. */
  const logos = (hero.heroLogos ?? [])
    .map((logo) => ({
      light: logo?.light || "",
      dark: logo?.dark || "",
    }))
    .filter((logo) => Boolean(logo.light || logo.dark));

  /* =========================================
     HERO
     ========================================= */

  return (
    <section
      id="hero"
      className="
        relative
        overflow-hidden
        bg-[var(--background)]
        py-16
        transition-colors
        duration-500
        md:py-24
      "
    >

      {/* =========================================
          BACKGROUND GLOW
          ========================================= */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-1/2
          top-0
          h-[500px]
          w-[800px]
          -translate-x-1/2
          rounded-full
          blur-[140px]
        "
        style={{
          background:
            "radial-gradient(circle, rgba(114,92,255,0.12), transparent 70%)",
        }}
      />

         <div
  className="
    relative
    mx-auto
    px-5
  "
>

  <div ref={heroRevealRef}>
           

        {/* =========================================
            LOGOS
            ========================================= */}

        {logos.length > 0 && (
  <div
    className={`
      codm-hero-logos
      codm-reveal
      ${heroVisible ? "codm-visible" : ""}
      mb-8
      flex
      flex-wrap
      items-center
      justify-center
      gap-5
      md:gap-7
    `}
    style={{ transitionDelay: "0.05s" }}
  >
            {logos.map((logo, index) => {
              const src =
                (isDark ? logo.dark || logo.light : logo.light || logo.dark) ||
                "";

              return (
                <div
                  key={`${src}-${index}`}
                  className="
                    flex
                    h-10
                    min-w-[70px]
                    items-center
                    justify-center
                  "
                >
                  <img
                    src={src}
                    alt=""
                    className="
                      max-h-10
                      w-auto
                      max-w-[140px]
                      object-contain
                    "
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* =========================================
            HEADING
            ========================================= */}

       <h1
  className={`
    codm-hero-title
    codm-reveal-heading
    ${heroVisible ? "codm-visible" : ""}
    mx-auto
    max-w-[950px]
    text-center
    text-[44px]
    font-medium
    leading-[1.03]
    tracking-[-0.055em]
    text-[var(--foreground)]
    md:text-[64px]
  `}
  style={{ transitionDelay: "0.15s" }}
>
          {mainHeading && (
            <span className="block">
              {mainHeading}
            </span>
          )}

          {highlight && (
            <span
              className="
                codm-highlight
                block
                bg-clip-text
                text-transparent
              "
            >
              {highlight}
            </span>
          )}
        </h1>

        {/* =========================================
            DESCRIPTION
            ========================================= */}

        {description && (
  <p
    className={`
      codm-hero-description
      codm-reveal
      ${heroVisible ? "codm-visible" : ""}
      mx-auto
      mt-5
      max-w-[700px]
      text-center
      font-['Inter']
      text-[20px]
      font-normal
      leading-[28px]
      text-[#9AA3B8]
    `}
    style={{ transitionDelay: "0.3s" }}
  >
    {description}
  </p>
)}

        {/* =========================================
            BUTTONS
            ========================================= */}

        {(hero.button1Text ||
          hero.button2Text) && (
          <div
  className={`
    codm-hero-buttons
    codm-reveal
    ${heroVisible ? "codm-visible" : ""}
    mt-8
    flex
    flex-wrap
    items-center
    justify-center
    gap-3
  `}
  style={{ transitionDelay: "0.42s" }}
>

            {/* PRIMARY */}

            {hero.button1Text && (
              <a
                ref={
                  primaryButtonRef as Ref<HTMLAnchorElement>
                }
                href={
                  hero.button1Url ||
                  "/contact"
                }
                className="
                  codm-hero-primary-button
                  codm-magnetic
                  codm-press
                  inline-flex
                  h-[53px]
                  min-w-[227px]
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-transparent
                  px-5
                  text-center
                  font-['Plus_Jakarta_Sans']
                  text-[18px]
                  font-medium
                  leading-none
                  text-white
                  transition-all
                  duration-300
                  hover:opacity-90
                "
              >
                {hero.button1Text}
              </a>
            )}

            {/* SECONDARY */}

            {hero.button2Text && (
              <a
                ref={
                  secondaryButtonRef as Ref<HTMLAnchorElement>
                }
                href={
                  hero.button2Url ||
                  "/services"
                }
                className="
                  codm-hero-secondary-button
                  codm-magnetic
                  codm-press
                  inline-flex
                  h-[53px]
                  min-w-[177px]
                  items-center
                  justify-center
                  rounded-full
                  border
                  px-5
                  text-center
                  font-['Google_Sans_Flex']
                  text-[18px]
                  font-medium
                  leading-none
                  transition-all
                  duration-300
                  hover:scale-[1.02]
                "
              >
                {hero.button2Text}
              </a>
            )}

          </div>
        )}


 </div>
    
        {/* =========================================
            HERO MEDIA
            ========================================= */}

        {(hero.videoUrl ||
          hero.featuredImage?.node?.sourceUrl) && (
                   <div
            ref={
              heroMediaRef as Ref<HTMLDivElement>
            }
            className="
              codm-hero-image-section
              codm-hero-media-scale
              relative
              mx-auto
              mt-12
              w-full
            "
          >

            {/* Ambient glow */}

            <div
              aria-hidden="true"
              className="
                codm-hero-image-glow
                pointer-events-none
                absolute
                bottom-[-80px]
                left-1/2
                h-[260px]
                w-[75%]
                -translate-x-1/2
                rounded-full
                blur-[90px]
              "
              style={{
                background:
                  "radial-gradient(circle, rgba(114,92,255,0.35), transparent 70%)",
              }}
            />

            {/* Media frame */}

            <div
              className="
                codm-hero-image-frame
                relative
                overflow-hidden
                rounded-[22px]
                border
                border-[var(--border)]
                bg-[var(--surface)]
                shadow-[0_30px_100px_rgba(0,0,0,0.20)]
              "
            >
              <div
                className="
                  codm-hero-image-inner
                  relative
                  overflow-hidden
                "
              >

                {/* =====================================
                    VIDEO / IMAGE
                    ===================================== */}

                {hero.videoUrl ? (
                  <video
                    className="
                      codm-hero-dashboard-image
                      block
                      h-auto
                      w-full
                      object-cover
                    "
                    src={hero.videoUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    poster={
                      hero.featuredImage?.node?.sourceUrl ||
                      undefined
                    }
                    aria-label={
                      hero.title ||
                      "CODM Hero Video"
                    }
                  />
                ) : (
                  <>
                    {hero.featuredImage?.node?.sourceUrl && (
                      <img
                        src={
                          hero.featuredImage.node.sourceUrl
                        }
                        alt={
                          hero.featuredImage.node.altText ||
                          hero.title ||
                          "CODM Software Dashboard"
                        }
                        className="
                          codm-hero-dashboard-image
                          block
                          h-auto
                          w-full
                          object-contain
                        "
                      />
                    )}
                  </>
                )}

              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}

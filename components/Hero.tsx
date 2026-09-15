"use client";

import { useEffect, useState, useRef } from "react";
import type { Ref } from "react";
import { useMagneticButton } from "@/lib/codm-animations";

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

  logo1: string;
  logo2: string;
  logo3: string;
  logo4: string;

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

export default function Hero() {
  const [hero, setHero] = useState<HeroData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const primaryButtonRef = useMagneticButton(24);
  const secondaryButtonRef = useMagneticButton(24);

  const heroMediaRef = useRef<HTMLDivElement>(null);
  const [heroMediaVisible, setHeroMediaVisible] = useState(false);

  useEffect(() => {
    const element = heroMediaRef.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeroMediaVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -80px 0px",
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    async function loadHero() {

  useEffect(() => {
    async function loadHero() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          WORDPRESS_GRAPHQL_URL,
          {
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

                      logo1
                      logo2
                      logo3
                      logo4

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
          }
        );

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

  const logos = [
    hero.logo1,
    hero.logo2,
    hero.logo3,
    hero.logo4,
  ].filter(
    (logo): logo is string =>
      Boolean(logo)
  );

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
          max-w-[1200px]
          px-5
          sm:px-8
        "
      >

        {/* =========================================
            LOGOS
            ========================================= */}

        {logos.length > 0 && (
          <div
            className="
              codm-hero-logos
              mb-8
              flex
              flex-wrap
              items-center
              justify-center
              gap-5
              md:gap-7
            "
          >
            {logos.map((logo, index) => (
              <div
                key={`${logo}-${index}`}
                className="
                  flex
                  h-10
                  min-w-[70px]
                  items-center
                  justify-center
                "
              >
                <img
                  src={logo}
                  alt=""
                  className="
                    max-h-10
                    w-auto
                    max-w-[140px]
                    object-contain
                  "
                />
              </div>
            ))}
          </div>
        )}

        {/* =========================================
            HEADING
            ========================================= */}

        <h1
          className="
            codm-hero-title
            mx-auto
            max-w-[950px]
            text-center
            text-[44px]
            font-medium
            leading-[1.03]
            tracking-[-0.055em]
            text-[var(--foreground)]
            md:text-[64px]
          "
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
            className="
              codm-hero-description
              mx-auto
              mt-5
              max-w-[900px]
              text-center
              font-['Inter']
              text-[20px]
              font-normal
              leading-[28px]
              text-[#9AA3B8]
            "
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
            className="
              codm-hero-buttons
              mt-8
              flex
              flex-wrap
              items-center
              justify-center
              gap-3
            "
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

        {/* =========================================
            HERO MEDIA
            VIDEO FIRST
            FEATURED IMAGE = FALLBACK / POSTER
            ========================================= */}

        {(hero.videoUrl ||
          hero.featuredImage?.node?.sourceUrl) && (
         <div
  ref={heroMediaRef}
  className={`
    codm-hero-image-section
    relative
    mx-auto
    mt-12
    w-full
    max-w-[1100px]
    transition-all
    duration-[1200ms]
    ease-[cubic-bezier(0.22,1,0.36,1)]
    ${
      heroMediaVisible
        ? "translate-y-0 scale-100 opacity-100 blur-0"
        : "translate-y-[100px] scale-[0.88] opacity-0 blur-[8px]"
    }
  `}
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
                    VIDEO
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

                  /* ===================================
                     FEATURED IMAGE FALLBACK
                     =================================== */

                  hero.featuredImage?.node
                    ?.sourceUrl && (
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
                  )
                )}

              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}

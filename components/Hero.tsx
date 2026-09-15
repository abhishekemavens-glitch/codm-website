"use client";

import { useEffect, useRef, useState } from "react";

type HeroData = {
  id: string;
  databaseId: number;
  title: string;
  content: string;

  highlight: string;

  button1Text: string;
  button1Url: string;

  button2Text: string;
  button2Url: string;

  logo1: string;
  logo2: string;
  logo3: string;
  logo4: string;

  /* HERO VIDEO */
  videoId?: string;
  videoUrl?: string;

  /* HERO IMAGE */
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
  const [error, setError] = useState("");

 /* =========================================================
   HERO MEDIA SCROLL ANIMATION
   ========================================================= */

const heroMediaRef = useRef<HTMLDivElement>(null);
const [heroMediaVisible, setHeroMediaVisible] = useState(false);

useEffect(() => {
  const element = heroMediaRef.current;

  if (!element) return;

  // Make the video visible immediately when Hero loads.
  // The scroll animation is handled separately below.
  setHeroMediaVisible(true);

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        setHeroMediaVisible(true);
      }
    },
    {
      threshold: 0.01,
      rootMargin: "200px 0px 200px 0px",
    }
  );

  observer.observe(element);

  return () => observer.disconnect();
}, []);

  /* =========================================================
     LOAD HERO FROM WORDPRESS
     ========================================================= */

  useEffect(() => {
    async function loadHero() {
      try {
        setLoading(true);
        setError("");

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
                      content

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

          throw new Error(
            result.errors
              .map(
                (item: { message?: string }) =>
                  item.message ||
                  "Unknown GraphQL error"
              )
              .join(", ")
          );
        }

        const heroData =
          result?.data?.heroes?.nodes?.[0] ?? null;

        if (!heroData) {
          throw new Error(
            "WordPress returned no Hero post."
          );
        }

        setHero(heroData);
      } catch (err) {
        console.error(
          "Failed to load Hero:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load Hero from WordPress."
        );
      } finally {
        setLoading(false);
      }
    }

    loadHero();
  }, []);

  /* =========================================================
     LOADING
     ========================================================= */

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

  /* =========================================================
     ERROR
     ========================================================= */

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

  /* =========================================================
     NO HERO
     ========================================================= */

  if (!hero) {
    return null;
  }

  /* =========================================================
     SPLIT HEADING
     ========================================================= */

  const fullTitle = hero.title || "";
  const highlight = hero.highlight || "";

  let mainHeading = fullTitle;

  if (highlight) {
    mainHeading = fullTitle
      .replace(highlight, "")
      .trim();
  }

  /* =========================================================
     LOGOS
     ========================================================= */

  const logos = [
    hero.logo1,
    hero.logo2,
    hero.logo3,
    hero.logo4,
  ].filter(
    (logo): logo is string =>
      Boolean(logo)
  );

  /* =========================================================
     MEDIA
     ========================================================= */

  const hasVideo = Boolean(
    hero.videoUrl
  );

  const hasImage = Boolean(
    hero.featuredImage?.node?.sourceUrl
  );

  return (
    <section
      id="hero"
      className="
        relative
        overflow-hidden
        bg-[var(--background)]
        py-20
        transition-colors
        duration-500
        md:py-28
      "
    >
      {/* =====================================================
          BACKGROUND GLOW
          ===================================================== */}

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

        {/* =====================================================
            HEADING
            ===================================================== */}

        <h1
          className="
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
          <span className="block">
            {mainHeading}
          </span>

          {highlight && (
            <span
              className="
                block
                bg-gradient-to-r
                from-[#5967ff]
                via-[#7c68ff]
                to-[#a08cff]
                bg-clip-text
                text-transparent
              "
            >
              {highlight}
            </span>
          )}
        </h1>

        {/* =====================================================
            DESCRIPTION
            ===================================================== */}

        <div
          className="
            mx-auto
            mt-5
            max-w-[700px]
            text-center
            text-sm
            leading-6
            text-[var(--muted)]
            md:text-base
          "
          dangerouslySetInnerHTML={{
            __html: hero.content,
          }}
        />

        {/* =====================================================
            BUTTONS
            ===================================================== */}

        <div
          className="
            mt-8
            flex
            flex-wrap
            justify-center
            gap-3
          "
        >

          {/* PRIMARY BUTTON */}

          {hero.button1Text && (
            <a
              href={
                hero.button1Url ||
                "/contact"
              }
              className="
                rounded-full
                bg-[var(--accent)]
                px-6
                py-3
                text-sm
                font-medium
                text-white
                transition-all
                duration-300
                hover:opacity-90
              "
            >
              {hero.button1Text}
            </a>
          )}

          {/* SECONDARY BUTTON */}

          {hero.button2Text && (
            <a
              href={
                hero.button2Url ||
                "/services"
              }
              className="
                rounded-full
                border
                border-[var(--border)]
                bg-[var(--surface)]
                px-6
                py-3
                text-sm
                font-medium
                text-[var(--foreground)]
                transition-all
                duration-300
                hover:border-[var(--accent)]
              "
            >
              {hero.button2Text}
            </a>
          )}

        </div>

        {/* =====================================================
            HERO LOGOS
            ===================================================== */}

        {logos.length > 0 && (
          <div
            className="
              mt-8
              flex
              flex-wrap
              items-center
              justify-center
              gap-5
              md:gap-7
            "
          >
            {logos.map(
              (logo, index) => (
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
                      max-h-8
                      w-auto
                      max-w-[120px]
                      object-contain
                    "
                  />
                </div>
              )
            )}
          </div>
        )}

        {/* =====================================================
            HERO MEDIA
            VIDEO OR IMAGE
            ===================================================== */}

        {(hasVideo || hasImage) && (
  <div
    ref={heroMediaRef}
    className={`
      relative
      mx-auto
      mt-12
      max-w-[1100px]
      transform-gpu
      will-change-transform
      transition-all
      duration-[1200ms]
      ease-[cubic-bezier(0.22,1,0.36,1)]

      ${
        heroMediaVisible
          ? "translate-y-0 scale-100 opacity-100 blur-0"
          : "translate-y-[40px] scale-[0.96] opacity-0 blur-[4px]"
      }
    `}
  >

            {/* =================================================
                MEDIA GLOW
                ================================================= */}

            <div
              aria-hidden="true"
              className="
                codm-hero-media-glow
                pointer-events-none
                absolute
                bottom-[-30px]
                left-1/2
                h-[220px]
                w-[75%]
                -translate-x-1/2
                rounded-full
                blur-[80px]
                transition-all
                duration-[1400ms]
                ease-out
              "
              style={{
                background:
                  "radial-gradient(circle, rgba(114,92,255,0.45), transparent 70%)",
              }}
            />

            {/* =================================================
                MEDIA CONTAINER
                ================================================= */}

            <div
              className="
                codm-hero-media-frame
                relative
                overflow-hidden
                rounded-[22px]
                border
                border-[var(--border)]
                bg-[var(--surface)]
                p-3
                shadow-[0_30px_100px_rgba(0,0,0,0.25)]
                transition-all
                duration-[1200ms]
                ease-[cubic-bezier(0.22,1,0.36,1)]
                md:p-5
              "
            >

              {/* =================================================
                  VIDEO
                  ================================================= */}

              {hasVideo ? (
                <video
                  src={hero.videoUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  className="
                    codm-hero-video
                    block
                    h-auto
                    w-full
                    rounded-[14px]
                    object-contain
                  "
                />
              ) : hasImage ? (

                /* =================================================
                   IMAGE FALLBACK
                   ================================================= */

                <img
                  src={
                    hero.featuredImage?.node
                      ?.sourceUrl
                  }
                  alt={
                    hero.featuredImage?.node
                      ?.altText ||
                    hero.title
                  }
                  className="
                    codm-hero-image
                    block
                    h-auto
                    w-full
                    rounded-[14px]
                    object-contain
                  "
                />

              ) : null}

            </div>
          </div>
        )}

      </div>
    </section>
  );
}

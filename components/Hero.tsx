"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

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

  featuredImage: {
    node: {
      sourceUrl: string;
      altText: string;
    } | null;
  } | null;
};

const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

/*
 * ANIMATION
 *
 * One orchestrated entrance: heading -> description -> buttons ->
 * logos -> featured image, each offset slightly from the last.
 * `container` drives the stagger; each section uses the shared
 * `item` variant so the timing stays consistent everywhere it's used.
 */
const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export default function Hero() {
  const [hero, setHero] =
    useState<HeroData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

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

        const result =
          await response.json();

        /*
         * GRAPHQL ERROR
         */

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

        /*
         * GET FIRST HERO
         */

        const heroData =
          result?.data?.heroes?.nodes?.[0] ??
          null;

        /*
         * NO HERO FOUND
         */

        if (!heroData) {
          setError(
            "WordPress returned no Hero posts."
          );

          setHero(null);

          return;
        }

        /*
         * HERO FOUND
         */

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


  /*
   * LOADING
   */

  if (loading) {
    return (
      <section
        className="
          bg-[var(--background)]
          py-20
        "
      >
        <div
          className="
            mx-auto
            max-w-[1200px]
            px-5
            text-center
          "
        >
          <p
            className="
              text-sm
              text-[var(--muted)]
            "
          >
            Loading...
          </p>
        </div>
      </section>
    );
  }


  /*
   * ERROR
   */

  if (error) {
    return (
      <section
        className="
          bg-[var(--background)]
          py-20
        "
      >
        <div
          className="
            mx-auto
            max-w-[1200px]
            px-5
            text-center
          "
        >
          <p
            className="
              mb-2
              text-sm
              font-medium
              text-red-400
            "
          >
            Unable to load Hero from WordPress.
          </p>

          <p
            className="
              text-xs
              text-red-300
            "
          >
            {error}
          </p>
        </div>
      </section>
    );
  }


  /*
   * SAFETY
   */

  if (!hero) {
    return null;
  }


  /*
   * WORDPRESS CONTENT
   */

  const mainHeading =
    hero.mainHeading || "";

  const highlight =
    hero.highlight || "";

  const description =
    hero.description || "";


  /*
   * LOGOS
   */

  const logos = [
    hero.logo1,
    hero.logo2,
    hero.logo3,
    hero.logo4,
  ].filter(
    (logo): logo is string =>
      Boolean(logo)
  );


  /*
   * HERO
   */

  return (
    <motion.section
      id="hero"
      variants={container}
      initial="hidden"
      animate="show"
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

      {/* =========================================
          BACKGROUND GLOW
          ========================================= */}

      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
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
            HEADING
            ========================================= */}

        <motion.h1
          variants={item}
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

        </motion.h1>


        {/* =========================================
            HERO DESCRIPTION
            ========================================= */}

        {description && (
          <motion.p
            variants={item}
            className="
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
          </motion.p>
        )}


      {/* =========================================
    BUTTONS
    ========================================= */}

{(hero.button1Text || hero.button2Text) && (

  <motion.div
    variants={item}
    className="
      mt-8
      flex
      flex-wrap
      items-center
      justify-center
      gap-3
    "
  >

    {/* =========================================
        PRIMARY BUTTON — BOOK A CONSULTATION
        ========================================= */}

    {hero.button1Text && (
      <a
        href={hero.button1Url || "/contact"}
        className="
          codm-hero-primary-button
          inline-flex
          items-center
          justify-center
          rounded-full
        "
      >
        {hero.button1Text}
      </a>
    )}


    {/* =========================================
        SECONDARY BUTTON — EXPLORE SERVICES
        ========================================= */}

    {hero.button2Text && (
      <a
        href={hero.button2Url || "/services"}
        className="
          codm-hero-secondary-button
          inline-flex
          items-center
          justify-center
          rounded-full
        "
      >
        {hero.button2Text}
      </a>
    )}

  </motion.div>
)}

        {/* =========================================
            LOGOS
            ========================================= */}

        {logos.length > 0 && (

          <motion.div
            variants={item}
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

          </motion.div>

        )}


        {/* =========================================
            FEATURED IMAGE
            ========================================= */}

        {hero.featuredImage?.node
          ?.sourceUrl && (

          <motion.div
            variants={item}
            initial="hidden"
            animate="show"
            transition={{
              duration: 0.9,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="
              relative
              mx-auto
              mt-12
              max-w-[1100px]
            "
          >

            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                bottom-0
                left-1/2
                h-[220px]
                w-[75%]
                -translate-x-1/2
                rounded-full
                blur-[80px]
              "
              style={{
                background:
                  "radial-gradient(circle, rgba(114,92,255,0.45), transparent 70%)",
              }}
            />

            <div
              className="
                relative
                overflow-hidden
                rounded-[22px]
                border
                border-[var(--border)]
                bg-[var(--surface)]
                p-3
                shadow-[0_30px_100px_rgba(0,0,0,0.25)]
                md:p-5
              "
            >

              <img
                src={
                  hero.featuredImage.node
                    .sourceUrl
                }
                alt={
                  hero.featuredImage.node
                    .altText ||
                  hero.title
                }
                className="
                  h-auto
                  w-full
                  object-contain
                "
              />

            </div>

          </motion.div>

        )}

      </div>

    </motion.section>
  );
}

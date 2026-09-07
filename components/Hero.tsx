"use client";

import { useEffect, useState } from "react";

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

export default function Hero() {

  const [hero, setHero] =
    useState<HeroData | null>(null);

  const [loading, setLoading] =
    useState(true);


  useEffect(() => {

    async function loadHero() {

      try {

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


        console.log(
          "HERO GRAPHQL DATA:",
          result
        );


        if (result.errors) {

          console.error(
            "Hero GraphQL Error:",
            result.errors
          );

          throw new Error(
            "Hero GraphQL query failed."
          );

        }


        const heroData =
          result?.data?.heroes?.nodes?.[0] ??
          null;


        console.log(
          "HERO DATA:",
          heroData
        );


        setHero(heroData);


      } catch (error) {

        console.error(
          "Failed to load Hero:",
          error
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
   * NO HERO
   */

  if (!hero) {

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
              text-red-400
            "
          >
            Hero content not found in WordPress.
          </p>

        </div>

      </section>
    );

  }


  /*
   * BACKEND CONTENT
   */

  const mainHeading =
    hero.mainHeading || "";

  const highlight =
    hero.highlight || "";

  const description =
    hero.description || "";


  /*
   * HERO LOGOS
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
   * FRONTEND
   */

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
            HEADING
            ========================================= */}

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

          {/* MAIN HEADING FROM WORDPRESS */}

          {mainHeading && (
            <span className="block">
              {mainHeading}
            </span>
          )}


          {/* HIGHLIGHTED HEADING FROM WORDPRESS */}

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
            HERO DESCRIPTION
            ========================================= */}

        {description && (
          <p
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
          </p>
        )}


        {/* =========================================
            BUTTONS
            ========================================= */}

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


        {/* =========================================
            HERO LOGOS / SMALL IMAGES
            ========================================= */}

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


        {/* =========================================
            HERO MAIN IMAGE
            ========================================= */}

        {hero.featuredImage?.node?.sourceUrl && (

          <div
            className="
              relative
              mx-auto
              mt-12
              max-w-[1100px]
            "
          >

            {/* IMAGE GLOW */}

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


            {/* IMAGE CONTAINER */}

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
                  hero.featuredImage.node.sourceUrl
                }
                alt={
                  hero.featuredImage.node.altText ||
                  mainHeading
                }
                className="
                  h-auto
                  w-full
                  object-contain
                "
              />

            </div>

          </div>

        )}

      </div>

    </section>

  );
}

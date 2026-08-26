"use client";

import { useEffect, useState } from "react";

type Testimonial = {
  id: string;
  databaseId: number;
  title: string;
  content: string;
  featuredImage: {
    node: {
      sourceUrl: string;
      altText: string;
    } | null;
  } | null;
};

const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTestimonials() {
      try {
        const response = await fetch(WORDPRESS_GRAPHQL_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
              query GetTestimonials {
                testimonials(first: 20) {
                  nodes {
                    id
                    databaseId
                    title
                    content
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

        console.log("TESTIMONIAL DATA:", result);

        if (result.errors) {
          console.error(
            "Testimonial GraphQL Error:",
            result.errors
          );

          throw new Error(
            "Could not load testimonials."
          );
        }

        const data =
          result?.data?.testimonials?.nodes ?? [];

        setTestimonials(data);
      } catch (error) {
        console.error(
          "Failed to load testimonials:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadTestimonials();
  }, []);

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <section
        id="testimonials"
        className="
          bg-[var(--background)]
          py-[90px]
          md:py-[110px]
        "
      >
        <div className="mx-auto max-w-[1100px] px-6 text-center">
          <p className="text-sm text-[var(--muted)]">
            Loading...
          </p>
        </div>
      </section>
    );
  }

  /* =========================
     EMPTY
  ========================= */

  if (!testimonials.length) {
    return null;
  }

  const testimonial =
    testimonials[activeIndex];

  return (
    <section
      id="testimonials"
      className="
        relative
        overflow-hidden
        bg-[var(--background)]
        py-[90px]
        transition-colors
        duration-500
        md:py-[110px]
      "
    >
      <div className="mx-auto max-w-[1100px] px-6">

        {/* =========================
            EYEBROW
        ========================= */}

        <div className="mb-6 flex items-center justify-center gap-3">

          <span
            className="
              h-px
              w-12
              bg-[var(--accent)]/40
            "
          />

          <span
            className="
              text-[10px]
              font-medium
              uppercase
              tracking-[0.14em]
              text-[var(--muted)]
            "
          >
            Testimonial
          </span>

          <span
            className="
              h-px
              w-12
              bg-[var(--accent)]/40
            "
          />

        </div>


        {/* =========================
            HEADING
        ========================= */}

        <div className="mx-auto max-w-[800px] text-center">

          <h2
            className="
              text-[42px]
              font-medium
              leading-[1.02]
              tracking-[-0.055em]
              text-[var(--foreground)]
              sm:text-[50px]
              md:text-[58px]
            "
          >
            Experiences Shared by

            <span
              className="
                block
                bg-gradient-to-r
                from-[#d1ceff]
                via-[#9b88ff]
                to-[#705cff]
                bg-clip-text
                text-transparent
              "
            >
              Our Clients
            </span>
          </h2>

        </div>


        {/* =========================
            TESTIMONIAL CARD
        ========================= */}

        <div
          className="
            relative
            mx-auto
            mt-12
            max-w-[1015px]
            overflow-hidden
            rounded-[26px]
            border
            border-[var(--border)]
            bg-[#101126]
          "
        >

          {/* TOP RIGHT PURPLE GLOW */}

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              right-[-120px]
              top-[-150px]
              h-[430px]
              w-[430px]
              rounded-full
              blur-[100px]
            "
            style={{
              background:
                "radial-gradient(circle, rgba(114,92,255,0.18), transparent 68%)",
            }}
          />


          {/* DIAGONAL DECORATION */}

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              right-[-120px]
              top-[60px]
              h-[500px]
              w-[360px]
              rotate-[35deg]
              border-l
              border-[var(--accent)]/[0.10]
            "
          />

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              right-[-160px]
              top-[40px]
              h-[500px]
              w-[360px]
              rotate-[35deg]
              border-l
              border-[var(--accent)]/[0.07]
            "
          />


          {/* CONTENT GRID */}

          <div
            className="
              relative
              grid
              min-h-[420px]
              grid-cols-1
              md:grid-cols-[350px_1fr]
            "
          >

            {/* =========================
                IMAGE
            ========================= */}

            <div className="relative p-[10px]">

              <div
                className="
                  relative
                  h-full
                  min-h-[390px]
                  overflow-hidden
                  rounded-[22px]
                  bg-[var(--surface-secondary)]
                  md:min-h-[400px]
                "
              >

                {testimonial.featuredImage?.node?.sourceUrl ? (
                  <img
                    src={
                      testimonial.featuredImage.node.sourceUrl
                    }
                    alt={
                      testimonial.featuredImage.node.altText ||
                      testimonial.title
                    }
                    className="
                      absolute
                      inset-0
                      h-full
                      w-full
                      object-cover
                    "
                  />
                ) : (
                  <div
                    className="
                      flex
                      h-full
                      min-h-[390px]
                      items-center
                      justify-center
                      text-sm
                      text-[var(--muted)]
                    "
                  >
                    No image
                  </div>
                )}

              </div>

            </div>


            {/* =========================
                RIGHT CONTENT
            ========================= */}

            <div
              className="
                relative
                flex
                min-h-[400px]
                flex-col
                justify-center
                px-8
                py-12
                md:px-10
                md:py-10
              "
            >

              {/* OPENING QUOTE */}

              <div
                aria-hidden="true"
                className="
                  absolute
                  left-8
                  top-5
                  font-serif
                  text-[92px]
                  leading-none
                  text-[var(--accent)]/[0.16]
                  md:left-10
                "
              >
                “
              </div>


              {/* TESTIMONIAL TEXT */}

              <div
                className="
                  relative
                  z-10
                  mt-10
                  max-w-[620px]
                  text-[15px]
                  leading-[1.7]
                  text-[var(--muted)]
                  md:text-[16px]
                "
                dangerouslySetInnerHTML={{
                  __html: testimonial.content,
                }}
              />


              {/* CLIENT NAME */}

              <div className="relative z-10 mt-7">

                <h3
                  className="
                    text-[17px]
                    font-medium
                    tracking-[-0.02em]
                    text-[var(--foreground)]
                  "
                >
                  {testimonial.title}
                </h3>

              </div>


              {/* COMPANY AREA
                  Currently hidden until backend
                  company fields are available.
              */}

              {/* =========================
                  CLOSING QUOTE
              ========================= */}

              <div
                aria-hidden="true"
                className="
                  absolute
                  bottom-[-18px]
                  right-7
                  font-serif
                  text-[100px]
                  leading-none
                  text-[var(--accent)]/[0.15]
                  md:right-8
                "
              >
                ”
              </div>

            </div>

          </div>

        </div>


        {/* =========================
            NAVIGATION
        ========================= */}

        {testimonials.length > 1 && (
          <div
            className="
              mt-7
              flex
              items-center
              justify-center
              gap-3
            "
          >

            {/* PREVIOUS */}

            <button
              type="button"
              aria-label="Previous testimonial"
              onClick={() => {
                setActiveIndex(
                  activeIndex === 0
                    ? testimonials.length - 1
                    : activeIndex - 1
                );
              }}
              className="
                flex
                h-[44px]
                w-[44px]
                items-center
                justify-center
                rounded-full
                border
                border-[var(--border)]
                bg-[var(--surface)]
                text-[var(--foreground)]
                transition-all
                duration-300
                hover:border-[var(--accent)]
                hover:bg-[var(--accent)]
                hover:text-white
              "
            >
              ←
            </button>


            {/* NEXT */}

            <button
              type="button"
              aria-label="Next testimonial"
              onClick={() => {
                setActiveIndex(
                  activeIndex === testimonials.length - 1
                    ? 0
                    : activeIndex + 1
                );
              }}
              className="
                flex
                h-[44px]
                w-[44px]
                items-center
                justify-center
                rounded-full
                bg-[var(--accent)]
                text-[20px]
                text-white
                shadow-[0_10px_30px_rgba(114,92,255,0.25)]
                transition-all
                duration-300
                hover:scale-105
                hover:opacity-90
              "
            >
              →
            </button>

          </div>
        )}

      </div>
    </section>
  );
}
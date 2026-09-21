"use client";

import { useEffect, useRef, useState } from "react";
import SectionHeading from "@/components/SectionHeading";

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

  /* Optional company row (filled from the extra query below) */
  clientCompany?: string | null;
  clientCompanyTagline?: string | null;
  clientCompanyLogo?: string | null;
};

type TestimonialExtra = Pick<
  Testimonial,
  | "databaseId"
  | "clientCompany"
  | "clientCompanyTagline"
  | "clientCompanyLogo"
>;

const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

/*
 * Autoplay delay in milliseconds.
 * Set to 0 to turn autoplay off.
 */
const AUTOPLAY_MS = 6000;

/*
 * How many of the NEWEST testimonials to show.
 * Change this number, or pass a different one where the
 * component is used, e.g. <Testimonials limit={8} />
 */
const DEFAULT_LIMIT = 5;

export default function Testimonials({
  limit = DEFAULT_LIMIT,
}: {
  limit?: number;
}) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);

  const touchStartX = useRef<number | null>(null);

  /* =====================================================
     DATA
     ===================================================== */

  useEffect(() => {
    /*
     * Company name / tagline / logo come from a SEPARATE query,
     * so a field that doesn't exist can never break the
     * testimonials themselves.
     */
    async function loadExtras() {
      try {
        const response = await fetch(WORDPRESS_GRAPHQL_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
              query TestimonialExtras($first: Int!) {
                testimonials(
                  first: $first
                  where: { orderby: [{ field: DATE, order: DESC }] }
                ) {
                  nodes {
                    databaseId
                    clientCompany
                    clientCompanyTagline
                    clientCompanyLogo
                  }
                }
              }
            `,
            variables: { first: limit },
          }),
        });

        const result = await response.json();

        if (result.errors) {
          console.warn(
            "Testimonial company fields are not available in WordPress GraphQL yet:",
            result.errors
          );
          return;
        }

        const extras: TestimonialExtra[] =
          result?.data?.testimonials?.nodes ?? [];

        setTestimonials((current) =>
          current.map((item) => {
            const extra = extras.find(
              (entry) => entry.databaseId === item.databaseId
            );

            return extra ? { ...item, ...extra } : item;
          })
        );
      } catch (error) {
        console.warn("Testimonial extras could not be loaded:", error);
      }
    }

    async function loadTestimonials() {
      try {
        const response = await fetch(WORDPRESS_GRAPHQL_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
              query GetTestimonials($first: Int!) {
                testimonials(
                  first: $first
                  where: { orderby: [{ field: DATE, order: DESC }] }
                ) {
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
            variables: { first: limit },
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
        setActiveIndex(0);

        /* Not awaited: the section shows right away. */
        void loadExtras();
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
  }, [limit]);

  /* =====================================================
     AUTOPLAY
     Pauses while hovered / touched, skipped for people who
     prefer reduced motion, restarts after any manual change.
     ===================================================== */

  useEffect(() => {
    if (!AUTOPLAY_MS || paused || testimonials.length < 2) {
      return;
    }

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length);
    }, AUTOPLAY_MS);

    return () => window.clearInterval(timer);
  }, [paused, testimonials.length, activeIndex]);

  /* =====================================================
     LOADING
     ===================================================== */

  if (loading) {
    return (
      <section
        id="testimonials"
        className="codm-testimonials"
      >
        <div className="codm-testimonials-container">
          <p className="codm-testimonials-loading">
            Loading...
          </p>
        </div>
      </section>
    );
  }

  /* =====================================================
     EMPTY
     ===================================================== */

  if (!testimonials.length) {
    return null;
  }

  const total = testimonials.length;

  const goPrev = () =>
    setActiveIndex((current) => (current === 0 ? total - 1 : current - 1));

  const goNext = () =>
    setActiveIndex((current) => (current === total - 1 ? 0 : current + 1));

  /* Swipe support for touch screens */

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0].clientX;
    setPaused(true);
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX.current !== null) {
      const distance =
        event.changedTouches[0].clientX - touchStartX.current;

      if (Math.abs(distance) > 50) {
        if (distance < 0) {
          goNext();
        } else {
          goPrev();
        }
      }
    }

    touchStartX.current = null;
    setPaused(false);
  };

  /* =====================================================
     RENDER
     ===================================================== */

  return (
    <section
      id="testimonials"
      className="codm-testimonials"
    >
      <div className="codm-testimonials-container">

        {/* =================================================
            SECTION HEADING
            ================================================= */}

        <SectionHeading
          eyebrow="Testimonial"
          title="Experiences Shared by"
          gradientText="Our Clients"
        />


        {/* =================================================
            SLIDER
            ================================================= */}

        <div
          className="codm-testimonial-slider"
          role="region"
          aria-roledescription="carousel"
          aria-label="Client testimonials"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >

          <div
            className="codm-testimonial-track"
            style={{
              transform: `translateX(-${activeIndex * 100}%)`,
            }}
          >

            {testimonials.map((testimonial, index) => {
              const hasCompany =
                testimonial.clientCompany ||
                testimonial.clientCompanyLogo;

              return (
                <div
                  key={testimonial.id}
                  className="codm-testimonial-slide"
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${index + 1} of ${total}`}
                  aria-hidden={index !== activeIndex}
                >

                  <article className="codm-testimonial-card">

                    {/* Decorative glow */}

                    <div
                      className="codm-testimonial-glow"
                      aria-hidden="true"
                    />

                    {/* Decorative diagonal lines */}

                    <div
                      className="codm-testimonial-line codm-testimonial-line-one"
                      aria-hidden="true"
                    />

                    <div
                      className="codm-testimonial-line codm-testimonial-line-two"
                      aria-hidden="true"
                    />

                    <div className="codm-testimonial-layout">

                      {/* ===================================
                          IMAGE
                          =================================== */}

                      <div className="codm-testimonial-image-wrap">

                        <div className="codm-testimonial-image">

                          {testimonial.featuredImage?.node
                            ?.sourceUrl ? (
                            <img
                              src={
                                testimonial
                                  .featuredImage
                                  .node.sourceUrl
                              }
                              alt={
                                testimonial
                                  .featuredImage
                                  .node.altText ||
                                testimonial.title
                              }
                              draggable={false}
                            />
                          ) : (
                            <div className="codm-testimonial-no-image">
                              No image
                            </div>
                          )}

                        </div>

                      </div>


                      {/* ===================================
                          CONTENT
                          =================================== */}

                      <div className="codm-testimonial-content">

                        <div
                          className="codm-testimonial-opening-quote"
                          aria-hidden="true"
                        >
                          “
                        </div>

                        <div className="codm-testimonial-client">
                          <h3>
                            {testimonial.title}
                          </h3>
                        </div>

                        <div
                          className="codm-testimonial-text"
                          dangerouslySetInnerHTML={{
                            __html: testimonial.content,
                          }}
                        />

                        {hasCompany && (
                          <div className="codm-testimonial-company">

                            {testimonial.clientCompanyLogo && (
                              <img
                                src={testimonial.clientCompanyLogo}
                                alt=""
                                className="codm-testimonial-company-logo"
                                draggable={false}
                              />
                            )}

                            <div className="codm-testimonial-company-text">

                              {testimonial.clientCompany && (
                                <p className="codm-testimonial-company-name">
                                  {testimonial.clientCompany}
                                </p>
                              )}

                              {testimonial.clientCompanyTagline && (
                                <p className="codm-testimonial-company-tagline">
                                  {testimonial.clientCompanyTagline}
                                </p>
                              )}

                            </div>

                          </div>
                        )}

                        <div
                          className="codm-testimonial-closing-quote"
                          aria-hidden="true"
                        >
                          ”
                        </div>

                      </div>

                    </div>

                  </article>

                </div>
              );
            })}

          </div>

        </div>


        {/* =================================================
            NAVIGATION
            ================================================= */}

        {total > 1 && (
          <div className="codm-testimonial-navigation">

            <button
              type="button"
              aria-label="Previous testimonial"
              onClick={goPrev}
              className="codm-testimonial-nav-button codm-testimonial-nav-prev"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M10 3L5 8l5 5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <button
              type="button"
              aria-label="Next testimonial"
              onClick={goNext}
              className="codm-testimonial-nav-button codm-testimonial-nav-next"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M6 3l5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

          </div>
        )}

      </div>
    </section>
  );
}

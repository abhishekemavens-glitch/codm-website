"use client";

import { useEffect, useState } from "react";
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

  /*
   * OPTIONAL — only filled once these fields exist in WordPress
   * GraphQL. The card looks fine without them (the company row
   * simply doesn't show).
   */
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

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /*
     * Company name / tagline / logo come from a SEPARATE query,
     * so a field that doesn't exist yet can never break the
     * testimonials themselves (same pattern as the header
     * announcement).
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
              query TestimonialExtras {
                testimonials(first: 20) {
                  nodes {
                    databaseId
                    clientCompany
                    clientCompanyTagline
                    clientCompanyLogo
                  }
                }
              }
            `,
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
  }, []);

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

  const testimonial =
    testimonials[activeIndex];

  const hasCompany =
    testimonial.clientCompany ||
    testimonial.clientCompanyLogo;

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
            TESTIMONIAL CARD
            ================================================= */}

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

            {/* =============================================
                IMAGE
                ============================================= */}

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
                  />
                ) : (
                  <div className="codm-testimonial-no-image">
                    No image
                  </div>
                )}

              </div>

            </div>


            {/* =============================================
                CONTENT
                ============================================= */}

            <div className="codm-testimonial-content">

              {/* Opening quote */}

              <div
                className="codm-testimonial-opening-quote"
                aria-hidden="true"
              >
                “
              </div>


              {/* Client name (WordPress post title) — now ABOVE the quote */}

              <div className="codm-testimonial-client">

                <h3>
                  {testimonial.title}
                </h3>

              </div>


              {/* Testimonial */}

              <div
                className="codm-testimonial-text"
                dangerouslySetInnerHTML={{
                  __html: testimonial.content,
                }}
              />


              {/* Company row (logo, name, tagline) */}

              {hasCompany && (
                <div className="codm-testimonial-company">

                  {testimonial.clientCompanyLogo && (
                    <img
                      src={testimonial.clientCompanyLogo}
                      alt=""
                      className="codm-testimonial-company-logo"
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


              {/* Closing quote */}

              <div
                className="codm-testimonial-closing-quote"
                aria-hidden="true"
              >
                ”
              </div>

            </div>

          </div>

        </article>


        {/* =================================================
            NAVIGATION — two round buttons, like the design
            ================================================= */}

        {testimonials.length > 1 && (
          <div className="codm-testimonial-navigation">

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
              onClick={() => {
                setActiveIndex(
                  activeIndex ===
                    testimonials.length - 1
                    ? 0
                    : activeIndex + 1
                );
              }}
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

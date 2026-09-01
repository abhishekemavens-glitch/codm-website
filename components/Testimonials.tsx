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
            EYEBROW
            ================================================= */}

        <div className="codm-testimonials-eyebrow">

          <span />

          <span className="codm-testimonials-eyebrow-text">
            Testimonial
          </span>

          <span />

        </div>


        {/* =================================================
            HEADING
            ================================================= */}

        <div className="codm-testimonials-heading-wrap">

          <h2>
            Experiences Shared by
            <span>
              Our Clients
            </span>
          </h2>

        </div>


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


          {/* =================================================
              IMAGE
              ================================================= */}

          <div className="codm-testimonial-layout">

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


            {/* =================================================
                CONTENT
                ================================================= */}

            <div className="codm-testimonial-content">

              {/* Opening quote */}

              <div
                className="codm-testimonial-opening-quote"
                aria-hidden="true"
              >
                “
              </div>


              {/* Testimonial */}

              <div
                className="codm-testimonial-text"
                dangerouslySetInnerHTML={{
                  __html: testimonial.content,
                }}
              />


              {/* Client */}

              <div className="codm-testimonial-client">

                <h3>
                  {testimonial.title}
                </h3>

              </div>


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
            NAVIGATION
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
              className="codm-testimonial-nav-button"
            >
              ←
            </button>


            <div className="codm-testimonial-dots">

              {testimonials.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`Go to testimonial ${
                    index + 1
                  }`}
                  aria-current={
                    index === activeIndex
                  }
                  onClick={() =>
                    setActiveIndex(index)
                  }
                  className={`codm-testimonial-dot ${
                    index === activeIndex
                      ? "is-active"
                      : ""
                  }`}
                />
              ))}

            </div>


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
              className="codm-testimonial-nav-button"
            >
              →
            </button>

          </div>
        )}

      </div>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useInViewOnce } from "@/lib/codm-animations";

type Industry = {
  id: string;
  databaseId: number;
  title: string;
  slug: string;
  excerpt: string;
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

export default function Industries() {
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [activeIndustry, setActiveIndustry] = useState(0);
  const [loading, setLoading] = useState(true);

  /* =========================================================
     INDUSTRIES SCROLL REVEAL
     ========================================================= */

  const { ref: industriesRef, isVisible } =
    useInViewOnce<HTMLElement>(0.12);

  /* =========================================================
     LOAD INDUSTRIES
     ========================================================= */

  useEffect(() => {
    async function loadIndustries() {
      try {
        const response = await fetch(WORDPRESS_GRAPHQL_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
              query GetIndustries {
                industries(first: 20) {
                  nodes {
                    id
                    databaseId
                    title
                    slug
                    excerpt
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

        if (result.errors) {
          console.error("GraphQL Error:", result.errors);
          return;
        }

        const nodes = result?.data?.industries?.nodes;

        if (Array.isArray(nodes)) {
          setIndustries(nodes);
        }
      } catch (error) {
        console.error("Failed to load industries:", error);
      } finally {
        setLoading(false);
      }
    }

    loadIndustries();
  }, []);

  const active = industries[activeIndustry];

  return (
    <section
      ref={industriesRef}
      id="industries"
      className={`codm-industries-section relative overflow-hidden bg-[var(--background)] py-24 transition-colors duration-500 md:py-32 ${
        isVisible ? "codm-industries-visible" : ""
      }`}
    >
      {/* =====================================================
          AMBIENT BACKGROUND
          ===================================================== */}

      <div
        aria-hidden="true"
        className="codm-industries-glow pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2"
      />

      <div
        aria-hidden="true"
        className="codm-industries-glow-secondary pointer-events-none absolute left-[8%] top-[30%] h-[350px] w-[350px]"
      />

      {/* =====================================================
          CONTAINER
          ===================================================== */}

      <div className="relative mx-auto max-w-[1250px] px-5 sm:px-8">

        {/* ===================================================
            SECTION HEADING
            =================================================== */}

        <div className="codm-industries-heading mx-auto max-w-[1000px] text-center">

          {/* EYEBROW */}

          <div className="codm-industries-eyebrow-wrapper mb-6 flex items-center justify-center gap-3">

            <span
              aria-hidden="true"
              className="codm-industries-line h-px w-10"
            />

            <span className="codm-industries-eyebrow">
              Industries We Serve
            </span>

            <span
              aria-hidden="true"
              className="codm-industries-line h-px w-10"
            />

          </div>

          {/* HEADING */}

          <h2 className="codm-industries-title">

            <span className="codm-industries-title-main">
              Engineering the systems that run
            </span>

            <span className="codm-industries-title-gradient">
              modern enterprises.
            </span>

          </h2>

          {/* DESCRIPTION */}

          <p className="codm-industries-description mx-auto mt-6 max-w-[700px]">
            We combine Salesforce depth with product-grade engineering, so
            transformation lands as working software not slideware.
          </p>

        </div>

        {/* ===================================================
            INDUSTRY PILLS
            =================================================== */}

        <div className="codm-industries-pills mx-auto mt-10 flex max-w-[1150px] flex-wrap justify-center gap-2.5">

          {loading ? (
            <div className="codm-industries-loading">
              Loading industries...
            </div>
          ) : industries.length === 0 ? (
            <div className="codm-industries-loading">
              No industries available.
            </div>
          ) : (
            industries.map((industry, index) => {
              const isActive = index === activeIndustry;

              return (
                <button
                  key={industry.id}
                  type="button"
                  onClick={() => setActiveIndustry(index)}
                  style={
                    {
                      "--pill-delay": `${index * 70}ms`,
                    } as React.CSSProperties
                  }
                  className={`codm-industry-pill ${
                    isActive
                      ? "codm-industry-pill-active"
                      : ""
                  }`}
                >
                  {industry.title}
                </button>
              );
            })
          )}

        </div>

        {/* ===================================================
            FEATURED INDUSTRY CARD
            =================================================== */}

        {active && (
          <div
            key={active.id}
            className="codm-industry-card mt-10 md:mt-12"
          >
            <div className="codm-industry-card-inner">

              {/* =================================================
                  CONTENT
                  ================================================= */}

              <div className="codm-industry-content">

                <div className="codm-industry-content-inner">

                  <h3 className="codm-industry-title">
                    {active.title}
                  </h3>

                  <div
                    className="codm-industry-description"
                    dangerouslySetInnerHTML={{
                      __html:
                        active.content || active.excerpt || "",
                    }}
                  />

                  <a
                    href={`/industries/${active.slug}`}
                    className="codm-industry-view-link"
                  >
                    <span>View all</span>

                    <span className="codm-industry-arrow">
                      →
                    </span>
                  </a>

                </div>

              </div>

              {/* =================================================
                  IMAGE
                  ================================================= */}

              <div className="codm-industry-image-wrapper">

                <div className="codm-industry-image-container">

                  {/* IMAGE AMBIENT GLOW */}

                  <div
                    aria-hidden="true"
                    className="codm-industry-image-glow"
                  />

                  {/* IMAGE */}

                  {active.featuredImage?.node?.sourceUrl && (
                    <img
                      src={active.featuredImage.node.sourceUrl}
                      alt={
                        active.featuredImage.node.altText ||
                        active.title
                      }
                      className="codm-industry-image"
                    />
                  )}

                </div>

              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
}

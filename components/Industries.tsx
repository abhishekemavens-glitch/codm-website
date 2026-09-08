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
  const [cardKey, setCardKey] = useState(0);

  /* =========================================================
     SECTION VIEWPORT REVEAL
     ========================================================= */

  const { ref: industriesRef, isVisible } =
    useInViewOnce<HTMLElement>(0.08);

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

        const result = await response.json();

        if (result.errors) {
          console.error("GraphQL Error:", result.errors);
          return;
        }

        setIndustries(result.data.industries.nodes);
      } catch (error) {
        console.error("Failed to load industries:", error);
      } finally {
        setLoading(false);
      }
    }

    loadIndustries();
  }, []);

  const active = industries[activeIndustry];

  /* =========================================================
     INDUSTRY CHANGE
     ========================================================= */

  const handleIndustryChange = (index: number) => {
    if (index === activeIndustry) return;

    setActiveIndustry(index);
    setCardKey((prev) => prev + 1);
  };

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
        className="codm-industries-bg-glow pointer-events-none absolute left-1/2 top-[0%] h-[520px] w-[820px] -translate-x-1/2 rounded-full blur-[140px]"
        style={{
          background:
            "radial-gradient(circle, rgba(114,92,255,0.12), transparent 68%)",
        }}
      />

      <div
        aria-hidden="true"
        className="codm-industries-bg-glow-2 pointer-events-none absolute bottom-[5%] left-[10%] h-[380px] w-[380px] rounded-full blur-[130px]"
        style={{
          background:
            "radial-gradient(circle, rgba(79,70,229,0.07), transparent 70%)",
        }}
      />

      <div
        aria-hidden="true"
        className="codm-industries-bg-glow-3 pointer-events-none absolute right-[5%] top-[40%] h-[300px] w-[300px] rounded-full blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(124,104,255,0.05), transparent 70%)",
        }}
      />

      {/* =====================================================
          MAIN CONTAINER
          ===================================================== */}

      <div className="relative mx-auto max-w-[1250px] px-5 sm:px-8">

        {/* ===================================================
            SECTION INTRO
            =================================================== */}

        <div className="mx-auto max-w-[900px] text-center">

          {/* =================================================
              EYEBROW
              ================================================= */}

          <div className="codm-industries-eyebrow-wrap mb-5 flex items-center justify-center gap-3">

            <span className="codm-industries-eyebrow-line h-px w-10 bg-[var(--accent)]/40" />

            <span className="codm-industries-eyebrow">
              Industries We Serve
            </span>

            <span className="codm-industries-eyebrow-line h-px w-10 bg-[var(--accent)]/40" />

          </div>


          {/* =================================================
              MAIN HEADING
              ================================================= */}

          <h2 className="codm-industries-title">

            <span className="codm-industries-title-line">
              Engineering the systems that run
            </span>

            <span className="codm-industries-title-gradient">
              modern enterprises.
            </span>

          </h2>


          {/* =================================================
              DESCRIPTION
              ================================================= */}

          <p className="codm-industries-description mx-auto mt-5 max-w-[700px] text-sm leading-6 text-[var(--muted)] md:text-base">

            We combine Salesforce depth with product-grade engineering, so
            transformation lands as working software not slideware.

          </p>

        </div>


        {/* ===================================================
            INDUSTRY PILLS
            =================================================== */}

        <div className="codm-industries-pills mx-auto mt-8 flex max-w-[1150px] flex-wrap justify-center gap-2.5 md:mt-10">

          {loading ? (

            <div className="codm-industries-loading text-sm text-[var(--muted)]">
              Loading industries...
            </div>

          ) : (

            industries.map((industry, index) => {

              const isActive = index === activeIndustry;

              return (
                <button
                  key={industry.id}
                  type="button"
                  onClick={() => handleIndustryChange(index)}
                  className={`codm-industry-pill rounded-full border px-4 py-2 text-xs font-medium transition-all duration-500 ease-out md:px-5 md:py-2.5 ${
                    isActive
                      ? "border-[var(--accent)] bg-[var(--accent)] text-white shadow-[0_10px_35px_rgba(114,92,255,0.20)]"
                      : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-[var(--foreground)] hover:shadow-[0_8px_25px_rgba(114,92,255,0.08)]"
                  }`}
                  style={
                    {
                      "--industry-index": index,
                    } as React.CSSProperties
                  }
                >
                  <span className="codm-industry-pill-text">
                    {industry.title}
                  </span>
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
            key={cardKey}
            className="codm-industries-card mt-8 overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--surface)] md:mt-10"
          >

            <div className="grid items-center lg:grid-cols-[1fr_0.95fr]">

              {/* =============================================
                  CONTENT
                  ============================================= */}

              <div className="codm-industries-card-content order-2 p-8 md:p-12 lg:order-1 lg:pl-12 xl:p-16">

                <div className="max-w-[500px]">

                  {/* CARD LABEL */}

                  <div className="codm-industries-card-label mb-5 flex items-center gap-3">

                    <span className="h-px w-8 bg-[var(--accent)]/50" />

                    <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
                      Industry
                    </span>

                  </div>


                  {/* CARD TITLE */}

                  <h3 className="codm-industries-card-title text-3xl font-semibold leading-tight tracking-[-0.045em] text-[var(--foreground)] md:text-4xl">
                    {active.title}
                  </h3>


                  {/* CARD DESCRIPTION */}

                  <p
                    className="codm-industries-card-description mt-5 text-sm leading-6 text-[var(--muted)] md:text-[15px]"
                    dangerouslySetInnerHTML={{
                      __html: active.content || active.excerpt,
                    }}
                  />


                  {/* CARD LINK */}

                  <a
                    href={`/industries/${active.slug}`}
                    className="codm-industries-card-link mt-7 inline-flex items-center gap-2 text-sm font-medium text-[var(--foreground)]"
                  >
                    <span>View all</span>

                    <span className="codm-industries-arrow">
                      →
                    </span>
                  </a>

                </div>

              </div>


              {/* =============================================
                  IMAGE
                  ============================================= */}

              <div className="codm-industries-card-image-wrap order-1 p-4 md:p-5 lg:order-2 lg:p-5">

                <div className="codm-industries-card-image relative aspect-[1.2/1] overflow-hidden rounded-[18px] bg-[#f5f3ff] dark:bg-[#111326]">

                  {/* IMAGE GLOW */}

                  <div
                    aria-hidden="true"
                    className="codm-industries-image-glow absolute left-1/2 top-1/2 h-[75%] w-[75%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[65px]"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(114,92,255,0.25), transparent 70%)",
                    }}
                  />


                  {/* IMAGE */}

                  {active.featuredImage?.node?.sourceUrl && (

                    <img
                      src={active.featuredImage.node.sourceUrl}
                      alt={
                        active.featuredImage.node.altText ||
                        active.title
                      }
                      className="codm-industries-main-image relative h-full w-full object-contain p-5 md:p-8"
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

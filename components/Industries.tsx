"use client";

import { useEffect, useState } from "react";

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

  return (
    <section
      id="industries"
      className="relative overflow-hidden bg-[var(--background)] py-24 transition-colors duration-300 md:py-32"
    >
      {/* Background Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[5%] h-[400px] w-[700px] -translate-x-1/2 rounded-full blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(114,92,255,0.10), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-[1250px] px-5 sm:px-8">

        {/* SECTION HEADING */}

        <div className="mx-auto max-w-[850px] text-center">

          {/* Eyebrow */}

          <div className="mb-5 flex items-center justify-center gap-3">
            <span className="h-px w-10 bg-[var(--accent)]/40" />

            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
              Industries We Serve
            </span>

            <span className="h-px w-10 bg-[var(--accent)]/40" />
          </div>

          {/* Heading */}

          <h2 className="text-[clamp(2.4rem,5vw,4rem)] font-medium leading-[1.02] tracking-[-0.055em] text-[var(--foreground)]">
            Engineering the systems that run

            <span className="block bg-gradient-to-r from-[#5967ff] via-[#7c68ff] to-[#a08cff] bg-clip-text text-transparent">
              modern enterprises.
            </span>
          </h2>

          {/* Description */}

          <p className="mx-auto mt-5 max-w-[650px] text-sm leading-6 text-[var(--muted)] md:text-base">
            We combine Salesforce depth with product-grade engineering, so
            transformation lands as working software not slideware.
          </p>

        </div>


        {/* INDUSTRY PILLS */}

        <div className="mx-auto mt-8 flex max-w-[1100px] flex-wrap justify-center gap-2.5">

          {loading ? (
            <div className="text-sm text-[var(--muted)]">
              Loading industries...
            </div>
          ) : (
            industries.map((industry, index) => {
              const isActive = index === activeIndustry;

              return (
                <button
                  key={industry.id}
                  type="button"
                  onClick={() => setActiveIndustry(index)}
                  className={`rounded-full border px-4 py-2 text-xs font-medium transition-all duration-300 ${
                    isActive
                      ? "border-[var(--accent)] bg-[var(--accent)] text-white shadow-[0_8px_25px_rgba(114,92,255,0.2)]"
                      : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {industry.title}
                </button>
              );
            })
          )}

        </div>


        {/* FEATURED INDUSTRY CARD */}

        {active && (
          <div className="mt-8 overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--surface)] transition-all duration-500 md:mt-10">

            <div className="grid items-center lg:grid-cols-[1fr_0.95fr]">

              {/* CONTENT */}

              <div className="order-2 p-8 md:p-12 lg:order-1 lg:pl-12 xl:p-16">

                <div className="max-w-[500px]">

                  <h3 className="text-3xl font-semibold leading-tight tracking-[-0.045em] text-[var(--foreground)] md:text-4xl">
                    {active.title}
                  </h3>

                  <p
                    className="mt-5 text-sm leading-6 text-[var(--muted)] md:text-[15px]"
                    dangerouslySetInnerHTML={{
                      __html: active.content || active.excerpt,
                    }}
                  />

                  <a
                    href={`/industries/${active.slug}`}
                    className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:text-[var(--accent)]"
                  >
                    View all
                    <span>→</span>
                  </a>

                </div>

              </div>


              {/* IMAGE */}

              <div className="order-1 p-4 md:p-5 lg:order-2 lg:p-5">

                <div className="relative aspect-[1.2/1] overflow-hidden rounded-[18px] bg-[#f5f3ff] dark:bg-[#111326]">

                  {/* Glow */}

                  <div
                    aria-hidden="true"
                    className="absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[60px]"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(114,92,255,0.25), transparent 70%)",
                    }}
                  />

                  {active.featuredImage?.node?.sourceUrl && (
                    <img
                      src={active.featuredImage.node.sourceUrl}
                      alt={
                        active.featuredImage.node.altText ||
                        active.title
                      }
                      className="relative h-full w-full object-contain p-5 transition-all duration-500 md:p-8"
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
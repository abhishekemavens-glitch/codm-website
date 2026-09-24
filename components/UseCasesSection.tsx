"use client";
import { useEffect, useState } from "react";
import SectionHeading from "@/components/SectionHeading";
import { useInViewOnce } from "@/lib/codm-animations";

type UseCaseItem = {
  id: string;
  title: string;
  usecaseFields: {
    eyebrow: string | null;
    heading: string | null;
    description: string | null;
    tags: string | null;
  } | null;
};

const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

export default function UseCasesSection() {
  const [items, setItems] = useState<UseCaseItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const { ref: sectionRef, isVisible } = useInViewOnce<HTMLElement>(0.12);

  useEffect(() => {
    async function loadUseCases() {
      try {
        const response = await fetch(WORDPRESS_GRAPHQL_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              query GetUseCases {
                useCases(first: 20) {
                  nodes {
                    id
                    title
                    usecaseFields {
                      eyebrow
                      heading
                      description
                      tags
                    }
                  }
                }
              }
            `,
          }),
          next: { revalidate: 60 },
        });

        const result = await response.json();
        if (result.errors) {
          console.error("GraphQL Error:", result.errors);
          return;
        }
        setItems(result?.data?.useCases?.nodes ?? []);
      } catch (error) {
        console.error("Failed to load use cases:", error);
      } finally {
        setLoading(false);
      }
    }

    loadUseCases();
  }, []);

  const active = items[activeIndex];
  const fields = active?.usecaseFields;

  const tagList =
    fields?.tags
      ?.split(",")
      .map((t) => t.trim())
      .filter(Boolean) ?? [];

  if (!loading && items.length === 0) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className={
        "codm-usecases-section relative overflow-hidden bg-[var(--background)] px-6 py-24 transition-colors duration-500 " +
        (isVisible ? "codm-usecases-visible" : "")
      }
    >
      <div className="mx-auto max-w-[1250px]">
        <SectionHeading
          eyebrow="Use Cases"
          title="Built for every stage of"
          gradientText="the learner journey."
          description="We combine Salesforce depth with product-grade engineering, so transformation lands as working software not slideware."
        />

        {!loading && items.length > 0 && (
          <div className="codm-usecases-panel mt-14 grid overflow-hidden rounded-[24px] border border-[var(--border)] md:grid-cols-[280px_1fr]">
            {/* ---------- Sidebar list ---------- */}
            <div className="codm-usecases-sidebar border-b border-[var(--border)] p-4 md:border-b-0 md:border-r md:p-5">
              {items.map((item, index) => {
                const isActive = index === activeIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={
                      "codm-usecase-nav-item mb-1 flex w-full items-center justify-between rounded-full px-5 py-3 text-left text-[15px] transition-colors " +
                      (isActive
                        ? "codm-usecase-nav-active font-medium text-[var(--accent)]"
                        : "text-[var(--muted)] hover:text-[var(--foreground)]")
                    }
                  >
                    <span>{item.title}</span>
                    <span aria-hidden="true" className="text-[15px]">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M3.5 10.5L10.5 3.5M4.5 3.5h6v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* ---------- Active content ---------- */}
            {fields && (
              <div className="codm-usecase-content relative overflow-hidden p-8 md:p-12">
                {/* Decorative background icons */}
                <div className="codm-usecase-decor" aria-hidden="true">
                  <svg className="codm-decor-cap" width="90" height="90" viewBox="0 0 24 24" fill="none">
                    <path d="M12 3L2 8l10 5 8-4v5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6 10.5v4.5c0 1.5 2.5 3 6 3s6-1.5 6-3v-4.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>

                  <svg className="codm-decor-search" width="46" height="46" viewBox="0 0 24 24" fill="none">
                    <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1" />
                    <path d="M20 20l-4.5-4.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                  </svg>

                  <svg className="codm-decor-bulb" width="40" height="40" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.5.4.8 1 .8 1.6h5.4c0-.6.3-1.2.8-1.6A6 6 0 0012 3z" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                {fields.eyebrow && (
                  <div className="relative text-[13px] font-medium uppercase tracking-[0.1em] text-[var(--accent)]">
                    {fields.eyebrow}
                  </div>
                )}

                {fields.heading && (
                  <h3 className="relative mt-4 max-w-[600px] text-[clamp(22px,2.4vw,30px)] font-medium leading-[1.25] text-[var(--foreground)]">
                    {fields.heading}
                  </h3>
                )}

                {fields.description && (
                  <p className="relative mt-4 max-w-[600px] text-[15px] leading-[1.6] text-[var(--muted)]">
                    {fields.description}
                  </p>
                )}

                {tagList.length > 0 && (
                  <div className="relative mt-6 flex flex-wrap gap-x-6 gap-y-3">
                    {tagList.map((tag, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-2 text-[14px] text-[var(--foreground)]"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M2.5 7.2L5.3 10L11.5 3.8"
                            stroke="var(--accent)"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .codm-usecases-section {
          opacity: 0;
          transform: translateY(24px);
          transition:
            opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1),
            transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .codm-usecases-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .codm-usecases-panel {
          background: linear-gradient(
            135deg,
            rgba(124, 108, 240, 0.06),
            rgba(124, 108, 240, 0.02) 40%,
            var(--surface) 70%
          );
        }

        .codm-usecase-nav-item {
          transition:
            background-color 300ms ease,
            color 300ms ease;
        }

        .codm-usecase-nav-active {
          background: linear-gradient(
            135deg,
            rgba(124, 108, 240, 0.16),
            rgba(124, 108, 240, 0.08)
          );
        }

        .codm-usecase-decor {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          width: 45%;
          pointer-events: none;
          color: var(--accent);
          opacity: 0.14;
        }

        .codm-decor-cap {
          position: absolute;
          top: 20px;
          right: 40px;
        }

        .codm-decor-search {
          position: absolute;
          top: 130px;
          right: 130px;
        }

        .codm-decor-bulb {
          position: absolute;
          top: 200px;
          right: 30px;
        }

        @media (max-width: 767px) {
          .codm-usecase-decor {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .codm-usecases-section {
            transition: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
    </section>
  );
}

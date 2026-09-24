"use client";
import { useEffect, useState } from "react";
import SectionHeading from "@/components/SectionHeading";
import { useInViewOnce } from "@/lib/codm-animations";
 
/*
 * Save as: components/ProductExperience.tsx
 *
 * "See Education Cloud in action" section: eyebrow + heading, pill
 * tabs across the top, and a framed screenshot below for whichever
 * tab is active. Each tab's screen is an uploaded image (Featured
 * image) on a "Product Experience" entry in WordPress, since each
 * tab shows a genuinely different screen design.
 */

type ExperienceTab = {
  id: string;
  title: string;
  featuredImage: {
    node: {
      sourceUrl: string;
      altText: string;
    } | null;
  } | null;
};

const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

export default function ProductExperience() {
  const [tabs, setTabs] = useState<ExperienceTab[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const { ref: sectionRef, isVisible } = useInViewOnce<HTMLElement>(0.12);

  useEffect(() => {
    async function loadTabs() {
      try {
        const response = await fetch(WORDPRESS_GRAPHQL_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              query GetExperienceTabs {
                experienceTabs(first: 20, where: { orderby: { field: MENU_ORDER, order: ASC } }) {
                  nodes {
                    id
                    title
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
          next: { revalidate: 60 },
        });

        const result = await response.json();
        if (result.errors) {
          console.error("GraphQL Error (ProductExperience):", result.errors);
          return;
        }
        setTabs(result?.data?.experienceTabs?.nodes ?? []);
      } catch (error) {
        console.error("Failed to load experience tabs:", error);
      } finally {
        setLoading(false);
      }
    }

    loadTabs();
  }, []);

  const active = tabs[activeIndex];

  if (!loading && tabs.length === 0) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className={
        "codm-experience-section relative overflow-hidden bg-[var(--background)] px-6 py-24 transition-colors duration-500 " +
        (isVisible ? "codm-experience-visible" : "")
      }
    >
      <div className="mx-auto max-w-[1250px]">
        <SectionHeading
          eyebrow="Product Experience"
          title="See Education Cloud"
          gradientText="in action"
          description="We connect strategy, technology, and people so Education Cloud becomes a platform your institution can grow into."
        />

        {tabs.length > 0 && (
          <div className="mt-9 flex justify-center">
            <div className="inline-flex flex-wrap justify-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface)] p-1.5">
              {tabs.map((tab, index) => {
                const isActive = index === activeIndex;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={
                      "rounded-full px-5 py-2.5 text-sm font-medium transition-colors " +
                      (isActive
                        ? "bg-[var(--accent)] text-white"
                        : "text-[var(--muted)] hover:text-[var(--foreground)]")
                    }
                  >
                    {tab.title}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {active?.featuredImage?.node?.sourceUrl && (
          <div className="codm-experience-frame mt-9 overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-2 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.15)] md:mt-12 md:p-3">
            <img
              key={active.id}
              src={active.featuredImage.node.sourceUrl}
              alt={active.featuredImage.node.altText || active.title}
              className="codm-experience-image w-full rounded-[16px]"
            />
          </div>
        )}
      </div>

      <style jsx>{`
        .codm-experience-section {
          opacity: 0;
          transform: translateY(24px);
          transition:
            opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1),
            transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .codm-experience-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .codm-experience-image {
          animation: codmExperienceFade 0.4s ease;
        }
 
        @keyframes codmExperienceFade {
          from {
            opacity: 0;
            transform: scale(0.99);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .codm-experience-section {
            transition: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
          .codm-experience-image {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}

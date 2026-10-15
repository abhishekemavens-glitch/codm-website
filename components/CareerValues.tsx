
"use client";

import { useEffect, useState } from "react";
import SectionHeading from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";

const GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

type CareerValue = {
  databaseId: number;
  title: string;
  content: string;
  iconName: string | null;
  isActive: boolean;
  menuOrder?: number;
  featuredImage?: {
    node?: {
      sourceUrl?: string;
      altText?: string;
    } | null;
  } | null;
};

type CareerValuesResponse = {
  data?: {
    careerValuesSettings?: {
      heading?: string | null;
      intro?: string | null;
    } | null;
    careerValues?: {
      nodes?: CareerValue[];
    } | null;
  };
  errors?: Array<{ message: string }>;
};

const VALUE_ORDER = [
  "Innovation",
  "Ownership",
  "Continuous Learning",
  "Integrity",
  "Collaboration",
];

const ICON_PATHS: Record<string, React.ReactNode> = {
  sparkles: (
    <>
      <path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z" />
      <path d="m19 14 1.1 2.9L23 18l-2.9 1.1L19 22l-1.1-2.9L15 18l2.9-1.1L19 14Z" />
      <path d="m5 2 .8 2.2L8 5l-2.2.8L5 8l-.8-2.2L2 5l2.2-.8L5 2Z" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
      <path d="m13 11 7-7" />
      <path d="M15 4h5v5" />
    </>
  ),
  book: (
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
      <path d="M8 7h8M8 11h8" />
    </>
  ),
  shield: (
    <>
      <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="10" cy="7" r="4" />
      <path d="M20 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  heart: (
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" />
    </>
  ),
};

function CareerIcon({ name }: { name: string | null }) {
  const icon = name?.toLowerCase() || "sparkles";

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-violet-700 shadow-sm ring-1 ring-black/5">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {ICON_PATHS[icon] || ICON_PATHS.sparkles}
      </svg>
    </div>
  );
}

const CARD_STYLES = [
  {
    background: "bg-violet-50",
    accent: "from-violet-200/70",
    decoration: "bg-violet-200/50",
  },
  {
    background: "bg-amber-50",
    accent: "from-amber-200/70",
    decoration: "bg-amber-200/50",
  },
  {
    background: "bg-sky-50",
    accent: "from-sky-200/70",
    decoration: "bg-sky-200/50",
  },
  {
    background: "bg-rose-50",
    accent: "from-rose-200/70",
    decoration: "bg-rose-200/50",
  },
  {
    background: "bg-emerald-50",
    accent: "from-emerald-200/70",
    decoration: "bg-emerald-200/50",
  },
];

export default function CareerValues() {
  const [heading, setHeading] = useState("Working at CODM.");
  const [intro, setIntro] = useState(
    "These values shape how and what we build. If they resonate with you, take a closer look at who we are and the opportunities we have."
  );
  const [values, setValues] = useState<CareerValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchCareerValues() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(GRAPHQL_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
              query GetWorkingAtCODM {
                careerValuesSettings {
                  heading
                  intro
                }
                careerValues(first: 20) {
                  nodes {
                    databaseId
                    title
                    content
                    iconName
                    isActive
                    menuOrder
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
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(
            `WordPress returned HTTP ${response.status}.`
          );
        }

        const result: CareerValuesResponse = await response.json();

        if (result.errors?.length) {
          throw new Error(result.errors[0].message);
        }

        const settings = result.data?.careerValuesSettings;
        const nodes = result.data?.careerValues?.nodes ?? [];

        if (settings?.heading) {
          setHeading(settings.heading);
        }

        if (settings?.intro) {
          setIntro(settings.intro);
        }

        const activeValues = nodes.filter(
          (value) => value.isActive
        );

        // Keep the requested order, regardless of the order
        // returned by WordPress.
        activeValues.sort((a, b) => {
          const aIndex = VALUE_ORDER.indexOf(a.title);
          const bIndex = VALUE_ORDER.indexOf(b.title);

          if (aIndex === -1 && bIndex === -1) {
            return (a.menuOrder ?? 0) - (b.menuOrder ?? 0);
          }

          if (aIndex === -1) return 1;
          if (bIndex === -1) return -1;

          return aIndex - bIndex;
        });

        setValues(activeValues);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        console.error("Error fetching Career Values:", err);
        setError(
          "We couldn't load the career values right now. Please try again later."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchCareerValues();

    return () => controller.abort();
  }, []);

  /* "Working at CODM." -> "Working at" + gradient "CODM." */
  const headingWords = heading.trim().split(/\s+/);
  const headingEnd =
    headingWords.length > 1 ? headingWords[headingWords.length - 1] : "";
  const headingStart =
    headingWords.length > 1
      ? headingWords.slice(0, -1).join(" ")
      : heading;

  return (
    <section
      id="working-at-codm"
      className="relative overflow-hidden bg-[var(--background)] px-5 py-16 transition-colors duration-500 sm:px-8 sm:py-20 lg:px-12 lg:py-24"
    >
      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-violet-100/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-sky-100/40 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        {/* Section heading: shared SectionHeading (same eyebrow, font,
            weight and gradient as every other section) + link on the right */}
        <Reveal distance={20}>
          <div className="mb-10 flex flex-col justify-between gap-6 md:mb-14 md:flex-row md:items-start">
            <SectionHeading
              align="left"
              eyebrow="Life at CODM"
              title={headingStart}
              gradientText={headingEnd}
              description={intro}
            />

            <a
              href="#open-positions"
              className="inline-flex w-fit shrink-0 items-center gap-2 text-sm font-medium text-[#6D4AFF] transition-all duration-300 hover:gap-3 md:mt-14"
            >
              View Open Positions
              <span aria-hidden="true" className="text-base">
                →
              </span>
            </a>
          </div>
        </Reveal>

        {/* Loading state */}
        {loading && (
          <div
            className="career-values-fan career-values-fan-loading"
            aria-label="Loading career values"
          >
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="career-value-skeleton h-[340px] animate-pulse rounded-3xl bg-slate-100"
              />
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* Career value cards: overlapping illustrated fan layout */}
        {!loading && !error && values.length > 0 && (
          <div className="career-values-fan">
            {values.map((value, index) => {
              const style = CARD_STYLES[index % CARD_STYLES.length];
              const imageUrl =
                value.featuredImage?.node?.sourceUrl;
              const imageAlt =
                value.featuredImage?.node?.altText ||
                `${value.title} at CODM`;

              return (
                <article
                  key={value.databaseId}
                  className={`career-value-card group relative flex flex-col overflow-hidden rounded-[24px] border border-white/70 ${style.background} shadow-lg transition-all duration-300 hover:z-20 hover:-translate-y-3 hover:shadow-2xl`}
                  style={{ zIndex: index + 1 }}
                >
                  <div
                    className={`pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full ${style.decoration} blur-2xl`}
                  />
                  <div
                    className={`pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b ${style.accent} to-transparent`}
                  />

                  <div className="relative z-10 flex h-[172px] items-center justify-center px-4 pt-4">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={imageAlt}
                        loading="lazy"
                        className="h-full w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/70">
                        <CareerIcon name={value.iconName} />
                      </div>
                    )}
                  </div>

                  <div className="relative z-10 flex flex-1 flex-col px-5 pb-6 pt-2 sm:px-6">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <h3 className="text-xl font-normal leading-tight tracking-[-0.02em] text-slate-900 sm:text-[22px]">
                        {value.title}
                      </h3>
                    </div>

                    <div
                      className="career-value-content text-[12.5px] leading-[1.6] text-slate-600"
                      dangerouslySetInnerHTML={{
                        __html: value.content || "",
                      }}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && values.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center">
            <h3 className="text-lg font-semibold text-slate-900">
              Career values coming soon
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Please check back soon to learn more about working at CODM.
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        .career-values-fan {
          display: flex;
          align-items: stretch;
          justify-content: center;
          padding: 1.5rem 0 2rem;
          isolation: isolate;
        }

        .career-value-card {
          flex: 0 1 262px;
          min-width: 0;
          min-height: 360px;
          transform: rotate(0deg);
          transform-origin: center bottom;
          box-shadow: 0 18px 44px rgba(60, 40, 140, 0.12);
        }

        .career-value-card + .career-value-card {
          margin-left: -52px;
        }

        .career-value-card:nth-child(1) {
          transform: translateY(14px) rotate(-4deg);
        }

        .career-value-card:nth-child(2) {
          transform: translateY(2px) rotate(-1.5deg);
        }

        .career-value-card:nth-child(3) {
          transform: translateY(-4px) rotate(0deg);
        }

        .career-value-card:nth-child(4) {
          transform: translateY(0) rotate(0.6deg);
        }

        .career-value-card:nth-child(5) {
          transform: translateY(8px) rotate(2deg);
        }

        .career-value-card:hover {
          transform: translateY(-12px) rotate(0deg);
        }

        .career-values-fan-loading {
          gap: 1rem;
        }

        .career-value-skeleton {
          flex: 0 1 250px;
          min-width: 0;
        }

        .career-value-content :global(p) {
          margin: 0;
        }

        .career-value-content :global(a) {
          color: inherit;
          text-decoration: underline;
        }

        @media (max-width: 900px) {
          .career-values-fan {
            justify-content: flex-start;
            overflow-x: auto;
            padding: 1.5rem 0.5rem 2rem;
            scroll-snap-type: x proximity;
            scrollbar-width: thin;
          }

          .career-value-card {
            flex: 0 0 250px;
            scroll-snap-align: center;
          }

          .career-value-card + .career-value-card {
            margin-left: -28px;
          }
        }

        @media (max-width: 640px) {
          .career-values-fan {
            margin-right: -1.25rem;
            padding-right: 1.25rem;
          }

          .career-value-card {
            flex-basis: 235px;
          }
        }
      `}</style>
    </section>
  );
}

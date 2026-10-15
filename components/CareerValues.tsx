
"use client";

import { useEffect, useState } from "react";

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

  return (
    <section
      id="working-at-codm"
      className="relative overflow-hidden bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24"
    >
      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-violet-100/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-sky-100/40 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        {/* Section heading */}
        <div className="mb-10 flex flex-col justify-between gap-6 md:mb-14 md:flex-row md:items-end">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-violet-700">
              Life at CODM
            </p>

            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              {heading}
            </h2>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              {intro}
            </p>
          </div>

          <a
            href="#open-positions"
            className="inline-flex w-fit shrink-0 items-center gap-2 text-sm font-semibold text-slate-900 transition-colors hover:text-violet-700"
          >
            View Open Positions
            <span aria-hidden="true" className="text-lg">
              →
            </span>
          </a>
        </div>

        {/* Loading state */}
        {loading && (
          <div
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
            aria-label="Loading career values"
          >
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-[340px] animate-pulse rounded-3xl bg-slate-100"
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

        {/* Career value cards */}
        {!loading && !error && values.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                  className={`group relative isolate flex min-h-[360px] flex-col overflow-hidden rounded-3xl border border-black/[0.04] ${style.background} p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-7`}
                >
                  {/* Decorative background */}
                  <div
                    className={`pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full ${style.decoration} blur-2xl transition-transform duration-500 group-hover:scale-125`}
                  />

                  <div
                    className={`pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b ${style.accent} to-transparent`}
                  />

                  <div className="relative z-10 flex items-start justify-between gap-4">
                    <CareerIcon name={value.iconName} />

                    <span className="text-sm font-medium tabular-nums text-slate-400">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="relative z-10 mt-6">
                    <h3 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                      {value.title}
                    </h3>

                    <div
                      className="career-value-content mt-3 text-sm leading-7 text-slate-600 sm:text-base"
                      dangerouslySetInnerHTML={{
                        __html: value.content || "",
                      }}
                    />
                  </div>

                  {imageUrl && (
                    <div className="relative z-10 mt-auto flex min-h-[150px] items-end justify-center pt-6">
                      <img
                        src={imageUrl}
                        alt={imageAlt}
                        loading="lazy"
                        className="h-40 w-full rounded-2xl object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                    </div>
                  )}
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
        .career-value-content :global(p) {
          margin: 0;
        }

        .career-value-content :global(a) {
          color: inherit;
          text-decoration: underline;
        }
      `}</style>
    </section>
  );
}

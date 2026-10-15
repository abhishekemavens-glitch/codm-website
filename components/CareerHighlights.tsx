
"use client";

import { useEffect, useState } from "react";

const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

type CareerFeature = {
  databaseId: number;
  title: string;
  content: string;
  iconName: string | null;
};

const DISPLAY_ORDER = [
  "Build with purpose",
  "Keep learning",
  "Work as one team",
];

function FeatureIcon({ name }: { name: string | null }) {
  const iconClass = "h-7 w-7 shrink-0";

  switch (name) {
    case "target":
      return (
        <svg
          className={iconClass}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1" />
          <path d="M12 12 19 5" />
          <path d="M15 5h4v4" />
        </svg>
      );

    case "chart-no-axes-combined":
      return (
        <svg
          className={iconClass}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 3v18h18" />
          <path d="m7 14 4-4 4 3 6-7" />
          <path d="M16 6h5v5" />
        </svg>
      );

    case "users":
      return (
        <svg
          className={iconClass}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="10" cy="7" r="4" />
          <path d="M20 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );

    default:
      return (
        <svg
          className={iconClass}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1" />
        </svg>
      );
  }
}

export default function CareerHighlights() {
  const [features, setFeatures] = useState<CareerFeature[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function loadFeatures() {
      try {
        const response = await fetch(WORDPRESS_GRAPHQL_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
              query GetCareerHighlights {
                careerFeatures(first: 20) {
                  nodes {
                    databaseId
                    title
                    content
                    iconName
                  }
                }
              }
            `,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            `WordPress request failed: ${response.status}`
          );
        }

        const result = await response.json();

        if (result.errors) {
          throw new Error(
            "Unable to load Career Highlights from WordPress."
          );
        }

        const nodes: CareerFeature[] =
          result?.data?.careerFeatures?.nodes ?? [];

        const order = new Map(
          DISPLAY_ORDER.map((title, index) => [title, index])
        );

        const sortedFeatures = [...nodes].sort((a, b) => {
          const orderA = order.get(a.title) ?? 999;
          const orderB = order.get(b.title) ?? 999;
          return orderA - orderB;
        });

        setFeatures(sortedFeatures);
      } catch (error) {
        if (
          error instanceof Error &&
          error.name !== "AbortError"
        ) {
          console.error(
            "Failed to load Career Highlights:",
            error
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadFeatures();

    return () => controller.abort();
  }, []);

  if (loading || features.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Career highlights"
      className="relative px-5 py-5 sm:px-6 md:py-7"
    >
      <div
        className="
          mx-auto grid max-w-[1100px]
          grid-cols-1 overflow-hidden
          rounded-[20px] border border-[var(--border)]
          bg-[var(--surface)]/80
          shadow-[0_8px_35px_-25px_rgba(80,70,180,0.22)]
          backdrop-blur-xl
          md:grid-cols-3
        "
      >
        {features.map((feature, index) => (
          <article
            key={feature.databaseId}
            className={`
              relative flex min-w-0 items-center gap-4
              px-5 py-5 sm:px-7 md:py-5
              ${index > 0 ? "border-t md:border-t-0" : ""}
              md:border-l-0
            `}
          >
            {index > 0 && (
              <span
                aria-hidden="true"
                className="
                  absolute left-0 top-1/2 hidden
                  h-12 w-px -translate-y-1/2
                  bg-[var(--border)] md:block
                "
              />
            )}

            <div className="shrink-0 text-[#7854FF]">
              <FeatureIcon name={feature.iconName} />
            </div>

            <div className="min-w-0">
              <h3
                className="
                  text-sm font-semibold leading-5
                  text-[var(--foreground)]
                  sm:text-[15px]
                "
              >
                {feature.title}
              </h3>

              <div
                className="
                  mt-1 text-xs leading-[1.6]
                  text-[var(--muted)]
                  [&_p]:m-0
                "
                dangerouslySetInnerHTML={{
                  __html: feature.content,
                }}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}


"use client";

import { useEffect, useState } from "react";
import { Target, TrendingUp, Users } from "lucide-react";

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
      return <Target className={iconClass} aria-hidden="true" />;

    case "chart-no-axes-combined":
      return <TrendingUp className={iconClass} aria-hidden="true" />;

    case "users":
      return <Users className={iconClass} aria-hidden="true" />;

    default:
      return <Target className={iconClass} aria-hidden="true" />;
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

            <div
              className="
                shrink-0 text-[#7854FF]
                [&_svg]:stroke-[1.8]
              "
            >
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

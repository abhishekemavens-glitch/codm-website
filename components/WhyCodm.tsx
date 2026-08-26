"use client";

import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";

type WhyCodmItem = {
  id: string;
  databaseId: number;
  title: string;
  content: string;
  icon: string;
  featuredImage: {
    node: {
      sourceUrl: string;
      altText: string;
    } | null;
  } | null;
};

const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";



function LightIcon({ type }: { type: string }) {
  const common = "h-7 w-7 text-[var(--accent)]";

  if (type === "building") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={common}
      >
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" />
        <path d="M10 21v-3h4v3" />
      </svg>
    );
  }

  if (type === "shield") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={common}
      >
        <path d="M12 3l7 3v5c0 4.5-3 7.8-7 10-4-2.2-7-5.5-7-10V6l7-3z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    );
  }

  if (type === "lock") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={common}
      >
        <rect x="5" y="10" width="14" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </svg>
    );
  }

  if (type === "layers") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={common}
      >
        <path d="m12 4 8 4-8 4-8-4 8-4z" />
        <path d="m4 12 8 4 8-4" />
        <path d="m4 16 8 4 8-4" />
      </svg>
    );
  }

  if (type === "cube") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={common}
      >
        <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3z" />
        <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={common}
    >
      <path d="M5 17a7 7 0 0 1 14 0" />
      <path d="M8 13a4 4 0 0 1 8 0" />
      <path d="M12 9a1 1 0 1 1 0 .01" />
    </svg>
  );
}

export default function WhyCodm() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [items, setItems] = useState<WhyCodmItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadWhyCodm() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(WORDPRESS_GRAPHQL_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
  query: `
    query GetWhyCodm {
      whyCodms(
        first: 20
        where: {
          orderby: {
            field: DATE
            order: ASC
          }
        }
      ) {
        nodes {
          id
          databaseId
          title
          content
          icon
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
            `WordPress request failed with status ${response.status}`
          );
        }

        const result = await response.json();

        if (result.errors) {
          console.error("Why CODM GraphQL Error:", result.errors);
          throw new Error("Could not load Why CODM content.");
        }

        const nodes = result?.data?.whyCodms?.nodes ?? [];

        setItems(nodes);
      } catch (err) {
        console.error("Failed to load Why CODM:", err);
        setError("Unable to load Why CODM content.");
      } finally {
        setLoading(false);
      }
    }

    loadWhyCodm();
  }, []);

  return (
    <section
      id="why-codm"
      className="relative overflow-hidden bg-[var(--background)] py-20 transition-colors duration-500 md:py-28"
    >
      <div className="mx-auto max-w-[1110px] px-5 sm:px-8">
        <div className="mx-auto max-w-[1018px]">

          {/* EYEBROW */}
          <div className="mb-7 flex items-center justify-center gap-3">
            <span className="h-px w-14 bg-[var(--accent)]/35" />

            <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--muted)]">
              WHY CODM
            </span>

            <span className="h-px w-14 bg-[var(--accent)]/35" />
          </div>

          {/* HEADING */}
          <div className="mx-auto max-w-[850px] text-center">
            <h2
              className="
                text-[42px]
                font-medium
                leading-[1.05]
                tracking-[-0.055em]
                text-[var(--foreground)]
                md:text-[48px]
                lg:text-[50px]
              "
            >
              A partner enterprise boards are

              <span
                className="
                  block
                  bg-gradient-to-r
                  from-[#5269ff]
                  via-[#7668ff]
                  to-[#a08cff]
                  bg-clip-text
                  text-transparent
                "
              >
                comfortable signing off.
              </span>
            </h2>
          </div>

          {/* CONTENT CARD */}
          <div
            className="
              mx-auto
              mt-10
              max-w-[1018px]
              overflow-hidden
              rounded-[24px]
              border
              border-[var(--border)]
              bg-[var(--surface)]
            "
          >
            {loading ? (
              <div className="flex min-h-[250px] items-center justify-center">
                <p className="text-sm text-[var(--muted)]">
                  Loading Why CODM...
                </p>
              </div>
            ) : error ? (
              <div className="flex min-h-[250px] items-center justify-center p-8">
                <p className="text-sm text-red-400">
                  {error}
                </p>
              </div>
            ) : items.length === 0 ? (
              <div className="flex min-h-[250px] items-center justify-center p-8">
                <p className="text-sm text-[var(--muted)]">
                  No Why CODM items have been published in WordPress.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {items.map((item, index) => (
      <article
  key={item.id}
  className={[
    "group relative min-h-[180px] p-7 md:p-8",
    "border-b border-[var(--border)]",
    "bg-[var(--surface)]",
    "transition-[background-color,background-image] duration-300 ease-out",

    // HOVER EFFECT
    "hover:bg-[radial-gradient(circle_at_100%_100%,rgba(74,55,255,0.95)_0%,rgba(52,38,180,0.65)_38%,rgba(13,16,32,0.98)_78%)]",

    index % 3 !== 2
      ? "lg:border-r"
      : "",

    index % 2 === 0
      ? "md:border-r"
      : "",

    index >= items.length - 3
      ? "lg:border-b-0"
      : "",
  ].join(" ")}
>

                   {/* FEATURED IMAGE / ICON */}
<div className="mb-6 flex h-8 w-8 items-center">
  {item.featuredImage?.node?.sourceUrl ? (
    <img
      src={item.featuredImage.node.sourceUrl}
      alt={item.featuredImage.node.altText || item.title}
      className="h-8 w-8 object-contain"
    />
  ) : (
    <LightIcon type={item.icon} />
  )}
</div>

                    {/* TITLE */}
                    <h3
                      className="
                        text-[16px]
                        font-medium
                        tracking-[-0.025em]
                        text-[var(--foreground)]
                      "
                    >
                      {item.title}
                    </h3>

                    {/* DESCRIPTION */}
                    <div
                      className="
                        mt-2
                        max-w-[290px]
                        text-[11px]
                        leading-[1.55]
                        text-[var(--muted)]
                      "
                      dangerouslySetInnerHTML={{
                        __html: item.content,
                      }}
                    />

                  </article>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
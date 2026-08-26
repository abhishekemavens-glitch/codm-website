"use client";

import { useEffect, useState } from "react";

type TrustedLogo = {
  id: string;
  databaseId: number;
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

export default function TrustedBy() {
  const [logos, setLogos] = useState<TrustedLogo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrustedLogos() {
      try {
        const response = await fetch(WORDPRESS_GRAPHQL_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
              query GetTrustedBy {
                trustedLogos(
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

        console.log("TRUSTED BY DATA:", result);

        if (result.errors) {
          console.error(
            "Trusted By GraphQL Error:",
            result.errors
          );
          throw new Error("Could not load Trusted By content.");
        }

        const nodes =
          result?.data?.trustedLogos?.nodes ?? [];

        setLogos(nodes);
      } catch (error) {
        console.error(
          "Failed to load Trusted By:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadTrustedLogos();
  }, []);

  return (
    <section
      id="trusted-by"
      className="
        relative
        overflow-hidden
        bg-[var(--background)]
        py-[72px]
        transition-colors
        duration-500
        md:py-[86px]
      "
    >
      <div className="mx-auto max-w-[1200px] px-6">

        {/* EYEBROW */}
        <div className="mb-8 flex items-center justify-center gap-3">

          <span className="h-px w-12 bg-[var(--accent)]/35" />

          <span
            className="
              text-[10px]
              font-medium
              uppercase
              tracking-[0.1em]
              text-[var(--muted)]
            "
          >
            Trusted by world best
          </span>

          <span className="h-px w-12 bg-[var(--accent)]/35" />

        </div>

        {/* LOGOS */}
        {loading ? (
          <div className="flex justify-center">
            <p className="text-sm text-[var(--muted)]">
              Loading...
            </p>
          </div>
        ) : logos.length === 0 ? (
          <div className="flex justify-center">
            <p className="text-sm text-[var(--muted)]">
              No trusted companies found.
            </p>
          </div>
        ) : (
          <div
            className="
              mx-auto
              flex
              max-w-[1060px]
              flex-wrap
              items-center
              justify-center
              gap-[14px]
            "
          >
            {logos.map((logo) => (
              <div
                key={logo.id}
                className="
                  flex
                  h-[70px]
                  w-[190px]
                  items-center
                  justify-center
                  rounded-full
                  bg-[#d9dbea]
                  px-7
                  transition-all
                  duration-300
                  hover:-translate-y-[2px]
                  hover:bg-[#e2e3f0]
                "
              >
                {logo.featuredImage?.node?.sourceUrl ? (
                  <img
                    src={
                      logo.featuredImage.node.sourceUrl
                    }
                    alt={
                      logo.featuredImage.node.altText ||
                      logo.title
                    }
                    className="
                      max-h-[42px]
                      max-w-[145px]
                      object-contain
                      opacity-65
                      grayscale
                    "
                  />
                ) : (
                  <span
                    className="
                      text-center
                      text-[20px]
                      font-semibold
                      tracking-[-0.03em]
                      text-[#70727d]
                    "
                  >
                    {logo.title}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
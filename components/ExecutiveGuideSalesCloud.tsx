"use client";

import { useEffect, useState } from "react";
import SectionHeading from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal"; 

/* =========================================================
   EXECUTIVE GUIDE — "Sales Cloud vs Others"

   All copy comes from WordPress (Executive Guides, defined in
   codm-headless.php). Every service page has its OWN guide:

     <ExecutiveGuideSalesCloud serviceSlug="education-cloud" />

   shows the guide whose "Service page slug" field (in WordPress,
   Executive Guides) is "education-cloud". A guide can list several
   slugs separated by commas.

   Still supported: <ExecutiveGuideSalesCloud slug="some-entry" />
   shows one specific entry (by the entry's own URL slug).

   If no guide belongs to the page, the section is hidden.
   Place at: components/ExecutiveGuideSalesCloud.tsx
   ========================================================= */

const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

type ExecutiveGuide = {
  serviceSlug?: string | null;
  eyebrow: string | null;
  headingLine1: string | null;
  headingLine2: string | null;
  intro: string | null;
  question: string | null;
  questionBody: string | null;
  ctaText: string | null;
  ctaLink: string | null;
  microcopy: string | null;
  cardBrand: string | null;
  cardCategory: string | null;
  cardTitle: string | null;
  cardSubtitle: string | null;
  stat1Label: string | null;
  stat1Value: string | null;
  stat2Label: string | null;
  stat2Value: string | null;
};

function DownloadIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3v12" />
      <path d="m7 11 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

const GUIDE_FIELDS = `
  serviceSlug
  eyebrow
  headingLine1
  headingLine2
  intro
  question
  questionBody
  ctaText
  ctaLink
  microcopy
  cardBrand
  cardCategory
  cardTitle
  cardSubtitle
  stat1Label
  stat1Value
  stat2Label
  stat2Value
`;

/** "sales-cloud, salesforce-crm" -> ["sales-cloud", "salesforce-crm"] */
const splitSlugs = (value: string | null | undefined) =>
  (value ?? "")
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);

export default function ExecutiveGuideSalesCloud({
  serviceSlug,
  slug,
}: {
  /** Service page this guide belongs to, e.g. "education-cloud" */
  serviceSlug?: string;
  /** Or: one specific guide entry by its own URL slug */
  slug?: string;
}) {
  const [guide, setGuide] = useState<ExecutiveGuide | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadGuide() {
      try {
        const response = await fetch(WORDPRESS_GRAPHQL_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            slug
              ? {
                  query: `
                    query GetExecutiveGuide($slug: ID!) {
                      executiveGuide(id: $slug, idType: SLUG) {
                        ${GUIDE_FIELDS}
                      }
                    }
                  `,
                  variables: { slug },
                }
              : {
                  query: `
                    query GetExecutiveGuides {
                      executiveGuides(
                        first: 100
                        where: {
                          orderby: [
                            { field: MENU_ORDER, order: ASC }
                            { field: DATE, order: ASC }
                          ]
                        }
                      ) {
                        nodes {
                          ${GUIDE_FIELDS}
                        }
                      }
                    }
                  `,
                }
          ),
        });

        const result = await response.json();

        if (result.errors) {
          console.error("GraphQL Error:", result.errors);
          return;
        }

        if (!cancelled) {
          if (slug) {
            setGuide(result.data?.executiveGuide ?? null);
          } else {
            const wanted = (serviceSlug ?? "").trim().toLowerCase();
            const nodes: ExecutiveGuide[] =
              result.data?.executiveGuides?.nodes ?? [];

            setGuide(
              wanted
                ? nodes.find((node) =>
                    splitSlugs(node.serviceSlug).includes(wanted)
                  ) ?? null
                : null
            );
          }
        }
      } catch (error) {
        console.error("Failed to load executive guide:", error);
      }
    }

    loadGuide();

    return () => {
      cancelled = true;
    };
  }, [slug, serviceSlug]);

  /* nothing published (or still loading): render nothing */
  if (!guide) {
    return null;
  }

  const stats = [
    { label: guide.stat1Label, value: guide.stat1Value },
    { label: guide.stat2Label, value: guide.stat2Value },
  ].filter((s) => s.label && s.value);

  return (
    <section
      id="guide"
      className="relative overflow-hidden bg-[var(--background)] py-20 transition-colors duration-500 md:py-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[8%] top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(114,92,255,0.14),transparent_70%)] blur-[90px]"
      />

      <div className="relative mx-auto grid max-w-[1250px] items-center gap-14 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        {/* =================================================
            COPY
            ================================================= */}
        <Reveal distance={30} duration={0.8}>
          <div className="max-w-[560px]">
            {/* Eyebrow + gradient title + description: the shared
                SectionHeading, so this matches every other section */}
            <SectionHeading
              align="left"
              eyebrow={guide.eyebrow ?? ""}
              title={guide.headingLine1 ?? ""}
              gradientText={guide.headingLine2 ?? ""}
              description={guide.intro ?? undefined}
            />

            {guide.question && (
              <h3 className="mt-8 text-xl font-normal leading-[1.4] tracking-[-0.01em] text-[var(--foreground)] md:text-[24px]">
                {guide.question}
              </h3>
            )}

            {guide.questionBody && (
              <p className="mt-3 text-[17px] font-normal leading-[1.75] text-[var(--muted)] md:text-lg">
                {guide.questionBody}
              </p>
            )}

            {guide.ctaText && (
              <a
                href={guide.ctaLink || "#"}
                className="mt-9 inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] px-8 py-4 text-sm font-medium uppercase tracking-[0.1em] text-white shadow-[0_14px_34px_rgba(99,79,240,0.32)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(99,79,240,0.42)]"
              >
                <DownloadIcon />
                <span>{guide.ctaText}</span>
              </a>
            )}

            {guide.microcopy && (
              <p className="mt-4 text-[13px] text-[var(--muted)] opacity-80">
                {guide.microcopy}
              </p>
            )}
          </div>
        </Reveal>

        {/* =================================================
            GUIDE COVER CARD
            ================================================= */}
        <Reveal distance={40} duration={0.9}>
          <div className="mx-auto w-full max-w-[470px] lg:ml-auto lg:mr-6">
            <div
              style={{
                transform:
                  "perspective(1400px) rotateX(5deg) rotateY(-9deg) rotateZ(-3deg)",
              }}
              className="overflow-hidden rounded-[26px] border border-[var(--border)] bg-white shadow-[0_40px_90px_rgba(40,30,110,0.16)] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:!transform-none dark:bg-[#12142a]"
            >
              <div className="h-3 bg-gradient-to-r from-[#8B5CF6] to-[#6D4AFF]" />

              <div className="px-8 pb-9 pt-8">
                {guide.cardBrand && (
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5b5f73] dark:text-[#a3a8c3]">
                    {guide.cardBrand}
                  </p>
                )}

                {guide.cardCategory && (
                  <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6D4AFF]">
                    {guide.cardCategory}
                  </p>
                )}

                {guide.cardTitle && (
                  <h4 className="mt-3 text-[27px] font-medium leading-[1.22] tracking-[-0.02em] text-[#0f1230] dark:text-white">
                    {guide.cardTitle}
                  </h4>
                )}

                {guide.cardSubtitle && (
                  <p className="mt-3 text-sm text-[#5b5f73] dark:text-[#a3a8c3]">
                    {guide.cardSubtitle}
                  </p>
                )}

                <div className="mt-6 h-[3px] w-9 rounded-full bg-[#8B5CF6]" />

                {stats.length > 0 && (
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    {stats.map((stat) => (
                      <div
                        key={stat.label}
                        className="border-l-[3px] border-[#8B5CF6] bg-[#f4f3fb] px-4 py-3.5 dark:bg-[#1b1e3a]"
                      >
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#5b5f73] dark:text-[#a3a8c3]">
                          {stat.label}
                        </p>

                        <p className="mt-1.5 text-xl font-medium tracking-[-0.01em] text-[#0f1230] dark:text-white">
                          {stat.value}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

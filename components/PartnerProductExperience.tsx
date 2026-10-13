"use client";
import { useEffect, useState } from "react";
import SectionHeading from "@/components/SectionHeading";

/*
 * Save as: components/PartnerProductExperience.tsx
 *
 * "Product Experience" section for the Partner page: eyebrow + two-
 * part heading, pill tabs, and below each tab a two-column panel --
 * a text side (small label, big product name, description, checklist,
 * button) and a framed screenshot on the right. Fetches its own
 * content from the "Partner Product Experience" custom post type.
 */

type ProductTab = {
  id: string;
  title: string;
  productFields: {
    label: string | null;
    productName: string | null;
    description: string | null;
    checklist: string | null;
    buttonText: string | null;
    buttonUrl: string | null;
  } | null;
  featuredImage: {
    node: {
      sourceUrl: string;
      altText: string;
    } | null;
  } | null;
};

const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path
        d="M2.5 8L5.5 11L12.5 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PartnerProductExperience() {
  const [tabs, setTabs] = useState<ProductTab[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTabs() {
      try {
        const response = await fetch(WORDPRESS_GRAPHQL_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              query GetPartnerProducts {
                partnerProducts(
                  first: 20
                  where: { orderby: { field: MENU_ORDER, order: ASC } }
                ) {
                  nodes {
                    id
                    title
                    productFields {
                      label
                      productName
                      description
                      checklist
                      buttonText
                      buttonUrl
                    }
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
          console.error("GraphQL Error (PartnerProductExperience):", result.errors);
          return;
        }
        setTabs(result?.data?.partnerProducts?.nodes ?? []);
      } catch (error) {
        console.error("Failed to load partner products:", error);
      } finally {
        setLoading(false);
      }
    }

    loadTabs();
  }, []);

  const active = tabs[activeIndex];
  const fields = active?.productFields;
  const image = active?.featuredImage?.node;

  const checklist =
    fields?.checklist
      ?.split(",")
      .map((c) => c.trim())
      .filter(Boolean) ?? [];

  const hasButton = Boolean(fields?.buttonText && fields?.buttonUrl);

  if (!loading && tabs.length === 0) {
    return null;
  }

  return (
    <section className="bg-[var(--background)] px-6 py-24">
      <div className="mx-auto max-w-[1250px]">
        <SectionHeading
          eyebrow="Product Experience"
          title="Meet the products"
          gradientText="we're building"
          description="We connect strategy, technology, and people so Education Cloud becomes a platform your institution can grow into."
          inline
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

        {active && (
          <div
            key={active.id}
            className="mt-12 grid overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface)] lg:grid-cols-[0.85fr_1.15fr]"
          >
            {/* ---------- Left: text panel ---------- */}
            <div className="p-8 md:p-12">
              {fields?.label && (
                <div className="text-[13px] font-medium uppercase tracking-[0.1em] text-[var(--accent)]">
                  {fields.label}
                </div>
              )}

              {fields?.productName && (
                <h3 className="mt-3 text-[clamp(32px,3.4vw,44px)] font-medium leading-[1.1] tracking-[-0.02em] text-[var(--foreground)]">
                  {fields.productName}
                </h3>
              )}

              {fields?.description && (
                <p className="mt-4 max-w-[400px] text-[15px] leading-[1.6] text-[var(--muted)]">
                  {fields.description}
                </p>
              )}

              {checklist.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
                  {checklist.map((item, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-2 text-[14px] text-[var(--foreground)]"
                    >
                      <span className="text-[var(--accent)]">
                        <CheckIcon />
                      </span>
                      {item}
                    </span>
                  ))}
                </div>
              )}

              {hasButton && (
                <a
                  href={fields!.buttonUrl!}
                  className="mt-8 inline-flex h-[46px] items-center gap-2 rounded-full border border-[var(--border)] px-6 text-[14px] font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--background)]"
                >
                  {fields!.buttonText}
                  <span aria-hidden="true">↗</span>
                </a>
              )}
            </div>

            {/* ---------- Right: framed screenshot ---------- */}
            {image?.sourceUrl && (
              <div className="bg-[var(--background)] p-4 md:p-6">
                <img
                  key={active.id}
                  src={image.sourceUrl}
                  alt={image.altText || active.title}
                  className="w-full rounded-[14px] border border-[var(--border)]"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

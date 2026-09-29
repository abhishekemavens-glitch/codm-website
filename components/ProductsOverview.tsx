"use client";

import { useEffect, useState } from "react";
import SectionHeading from "@/components/SectionHeading";
import { Reveal, Stagger, StaggerItem } from "@/components/Reveal";

type OverviewFields = {
  icon: string | null;
  description: string | null;
  linkText: string | null;
  linkUrl: string | null;
};

type ProductOverviewNode = {
  id: string;
  title: string;
  overviewFields: OverviewFields | null;
};

/* ---------- icons (matched to the "salesforce" / "ai" / "custom" keys) ---------- */

function OverviewIcon({ type }: { type: string }) {
  const common = "h-7 w-7 text-[var(--accent)]";

  if (type === "salesforce") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={common}
      >
        <path
          d="M7.5 15.5h9a4 4 0 0 0 .4-7.98A5.3 5.3 0 0 0 6.9 8.6a3.6 3.6 0 0 0 .6 6.9Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (type === "ai") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={common}
      >
        <rect x="7" y="7" width="10" height="10" rx="2.5" />
        <circle cx="12" cy="12" r="1.6" />
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.5 5.5l2 2M16.5 16.5l2 2M18.5 5.5l-2 2M7.5 16.5l-2 2" />
      </svg>
    );
  }

  if (type === "custom") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={common}
      >
        <rect x="3" y="5" width="18" height="12" rx="2" />
        <path d="M8 21h8M12 17v4" strokeLinecap="round" />
        <path d="m9.5 9-2 2 2 2M14.5 9l2 2-2 2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  /* fallback */
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={common}
    >
      <circle cx="12" cy="12" r="8" />
      <path d="M8 12h8M12 8v8" strokeLinecap="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M3.5 10.5L10.5 3.5M4.5 3.5h6v6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* =========================================================
   SECTION
   ========================================================= */

export default function ProductsOverview() {
  const [items, setItems] = useState<ProductOverviewNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOverview() {
      try {
        const response = await fetch("/api/wordpress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              query GetProductOverviews {
                productOverviews(
                  first: 20
                  where: { orderby: { field: MENU_ORDER, order: ASC } }
                ) {
                  nodes {
                    id
                    title
                    overviewFields {
                      icon
                      description
                      linkText
                      linkUrl
                    }
                  }
                }
              }
            `,
          }),
        });

        if (!response.ok) {
          throw new Error(`WordPress request failed: ${response.status}`);
        }

        const result = await response.json();

        if (result.errors) {
          console.error("Products Overview GraphQL Error:", result.errors);
          return;
        }

        setItems(result?.data?.productOverviews?.nodes ?? []);
      } catch (error) {
        console.error("Failed to load Products Overview:", error);
      } finally {
        setLoading(false);
      }
    }

    loadOverview();
  }, []);

  if (!loading && items.length === 0) {
    return null;
  }

  return (
    <section className="products-overview">
      <div className="products-overview-container">
        <Reveal distance={20}>
          <SectionHeading
            eyebrow="Overview"
            title=""
            gradientText="Products & Platforms"
            description="From Salesforce and AI-powered technologies to modern application platforms, CODM brings together the right technology to solve complex business challenges."
          />
        </Reveal>

        {loading ? (
          <p className="products-overview-status">Loading...</p>
        ) : (
          <Stagger className="products-overview-grid">
            {items.map((item) => {
              const fields = item.overviewFields;

              return (
                <StaggerItem key={item.id} className="h-full">
                  <article className="products-overview-card">
                    <div className="products-overview-icon">
                      <OverviewIcon type={fields?.icon ?? ""} />
                    </div>

                    <h3>{item.title}</h3>

                    {fields?.description && <p>{fields.description}</p>}

                    {fields?.linkUrl && (
                      <a href={fields.linkUrl} className="products-overview-link">
                        {fields.linkText || "Explore"}
                        <ArrowIcon />
                      </a>
                    )}
                  </article>
                </StaggerItem>
              );
            })}
          </Stagger>
        )}
      </div>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import type { ReactElement } from "react";
import SectionHeading from "@/components/SectionHeading";
import { Stagger, StaggerItem } from "@/components/Reveal";

type SfProduct = {
  id: string;
  title: string;
  excerpt: string | null;
  badge: string | null;
  iconKey: string | null;
  exploreUrl: string | null;
};

const ICONS: Record<string, JSX.Element> = {import type { ReactElement } from "react";
// ...
const ICONS: Record<string, ReactElement> = {
  chart: <path d="M4 15l4-4 3 3 6-6" />,
  people: <path d="M6 15a3 3 0 100-6 3 3 0 000 6zm8 0a3 3 0 100-6 3 3 0 000 6zM2 20c0-3 2.5-5 4-5m10 0c1.5 0 4 2 4 5" />,
  megaphone: <path d="M3 10v4h3l6 4V6l-6 4H3zm14-2a4 4 0 010 6" />,
  database: <path d="M4 6c0-1.1 3.6-2 8-2s8 .9 8 2-3.6 2-8 2-8-.9-8-2zm0 0v12c0 1.1 3.6 2 8 2s8-.9 8-2V6M4 12c0 1.1 3.6 2 8 2s8-.9 8-2" />,
  cap: <path d="M2 9l10-4 10 4-10 4-10-4zm4 2v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" />,
  bank: <path d="M3 10l9-5 9 5M4 10v8m4-8v8m4-8v8m4-8v8m4-8v8M2 20h20" />,
  stethoscope: <path d="M6 3v6a4 4 0 008 0V3M10 15a4 4 0 108 0v-2m-4 8a2 2 0 100-4 2 2 0 000 4z" />,
  factory: <path d="M3 21V10l5 3v-3l5 3V8l6 4v9H3z" />,
  heart: <path d="M12 20s-7-4.5-9.5-9A5.5 5.5 0 0112 5a5.5 5.5 0 019.5 6c-2.5 4.5-9.5 9-9.5 9z" />,
};

function decodeEntities(text: string): string {
  if (typeof document === "undefined") return text;
  const el = document.createElement("textarea");
  el.innerHTML = text;
  return el.value;
}

function stripHtml(html: string | null): string {
  if (!html) return "";
  if (typeof document === "undefined") return html.replace(/<[^>]*>/g, "");
  const el = document.createElement("div");
  el.innerHTML = html;
  return el.textContent || "";
}

export default function SalesforceProducts() {
  const [products, setProducts] = useState<SfProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch("/api/wordpress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              query SalesforceProducts {
                salesforceProducts(
                  first: 20
                  where: { status: PUBLISH, orderby: { field: MENU_ORDER, order: ASC } }
                ) {
                  nodes {
                    id
                    title
                    excerpt
                    badge
                    iconKey
                    exploreUrl
                  }
                }
              }
            `,
          }),
        });

        const result = await response.json();
        if (result.errors) {
          console.error("Salesforce Products GraphQL Error:", result.errors);
          return;
        }
        setProducts(result?.data?.salesforceProducts?.nodes ?? []);
      } catch (error) {
        console.error("Failed to load Salesforce Products:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  if (!loading && products.length === 0) return null;

  return (
    <section className="sfp-section">
      <div className="sfp-container">
        <SectionHeading
          eyebrow="Salesforce"
          title="Salesforce"
          gradientText="Products"
          description="Powerful Salesforce platforms designed to connect customer data, automate processes and create better business experiences."
        />

        {!loading && (
          <Stagger className="sfp-grid">
            {products.map((p) => (
              <StaggerItem key={p.id}>
                <article className="sfp-card">
                  <div className="sfp-card-top">
                    <div className="sfp-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        {ICONS[p.iconKey || "chart"] ?? ICONS.chart}
                      </svg>
                    </div>
                    {p.badge && <span className="sfp-badge">{p.badge}</span>}
                  </div>

                  <h3 className="sfp-title">{decodeEntities(p.title)}</h3>
                  <p className="sfp-desc">{stripHtml(p.excerpt)}</p>

                  {p.exploreUrl && (
                    <a href={p.exploreUrl} className="sfp-link">
                      Explore Product
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path d="M3 7h8m0 0L7.5 3.5M11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </a>
                  )}
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </div>
    </section>
  );
}

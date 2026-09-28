"use client";

import { useEffect, useState } from "react";
import SectionHeading from "@/components/SectionHeading";
import { Reveal, Stagger, StaggerItem } from "@/components/Reveal";

type CardLayout = "feature-left" | "compact" | "feature-right" | "card-top";

type ProductNode = {
  id: string;
  title: string;
  excerpt: string | null;
  iconUrl: string | null;
  productTags: string[] | null;
  cardLayout: string | null;
  featuredImage?: {
    node?: {
      sourceUrl?: string;
      altText?: string;
    } | null;
  } | null;
};

const LAYOUTS: CardLayout[] = [
  "feature-left",
  "compact",
  "feature-right",
  "card-top",
];

function normalizeLayout(value: string | null): CardLayout {
  return LAYOUTS.includes(value as CardLayout)
    ? (value as CardLayout)
    : "card-top";
}

/* WordPress sends titles with HTML entities (e.g. &#038;) */
function decodeEntities(text: string): string {
  if (typeof document === "undefined") return text;
  const el = document.createElement("textarea");
  el.innerHTML = text;
  return el.value;
}

/* =========================================================
   SINGLE CARD
   ========================================================= */

function ProductCard({ product }: { product: ProductNode }) {
  const layout = normalizeLayout(product.cardLayout);
  const image = product.featuredImage?.node;
  const tags = product.productTags ?? [];

  const media = image?.sourceUrl ? (
    <div className="wwb-media">
      <img
        src={image.sourceUrl}
        alt={image.altText || decodeEntities(product.title)}
        loading="lazy"
      />
    </div>
  ) : null;

  const body = (
    <div className="wwb-body">
      {product.iconUrl && (
        <div className="wwb-icon">
          <img src={product.iconUrl} alt="" />
        </div>
      )}

      <h3 className="wwb-title">{decodeEntities(product.title)}</h3>

      {product.excerpt && (
        <div
          className="wwb-desc"
          dangerouslySetInnerHTML={{ __html: product.excerpt }}
        />
      )}

      {tags.length > 0 && (
        <ul className="wwb-tags">
          {tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      )}
    </div>
  );

  if (layout === "feature-right") {
    return (
      <article className="wwb-card wwb-feature wwb-feature-right">
        {body}
        {media}
      </article>
    );
  }

  if (layout === "feature-left") {
    return (
      <article className="wwb-card wwb-feature wwb-feature-left">
        {media}
        {body}
      </article>
    );
  }

  if (layout === "compact") {
    return (
      <article className="wwb-card wwb-compact">
        <div className="wwb-glow" aria-hidden="true" />
        {body}
      </article>
    );
  }

  return (
    <article className="wwb-card wwb-card-top">
      {media}
      {body}
    </article>
  );
}

/* =========================================================
   SECTION
   ========================================================= */

export default function WhatWeBuild({
  eyebrow = "What We Build",
  title = "Meet the products",
  highlight = "we're building.",
  description = "A full spectrum of AI capabilities — designed, engineered and delivered as secure, scalable systems your teams can actually use.",
}: {
  eyebrow?: string;
  title?: string;
  highlight?: string;
  description?: string;
}) {
  const [products, setProducts] = useState<ProductNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch("/api/wordpress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              query WhatWeBuild {
                aiProducts(
                  first: 20
                  where: {
                    status: PUBLISH
                    orderby: { field: MENU_ORDER, order: ASC }
                  }
                ) {
                  nodes {
                    id
                    title
                    excerpt
                    iconUrl
                    productTags
                    cardLayout
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
          throw new Error(`WordPress request failed: ${response.status}`);
        }

        const result = await response.json();

        if (result.errors) {
          console.error("What We Build GraphQL Error:", result.errors);
          return;
        }

        setProducts(result?.data?.aiProducts?.nodes ?? []);
      } catch (error) {
        console.error("Failed to load What We Build:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  /* Nothing published yet: hide the whole section */
  if (!loading && products.length === 0) {
    return null;
  }

  return (
    <section id="what-we-build" className="wwb-section">
      <div className="wwb-container">
        <Reveal distance={20}>
          <SectionHeading
            eyebrow={eyebrow}
            title={title}
            gradientText={highlight}
            description={description}
          />
        </Reveal>

        {loading ? (
          <p className="wwb-status">Loading products...</p>
        ) : (
          <Stagger className="wwb-grid">
            {products.map((product) => (
              <StaggerItem
                key={product.id}
                className={`wwb-cell wwb-cell--${normalizeLayout(
                  product.cardLayout
                )}`}
              >
                <ProductCard product={product} />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </div>
    </section>
  );
}

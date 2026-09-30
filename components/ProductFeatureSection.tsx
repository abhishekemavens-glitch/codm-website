"use client";

import { useEffect, useState } from "react";
import SectionHeading from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";

type FeatureFields = {
  productSlug: string | null;
  eyebrow: string | null;
  heading1: string | null;
  heading2: string | null;
  paragraph1: string | null;
  paragraph2: string | null;
  checklist: string[] | null;
  buttonText: string | null;
  buttonUrl: string | null;
};

type ProductFeatureNode = {
  id: string;
  featureFields: FeatureFields | null;
  featuredImage?: {
    node?: {
      sourceUrl?: string;
      altText?: string;
    } | null;
  } | null;
};

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M6.5 10.3l2.2 2.2 4.8-5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M3.5 7h7M7 3.5L10.5 7 7 10.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Usage: <ProductFeatureSection productSlug="salesforce" />
 * Matches the "Product Slug" field set on the entry in
 * Dashboard > Product Features in wp-admin.
 */
export default function ProductFeatureSection({
  productSlug,
}: {
  productSlug: string;
}) {
  const [feature, setFeature] = useState<ProductFeatureNode | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeature() {
      try {
        const response = await fetch("/api/wordpress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              query GetProductFeatures {
                productFeatures(first: 50) {
                  nodes {
                    id
                    featureFields {
                      productSlug
                      eyebrow
                      heading1
                      heading2
                      paragraph1
                      paragraph2
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

        if (!response.ok) {
          throw new Error(`WordPress request failed: ${response.status}`);
        }

        const result = await response.json();

        if (result.errors) {
          console.error("Product Feature GraphQL Error:", result.errors);
          return;
        }

        const nodes: ProductFeatureNode[] =
          result?.data?.productFeatures?.nodes ?? [];

        const match = nodes.find(
          (node) => node.featureFields?.productSlug === productSlug
        );

        setFeature(match ?? null);
      } catch (error) {
        console.error("Failed to load Product Feature:", error);
      } finally {
        setLoading(false);
      }
    }

    loadFeature();
  }, [productSlug]);

  if (loading || !feature?.featureFields) {
    return null;
  }

  const fields = feature.featureFields;
  const image = feature.featuredImage?.node;
  const checklist = fields.checklist ?? [];

  return (
    <section className="product-feature">
      <div className="product-feature-container">
        {/* =================================================
            SECTION HEADING
            Same shared component + Reveal wrapper as LatestBlogs.
            ================================================= */}
        <Reveal distance={20}>
          <SectionHeading
            eyebrow={fields.eyebrow || ""}
            title={fields.heading1 || ""}
            gradientText={fields.heading2 || ""}
          />
        </Reveal>

        <div className="product-feature-grid">
          <Reveal direction="right" className="product-feature-media">
            {image?.sourceUrl && (
              <div className="product-feature-image-frame">
                <img src={image.sourceUrl} alt={image.altText || ""} />
              </div>
            )}
          </Reveal>

          <Reveal direction="left" delay={0.1} className="product-feature-content">
            {fields.paragraph1 && <p>{fields.paragraph1}</p>}
            {fields.paragraph2 && <p>{fields.paragraph2}</p>}

            {checklist.length > 0 && (
              <ul className="product-feature-checklist">
                {checklist.map((item) => (
                  <li key={item}>
                    <CheckIcon />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}

            {fields.buttonUrl && (
              <a href={fields.buttonUrl} className="product-feature-cta">
                {fields.buttonText || "Learn more"}
                <ArrowIcon />
              </a>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

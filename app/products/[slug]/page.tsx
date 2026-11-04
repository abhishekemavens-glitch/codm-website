/*
 * Save as: app/products/[slug]/page.tsx
 *
 * Dedicated route for product detail pages:
 *
 *   /products/sales-cloud
 *   /products/<any Product Page slug from WordPress>
 *
 * This is a [slug] route (ONE segment), so generateStaticParams must
 * return plain strings: { slug: "sales-cloud" }, not arrays.
 *
 * /products itself (the WordPress "Products" page) is still served by
 * app/[...slug]/page.tsx.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import PageShell from "@/components/PageShell";
import ProductPage, { type ProductPageData } from "@/components/ProductPage";
import IndustryCards from "@/components/IndustryCards";
import LatestBlogs from "@/components/LatestBlogs";
import ContactCTA from "@/components/ContactCTA";

const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

/* =========================================================
   WORDPRESS FETCH
========================================================= */

async function wpFetch<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T | null> {
  try {
    const response = await fetch(WORDPRESS_GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();

    return result?.data ?? null;
  } catch {
    return null;
  }
}

/* =========================================================
   GET PRODUCT PAGE  (/products/<slug>)
   WordPress: Product Pages (one entry per product)
========================================================= */

async function getProductPage(
  slug: string
): Promise<{ title: string; data: ProductPageData } | null> {
  try {
    const data = await wpFetch<{
      productPage: {
        title: string;
        productPageData: string | null;
      } | null;
    }>(
      `
        query GetProductPage($slug: ID!) {
          productPage(id: $slug, idType: SLUG) {
            title
            productPageData
          }
        }
      `,
      { slug }
    );

    const node = data?.productPage;

    if (!node?.productPageData) {
      return null;
    }

    return {
      title: node.title.replace(/&amp;/g, "&"),
      data: JSON.parse(node.productPageData) as ProductPageData,
    };
  } catch (error) {
    console.error("Failed to load product page:", error);
    return null;
  }
}

/* =========================================================
   STATIC PARAMS

   Must be plain strings for a [slug] route:
     [{ slug: "sales-cloud" }, { slug: "service-cloud" }]
========================================================= */

export async function generateStaticParams() {
  const data = await wpFetch<{
    productPages: {
      nodes: { slug: string | null }[];
    };
  }>(
    `
      query AllProductPages {
        productPages(first: 100) {
          nodes {
            slug
          }
        }
      }
    `
  );

  return (data?.productPages?.nodes ?? [])
    .map((node) => node.slug)
    .filter(
      (slug): slug is string =>
        typeof slug === "string" && slug.length > 0
    )
    .map((slug) => ({ slug }));
}

/* =========================================================
   METADATA
========================================================= */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const productPage = await getProductPage(slug);

  if (!productPage) {
    return { title: "Page not found | CODM" };
  }

  return { title: `${productPage.title} | CODM` };
}

/* =========================================================
   PAGE
========================================================= */

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const productPage = await getProductPage(slug);

  if (!productPage) {
    notFound();
  }

  const shared = productPage.data.shared;

  return (
    <PageShell>
      <ProductPage title={productPage.title} data={productPage.data} />

      {shared?.showIndustries && (
        <div className="relative z-10">
          <IndustryCards />
        </div>
      )}

      {shared?.showBlogs && (
        <div className="relative z-10">
          <LatestBlogs />
        </div>
      )}

      {shared?.showCta && (
        <div className="relative z-10">
          <ContactCTA />
        </div>
      )}
    </PageShell>
  );
}

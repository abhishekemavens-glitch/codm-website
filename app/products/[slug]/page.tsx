
import { notFound } from "next/navigation";

const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

type ProductPageData = {
  databaseId: number;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  featuredImage: {
    node: {
      sourceUrl: string;
      altText: string;
    } | null;
  } | null;
};

/* =========================================================
   GET PRODUCT PAGE FROM WORDPRESS
========================================================= */

async function getProductPage(
  productSlug: string
): Promise<ProductPageData | null> {
  try {
    const response = await fetch(WORDPRESS_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          query GetProductPages {
            productPages(first: 100) {
              nodes {
                databaseId
                title
                slug
                content
                excerpt

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
      next: {
        revalidate: 60,
      },
    });

    if (!response.ok) {
      console.error(
        "Product Page HTTP error:",
        response.status
      );
      return null;
    }

    const result = await response.json();

    if (result.errors) {
      console.error(
        "Product Page GraphQL error:",
        result.errors
      );
      return null;
    }

    const pages: ProductPageData[] =
      result?.data?.productPages?.nodes ?? [];

    const requestedSlug =
      productSlug.trim().toLowerCase();

    const matchedPage =
      pages.find(
        (page) =>
          page.slug?.trim().toLowerCase() ===
          requestedSlug
      ) ?? null;

    return matchedPage;

  } catch (error) {
    console.error(
      "Failed to load Product Page:",
      error
    );

    return null;
  }
}

/* =========================================================
   PRODUCT PAGE
========================================================= */

export default async function ProductPage({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug } = await params;

  const productPage =
    await getProductPage(slug);

  if (!productPage) {
    notFound();
  }

  const productTitle =
    productPage.title || "Product";

  const productImage =
    productPage.featuredImage?.node?.sourceUrl;

  const imageAlt =
    productPage.featuredImage?.node?.altText ||
    productTitle;

  return (
    <main className="min-h-screen bg-white">

      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-[#080B18] py-20 md:py-28">

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 md:grid-cols-2 md:px-10">

          <div>
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-purple-400">
              CODM PRODUCT
            </p>

            <h1 className="text-4xl font-bold leading-tight text-white md:text-6xl">
              {productTitle}
            </h1>

            {productPage.excerpt && (
              <div
                className="mt-6 max-w-xl text-lg leading-8 text-gray-300"
                dangerouslySetInnerHTML={{
                  __html: productPage.excerpt,
                }}
              />
            )}

            <div className="mt-8">
              <a
                href="/contact"
                className="inline-flex items-center rounded-full bg-purple-600 px-8 py-4 font-semibold text-white transition hover:bg-purple-700"
              >
                Talk to Our Experts
              </a>
            </div>
          </div>

          {productImage && (
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <img
                src={productImage}
                alt={imageAlt}
                className="h-auto w-full object-cover"
              />
            </div>
          )}

        </div>
      </section>

      {/* PRODUCT CONTENT */}
      {productPage.content && (
        <section className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">

          <article
            className="
              prose prose-lg max-w-none
              prose-headings:font-bold
              prose-headings:text-gray-900
              prose-p:text-gray-600
              prose-a:text-purple-600
              prose-img:rounded-2xl
            "
            dangerouslySetInnerHTML={{
              __html: productPage.content,
            }}
          />

        </section>
      )}

      {/* CONTACT CTA */}
      <section className="bg-[#080B18] px-6 py-16 text-center">

        <h2 className="text-3xl font-bold text-white md:text-4xl">
          Ready to transform your business?
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-gray-300">
          Let's discuss how CODM can help you achieve
          your business goals.
        </p>

        <a
          href="/contact"
          className="mt-8 inline-flex rounded-full bg-purple-600 px-8 py-4 font-semibold text-white transition hover:bg-purple-700"
        >
          Contact Us
        </a>

      </section>

    </main>
  );
}


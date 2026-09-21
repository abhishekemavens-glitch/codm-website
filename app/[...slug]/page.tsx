import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import AboutHero from "@/components/AboutHero"; // Hero
import ServicesSection from "@/components/ServicesSection"; // What We Do
import Testimonials from "@/components/Testimonials"; // Testimonial
import LatestBlogs from "@/components/LatestBlogs"; // Blog
import ContactCTA from "@/components/ContactCTA"; // Let's Build
 
/* WordPress slugs that should also show the homepage sections */
const PAGES_WITH_HOME_SECTIONS = ["about"];

/*
 * Save as: app/[...slug]/page.tsx
 *
 * Any PUBLISHED page you create in WordPress > Pages appears on the
 * site at the same slug:
 *   WordPress slug "privacy-policy"  ->  https://your-site/privacy-policy
 *   Child page "team" under "about"  ->  https://your-site/about/team
 *
 * Fixed routes you create in code (app/contact, app/industries/[slug],
 * ...) always win over this catch-all.
 */

const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

const WORDPRESS_ORIGIN =
  "https://lightyellow-echidna-411021.hostingersite.com";

type WpPage = {
  title: string;
  content: string | null;
  featuredImage: {
    node: {
      sourceUrl: string;
      altText: string;
    } | null;
  } | null;
  aboutHero: {
    headline: string | null;
    description: string | null;
    primaryLabel: string | null;
    primaryUrl: string | null;
    secondaryLabel: string | null;
    secondaryUrl: string | null;
  } | null;
};
async function wpFetch<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T | null> {
  try {
    const response = await fetch(WORDPRESS_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: 60 }, // WordPress edits show up within a minute
    });

    if (!response.ok) return null;

    const result = await response.json();

    return result?.data ?? null;
  } catch {
    return null;
  }
}

/* ["about", "team"]  ->  "/about/team/"  (WordPress URI format) */
function toUri(slug: string[]) {
  return `/${slug.join("/")}/`;
}

async function getPage(slug: string[]): Promise<WpPage | null> {
  const data = await wpFetch<{ page: WpPage | null }>(
    `
      query GetPage($uri: ID!) {
        page(id: $uri, idType: URI) {
          title
          content
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
        }
      }
    `,
    { uri: toUri(slug) }
  );

  return data?.page ?? null;
}

/* Links to other WordPress pages should stay on THIS site, not
   jump to the WordPress backend. Uploaded files are left alone. */
function fixLinks(html: string) {
  return html.replace(/href="(https?:\/\/[^"]+)"/g, (match, url: string) => {
    if (url.startsWith(WORDPRESS_ORIGIN) && !url.includes("/wp-content/")) {
      return `href="${url.slice(WORDPRESS_ORIGIN.length) || "/"}"`;
    }

    return match;
  });
}

/* Pre-build every existing page. Pages created later still work. */
export async function generateStaticParams() {
  const data = await wpFetch<{ pages: { nodes: { uri: string }[] } }>(`
    query AllPages {
      pages(first: 100) {
        nodes {
          uri
        }
      }
    }
  `);

  return (data?.pages.nodes ?? [])
    .map((node) => node.uri)
    .filter((uri) => uri !== "/")
    .map((uri) => ({ slug: uri.split("/").filter(Boolean) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);

  return {
    title: page ? `${page.title} | CODM` : "Page not found | CODM",
  };
}

export default async function WordPressPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const page = await getPage(slug);

  if (!page) {
    notFound();
  }

  const image = page.featuredImage?.node;

  /* true only for pages listed in PAGES_WITH_HOME_SECTIONS (e.g. /about) */
  const showHomeSections =
    slug.length === 1 && PAGES_WITH_HOME_SECTIONS.includes(slug[0]);

  return (
    <PageShell>
      {showHomeSections ? (
        <AboutHero />
      ) : (
        <article className="mx-auto max-w-[1000px] px-6 pb-24">
          <h1 className="text-[clamp(32px,4vw,56px)] font-medium leading-[1.08] tracking-[-0.03em] text-[var(--foreground)]">
            {page.title}
          </h1>

          {image?.sourceUrl && (
            <img
              src={image.sourceUrl}
              alt={image.altText || page.title}
              className="mt-10 w-full rounded-[24px]"
            />
          )}

          <div
            className="codm-wp-content mt-10"
            dangerouslySetInnerHTML={{
              __html: fixLinks(page.content ?? ""),
            }}
          />
        </article>
      )}

      {showHomeSections && (
        <>
          <div id="services" className="relative z-10 scroll-mt-24">
            <ServicesSection />
          </div>

          <div className="relative z-10">
            <Testimonials />
          </div>

          <div className="relative z-10">
            <LatestBlogs />
          </div>

          <div className="relative z-10">
            <ContactCTA />
          </div>
        </>
      )}
    </PageShell>
  );
}

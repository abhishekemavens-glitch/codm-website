import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageShell from "@/components/PageShell";
import AboutHero from "@/components/AboutHero"; // Hero
import CodmStory from "@/components/CodmStory";
import PurposeSection from "@/components/PurposeSection";
import ServicesSection from "@/components/ServicesSection"; // What We Do
import ExcellenceSection from "@/components/ExcellenceSection";
import KeyCapabilities from "@/components/KeyCapabilities";
import UseCasesSection from "@/components/UseCasesSection";
import ServiceProcess from "@/components/ServiceProcess";
import ProductExperience from "@/components/ProductExperience";
import Testimonials from "@/components/Testimonials"; // Testimonial
import LatestBlogs from "@/components/LatestBlogs"; // Blog
import ContactCTA from "@/components/ContactCTA"; // Let's Build

/* WordPress slugs that should also show the homepage sections */
const PAGES_WITH_HOME_SECTIONS = ["about", "services","industries"];
/* WordPress slugs that should show the About-only sections
   (CODM Story, Our Purpose, What We Do, Our Excellence) */
const PAGES_WITH_ABOUT_SECTIONS = ["about"];
 


/* WordPress slugs that should show Services-only sections
   (Key Capabilities) */
const PAGES_WITH_SERVICES_SECTIONS = ["services"];

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

const PAGE_FIELDS = `
  title
  content
  featuredImage {
    node {
      sourceUrl
      altText
    }
  }
  aboutHero {
    headline
    description
    primaryLabel
    primaryUrl
    secondaryLabel
    secondaryUrl
  }
`;

async function getPage(slug: string[]): Promise<WpPage | null> {
  const data = await wpFetch<{ page: WpPage | null }>(
    `
      query GetPage($uri: ID!) {
        page(id: $uri, idType: URI) {
          ${PAGE_FIELDS}
        }
      }
    `,
    { uri: toUri(slug) }
  );

  if (data?.page) {
    return data.page;
  }

  /* URI lookup can fail when another content type shares the same slug
     (a plugin-registered rewrite rule, for example). Fall back to
     finding the page's database ID from the full page list, then
     fetch it by ID, which is unaffected by the URI conflict. */
  return getPageByFallback(slug);
}

async function getPageByFallback(slug: string[]): Promise<WpPage | null> {
  const targetUri = toUri(slug);

  const list = await wpFetch<{
    pages: { nodes: { databaseId: number; uri: string }[] };
  }>(`
    query AllPageUris {
      pages(first: 200) {
        nodes {
          databaseId
          uri
        }
      }
    }
  `);

  const match = list?.pages.nodes.find((node) => node.uri === targetUri);

  if (!match) {
    return null;
  }

  const data = await wpFetch<{ page: WpPage | null }>(
    `
      query GetPageById($id: ID!) {
        page(id: $id, idType: DATABASE_ID) {
          ${PAGE_FIELDS}
        }
      }
    `,
    { id: String(match.databaseId) }
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

  /* only render the WordPress body if it has real text in it */
  const hasContent = Boolean(page.content?.replace(/<[^>]*>/g, "").trim());

  /* true only for pages listed in PAGES_WITH_HOME_SECTIONS (e.g. /about) */
  const showHomeSections =
    slug.length === 1 && PAGES_WITH_HOME_SECTIONS.includes(slug[0]);

   const showAboutSections =
    slug.length === 1 && PAGES_WITH_ABOUT_SECTIONS.includes(slug[0]);

   const showServicesSections =
  slug.length === 1 && PAGES_WITH_SERVICES_SECTIONS.includes(slug[0]);

  return (
    <PageShell>
      <AboutHero
        pageTitle={page.title}
        hero={page.aboutHero}
        imageUrl={image?.sourceUrl}
        imageAlt={image?.altText}
      />

      {hasContent && (
        <article className="mx-auto max-w-[1000px] px-6 py-16">
          <div
            className="codm-wp-content"
            dangerouslySetInnerHTML={{
              __html: fixLinks(page.content ?? ""),
            }}
          />
        </article>
      )}

           {showAboutSections && (
  <>
    {/* CODM STORY */}
    <div className="relative z-10">
      <CodmStory />
    </div>

    {/* OUR PURPOSE */}
    <div className="relative z-10">
      <PurposeSection />
    </div>

    {/* WHAT WE DO */}
    <div id="services" className="relative z-10 scroll-mt-24">
      <ServicesSection />
    </div>

    {/* OUR EXCELLENCE */}
    <div className="relative z-10">
      <ExcellenceSection />
    </div>
  </>
)}


{showServicesSections && (
  <>
    {/* KEY CAPABILITIES */}
    <div className="relative z-10">
      <KeyCapabilities />
    </div>

    {/* USE CASES */}
    <div className="relative z-10">
      <UseCasesSection />
    </div>

 {/* Service Process */}
    <div className="relative z-10">
      <ServiceProcess />
    </div>

      {/* PRODUCT EXPERIENCE */}
    <div className="relative z-10">
      <ProductExperience />
    </div>
     
  </>
)}
       
{showHomeSections && (
  <>
    {/* TESTIMONIAL */}
    <div className="relative z-10">
      <Testimonials />
    </div>

    {/* BLOG */}
    <div className="relative z-10">
      <LatestBlogs />
    </div>

    {/* CONTACT CTA */}
    <div className="relative z-10">
      <ContactCTA />
    </div>
  </>
)}
    </PageShell>
  );
}

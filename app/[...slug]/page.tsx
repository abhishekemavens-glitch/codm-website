import type { Metadata } from "next";
import { notFound } from "next/navigation";

import PageShell from "@/components/PageShell";
import AboutHero from "@/components/AboutHero";

import CodmStory from "@/components/CodmStory";
import PurposeSection from "@/components/PurposeSection";
import ServicesSection from "@/components/ServicesSection";
import ExcellenceSection from "@/components/ExcellenceSection";

import KeyCapabilities from "@/components/KeyCapabilities";
import UseCasesSection from "@/components/UseCasesSection";
import ServiceProcess from "@/components/ServiceProcess";
import ProductExperience from "@/components/ProductExperience";

import Testimonials from "@/components/Testimonials";

import FeaturedStorySection from "@/components/FeaturedStorySection";
import BlogGrid from "@/components/BlogGrid";

import ContactCTA from "@/components/ContactCTA";
import CaseStudiesGrid from "@/components/CaseStudiesGrid";

/* =========================================================
   PAGE CONFIGURATION
========================================================= */

/*
 * Pages that show Testimonials
 */
const PAGES_WITH_TESTIMONIALS = [
  "about",
  "services",
  "industries",
  "partner",
];

/*
 * Pages that show Latest Blogs
 */
const PAGES_WITH_BLOG = [
  "about",
  "services",
  "industries",
  "partner",
];

/*
 * About-only sections
 */
const PAGES_WITH_ABOUT_SECTIONS = [
  "about",
];

/*
 * Services-only sections
 */
const PAGES_WITH_SERVICES_SECTIONS = [
  "services",
];

/*
 * Case Studies page
 */
const PAGES_WITH_CASE_STUDIES_GRID = [
  "case-studies",
];

/*
 * Pages that show Featured Story
 */
const PAGES_WITH_FEATURED_STORY = [
  "insights",
];

/*
 * Pages that show Let's Build CTA
 */
const PAGES_WITH_CTA = [
  "about",
  "services",
  "industries",
  "case-studies",
  "insights",
  "partner",
];

/*
 * Partner-only sections
 *
 * Partner page:
 * Hero
 * Our Purpose
 * What We Do
 * Product Experience
 * Testimonials
 * Blog
 * Let's Build
 */
const PAGES_WITH_PARTNER_SECTIONS = [
  "partner",
];

/* =========================================================
   WORDPRESS
========================================================= */

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

/* =========================================================
   WORDPRESS FETCH
========================================================= */

async function wpFetch<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T | null> {
  try {
    const response = await fetch(
      WORDPRESS_GRAPHQL_URL,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          query,
          variables,
        }),

        next: {
          revalidate: 60,
        },
      }
    );

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
   WORDPRESS URI
========================================================= */

function toUri(slug: string[]) {
  return `/${slug.join("/")}/`;
}

/* =========================================================
   PAGE FIELDS
========================================================= */

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

/* =========================================================
   GET PAGE
========================================================= */

async function getPage(
  slug: string[]
): Promise<WpPage | null> {
  const data =
    await wpFetch<{
      page: WpPage | null;
    }>(
      `
        query GetPage($uri: ID!) {
          page(
            id: $uri
            idType: URI
          ) {
            ${PAGE_FIELDS}
          }
        }
      `,
      {
        uri: toUri(slug),
      }
    );

  if (data?.page) {
    return data.page;
  }

  return getPageByFallback(slug);
}

/* =========================================================
   FALLBACK PAGE LOOKUP
========================================================= */

async function getPageByFallback(
  slug: string[]
): Promise<WpPage | null> {
  const targetUri = toUri(slug);

  const list =
    await wpFetch<{
      pages: {
        nodes: {
          databaseId: number;
          uri: string;
        }[];
      };
    }>(
      `
        query AllPageUris {
          pages(first: 200) {
            nodes {
              databaseId
              uri
            }
          }
        }
      `
    );

  const match =
    list?.pages.nodes.find(
      (node) => node.uri === targetUri
    );

  if (!match) {
    return null;
  }

  const data =
    await wpFetch<{
      page: WpPage | null;
    }>(
      `
        query GetPageById($id: ID!) {
          page(
            id: $id
            idType: DATABASE_ID
          ) {
            ${PAGE_FIELDS}
          }
        }
      `,
      {
        id: String(match.databaseId),
      }
    );

  return data?.page ?? null;
}

/* =========================================================
   FIX WORDPRESS LINKS
========================================================= */

function fixLinks(html: string) {
  return html.replace(
    /href="(https?:\/\/[^"]+)"/g,
    (match, url: string) => {
      if (
        url.startsWith(WORDPRESS_ORIGIN) &&
        !url.includes("/wp-content/")
      ) {
        return `href="${
          url.slice(WORDPRESS_ORIGIN.length) || "/"
        }"`;
      }

      return match;
    }
  );
}

/* =========================================================
   STATIC PARAMS
========================================================= */

export async function generateStaticParams() {
  const data =
    await wpFetch<{
      pages: {
        nodes: {
          uri: string;
        }[];
      };
    }>(
      `
        query AllPages {
          pages(first: 100) {
            nodes {
              uri
            }
          }
        }
      `
    );

  return (
    data?.pages.nodes ?? []
  )
    .map((node) => node.uri)
    .filter((uri) => uri !== "/")
    .map((uri) => ({
      slug: uri
        .split("/")
        .filter(Boolean),
    }));
}

/* =========================================================
   METADATA
========================================================= */

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    slug: string[];
  }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const page = await getPage(slug);

  return {
    title: page
      ? `${page.title} | CODM`
      : "Page not found | CODM",
  };
}

/* =========================================================
   PAGE
========================================================= */

export default async function WordPressPage({
  params,
}: {
  params: Promise<{
    slug: string[];
  }>;
}) {
  const { slug } = await params;

  const page = await getPage(slug);

  if (!page) {
    notFound();
  }

  const image =
    page.featuredImage?.node;

  /* =======================================================
     PAGE FLAGS
  ======================================================= */

  const currentSlug =
    slug.length === 1
      ? slug[0].toLowerCase()
      : "";

  /*
   * Insights page
   */
  const isInsightsPage =
    currentSlug === "insights";

  /*
   * Partner page
   */
  const isPartnerPage =
    currentSlug === "partner";

  /*
   * WordPress page content
   *
   * Do NOT show WordPress body on Insights.
   */
  const hasContent =
    !isInsightsPage &&
    slug.length === 1 &&
    currentSlug !== "case-studies" &&
    Boolean(
      page.content
        ?.replace(/<[^>]*>/g, "")
        .trim()
    );

  /* =======================================================
     SECTION FLAGS
  ======================================================= */

  /*
   * Testimonials
   */
  const showTestimonials =
    slug.length === 1 &&
    PAGES_WITH_TESTIMONIALS.includes(
      currentSlug
    );

  /*
   * Latest Blogs
   */
  const showBlog =
    slug.length === 1 &&
    PAGES_WITH_BLOG.includes(
      currentSlug
    );

  /*
   * About sections
   */
  const showAboutSections =
    slug.length === 1 &&
    PAGES_WITH_ABOUT_SECTIONS.includes(
      currentSlug
    );

  /*
   * Services sections
   */
  const showServicesSections =
    slug.length === 1 &&
    PAGES_WITH_SERVICES_SECTIONS.includes(
      currentSlug
    );

  /*
   * Case Studies grid
   */
  const showCaseStudiesGrid =
    slug.length === 1 &&
    PAGES_WITH_CASE_STUDIES_GRID.includes(
      currentSlug
    );

  /*
   * Featured Story
   */
  const showFeaturedStory =
    slug.length === 1 &&
    PAGES_WITH_FEATURED_STORY.includes(
      currentSlug
    );

  /*
   * Let's Build CTA
   */
  const showCTA =
    slug.length === 1 &&
    PAGES_WITH_CTA.includes(
      currentSlug
    );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <PageShell>

      {/* =================================================
          HERO
      ================================================= */}

      <AboutHero
        pageTitle={page.title}
        hero={page.aboutHero}
        imageUrl={image?.sourceUrl}
        imageAlt={image?.altText}
      />

      {/* =================================================
          WORDPRESS CONTENT
      ================================================= */}

      {hasContent && (
        <article className="mx-auto max-w-[1000px] px-6 py-16">
          <div
            className="codm-wp-content"
            dangerouslySetInnerHTML={{
              __html: fixLinks(
                page.content ?? ""
              ),
            }}
          />
        </article>
      )}

      {/* =================================================
          ABOUT PAGE
      ================================================= */}

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

          <div
            id="services"
            className="relative z-10 scroll-mt-24"
          >
            <ServicesSection />
          </div>

          {/* OUR EXCELLENCE */}

          <div className="relative z-10">
            <ExcellenceSection />
          </div>
        </>
      )}

      {/* =================================================
          SERVICES PAGE
      ================================================= */}

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

          {/* SERVICE PROCESS */}

          <div className="relative z-10">
            <ServiceProcess />
          </div>

          {/* PRODUCT EXPERIENCE */}

          <div className="relative z-10">
            <ProductExperience />
          </div>
        </>
      )}

      {/* =================================================
          PARTNER PAGE
          
          Required order:

          OUR PURPOSE
          WHAT WE DO
          PRODUCT EXPERIENCE
          TESTIMONIAL
          BLOG
          LET'S BUILD
      ================================================= */}

      {isPartnerPage && (
        <>
          {/* =============================================
              OUR PURPOSE
          ============================================= */}

          <div className="relative z-10">
            <PurposeSection />
          </div>

          {/* =============================================
              WHAT WE DO
          ============================================= */}

          <div
            id="services"
            className="relative z-10 scroll-mt-24"
          >
            <ServicesSection />
          </div>

          {/* =============================================
              PRODUCT EXPERIENCE
          ============================================= */}

          <div className="relative z-10">
            <ProductExperience />
          </div>
        </>
      )}

      {/* =================================================
          TESTIMONIALS

          About
          Services
          Industries
          Partner
      ================================================= */}

      {showTestimonials && (
        <div className="relative z-10">
          <Testimonials />
        </div>
      )}

      {/* =================================================
          CASE STUDIES
      ================================================= */}

      {showCaseStudiesGrid && (
        <div className="relative z-10">
          <CaseStudiesGrid />
        </div>
      )}

      {/* =================================================
          INSIGHTS — FEATURED STORY
      ================================================= */}

      {showFeaturedStory && (
        <div className="relative z-10">
          <FeaturedStorySection />
        </div>
      )}

      {/* =================================================
          LATEST BLOGS

          About
          Services
          Industries
          Partner
      ================================================= */}

      {showBlog && (
        <div className="relative z-10">
          <BlogGrid />
        </div>
      )}

      {/* =================================================
          LET'S BUILD CTA

          About
          Services
          Industries
          Case Studies
          Insights
          Partner
      ================================================= */}

      {showCTA && (
        <div className="relative z-10">
          <ContactCTA />
        </div>
      )}

    </PageShell>
  );
}

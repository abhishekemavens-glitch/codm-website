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
import SuccessStoriesCTA from "@/components/SuccessStoriesCTA";

import ContactCTA from "@/components/ContactCTA";
import CaseStudiesGrid from "@/components/CaseStudiesGrid";
import LatestBlogs from "@/components/LatestBlogs";
import WhatWeBuild from "@/components/WhatWeBuild";
import PartnersInSuccess from "@/components/PartnersInSuccess";


/* =========================================================
   PAGE CONFIGURATION
========================================================= */

/*
 * Pages with Testimonials
 */
const PAGES_WITH_TESTIMONIALS = [
  "about",
  "services",
  "industries",
  "partner",
];

/*
 * Pages with Latest Blogs
 */
const PAGES_WITH_BLOG = [
  "about",
  "services",
  "industries",
  "partner",
];

/*
 * About page sections
 */
const PAGES_WITH_ABOUT_SECTIONS = [
  "about",
];

/*
 * Services page sections
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
 * Insights Featured Story
 */
const PAGES_WITH_FEATURED_STORY = [
  "insights",
];

/*
 * Insights Blog Grid
 */
const PAGES_WITH_INSIGHTS_BLOG = [
  "insights",
];

/*
 * Explore Success Through Stories
 *
 * ONLY Insights.
 */
const PAGES_WITH_SUCCESS_STORIES = [
  "insights",
];

/*
 * Let's Build CTA
 */
const PAGES_WITH_CTA = [
  "about",
  "services",
  "industries",
  "case-studies",
  "insights",
  "partner",
];

/* =========================================================
   WORDPRESS
========================================================= */

const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

const WORDPRESS_ORIGIN =
  "https://lightyellow-echidna-411021.hostingersite.com";

/* =========================================================
   WORDPRESS PAGE TYPE
========================================================= */

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
   WORDPRESS BLOG POST TYPE
========================================================= */

type WpPost = {
  id: string;
  title: string;
  content: string | null;
  excerpt: string | null;
  uri: string;
  date: string;

  featuredImage: {
    node: {
      sourceUrl: string;
      altText: string;
    } | null;
  } | null;

  categories: {
    nodes: {
      name: string;
    }[];
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
   POST FIELDS
========================================================= */

const POST_FIELDS = `
  id
  title
  content
  excerpt
  uri
  date

  featuredImage {
    node {
      sourceUrl
      altText
    }
  }

  categories {
    nodes {
      name
    }
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
   GET WORDPRESS BLOG POST
========================================================= */

async function getPost(
  slug: string[]
): Promise<WpPost | null> {
  const uri = toUri(slug);

  const data =
    await wpFetch<{
      post: WpPost | null;
    }>(
      `
        query GetPost($uri: ID!) {
          post(
            id: $uri
            idType: URI
          ) {
            ${POST_FIELDS}
          }
        }
      `,
      {
        uri,
      }
    );

  return data?.post ?? null;
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

  /*
   * First check WordPress Pages.
   */
  const page = await getPage(slug);

  if (page) {
    return {
      title: `${page.title} | CODM`,
    };
  }

  /*
   * Then check WordPress Blog Posts.
   */
  const post = await getPost(slug);

  if (post) {
    return {
      title: `${post.title} | CODM`,
    };
  }

  return {
    title: "Page not found | CODM",
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

  /*
   * =======================================================
   * FIRST: TRY WORDPRESS PAGE
   * =======================================================
   */

  const page = await getPage(slug);

  /*
   * =======================================================
   * IF NO PAGE EXISTS, TRY WORDPRESS BLOG POST
   * =======================================================
   */

  const post = page
    ? null
    : await getPost(slug);

  /*
   * =======================================================
   * BLOG DETAIL PAGE
   *
   * This is the important fix.
   *
   * WordPress blog posts are NOT WordPress Pages.
   * Therefore they are handled separately here.
   * =======================================================
   */

  if (!page && post) {
    const postImage =
      post.featuredImage?.node;

    const category =
      post.categories?.nodes?.[0]?.name ||
      "Insight";

    return (
      <PageShell>
        <article className="mx-auto max-w-[1200px] px-6 py-16">

          {/* CATEGORY */}
          <div className="mb-4 text-sm font-medium uppercase tracking-[0.15em] text-[var(--muted)]">
            {category}
          </div>

          {/* TITLE */}
          <h1 className="mx-auto max-w-[1000px] text-center text-4xl font-semibold leading-tight md:text-6xl">
            {post.title}
          </h1>

          {/* DATE */}
          <div className="mt-6 text-center text-sm text-[var(--muted)]">
            {new Date(
              post.date
            ).toLocaleDateString(
              "en-US",
              {
                month: "long",
                day: "numeric",
                year: "numeric",
              }
            )}
          </div>

          {/* FEATURED IMAGE */}
          {postImage?.sourceUrl && (
            <div className="mx-auto mt-12 max-w-[1100px] overflow-hidden rounded-[24px]">
              <img
                src={postImage.sourceUrl}
                alt={
                  postImage.altText ||
                  post.title
                }
                className="h-auto w-full object-cover"
              />
            </div>
          )}

          {/* BLOG CONTENT */}
          {post.content && (
            <div
              className="codm-wp-content mx-auto mt-12 max-w-[900px]"
              dangerouslySetInnerHTML={{
                __html: fixLinks(
                  post.content
                ),
              }}
            />
          )}

        </article>
      </PageShell>
    );
  }

  /*
   * =======================================================
   * NOTHING FOUND
   * =======================================================
   */

  if (!page) {
    notFound();
  }

  const image =
    page.featuredImage?.node;

  /* =======================================================
     CURRENT PAGE
  ======================================================= */

  const currentSlug =
    slug.length === 1
      ? slug[0].toLowerCase()
      : "";

  /* =======================================================
     PAGE IDENTIFICATION
  ======================================================= */

  const isInsightsPage =
    currentSlug === "insights";

  const isPartnerPage =
    currentSlug === "partner";

  const isCaseStudiesPage =
    currentSlug === "case-studies";

  /* =======================================================
     WORDPRESS CONTENT
  ======================================================= */

  /*
   * Do not render WordPress body content on:
   *
   * - Insights
   * - Case Studies
   * - Partner
   *
   * because these pages are built from React sections.
   */

  const hasContent =
    !isInsightsPage &&
    !isPartnerPage &&
    !isCaseStudiesPage &&
    slug.length === 1 &&
    Boolean(
      page.content
        ?.replace(/<[^>]*>/g, "")
        .trim()
    );

  /* =======================================================
     SECTION FLAGS
  ======================================================= */

  /*
   * ABOUT
   */

  const showAboutSections =
    slug.length === 1 &&
    PAGES_WITH_ABOUT_SECTIONS.includes(
      currentSlug
    );

  /*
   * SERVICES
   */

  const showServicesSections =
    slug.length === 1 &&
    PAGES_WITH_SERVICES_SECTIONS.includes(
      currentSlug
    );

  /*
   * TESTIMONIALS
   */

  const showTestimonials =
    slug.length === 1 &&
    PAGES_WITH_TESTIMONIALS.includes(
      currentSlug
    );

  /*
   * NORMAL LATEST BLOGS
   *
   * About
   * Services
   * Industries
   * Partner
   */

  const showBlog =
    slug.length === 1 &&
    PAGES_WITH_BLOG.includes(
      currentSlug
    );

  /*
   * CASE STUDIES
   */

  const showCaseStudiesGrid =
    slug.length === 1 &&
    PAGES_WITH_CASE_STUDIES_GRID.includes(
      currentSlug
    );

  /*
   * INSIGHTS FEATURED STORY
   */

  const showFeaturedStory =
    slug.length === 1 &&
    PAGES_WITH_FEATURED_STORY.includes(
      currentSlug
    );

  /*
   * INSIGHTS BLOG GRID
   */

  const showInsightsBlog =
    slug.length === 1 &&
    PAGES_WITH_INSIGHTS_BLOG.includes(
      currentSlug
    );

  /*
   * INSIGHTS SUCCESS STORIES
   */

  const showSuccessStories =
    slug.length === 1 &&
    PAGES_WITH_SUCCESS_STORIES.includes(
      currentSlug
    );

  /*
   * LET'S BUILD
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

          CODM STORY
          OUR PURPOSE
          WHAT WE DO
          OUR EXCELLENCE
      ================================================= */}

      {showAboutSections && (
        <>
          <div className="relative z-10">
            <CodmStory />
          </div>

          <div className="relative z-10">
            <PurposeSection />
          </div>

          <div
            id="services"
            className="relative z-10 scroll-mt-24"
          >
            <ServicesSection />
          </div>

          <div className="relative z-10">
            <ExcellenceSection />
          </div>
        </>
      )}

      {/* =================================================
          SERVICES PAGE

          KEY CAPABILITIES
          USE CASES
          SERVICE PROCESS
          PRODUCT EXPERIENCE
      ================================================= */}

      {showServicesSections && (
        <>
          <div className="relative z-10">
            <KeyCapabilities />
          </div>

          <div className="relative z-10">
            <UseCasesSection />
          </div>

          <div className="relative z-10">
            <ServiceProcess />
          </div>

          <div className="relative z-10">
            <ProductExperience />
          </div>
        </>
      )}

      {/* =================================================
          PARTNER PAGE

          EXACT ORDER:

          OUR PURPOSE
          WHAT WE DO
          PRODUCT EXPERIENCE
          TESTIMONIAL
          BLOG
          LET'S BUILD
      ================================================= */}

      {isPartnerPage && (
  <>
    <div className="relative z-10">
      <PurposeSection />
    </div>

    <div
      id="services"
      className="relative z-10 scroll-mt-24"
    >
      <ServicesSection />
    </div>

    <div className="relative z-10">
      <ProductExperience />
    </div>

    <div className="relative z-10">
      <PartnersInSuccess data={partnerTrust} />
    </div>
  </>
)}

      {/* =================================================
          TESTIMONIALS

          ABOUT
          SERVICES
          INDUSTRIES
          PARTNER
      ================================================= */}

      {showTestimonials && (
        <div className="relative z-10">
          <Testimonials />
        </div>
      )}

    {/* =================================================
    LATEST BLOGS

    ABOUT
    SERVICES
    INDUSTRIES
    PARTNER
================================================= */}

{showBlog && (
  <div className="relative z-10">
    <LatestBlogs />
  </div>
)}

      {/* =================================================
          CASE STUDIES PAGE

          HERO
          CASE STUDIES GRID
          LET'S BUILD

          NOTHING ELSE ADDED.
      ================================================= */}

      {showCaseStudiesGrid && (
        <div className="relative z-10">
          <CaseStudiesGrid />
        </div>
      )}

      {/* =================================================
          INSIGHTS PAGE

          HERO
          FEATURED STORY
          BLOG GRID
          EXPLORE SUCCESS THROUGH STORIES
          LET'S BUILD
      ================================================= */}

      {showFeaturedStory && (
        <div className="relative z-10">
          <FeaturedStorySection />
        </div>
      )}

      {showInsightsBlog && (
        <div className="relative z-10">
          <BlogGrid />
        </div>
      )}

      {showSuccessStories && (
        <div className="relative z-10">
          <SuccessStoriesCTA />
        </div>
      )}

      {/* =================================================
          LET'S BUILD

          ABOUT
          SERVICES
          INDUSTRIES
          CASE STUDIES
          INSIGHTS
          PARTNER
      ================================================= */}

      {showCTA && (
        <div className="relative z-10">
          <ContactCTA />
        </div>
      )}

    </PageShell>
  );
}

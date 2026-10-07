import type { Metadata } from "next";
import { notFound } from "next/navigation";

import PageShell from "@/components/PageShell";
import AboutHero from "@/components/AboutHero"; 

import CodmStory from "@/components/CodmStory";
import PurposeSection from "@/components/PurposeSection";
import ServicesSection from "@/components/ServicesSection";
import ExcellenceSection from "@/components/ExcellenceSection";

import Testimonials from "@/components/Testimonials"; 

import FeaturedStorySection from "@/components/FeaturedStorySection";
import BlogGrid from "@/components/BlogGrid";
import SuccessStoriesCTA from "@/components/SuccessStoriesCTA";

import ContactCTA from "@/components/ContactCTA";
import CaseStudiesGrid from "@/components/CaseStudiesGrid";
import LatestBlogs from "@/components/LatestBlogs";
import WhatWeBuild from "@/components/WhatWeBuild";
import PartnersInSuccess from "@/components/PartnersInSuccess";
import BlogPostDetail from "@/components/BlogPostDetail";  
import ProductsOverview from "@/components/ProductsOverview";
import SalesforceProducts from "@/components/SalesforceProducts";
import AiIntelligenceOverview from "@/components/AiIntelligenceOverview"; 
import TechOverview from "@/components/TechOverview";
import ProductFeatureSection from "@/components/ProductFeatureSection";

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
   "products",
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
  "products",
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

  author?: {
    node?: {
      name?: string | null;
      avatar?: {
        url?: string | null;
      } | null;
    } | null;
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

  author {
    node {
      name
      avatar {
        url
      }
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
   GET SERVICE
========================================================= */

async function getService(
  slug: string[]
): Promise<WpPage | null> {
  const serviceSlug = slug[slug.length - 1];

  try {
    const data =
      await wpFetch<{
        service: WpPage | null;
      }>(
        `
          query GetService($slug: ID!) {
            service(
              id: $slug
              idType: SLUG
            ) {
              ${PAGE_FIELDS}
            }
          }
        `,
        {
          slug: serviceSlug,
        }
      );

    return data?.service ?? null;
  } catch (error) {
    console.error("Failed to load service:", error);
    return null;
  }
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

  const isServiceDetailPage =
    slug.length >= 2 &&
    slug[0].toLowerCase() === "services";

  /*
   * =======================================================
   * FIRST: CHECK WORDPRESS PAGES — full path
   * =======================================================
   */

  let page = await getPage(slug);

  /*
   * =======================================================
   * SECOND: CHECK WORDPRESS PAGES — just the last slug
   * segment, matching the fallback used on the page itself.
   * =======================================================
   */

  if (!page && isServiceDetailPage) {
    const serviceSlugForPage = slug[1];

    if (serviceSlugForPage) {
      page = await getPage([serviceSlugForPage]);
    }
  }

  if (page) {
    return {
      title: `${page.title} | CODM`,
    };
  }

  /*
   * =======================================================
   * THIRD: CHECK SERVICE CPT
   * =======================================================
   */

  if (isServiceDetailPage) {
    const service = await getService(slug);

    if (service) {
      return {
        title: `${service.title} | CODM`,
      };
    }
  }

  /*
   * =======================================================
   * FOURTH: CHECK WORDPRESS BLOG POSTS
   * =======================================================
   */

  const post = await getPost(slug);

  if (post) {
    return {
      title: `${post.title} | CODM`,
    };
  }

  /*
   * =======================================================
   * NOT FOUND
   * =======================================================
   */

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
   * SERVICE DETAIL PAGE
   *
   * Example:
   * /services/sales-cloud
   * /services/education-cloud
   * /services/health-cloud
   *
   * These are WordPress child pages under "Services".
   * =======================================================
   */

  const isServiceDetailPage =
    slug.length === 2 &&
    slug[0].toLowerCase() === "services";

  /*
   * For service detail pages, try the WordPress page
   * using the complete path first.
   */
 /*
 * =======================================================
 * LOAD WORDPRESS PAGE / SERVICE
 * =======================================================
 */

/*
 * First try the complete URL path.
 *
 * Example:
 * /services/sales-cloud
 */
let wordpressPage = await getPage(slug);

/*
 * For service detail pages, the actual WordPress Page
 * may have the slug "sales-cloud" rather than the
 * nested URI "/services/sales-cloud".
 *
 * Therefore, if the full path was not found,
 * try the service slug directly.
 */
if (!wordpressPage && isServiceDetailPage) {
  const serviceSlugForPage = slug[1];

  if (serviceSlugForPage) {
    wordpressPage = await getPage([serviceSlugForPage]);
  }
}

/*
 * If it is still not a WordPress Page, try the
 * Service custom post type.
 */
const service =
  !wordpressPage && isServiceDetailPage
    ? await getService(slug)
    : null;

/*
 * Final page object used by the rest of the component.
 */
const page = wordpressPage ?? service;

/*
 * Only try a blog post if neither a Page nor
 * Service was found.
 */
const post =
  !page
    ? await getPost(slug)
    : null;

console.log("SERVICE DEBUG:", {
  slug,
  isServiceDetailPage,
  wordpressPageFound: Boolean(wordpressPage),
  serviceFound: Boolean(service),
  finalPageFound: Boolean(page),
});

  /*
   * =======================================================
   * BLOG DETAIL PAGE
   * =======================================================
   */

 if (!page && post) {
  return (
    <PageShell>
      <BlogPostDetail
        post={post}
        content={fixLinks(post.content ?? "")}
      />

      <div className="relative z-10">
        <ContactCTA />
      </div>
    </PageShell>
  );
}

  /*
   * =======================================================
   * PAGE NOT FOUND
   * =======================================================
   */

  if (!page) {
    notFound();
  }

  /*
   * =======================================================
   * SERVICE SLUG
   * =======================================================
   */

  const serviceSlug = isServiceDetailPage
    ? slug[1].toLowerCase()
    : undefined;

  /*
   * =======================================================
   * EXISTING PAGE LOGIC CONTINUES BELOW
   * =======================================================
   */

  // KEEP EVERYTHING THAT YOU CURRENTLY HAVE BELOW THIS POINT.

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

   const isProductsPage =
  currentSlug === "products";

   
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
  (slug.length === 1 && PAGES_WITH_TESTIMONIALS.includes(currentSlug)) ||
  isServiceDetailPage;

  /*
   * NORMAL LATEST BLOGS
   *
   * About
   * Services
   * Industries
   * Partner
   */

  const showBlog =
  (slug.length === 1 && PAGES_WITH_BLOG.includes(currentSlug)) ||
  isServiceDetailPage;

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
  (slug.length === 1 && PAGES_WITH_CTA.includes(currentSlug)) ||
  isServiceDetailPage;

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

     

       
    {isPartnerPage && (
  <>
    {/* =================================================
        WHAT WE BUILD
        ================================================= */}

   <div className="relative z-10">
  <WhatWeBuild />
</div>

    {/* =================================================
        OUR PURPOSE
        ================================================= */}

    <div className="relative z-10">
      <PurposeSection />
    </div>

    {/* =================================================
        WHAT WE DO
        ================================================= */}

    <div
      id="services"
      className="relative z-10 scroll-mt-24"
    >
      <ServicesSection />
    </div>

    {/* =================================================
        PRODUCT EXPERIENCE
        ================================================= */}

    <div className="relative z-10">
      <ProductExperience />
    </div>

    {/* =================================================
        TESTIMONIAL
        ================================================= */}

    <div className="relative z-10">
      <PartnersInSuccess />
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
    PRODUCTS & PLATFORMS

    PRODUCTS PAGE ONLY
================================================= */}

{isProductsPage && (
  <>
    <div className="relative z-10">
      <ProductsOverview />
    </div>

    <div className="relative z-10">
      <SalesforceProducts />
    </div>

<div className="relative z-10">
  <AiIntelligenceOverview />
</div>

     <div className="relative z-10">
  <TechOverview />
</div>

     <div className="relative z-10">
  <ProductFeatureSection productSlug="salesforce" />
</div>
     
  </>
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

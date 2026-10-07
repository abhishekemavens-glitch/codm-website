import { notFound } from "next/navigation";

import KeyCapabilities from "@/components/KeyCapabilities";
import UseCasesSection from "@/components/UseCasesSection";
import ServiceProcess from "@/components/ServiceProcess";
import ProductExperience from "@/components/ProductExperience";
import LatestBlogs from "@/components/LatestBlogs";
import ContactCTA from "@/components/ContactCTA";

const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

/* =========================================================
   SERVICE PAGE DATA
========================================================= */

type ServicePageData = {
  databaseId: number;
  title: string;
  slug: string;

  /* HERO */
  serviceHero: {
    eyebrow: string | null;
    headline: string | null;
    description: string | null;

    primaryLabel: string | null;
    primaryUrl: string | null;

    secondaryLabel: string | null;
    secondaryUrl: string | null;
  } | null;

  /* FEATURED IMAGE */
  featuredImage: {
    node: {
      sourceUrl: string;
      altText: string;
    } | null;
  } | null;

  /* KEY CAPABILITIES */
  capabilitiesEnabled: boolean;
  capabilitiesEyebrow: string | null;
  capabilitiesHeading: string | null;
  capabilitiesHighlight: string | null;
  capabilitiesDescription: string | null;

  /* USE CASES */
  usecasesEnabled: boolean;
  usecasesEyebrow: string | null;
  usecasesHeading: string | null;
  usecasesHighlight: string | null;
  usecasesDescription: string | null;

  /* CODM DIFFERENCE */
  processEnabled: boolean;
  processEyebrow: string | null;
  processHeading: string | null;
  processHighlight: string | null;
  processDescription: string | null;

  /* PRODUCT EXPERIENCE */
  productEnabled: boolean;
  productEyebrow: string | null;
  productHeading: string | null;
  productHighlight: string | null;
  productDescription: string | null;
};

/* =========================================================
   GET SERVICE PAGE FROM WORDPRESS
========================================================= */

async function getServicePage(
  serviceSlug: string
): Promise<ServicePageData | null> {
  try {
    const response = await fetch(WORDPRESS_GRAPHQL_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        query: `
          query GetServicePage {
            servicePages(first: 50) {
              nodes {
                databaseId
                title
                slug

                serviceHero {
                  eyebrow
                  headline
                  description
                  primaryLabel
                  primaryUrl
                  secondaryLabel
                  secondaryUrl
                }

                featuredImage {
                  node {
                    sourceUrl
                    altText
                  }
                }

                capabilitiesEnabled
                capabilitiesEyebrow
                capabilitiesHeading
                capabilitiesHighlight
                capabilitiesDescription

                usecasesEnabled
                usecasesEyebrow
                usecasesHeading
                usecasesHighlight
                usecasesDescription

                processEnabled
                processEyebrow
                processHeading
                processHighlight
                processDescription

                productEnabled
                productEyebrow
                productHeading
                productHighlight
                productDescription
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
        "Service Page HTTP error:",
        response.status
      );

      return null;
    }

    const result = await response.json();

    if (result.errors) {
      console.error(
        "GraphQL Error (Service Page):",
        result.errors
      );

      return null;
    }

    const pages: ServicePageData[] =
      result?.data?.servicePages?.nodes ?? [];

    const requestedSlug =
      serviceSlug.trim().toLowerCase();

    const matchedPage =
      pages.find(
        (page) =>
          page.slug?.trim().toLowerCase() ===
          requestedSlug
      ) ?? null;

    console.log(
      "SERVICE PAGE DEBUG:",
      {
        requestedSlug,
        availableSlugs: pages.map(
          (page) => page.slug
        ),
        matchedPage:
          matchedPage?.title ?? null,
      }
    );

    return matchedPage;
  } catch (error) {
    console.error(
      "Failed to load Service Page:",
      error
    );

    return null;
  }
}

/* =========================================================
   PAGE
========================================================= */

export default async function ServicePage({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug } = await params;

  const serviceSlug =
    slug.trim().toLowerCase();

  const servicePage =
    await getServicePage(serviceSlug);

  /* =======================================================
     NOT FOUND
  ======================================================= */

  if (!servicePage) {
    notFound();
  }

  /* =======================================================
     SAFE VALUES
  ======================================================= */

  const serviceTitle =
    servicePage.title || "Service";

  const hero =
    servicePage.serviceHero;

  const heroEyebrow =
  hero?.eyebrow || "";

  const heroHeadline =
    hero?.headline || serviceTitle;

  const heroDescription =
    hero?.description || "";

  const primaryLabel =
    hero?.primaryLabel || "Book a Consultation";

  const primaryUrl =
    hero?.primaryUrl || "/contact";

  const secondaryLabel =
    hero?.secondaryLabel || "Explore Services";

  const secondaryUrl =
    hero?.secondaryUrl || "/services";

  const heroImage =
    servicePage.featuredImage?.node?.sourceUrl || "";

  const heroImageAlt =
    servicePage.featuredImage?.node?.altText ||
    heroHeadline;

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <main className="service-page">

      {/* =================================================
          HERO
      ================================================= */}

      <section
        className="
          relative
          overflow-hidden
          bg-[#eeecff]
        "
      >

        {/* Background glow */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-[radial-gradient(circle_at_25%_45%,rgba(123,92,255,0.12),transparent_38%),radial-gradient(circle_at_75%_50%,rgba(123,92,255,0.08),transparent_35%)]
          "
        />

        <div
          className="
            relative
            mx-auto
            max-w-[1250px]
            px-6
            pt-20
            pb-20
            md:pt-32
            md:pb-24
          "
        >

          {/* Breadcrumb */}

          <nav
            aria-label="Breadcrumb"
            className="
              mb-12
              text-sm
              text-[#303044]
              md:mb-16
            "
          >

            <ol className="flex items-center gap-2">

              <li>
                <a
                  href="/"
                  className="
                    transition-colors
                    hover:text-[#7357ff]
                  "
                >
                  Home
                </a>
              </li>

              <li aria-hidden="true">
                /
              </li>

              <li>
                <a
                  href="/services"
                  className="
                    text-[#7357ff]
                    transition-colors
                    hover:text-[#5d42df]
                  "
                >
                  Services
                </a>
              </li>

              <li aria-hidden="true">
                /
              </li>

              <li
                className="text-[#15151c]"
                aria-current="page"
              >
                {serviceTitle}
              </li>

            </ol>

          </nav>

          {/* Hero content */}

          <div
            className="
              grid
              items-center
              gap-12
              lg:grid-cols-[1fr_1fr]
              lg:gap-16
            "
          >

            {/* LEFT */}

            <div>

              {/* Eyebrow */}

              {heroEyebrow && (
                <div
                  className="
                    mb-5
                    flex
                    items-center
                    gap-3
                    text-sm
                    font-medium
                    uppercase
                    tracking-wide
                    text-[#7257ee]
                  "
                >

                  <span
                    className="
                      h-px
                      w-8
                      bg-[#7257ee]
                    "
                  />

                  <span>
                    {heroEyebrow}
                  </span>

                  <span
                    className="
                      h-px
                      w-8
                      bg-[#7257ee]
                    "
                  />

                </div>
              )}

              {/* Headline */}

              <h1
                className="
                  max-w-[650px]
                  text-5xl
                  font-normal
                  leading-[1.05]
                  tracking-[-0.04em]
                  text-[#101014]
                  md:text-6xl
                  lg:text-[68px]
                "
              >
                {heroHeadline}
              </h1>

              {/* Description */}

              {heroDescription && (
                <p
                  className="
                    mt-7
                    max-w-[620px]
                    text-lg
                    leading-8
                    text-[#66687a]
                    md:text-xl
                  "
                >
                  {heroDescription}
                </p>
              )}

              {/* Buttons */}

              <div
                className="
                  mt-9
                  flex
                  flex-wrap
                  gap-4
                "
              >

                {primaryLabel && (
                  <a
                    href={primaryUrl || "#"}
                    className="
                      inline-flex
                      items-center
                      justify-center
                      rounded-full
                      bg-[#7452f5]
                      px-8
                      py-4
                      text-base
                      font-medium
                      text-white
                      shadow-[0_12px_30px_rgba(116,82,245,0.25)]
                      transition-all
                      hover:-translate-y-0.5
                      hover:bg-[#6442e5]
                    "
                  >
                    {primaryLabel}

                    <span className="ml-2">
                      ↗
                    </span>
                  </a>
                )}

                {secondaryLabel && (
                  <a
                    href={secondaryUrl || "#"}
                    className="
                      inline-flex
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-white
                      bg-white/40
                      px-8
                      py-4
                      text-base
                      font-medium
                      text-[#303044]
                      backdrop-blur
                      transition-all
                      hover:-translate-y-0.5
                      hover:bg-white
                    "
                  >
                    {secondaryLabel}

                    <span className="ml-2">
                      →
                    </span>
                  </a>
                )}

              </div>

            </div>

            {/* RIGHT - FEATURED IMAGE */}

            <div className="relative">

              {heroImage ? (

                <div
                  className="
                    overflow-hidden
                    rounded-[20px]
                    border
                    border-white/80
                    bg-white/50
                    p-2
                    shadow-[0_25px_70px_rgba(65,52,130,0.12)]
                  "
                >

                  <img
                    src={heroImage}
                    alt={heroImageAlt}
                    className="
                      block
                      h-auto
                      w-full
                      rounded-[14px]
                      object-cover
                    "
                  />

                </div>

              ) : (

                <div
                  className="
                    flex
                    min-h-[350px]
                    items-center
                    justify-center
                    rounded-[20px]
                    border
                    border-white
                    bg-white/40
                    text-sm
                    text-[#777]
                  "
                >
                  Set a Featured Image
                  for this Service Page
                </div>

              )}

            </div>

          </div>

        </div>

      </section>


      {/* =================================================
          KEY CAPABILITIES
      ================================================= */}

      {servicePage.capabilitiesEnabled && (
        <section>
          <KeyCapabilities
            serviceSlug={serviceSlug}
          />
        </section>
      )}


      {/* =================================================
          USE CASES
      ================================================= */}

      {servicePage.usecasesEnabled && (
        <section>
          <UseCasesSection
            serviceSlug={serviceSlug}
          />
        </section>
      )}


      {/* =================================================
          THE CODM DIFFERENCE
      ================================================= */}

      {servicePage.processEnabled && (
        <section>
          <ServiceProcess
            serviceSlug={serviceSlug}
          />
        </section>
      )}


      {/* =================================================
          PRODUCT EXPERIENCE
      ================================================= */}

      {servicePage.productEnabled && (
        <section>
          <ProductExperience
            serviceSlug={serviceSlug}
            productName={serviceTitle}
          />
        </section>
      )}


      {/* =================================================
          LATEST BLOGS
      ================================================= */}

      <section>
        <LatestBlogs />
      </section>


      {/* =================================================
          CONTACT CTA
      ================================================= */}

      <section>
        <ContactCTA />
      </section>

    </main>
  );
}

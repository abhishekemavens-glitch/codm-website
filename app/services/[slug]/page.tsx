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
        Same structure/alignment as Insights hero
        Breadcrumb is INSIDE the left content column
        ================================================= */}

    <section className="codm-hero-section relative overflow-hidden">

      <div
        className="
          mx-auto
          grid
          max-w-[1240px]
          items-center
          gap-12
          px-6
          pb-20
          pt-[150px]
          min-h-[620px]
          lg:grid-cols-2
        "
      >

        {/* =================================================
            LEFT COLUMN
            Breadcrumb + Heading + Description + Buttons
            ================================================= */}

        <div>

          {/* ================= BREADCRUMB ================= */}

          <nav
            aria-label="Breadcrumb"
            className="
              flex
              items-center
              gap-2
              text-[16px]
            "
          >

            <a
              href="/"
              className="
                codm-hero-breadcrumb-link
                transition-colors
              "
            >
              Home
            </a>

            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              className="codm-hero-chevron"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>

            <a
              href="/services"
              className="
                codm-hero-breadcrumb-link
                transition-colors
              "
            >
              Services
            </a>

            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              className="codm-hero-chevron"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>

            <span
              aria-current="page"
              className="text-[#8b6cf6]"
            >
              {serviceTitle}
            </span>

          </nav>


          {/* ================= EYEBROW ================= */}

          {heroEyebrow && (
            <div
              className="
                mt-6
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

              <span className="h-px w-8 bg-[#7257ee]" />

              <span>
                {heroEyebrow}
              </span>

              <span className="h-px w-8 bg-[#7257ee]" />

            </div>
          )}


          {/* ================= HEADLINE ================= */}

          <h1
            className={`
              ${
                heroEyebrow
                  ? "mt-5"
                  : "mt-6"
              }
              max-w-[640px]
              text-[clamp(40px,5.2vw,68px)]
              font-normal
              leading-[1.05]
              tracking-[-0.035em]
              text-[var(--foreground)]
              [text-wrap:balance]
            `}
          >
            {heroHeadline}
          </h1>


          {/* ================= DESCRIPTION ================= */}

          {heroDescription && (
            <p
              className="
                codm-hero-body
                mt-6
                max-w-[560px]
                text-[clamp(16px,1.4vw,19px)]
                leading-[1.65]
              "
            >
              {heroDescription}
            </p>
          )}


          {/* ================= BUTTONS ================= */}

          {(primaryLabel || secondaryLabel) && (
            <div
              className="
                mt-9
                flex
                flex-wrap
                items-center
                gap-4
              "
            >

              {/* Primary */}

              {primaryLabel && (
                <a
                  href={primaryUrl || "#"}
                  className="
                    inline-flex
                    h-[54px]
                    items-center
                    justify-center
                    rounded-full
                    bg-[linear-gradient(90deg,#8b5cf6_0%,#6d4ff0_100%)]
                    px-8
                    text-[17px]
                    font-medium
                    text-white
                    shadow-[0_10px_30px_-10px_rgba(109,79,240,0.7)]
                    transition-transform
                    hover:-translate-y-0.5
                    focus-visible:outline
                    focus-visible:outline-2
                    focus-visible:outline-offset-2
                    focus-visible:outline-[#6d4ff0]
                  "
                >
                  {primaryLabel}
                </a>
              )}


              {/* Secondary */}

              {secondaryLabel && (
                <a
                  href={secondaryUrl || "#"}
                  className="
                    codm-hero-secondary-btn
                    inline-flex
                    h-[54px]
                    items-center
                    justify-center
                    rounded-full
                    px-7
                    text-[17px]
                    font-medium
                    backdrop-blur
                    transition-colors
                    focus-visible:outline
                    focus-visible:outline-2
                    focus-visible:outline-offset-2
                    focus-visible:outline-[#6d4ff0]
                  "
                >
                  {secondaryLabel}
                </a>
              )}

            </div>
          )}

        </div>


        {/* =================================================
            RIGHT COLUMN
            Featured Image
            ================================================= */}

        <div className="flex justify-center lg:justify-end">

          {heroImage ? (
            <img
              src={heroImage}
              alt={heroImageAlt}
              className="
                w-full
                max-w-[520px]
                select-none
              "
              draggable={false}
            />
          ) : (
            <div
              className="
                flex
                min-h-[350px]
                w-full
                max-w-[520px]
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

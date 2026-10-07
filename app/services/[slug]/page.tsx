import { notFound } from "next/navigation";

import SectionHeading from "@/components/SectionHeading";
import KeyCapabilities from "@/components/KeyCapabilities";
import UseCasesSection from "@/components/UseCasesSection";
import ServiceProcess from "@/components/ServiceProcess";
import ProductExperience from "@/components/ProductExperience";

const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

/* =========================================================
   SERVICE PAGE DATA
========================================================= */

type ServicePageData = {
  databaseId: number;
  title: string;
  slug: string;

  capabilitiesEnabled: boolean;
  capabilitiesEyebrow: string | null;
  capabilitiesHeading: string | null;
  capabilitiesHighlight: string | null;
  capabilitiesDescription: string | null;

  usecasesEnabled: boolean;
  usecasesEyebrow: string | null;
  usecasesHeading: string | null;
  usecasesHighlight: string | null;
  usecasesDescription: string | null;

  processEnabled: boolean;
  processEyebrow: string | null;
  processHeading: string | null;
  processHighlight: string | null;
  processDescription: string | null;

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
            servicePages(
              first: 50
            ) {
              nodes {
                databaseId
                title
                slug

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
     SERVICE PAGE NOT FOUND
  ======================================================= */

  if (!servicePage) {
    notFound();
  }

  /* =======================================================
     SAFE VALUES
  ======================================================= */

  const serviceTitle =
    servicePage.title || "Service";

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <main className="service-page">

      {/* =================================================
          BREADCRUMB
      ================================================= */}

      <div className="mx-auto max-w-[1250px] px-6 pt-8">
        <nav
          aria-label="Breadcrumb"
          className="text-sm text-[var(--muted)]"
        >
          <ol className="flex items-center gap-2">
            <li>
              <a
                href="/"
                className="transition-colors hover:text-[var(--foreground)]"
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
                className="transition-colors hover:text-[var(--foreground)]"
              >
                Services
              </a>
            </li>

            <li aria-hidden="true">
              /
            </li>

            <li
              className="text-[var(--foreground)]"
              aria-current="page"
            >
              {serviceTitle}
            </li>
          </ol>
        </nav>
      </div>

      {/* =================================================
          SERVICE HERO / TITLE
      ================================================= */}

      <section className="service-page-hero">
        <div className="mx-auto max-w-[1250px] px-6 py-20 md:py-28">

          <SectionHeading
            eyebrow="SERVICES"
            title={serviceTitle}
            gradientText=""
            description=""
          />

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

    </main>
  );
}
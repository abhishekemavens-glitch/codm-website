/*
 * Save as: components/ServiceProcess.tsx
 *
 * "The CODM Difference" process section.
 *
 * Content is loaded from the individual Service entry
 * in WordPress.
 */

"use client";

import { useEffect, useState } from "react";
import SectionHeading from "@/components/SectionHeading";

const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

type ServiceProcessData = {
  slug: string;

  processEyebrow: string | null;
  processHeading: string | null;
  processHighlight: string | null;
  processDescription: string | null;

  processCtaText: string | null;
  processCtaUrl: string | null;

  processStep1Title: string | null;
  processStep1Description: string | null;

  processStep2Title: string | null;
  processStep2Description: string | null;

  processStep3Title: string | null;
  processStep3Description: string | null;

  processStep4Title: string | null;
  processStep4Description: string | null;
};

type ServiceProcessProps = {
  serviceSlug?: string;
};

export default function ServiceProcess({
  serviceSlug,
}: ServiceProcessProps) {
  const [data, setData] = useState<ServiceProcessData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadServiceProcess() {
      if (!serviceSlug) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const response = await fetch(
          WORDPRESS_GRAPHQL_URL,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: `
                query GetServiceProcess {
                  services(first: 50) {
                    nodes {
                      slug

                      processEyebrow
                      processHeading
                      processHighlight
                      processDescription

                      processCtaText
                      processCtaUrl

                      processStep1Title
                      processStep1Description

                      processStep2Title
                      processStep2Description

                      processStep3Title
                      processStep3Description

                      processStep4Title
                      processStep4Description
                    }
                  }
                }
              `,
            }),
          }
        );

        if (!response.ok) {
          console.error(
            "ServiceProcess HTTP error:",
            response.status
          );

          setData(null);
          return;
        }

        const result = await response.json();

        if (result.errors) {
          console.error(
            "GraphQL Error (ServiceProcess):",
            result.errors
          );

          setData(null);
          return;
        }

        const nodes: ServiceProcessData[] =
          result?.data?.services?.nodes ?? [];

        console.log(
          "SERVICE PROCESS DEBUG:",
          {
            requestedSlug: serviceSlug,
            availableServices: nodes.map(
              (node) => node.slug
            ),
          }
        );

        const requestedSlug =
          serviceSlug.trim().toLowerCase();

        const matchedService =
          nodes.find(
            (node) =>
              node.slug?.trim().toLowerCase() ===
              requestedSlug
          ) ?? null;

        console.log(
          "SERVICE PROCESS MATCH:",
          {
            requestedSlug,
            matchedService:
              matchedService?.slug ?? null,
          }
        );

        setData(matchedService);
      } catch (error) {
        console.error(
          "Failed to load Service Process:",
          error
        );

        setData(null);
      } finally {
        setLoading(false);
      }
    }

    loadServiceProcess();
  }, [serviceSlug]);

  /*
   * Don't render while loading.
   */
  if (loading) {
    return null;
  }

  /*
   * Don't render if the requested Service
   * does not exist.
   */
  if (!data) {
    return null;
  }

  const eyebrow =
    data.processEyebrow ?? "";

  const heading =
    data.processHeading ?? "";

  const highlight =
    data.processHighlight ?? "";

  const description =
    data.processDescription ?? "";

  const ctaText =
    data.processCtaText ?? "";

  const ctaUrl =
    data.processCtaUrl ?? "/contact";

  const steps = [
    {
      title: data.processStep1Title ?? "",
      description:
        data.processStep1Description ?? "",
    },
    {
      title: data.processStep2Title ?? "",
      description:
        data.processStep2Description ?? "",
    },
    {
      title: data.processStep3Title ?? "",
      description:
        data.processStep3Description ?? "",
    },
    {
      title: data.processStep4Title ?? "",
      description:
        data.processStep4Description ?? "",
    },
  ].filter(
    (step) =>
      step.title.trim() !== ""
  );

  /*
   * Don't render an empty section.
   */
  if (
    heading.trim() === "" &&
    steps.length === 0
  ) {
    return null;
  }

  return (
    <section className="codm-process-section-wrap">
      <div className="codm-process-inner">

        {/* =================================================
            SECTION HEADING
        ================================================= */}

        {heading.trim() !== "" && (
          <SectionHeading
            eyebrow={eyebrow}
            title={heading}
            gradientText={highlight}
            description={description}
          />
        )}

        {/* =================================================
            PROCESS STEPS
        ================================================= */}

        {steps.length > 0 && (
          <div className="codm-process-steps">
            {steps.map(
              (step, index) => (
                <div
                  key={`${data.slug}-${index}`}
                  className="codm-process-step"
                >
                  <div className="codm-process-step-number">
                    {String(
                      index + 1
                    ).padStart(2, "0")}
                  </div>

                  <div className="codm-process-step-title">
                    {step.title}
                  </div>

                  {step.description.trim() !== "" && (
                    <div className="codm-process-step-description">
                      {step.description}
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        )}

        {/* =================================================
            CTA
        ================================================= */}

        {ctaText.trim() !== "" && (
          <a
            href={
              ctaUrl.trim() !== ""
                ? ctaUrl
                : "/contact"
            }
            className="contact-cta-button"
          >
            {ctaText}

            <span
              className="codm-header-cta-arrow"
              aria-hidden="true"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
              >
                <path
                  d="M3.5 10.5L10.5 3.5M4.5 3.5h6v6"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </a>
        )}

      </div>
    </section>
  );
}

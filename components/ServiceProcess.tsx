/*
 * Save as:
 * components/ServiceProcess.tsx
 *
 * The CODM Difference
 *
 * Content comes from the WordPress
 * "The CODM Difference" custom post type.
 */

"use client";

import { useEffect, useState } from "react";
import SectionHeading from "@/components/SectionHeading";

const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

type CodmDifferenceData = {
  databaseId: number;
  title: string;

  differenceFields: {
    serviceSlug: string | null;

    eyebrow: string | null;
    heading: string | null;
    highlight: string | null;
    description: string | null;

    step1Title: string | null;
    step1Description: string | null;

    step2Title: string | null;
    step2Description: string | null;

    step3Title: string | null;
    step3Description: string | null;

    step4Title: string | null;
    step4Description: string | null;

    ctaText: string | null;
    ctaUrl: string | null;
  } | null;
};

type ServiceProcessProps = {
  serviceSlug?: string;
};

export default function ServiceProcess({
  serviceSlug,
}: ServiceProcessProps) {
  const [data, setData] =
    useState<CodmDifferenceData | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadCodmDifference() {

      /*
       * We need a service slug to find
       * the correct CODM Difference entry.
       */
      if (!serviceSlug) {
        console.log(
          "CODM DIFFERENCE: No serviceSlug provided"
        );

        setLoading(false);
        setData(null);

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
                query GetCodmDifference {

                  codmDifferences(first: 50) {

                    nodes {

                      databaseId
                      title

                      differenceFields {

                        serviceSlug

                        eyebrow
                        heading
                        highlight
                        description

                        step1Title
                        step1Description

                        step2Title
                        step2Description

                        step3Title
                        step3Description

                        step4Title
                        step4Description

                        ctaText
                        ctaUrl
                      }
                    }
                  }
                }
              `,
            }),
          }
        );

        if (!response.ok) {
          console.error(
            "CODM Difference HTTP error:",
            response.status
          );

          setData(null);
          return;
        }

        const result =
          await response.json();

        /*
         * GraphQL errors
         */
        if (result.errors) {
          console.error(
            "GraphQL Error (CODM Difference):",
            result.errors
          );

          setData(null);
          return;
        }

        /*
         * Get all CODM Difference entries
         */
        const nodes: CodmDifferenceData[] =
          result?.data?.codmDifferences?.nodes ?? [];

        console.log(
          "CODM DIFFERENCE DEBUG:",
          {
            requestedSlug: serviceSlug,

            availableDifferences:
              nodes.map(
                (node) => ({
                  title: node.title,
                  serviceSlug:
                    node.differenceFields
                      ?.serviceSlug ?? null,
                })
              ),
          }
        );

        /*
         * Normalize requested service slug
         */
        const requestedSlug =
          serviceSlug
            .trim()
            .toLowerCase();

        /*
         * Find the CODM Difference
         * using differenceFields.serviceSlug
         */
        const matchedDifference =
          nodes.find(
            (node) => {

              const nodeSlug =
                node.differenceFields
                  ?.serviceSlug
                  ?.trim()
                  .toLowerCase();

              return (
                nodeSlug ===
                requestedSlug
              );
            }
          ) ?? null;

        console.log(
          "CODM DIFFERENCE MATCH:",
          {
            requestedSlug,

            matchedDifference:
              matchedDifference?.title ??
              null,

            matchedServiceSlug:
              matchedDifference
                ?.differenceFields
                ?.serviceSlug ??
              null,
          }
        );

        setData(
          matchedDifference
        );

      } catch (error) {

        console.error(
          "Failed to load CODM Difference:",
          error
        );

        setData(null);

      } finally {

        setLoading(false);

      }
    }

    loadCodmDifference();

  }, [serviceSlug]);


  /*
   * Don't render while loading.
   */
  if (loading) {
    return null;
  }


  /*
   * No matching CODM Difference.
   */
  if (!data) {
    return null;
  }


  /*
   * Get fields from WordPress.
   */
  const fields =
    data.differenceFields;


  if (!fields) {
    return null;
  }


  /*
   * Heading
   */
  const eyebrow =
    fields.eyebrow ?? "";

  const heading =
    fields.heading ?? "";

  const highlight =
    fields.highlight ?? "";

  const description =
    fields.description ?? "";


  /*
   * CTA
   */
  const ctaText =
    fields.ctaText ?? "";

  const ctaUrl =
    fields.ctaUrl ?? "/contact";


  /*
   * Process steps
   */
  const steps = [

    {
      title:
        fields.step1Title ?? "",

      description:
        fields.step1Description ?? "",
    },

    {
      title:
        fields.step2Title ?? "",

      description:
        fields.step2Description ?? "",
    },

    {
      title:
        fields.step3Title ?? "",

      description:
        fields.step3Description ?? "",
    },

    {
      title:
        fields.step4Title ?? "",

      description:
        fields.step4Description ?? "",
    },

  ].filter(
    (step) =>
      step.title.trim() !== ""
  );


  /*
   * Don't render empty section.
   */
  if (
    heading.trim() === "" &&
    steps.length === 0
  ) {
    return null;
  }


  return (
    <section
      className="codm-process-section-wrap"
    >

      <div
        className="codm-process-inner"
      >

        {/* =========================================
            SECTION HEADING
        ========================================= */}

        {heading.trim() !== "" && (

          <SectionHeading

            eyebrow={eyebrow}

            title={heading}

            gradientText={highlight}

            description={description}

          />

        )}


        {/* =========================================
            PROCESS STEPS
        ========================================= */}

        {steps.length > 0 && (

          <div
            className="codm-process-steps"
          >

            {steps.map(
              (step, index) => (

                <div
                  key={`${data.databaseId}-${index}`}
                  className="codm-process-step"
                >

                  <div
                    className="codm-process-step-number"
                  >
                    {String(
                      index + 1
                    ).padStart(2, "0")}
                  </div>


                  <div
                    className="codm-process-step-title"
                  >
                    {step.title}
                  </div>


                  {step.description.trim() !== "" && (

                    <div
                      className="codm-process-step-description"
                    >
                      {step.description}
                    </div>

                  )}

                </div>

              )
            )}

          </div>

        )}


        {/* =========================================
            CTA
        ========================================= */}

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

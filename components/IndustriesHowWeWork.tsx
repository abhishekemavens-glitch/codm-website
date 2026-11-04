
/*
 * Save as:
 * components/IndustriesHowWeWork.tsx
 *
 * Industries How We Work
 *
 * Content comes from the WordPress
 * "Industries How We Work" custom post type.
 */

"use client";

import { useEffect, useState } from "react";

const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

/* =========================================================
   TYPES
========================================================= */

type IndustriesHowWeWorkData = {
  databaseId: number;
  title: string;

  sectionFields: {
    eyebrow: string | null;
    heading: string | null;
    highlight: string | null;

    step1Title: string | null;
    step1Description: string | null;

    step2Title: string | null;
    step2Description: string | null;

    step3Title: string | null;
    step3Description: string | null;

    step4Title: string | null;
    step4Description: string | null;
  } | null;
};

/* =========================================================
   COMPONENT
========================================================= */

export default function IndustriesHowWeWork() {
  const [data, setData] =
    useState<IndustriesHowWeWorkData | null>(null);

  const [loading, setLoading] = useState(true);

  /* =======================================================
     FETCH WORDPRESS CONTENT
  ======================================================= */

  useEffect(() => {
    async function loadIndustriesHowWeWork() {
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
                query GetIndustriesHowWeWork {

                  industriesHowWorks(first: 10) {

                    nodes {

                      databaseId
                      title

                      sectionFields {

                        eyebrow
                        heading
                        highlight

                        step1Title
                        step1Description

                        step2Title
                        step2Description

                        step3Title
                        step3Description

                        step4Title
                        step4Description
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
            "Industries How We Work HTTP error:",
            response.status
          );

          setData(null);
          return;
        }

        const result = await response.json();

        /* GraphQL errors */

        if (result.errors) {
          console.error(
            "GraphQL Error (Industries How We Work):",
            result.errors
          );

          setData(null);
          return;
        }

        /* Get WordPress entries */

        const nodes: IndustriesHowWeWorkData[] =
          result?.data?.industriesHowWorks?.nodes ?? [];

        console.log(
          "INDUSTRIES HOW WE WORK DEBUG:",
          {
            totalEntries: nodes.length,

            availableEntries: nodes.map((node) => ({
              id: node.databaseId,
              title: node.title,
              fields: node.sectionFields,
            })),
          }
        );

        /*
         * Use the first published entry.
         * Keep only one published entry for this section.
         */

        const matchedEntry =
          nodes.find(
            (node) => node.sectionFields !== null
          ) ?? null;

        console.log(
          "INDUSTRIES HOW WE WORK MATCH:",
          matchedEntry?.title ?? null
        );

        setData(matchedEntry);

      } catch (error) {
        console.error(
          "Failed to load Industries How We Work:",
          error
        );

        setData(null);

      } finally {
        setLoading(false);
      }
    }

    loadIndustriesHowWeWork();

  }, []);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return null;
  }

  /* =======================================================
     NO MATCHING ENTRY
  ======================================================= */

  if (!data || !data.sectionFields) {
    return null;
  }

  const fields = data.sectionFields;

  /* =======================================================
     HEADING
  ======================================================= */

  const eyebrow = fields.eyebrow ?? "";

  const heading = fields.heading ?? "";

  const highlight = fields.highlight ?? "";

  /* =======================================================
     PROCESS STEPS
  ======================================================= */

  const steps = [
    {
      title: fields.step1Title ?? "",
      description: fields.step1Description ?? "",
    },
    {
      title: fields.step2Title ?? "",
      description: fields.step2Description ?? "",
    },
    {
      title: fields.step3Title ?? "",
      description: fields.step3Description ?? "",
    },
    {
      title: fields.step4Title ?? "",
      description: fields.step4Description ?? "",
    },
  ].filter(
    (step) => step.title.trim() !== ""
  );

  /* =======================================================
     DON'T RENDER EMPTY SECTION
  ======================================================= */

  if (
    heading.trim() === "" &&
    highlight.trim() === "" &&
    steps.length === 0
  ) {
    return null;
  }

  /* =======================================================
     RENDER SECTION
  ======================================================= */

  return (
    <section
      className="industries-how-work-section"
    >

      <div
        className="industries-how-work-inner"
      >

        {/* ================================================
            EYEBROW
        ================================================ */}

        {eyebrow.trim() !== "" && (
          <div className="industries-how-work-eyebrow">

            <span className="industries-how-work-line" />

            <span>{eyebrow}</span>

            <span className="industries-how-work-line" />

          </div>
        )}

        {/* ================================================
            MAIN HEADING
        ================================================ */}

        {(heading.trim() !== "" ||
          highlight.trim() !== "") && (

          <h2 className="industries-how-work-heading">

            {heading}

            {highlight.trim() !== "" && (
              <span className="industries-how-work-highlight">
                {highlight}
              </span>
            )}

          </h2>

        )}

        {/* ================================================
            PROCESS STEPS
        ================================================ */}

        {steps.length > 0 && (

          <div className="industries-how-work-grid">

            {steps.map((step, index) => (

              <div
                key={`${data.databaseId}-${index}`}
                className="industries-how-work-card"
              >

                {/* STEP NUMBER */}

                <div className="industries-how-work-number">
                  {String(index + 1).padStart(2, "0")}
                </div>

                {/* STEP TITLE */}

                <h3 className="industries-how-work-title">
                  {step.title}
                </h3>

                {/* STEP DESCRIPTION */}

                {step.description.trim() !== "" && (

                  <p className="industries-how-work-description">
                    {step.description}
                  </p>

                )}

              </div>

            ))}

          </div>

        )}

      </div>

      {/* ================================================
          SECTION STYLES
      ================================================ */}

      <style jsx>{`

        .industries-how-work-section {
          width: 100%;
          background: #060714;
          color: #ffffff;
          padding: 64px 24px 52px;
        }

        .industries-how-work-inner {
          width: 100%;
          max-width: 1240px;
          margin: 0 auto;
        }

        /* EYEBROW */

        .industries-how-work-eyebrow {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 18px;
          margin-bottom: 22px;
          color: #ffffff;
          font-size: 16px;
          font-weight: 400;
          line-height: 1.4;
          text-transform: uppercase;
        }

        .industries-how-work-line {
          width: 66px;
          height: 1px;
          position: relative;
          background: linear-gradient(
            90deg,
            transparent,
            #a18aff
          );
        }

        .industries-how-work-line::after {
          content: "";
          position: absolute;
          right: 0;
          top: 50%;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #a18aff;
          transform: translateY(-50%);
        }

        .industries-how-work-line:last-child {
          transform: rotate(180deg);
        }

        /* HEADING */

        .industries-how-work-heading {
          max-width: 950px;
          margin: 0 auto 46px;
          text-align: center;
          color: #ffffff;
          font-size: clamp(34px, 4vw, 58px);
          font-weight: 400;
          line-height: 1.12;
          letter-spacing: -0.035em;
        }

        .industries-how-work-highlight {
          display: block;
          background: linear-gradient(
            90deg,
            #d7d2ff 0%,
            #a18aff 55%,
            #6659ed 100%
          );
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
        }

        /* PROCESS GRID */

        .industries-how-work-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          border: 1px solid #25283a;
          border-radius: 32px;
          overflow: hidden;
        }

        /* PROCESS CARD */

        .industries-how-work-card {
          min-width: 0;
          padding: 36px 40px 30px;
          border-right: 1px solid #25283a;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          background: transparent;
          transition: background 0.3s ease;
        }

        .industries-how-work-card:last-child {
          border-right: none;
        }

        .industries-how-work-card:hover {
          background: rgba(255, 255, 255, 0.025);
        }

        /* NUMBER */

        .industries-how-work-number {
          color: #202541;
          font-size: 42px;
          font-weight: 300;
          line-height: 1;
          letter-spacing: -0.04em;
          margin-bottom: 36px;
        }

        /* TITLE */

        .industries-how-work-title {
          margin: 0 0 10px;
          color: #ffffff;
          font-size: 20px;
          font-weight: 500;
          line-height: 1.3;
        }

        /* DESCRIPTION */

        .industries-how-work-description {
          max-width: 260px;
          margin: 0;
          color: #a5adc1;
          font-size: 14px;
          font-weight: 400;
          line-height: 1.4;
        }

        /* TABLET */

        @media screen and (max-width: 900px) {

          .industries-how-work-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .industries-how-work-card:nth-child(2) {
            border-right: none;
          }

          .industries-how-work-card:nth-child(-n+2) {
            border-bottom: 1px solid #25283a;
          }

        }

        /* MOBILE */

        @media screen and (max-width: 540px) {

          .industries-how-work-section {
            padding: 48px 18px 40px;
          }

          .industries-how-work-eyebrow {
            font-size: 13px;
            gap: 10px;
            margin-bottom: 18px;
          }

          .industries-how-work-line {
            width: 35px;
          }

          .industries-how-work-heading {
            font-size: 34px;
            margin-bottom: 30px;
          }

          .industries-how-work-grid {
            border-radius: 22px;
          }

          .industries-how-work-card {
            padding: 24px 18px;
          }

          .industries-how-work-number {
            font-size: 34px;
            margin-bottom: 25px;
          }

          .industries-how-work-title {
            font-size: 16px;
          }

          .industries-how-work-description {
            font-size: 13px;
          }

        }

      `}</style>

    </section>
  );
}

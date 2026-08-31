"use client";

import { useEffect, useState } from "react";

type ContactCTAData = {
  id: string;
  title: string;
  eyebrow: string;
  heading: string;
  highlight: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
};

const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

export default function ContactCTA() {
  const [cta, setCta] = useState<ContactCTAData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadContactCTA() {
      try {
        const response = await fetch(WORDPRESS_GRAPHQL_URL, {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            query: `
              query GetContactCTA {
                contactCtas(first: 1) {
                  nodes {
                    id
                    title
                    eyebrow
                    heading
                    highlight
                    description
                    buttonText
                    buttonUrl
                  }
                }
              }
            `,
          }),
        });

        if (!response.ok) {
          throw new Error(
            `WordPress request failed: ${response.status}`
          );
        }

        const result = await response.json();

        console.log("CONTACT CTA DATA:", result);

        if (result.errors) {
          console.error(
            "Contact CTA GraphQL Error:",
            result.errors
          );

          throw new Error(
            "Could not load Contact CTA content."
          );
        }

        const ctaData =
          result?.data?.contactCtas?.nodes?.[0] ?? null;

        setCta(ctaData);
      } catch (error) {
        console.error(
          "Failed to load Contact CTA:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadContactCTA();
  }, []);

  /*
   * LOADING
   */
  if (loading) {
    return (
      <section className="contact-cta">
        <div className="contact-cta-content">
          <p>Loading...</p>
        </div>
      </section>
    );
  }

  /*
   * NO CONTENT
   */
  if (!cta) {
    return (
      <section className="contact-cta">
        <div className="contact-cta-content">
          <p>Contact CTA content not found in WordPress.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="contact-cta">
      <div className="contact-cta-glow" />

      <div className="contact-cta-content">

        {/* LABEL */}
        <div className="contact-cta-label">
          <span />

          <p>{cta.eyebrow}</p>

          <span />
        </div>

        {/* HEADING */}
        <h2>
          {cta.heading}
          <br />

          <strong>
            {cta.highlight}
          </strong>
        </h2>

        {/* DESCRIPTION */}
        <p className="contact-cta-description">
          {cta.description}
        </p>

        {/* BUTTON */}
        <a
          href={cta.buttonUrl || "/contact"}
          className="contact-cta-button"
        >
          {cta.buttonText}
        </a>

      </div>
    </section>
  );
}

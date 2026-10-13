
"use client";

import { useEffect, useState } from "react";
import SectionHeading from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";
import MagicRings from "@/components/MagicRings";

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

        if (result.errors) {
          console.error("Contact CTA GraphQL Error:", result.errors);
          throw new Error("Could not load Contact CTA content.");
        }

        setCta(result?.data?.contactCtas?.nodes?.[0] ?? null);
      } catch (error) {
        console.error("Failed to load Contact CTA:", error);
      } finally {
        setLoading(false);
      }
    }

    loadContactCTA();
  }, []);

  if (loading) {
    return (
      <section className="contact-cta">
        <div className="contact-cta-content">
          <p>Loading...</p>
        </div>
      </section>
    );
  }

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
      {/* Animated background */}
      <div className="contact-cta-rings" aria-hidden="true">
        <MagicRings
          color="#8B5CF6"
          colorTwo="#6366F1"
          speed={0.65}
          followMouse={true}
          clickBurst={true}
          theme="light"
          className="contact-cta-magic-rings"
        />
      </div>

      <div className="contact-cta-glow" />

      <div className="contact-cta-content">
        <Reveal distance={20}>
          <SectionHeading
            eyebrow={cta.eyebrow}
            title={cta.heading}
            gradientText={cta.highlight}
            description={cta.description}
          />
        </Reveal>

        <Reveal delay={0.2} className="flex justify-center">
          <a
            href={cta.buttonUrl || "/contact"}
            className="contact-cta-button"
          >
            {cta.buttonText}

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
        </Reveal>
      </div>
    </section>
  );
}

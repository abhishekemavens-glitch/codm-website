"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic"; 
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

/*
 * Reads the site's current light/dark mode and follows the toggle.
 * Works with either data-theme="dark" or a "dark" class on <html>/<body>.
 */
function useSiteTheme(): "light" | "dark" {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    const read = () => {
      const isDark =
        root.getAttribute("data-theme") === "dark" ||
        root.classList.contains("dark") ||
        body.getAttribute("data-theme") === "dark" ||
        body.classList.contains("dark");

      setTheme(isDark ? "dark" : "light");
    };

    read();

    const observer = new MutationObserver(read);
    const options = { attributes: true, attributeFilter: ["data-theme", "class"] };

    observer.observe(root, options);
    observer.observe(body, options);

    return () => observer.disconnect();
  }, []);

  return theme;
}

export default function ContactCTA() {
  const [cta, setCta] = useState<ContactCTAData | null>(null);
  const [loading, setLoading] = useState(true);
  const theme = useSiteTheme();

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
    <section className="contact-cta relative isolate">

      {/* =================================================
          MAGIC RINGS BACKGROUND
          Sits behind everything, never blocks clicks.
          Tune the look with the props below.
          ================================================= */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
      >
        <MagicRings
          theme={theme}
          color="#8b5cf6"
          colorTwo="#4f46e5"
          ringCount={5}
          speed={0.8}
          baseRadius={0.28}
          radiusStep={0.1}
          lineThickness={2}
          glow={theme === "dark" ? 1 : 0.8}
          opacity={theme === "dark" ? 0.9 : 0.6}
          followMouse
          clickBurst
          maxDevicePixelRatio={1.5}
        />
      </div>

      <div className="contact-cta-glow" />

      <div className="contact-cta-content relative z-10">
        <Reveal distance={20}>

          {/* =================================================
              SECTION HEADING
              Uses the shared SectionHeading component so this
              matches Industries, Why CODM, What We Do, and
              Testimonials. Content is dynamic from WordPress.
              ================================================= */}

          <SectionHeading
            eyebrow={cta.eyebrow}
            title={cta.heading}
            gradientText={cta.highlight}
            description={cta.description}
          />
        </Reveal>

        <Reveal delay={0.2} className="flex justify-center">

          {/* BUTTON */}
          <a
            href={cta.buttonUrl || "/contact"}
            className="contact-cta-button"
          >
            {cta.buttonText}

            <span className="codm-header-cta-arrow" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3.5 10.5L10.5 3.5M4.5 3.5h6v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </a>

        </Reveal>

      </div>
    </section>
  );
}

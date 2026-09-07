"use client";

import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";

type HeaderData = {
  mainLogoLight: string;
  mainLogoDark: string;
  services: string;
  industries: string;
  caseStudies: string;
  about: string;
  insights: string;
  buttonText: string;
  buttonUrl: string;
};

const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

function parseLink(value: string) {
  if (!value) {
    return {
      label: "",
      url: "#",
    };
  }

  /*
   * Supports:
   *
   * Services/services
   * Services|/services
   *
   * WordPress currently uses "/"
   */

  let separatorIndex = value.indexOf("|");

  if (separatorIndex === -1) {
    separatorIndex = value.indexOf("/");
  }

  if (separatorIndex === -1) {
    return {
      label: value.trim(),
      url: "#",
    };
  }

  const label = value
    .substring(0, separatorIndex)
    .trim();

  const url = value
    .substring(separatorIndex)
    .trim();

  return {
    label,
    url: url || "#",
  };
}

export default function Header() {
  const [header, setHeader] = useState<HeaderData | null>(null);

  useEffect(() => {
    async function loadHeader() {
      try {
        const response = await fetch(
          WORDPRESS_GRAPHQL_URL,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: `
                query Header {
                  codmHeaders {
                    nodes {
                      id
                      title
                      mainLogoLight
                      mainLogoDark
                      services
                      industries
                      caseStudies
                      about
                      insights
                      buttonText
                      buttonUrl
                    }
                  }
                }
              `,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(
            `WordPress request failed: ${response.status}`
          );
        }

        const result = await response.json();

        console.log("HEADER DATA:", result);

        if (result.errors) {
          console.error(
            "Header GraphQL Error:",
            result.errors
          );
          return;
        }

        const data =
          result?.data?.codmHeaders?.nodes?.[0];

        if (data) {
          setHeader(data);
        }
      } catch (error) {
        console.error(
          "Failed to load Header:",
          error
        );
      }
    }

    loadHeader();
  }, []);

  if (!header) {
    return null;
  }

  const services = parseLink(header.services);
  const industries = parseLink(header.industries);
  const caseStudies = parseLink(header.caseStudies);
  const about = parseLink(header.about);
  const insights = parseLink(header.insights);

  return (
    <header className="codm-header">

      <div className="codm-header-inner">

        {/* =================================================
            LOGO
        ================================================= */}

        <a
          href="/"
          className="codm-header-logo-link"
          aria-label="CODM"
        >
          {header.mainLogoLight && (
            <img
              src={header.mainLogoLight}
              alt="CODM"
              className="codm-header-logo codm-logo-light"
            />
          )}

          {header.mainLogoDark && (
            <img
              src={header.mainLogoDark}
              alt="CODM"
              className="codm-header-logo codm-logo-dark"
            />
          )}
        </a>


        {/* =================================================
            DESKTOP NAVIGATION
        ================================================= */}

        <nav
          className="codm-header-nav"
          aria-label="Main navigation"
        >

          {services.label && (
            <a
              href={services.url}
              className="codm-header-nav-link"
            >
              {services.label}
            </a>
          )}

          {industries.label && (
            <a
              href={industries.url}
              className="codm-header-nav-link"
            >
              {industries.label}
            </a>
          )}

          {caseStudies.label && (
            <a
              href={caseStudies.url}
              className="codm-header-nav-link"
            >
              {caseStudies.label}
            </a>
          )}

          {about.label && (
            <a
              href={about.url}
              className="codm-header-nav-link"
            >
              {about.label}
            </a>
          )}

          {insights.label && (
            <a
              href={insights.url}
              className="codm-header-nav-link"
            >
              {insights.label}
            </a>
          )}

        </nav>


        {/* =================================================
            RIGHT SIDE
        ================================================= */}

        <div className="codm-header-right">

          <div className="codm-theme-toggle">
            <ThemeToggle />
          </div>

          {header.buttonText && (
            <a
              href={header.buttonUrl || "#"}
              className="codm-header-cta"
            >
              <span>
                {header.buttonText}
              </span>

              <span className="codm-header-cta-arrow">
                →
              </span>
            </a>
          )}

        </div>

      </div>

    </header>
  );
}

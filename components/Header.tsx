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

  announcementText: string;
  announcementButtonText: string;
  announcementButtonUrl: string;
};

const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

function parseLink(value: string = "") {
  if (!value) {
    return {
      label: "",
      url: "#",
    };
  }

  const separatorIndex = value.indexOf("|");

  if (separatorIndex !== -1) {
    return {
      label: value.substring(0, separatorIndex).trim(),
      url: value.substring(separatorIndex + 1).trim() || "#",
    };
  }

  /*
   * Supports values such as:
   *
   * Services/services
   * Industries/industries
   *
   * Only treat "/" as separator when it is not
   * the beginning of an actual URL.
   */

  if (!value.startsWith("/")) {
    const slashIndex = value.indexOf("/");

    if (slashIndex !== -1) {
      return {
        label: value.substring(0, slashIndex).trim(),
        url: value.substring(slashIndex).trim() || "#",
      };
    }
  }

  return {
    label: value.trim(),
    url: "#",
  };
}

export default function Header() {
  const [header, setHeader] =
    useState<HeaderData | null>(null);

  useEffect(() => {
    let mounted = true;

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

                      announcementText
                      announcementButtonText
                      announcementButtonUrl
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

        console.log(
          "CODM HEADER GRAPHQL:",
          result
        );

        if (result.errors) {
          console.error(
            "CODM HEADER GRAPHQL ERROR:",
            result.errors
          );

          return;
        }

        const data =
          result?.data?.codmHeaders?.nodes?.[0];

        if (!data) {
          console.error(
            "CODM HEADER: No header data found."
          );

          return;
        }

        if (mounted) {
          setHeader(data);
        }

      } catch (error) {
        console.error(
          "CODM HEADER LOAD FAILED:",
          error
        );
      }
    }

    loadHeader();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * Don't render the header until WordPress data
   * has been successfully loaded.
   */

  if (!header) {
    return null;
  }

  const services =
    parseLink(header.services);

  const industries =
    parseLink(header.industries);

  const caseStudies =
    parseLink(header.caseStudies);

  const about =
    parseLink(header.about);

  const insights =
    parseLink(header.insights);

  return (
    <>
      {/* =================================================
          ANNOUNCEMENT BAR
      ================================================= */}

      {header.announcementText && (
        <div className="codm-announcement-bar">

          <div className="codm-announcement-inner">

            <span className="codm-announcement-text">
              {header.announcementText}
            </span>

            {header.announcementButtonText && (
              <a
                href={
                  header.announcementButtonUrl ||
                  "#"
                }
                className="codm-announcement-link"
              >
                <span>
                  {header.announcementButtonText}
                </span>

                <span className="codm-announcement-arrow">
                  →
                </span>
              </a>
            )}

          </div>

        </div>
      )}


      {/* =================================================
          HEADER
      ================================================= */}

      <header className="codm-header">

        <div className="codm-header-inner">

          {/* =================================================
              LOGO
          ================================================= */}

          <a
            href="/"
            className="codm-header-logo-link"
            aria-label="CODM Home"
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
              NAVIGATION
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
                href={
                  header.buttonUrl || "#"
                }
                className="codm-header-cta"
              >

                <span>
                  {header.buttonText}
                </span>

                <span
                  className="codm-header-cta-arrow"
                  aria-hidden="true"
                >
                  →
                </span>

              </a>
            )}

          </div>

        </div>

      </header>
    </>
  );
}

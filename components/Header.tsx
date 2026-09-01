"use client";

import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "./ThemeToggle";

type HeaderData = {
  mainLogo: string;
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

  const separatorIndex = value.indexOf("|");

  if (separatorIndex === -1) {
    return {
      label: value.trim(),
      url: "#",
    };
  }

  return {
    label: value.substring(0, separatorIndex).trim(),
    url: value.substring(separatorIndex + 1).trim(),
  };
}

export default function Header() {
  const { theme } = useTheme();

  const [header, setHeader] = useState<HeaderData | null>(null);

  useEffect(() => {
    async function loadHeader() {
      try {
        const response = await fetch(WORDPRESS_GRAPHQL_URL, {
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
                    mainLogo
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
        });

        if (!response.ok) {
          throw new Error(
            `WordPress request failed: ${response.status}`
          );
        }

        const result = await response.json();

        console.log("HEADER DATA:", result);

        if (result.errors) {
          console.error("Header GraphQL Error:", result.errors);
          return;
        }

        const data =
          result?.data?.codmHeaders?.nodes?.[0];

        if (data) {
          setHeader(data);
        }
      } catch (error) {
        console.error("Failed to load Header:", error);
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

  /*
   * Select logo based on current theme.
   * Fallback to mainLogo if a theme-specific logo is missing.
   */
  const logo =
    theme === "dark"
      ? header.mainLogoDark || header.mainLogo
      : header.mainLogoLight || header.mainLogo;

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-xl">

      <div className="mx-auto flex h-[78px] max-w-[1400px] items-center justify-between px-6 lg:px-10">

        {/* LOGO */}

        <a
          href="/"
          className="flex items-center"
          aria-label="CODM"
        >
          {logo && (
            <img
              src={logo}
              alt="CODM"
              className="codm-header-logo"
            />
          )}
        </a>

        {/* NAVIGATION */}

        <nav className="hidden items-center gap-8 text-sm font-medium lg:flex">

          {services.label && (
            <a
              href={services.url}
              className="transition-opacity hover:opacity-50"
            >
              {services.label}
            </a>
          )}

          {industries.label && (
            <a
              href={industries.url}
              className="transition-opacity hover:opacity-50"
            >
              {industries.label}
            </a>
          )}

          {caseStudies.label && (
            <a
              href={caseStudies.url}
              className="transition-opacity hover:opacity-50"
            >
              {caseStudies.label}
            </a>
          )}

          {about.label && (
            <a
              href={about.url}
              className="transition-opacity hover:opacity-50"
            >
              {about.label}
            </a>
          )}

          {insights.label && (
            <a
              href={insights.url}
              className="transition-opacity hover:opacity-50"
            >
              {insights.label}
            </a>
          )}

        </nav>

        {/* RIGHT */}

        <div className="flex items-center gap-3">

          <ThemeToggle />

          {header.buttonText && (
            <a
              href={header.buttonUrl || "#"}
              className="hidden h-[44px] items-center whitespace-nowrap rounded-full bg-[var(--foreground)] px-6 text-sm font-semibold text-[var(--background)] transition-transform hover:scale-105 sm:flex"
            >
              {header.buttonText}
            </a>
          )}

        </div>

      </div>

    </header>
  );
}

"use client";

import { useEffect, useState, type ReactNode } from "react";

type FooterData = {
  mainLogo: string;
  description: string;
  linkedin: string;
  twitter: string;
  youtube: string;
  services: string;
  aiLlm: string;
  industries: string;
  company: string;
  leftLogo1: string;
  leftLogo2: string;
  leftLogo3: string;
  leftLogo4: string;
  certificationLogo1: string;
  certificationLogo2: string;
  certificationLogo3: string;
  certificationLogo4: string;
  copyright: string;
};

type FooterLink = { label: string; url: string };

const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

/*
 * Fallback routes for WordPress footer labels.
 * Explicit URLs supplied in WordPress are used only when no mapped route exists.
 * Adjust any route here if your published Next.js slug differs.
 */
const FOOTER_URLS: Record<string, string> = {
  // Services
  "Education Cloud": "/services/education-cloud",
  "Financial Services": "/services/sales-force-financial-services-cloud",
  "API Integration": "/services/api-integration",
  "Data Integration": "/services/data-integration-migration",
  "Data Migration": "/services/data-integration-migration",
  "React Application": "/services/react-application",
  "Technical Support": "/services/technical-support",
  "AI & LLM Overview": "/services/ai-llm-overview",
  "LLM & Custom AI Development": "/services/building-llm",
  "Business Process Automation": "/services/business-process-automation",
  "Custom Development": "/services/custom-development",
  ".NET Application": "/services/net-application",
  ".NET Application Development": "/services/net-application",
  "Python Application": "/services/python-application",
  "Python Application Development": "/services/python-application",
  "React Application Development": "/services/react-application",

  // Industries 
  "Healthcare & Insurance": "/industries/healthcare-insurance",
  Manufacturing: "/industries/manufacturing",
  "Higher Education": "/industries/higher-education",
  Education: "/industries/higher-education",
  "Energy & Utilities": "/industries/energy-utilities",
  "Energy and Utilities": "/industries/energy-utilities",
  Government: "/industries/government",
  "Public Sector": "/industries/government",
  "Healthcare & Insurance Cloud": "/industries/healthcare-insurance",
  "Manufacturing Cloud": "/industries/manufacturing",
  Nonprofit: "/industries/non-profit",
  "Nonprofit Cloud": "/industries/non-profit",

  // Company
  About: "/about",
  "Products": "/products",
  "Case Studies": "/case-studies",
  Career: "/careers",
  Careers: "/careers",
  Contact: "/contact-us",
  Blogs: "/insights",
  Blog: "/insights",
};

function normalizeUrl(url: string) {
  const trimmed = url.trim();

  if (!trimmed || trimmed === "#") return "#";

  if (
    /^(https?:\/\/|mailto:|tel:|#)/i.test(trimmed) ||
    trimmed.startsWith("//")
  ) {
    return trimmed;
  }

  return `/${trimmed.replace(/^\/+/, "")}`;
}

/*
 * WordPress sometimes stores "Development" on its own line right after
 * ".NET Application" / "Python Application" / "React Application".
 * Join those lines so each one reads as a single item, e.g.
 * ".NET Application Development", keeping the link of the line it joins.
 */
function mergeContinuationLines(lines: string[]): string[] {
  const merged: string[] = [];

  for (const line of lines) {
    const isStrayDevelopment = /^development$/i.test(line);

    if (isStrayDevelopment && merged.length > 0) {
      const previous = merged[merged.length - 1];
      const pipeIndex = previous.indexOf("|");
      const previousLabel = (
        pipeIndex === -1 ? previous : previous.substring(0, pipeIndex)
      ).trim();

      // Already ends with "Development" (e.g. "Custom Development"):
      // the extra line is a duplicate, so drop it.
      if (/development$/i.test(previousLabel)) {
        continue;
      }

      merged[merged.length - 1] =
        pipeIndex === -1
          ? `${previousLabel} Development`
          : `${previousLabel} Development|${previous.substring(pipeIndex + 1)}`;

      continue;
    }

    merged.push(line);
  }

  return merged;
}

function parseLinks(value: string = ""): FooterLink[] {
  if (!value) return [];

  const lines = mergeContinuationLines(
    value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
  );

  return lines.map((line) => {
    const separatorIndex = line.indexOf("|");
    const label =
      separatorIndex === -1
        ? line.trim()
        : line.substring(0, separatorIndex).trim();
    const suppliedUrl =
      separatorIndex === -1
        ? ""
        : line.substring(separatorIndex + 1).trim();

    // Replace the retired footer item with Products.
    const displayLabel = /^white\s*label\s*programme$/i.test(label)
      ? "Products"
      : label;

    const mappedUrl =
      FOOTER_URLS[displayLabel] ||
      FOOTER_URLS[displayLabel.replace(/\s+/g, " ").trim()];

    return {
      label: displayLabel,
      url: normalizeUrl(mappedUrl || suppliedUrl || "#"),
    };
  });
}

function FooterAccordion({
  id,
  title,
  isOpen,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className={`codm-footer-column codm-footer-accordion${
        isOpen ? " is-open" : ""
      }`}
    >
      <h3 className="codm-footer-column-title">
        <button
          type="button"
          className="codm-footer-accordion-trigger"
          aria-expanded={isOpen}
          aria-controls={`footer-panel-${id}`}
          onClick={onToggle}
        >
          <span>{title}</span>
          <span className="codm-footer-accordion-chevron" aria-hidden="true" />
        </button>
      </h3>
      <div id={`footer-panel-${id}`} className="codm-footer-accordion-panel">
        {children}
      </div>
    </div>
  );
}

export default function Footer() {
  const [footer, setFooter] = useState<FooterData | null>(null);
  const [openSections, setOpenSections] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadFooter() {
      try {
        const response = await fetch(WORDPRESS_GRAPHQL_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              query Footer {
                codmFooters {
                  nodes {
                    id
                    title
                    mainLogo
                    description
                    linkedin
                    twitter
                    youtube
                    services
                    aiLlm
                    industries
                    company
                    leftLogo1
                    leftLogo2
                    leftLogo3
                    leftLogo4
                    certificationLogo1
                    certificationLogo2
                    certificationLogo3
                    certificationLogo4
                    copyright
                  }
                }
              }
            `,
          }),
        });

        if (!response.ok) {
          throw new Error(`Footer request failed: ${response.status}`);
        }

        const result = await response.json();

        if (result.errors) {
          console.error("Footer GraphQL Error:", result.errors);
          return;
        }

        const data = result?.data?.codmFooters?.nodes?.[0];
        if (data && !cancelled) setFooter(data);
      } catch (error) {
        console.error("Failed to load Footer:", error);
      }
    }

    loadFooter();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!footer) return null;

  const toggleSection = (id: string) =>
    setOpenSections((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );

  const services = parseLinks(footer.services);
  const aiLlm = parseLinks(footer.aiLlm);
  const industriesFromWordPress = parseLinks(footer.industries);
  const industries =
    industriesFromWordPress.length > 0
      ? industriesFromWordPress
      : [
          { label: "Healthcare & Insurance", url: "/industries/healthcare-insurance" },
          { label: "Manufacturing", url: "/industries/manufacturing" },
          { label: "Higher Education", url: "/industries/higher-education" },
          { label: "Nonprofit", url: "/industries/non-profit" },
          { label: "Energy & Utilities", url: "/industries/energy-utilities" },
          { label: "Government & Public Sector", url: "/industries/government" },
        ];
  const company = parseLinks(footer.company);

  const leftLogos = [
    footer.leftLogo1,
    footer.leftLogo2,
    footer.leftLogo3,
    footer.leftLogo4,
  ].filter(Boolean);

  const certificationLogos = [
    footer.certificationLogo1,
    footer.certificationLogo2,
    footer.certificationLogo3,
    footer.certificationLogo4,
  ].filter(Boolean);

  // Hardcoded destinations: WordPress values cannot override these links.
  const linkedinUrl = "https://www.linkedin.com/company/codm-software-limited/";
  const twitterUrl = "https://x.com/";
  const youtubeUrl =
    "https://www.youtube.com/channel/UC7fU84Na9QuC7dPDVMpuGVQ";

  return (
    <footer className="codm-footer">
      <div className="codm-footer-main">
        {/* BRAND */}
        <div className="codm-footer-brand">
          <div className="codm-footer-logo">
            {footer.mainLogo && (
              <a href="/" aria-label="CODM Home">
                <img
                  src={footer.mainLogo}
                  alt="CODM"
                  className="codm-footer-logo"
                />
              </a>
            )}
          </div>

          <div className="codm-footer-social">
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
              </svg>
            </a>

            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>

          <p className="codm-footer-description">{footer.description}</p>

          {leftLogos.length > 0 && (
            <div className="codm-footer-left-logos">
              {leftLogos.map((logo, index) => (
                <img
                  key={index}
                  src={logo}
                  alt=""
                  className="codm-footer-left-logo"
                />
              ))}
            </div>
          )}
        </div>

        {/* SERVICES */}
        <FooterAccordion
          id="services"
          title="Services"
          isOpen={openSections.includes("services")}
          onToggle={() => toggleSection("services")}
        >
          <ul className="codm-footer-links">
            {services.map((item, index) => (
              <li key={`${item.label}-${index}`}>
                <a href={item.url}>{item.label}</a>
              </li>
            ))}
          </ul>
        </FooterAccordion>

        {/* AI & LLM */}
        <FooterAccordion
          id="ai-llm"
          title="AI & LLM Overview"
          isOpen={openSections.includes("ai-llm")}
          onToggle={() => toggleSection("ai-llm")}
        >
          <ul className="codm-footer-links">
            {aiLlm
              .filter((item) => item.label.trim().toLowerCase() !== "development")
              .map((item, index) => (
                <li key={`${item.label}-${index}`}>
                  {item.label === "Custom Development" ? (
                    <span className="codm-footer-subheading">
                      {item.label}
                    </span>
                  ) : (
                    <a href={item.url}>{item.label}</a>
                  )}
                </li>
              ))}
          </ul>
        </FooterAccordion>

       {/* INDUSTRIES */}
        <FooterAccordion
          id="industries"
          title="Industries"
          isOpen={openSections.includes("industries")}
          onToggle={() => toggleSection("industries")}
        >
          <ul className="codm-footer-links">
            {industries.map((item, index) => (
              <li key={`${item.label}-${index}`}>
                <a href={item.url}>{item.label}</a>
              </li>
            ))}
          </ul>
        </FooterAccordion>

        {/* COMPANY */}
        <FooterAccordion
          id="company"
          title="Company"
          isOpen={openSections.includes("company")}
          onToggle={() => toggleSection("company")}
        >
          <ul className="codm-footer-links">
            {company.map((item, index) => (
              <li key={`${item.label}-${index}`}>
                <a href={item.url}>{item.label}</a>
              </li>
            ))}
          </ul>
        </FooterAccordion>
      </div>

      {/* CERTIFICATIONS */}
      {certificationLogos.length > 0 && (
        <div className="codm-footer-certifications">
          <div className="codm-footer-certification-list">
            {certificationLogos.map((logo, index) => (
              <img
                key={index}
                src={logo}
                alt=""
                className="codm-footer-certification-logo"
              />
            ))}
          </div>
        </div>
      )}

      {/* COPYRIGHT */}
      <div className="codm-footer-bottom">
        <p>{footer.copyright}</p>
      </div>
    </footer>
  );
}

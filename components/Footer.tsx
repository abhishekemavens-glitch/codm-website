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

const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

function parseLinks(value: string) {
  if (!value) return [];

  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separatorIndex = line.indexOf("|");

      if (separatorIndex === -1) {
        return {
          label: line,
          url: "#",
        };
      }

      return {
        label: line.substring(0, separatorIndex).trim(),
        url: line.substring(separatorIndex + 1).trim(),
      };
    });
}

/*
 * One footer link column.
 *  - Desktop: looks like a normal heading, always expanded (CSS).
 *  - Mobile (<= 700px): heading becomes a toggle, list is collapsed
 *    until tapped (CSS + isOpen).
 */
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

          <span
            className="codm-footer-accordion-chevron"
            aria-hidden="true"
          />
        </button>
      </h3>

      <div
        id={`footer-panel-${id}`}
        className="codm-footer-accordion-panel"
      >
        {children}
      </div>
    </div>
  );
}

export default function Footer() {
  const [footer, setFooter] = useState<FooterData | null>(null);

  /* Which mobile sections are open. Empty = all closed. */
  const [openSections, setOpenSections] = useState<string[]>([]);

  useEffect(() => {
    async function loadFooter() {
      try {
        const response = await fetch(WORDPRESS_GRAPHQL_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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

        const result = await response.json();

        console.log("FOOTER DATA:", result);

        if (result.errors) {
          console.error("Footer GraphQL Error:", result.errors);
          return;
        }

        const data = result?.data?.codmFooters?.nodes?.[0];

        if (data) {
          setFooter(data);
        }
      } catch (error) {
        console.error("Failed to load Footer:", error);
      }
    }

    loadFooter();
  }, []);

  if (!footer) {
    return null;
  }

  const toggleSection = (id: string) =>
    setOpenSections((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );

  const services = parseLinks(footer.services);
  const aiLlm = parseLinks(footer.aiLlm);
  const industries = parseLinks(footer.industries);
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

  return (
    <footer className="codm-footer">

      <div className="codm-footer-main">

        {/* BRAND */}
        <div className="codm-footer-brand">

          <div className="codm-footer-logo">
           {footer.mainLogo && (
  <img
    src={footer.mainLogo}
    alt="CODM"
    className="codm-footer-logo"
  />
)}
          </div>

          <div className="codm-footer-social">

            {footer.linkedin && (
              <a
                href={footer.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
                </svg>
              </a>
            )}

            {footer.twitter && (
              <a
                href={footer.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            )}

            {footer.youtube && (
              <a
                href={footer.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            )}

          </div>

          <p className="codm-footer-description">
            {footer.description}
          </p>

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
              <li key={index}>
                <a href={item.url}>
                  {item.label}
                </a>
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

            {aiLlm.slice(0, 2).map((item, index) => (
              <li key={index}>
                <a href={item.url}>
                  {item.label}
                </a>
              </li>
            ))}

          </ul>


          {aiLlm.length > 2 && (
            <>
              <div className="codm-footer-subheading">
                <span>
                  {aiLlm[2].label}
                </span>

                <span>⌄</span>
              </div>

              <ul className="codm-footer-links">

                {aiLlm.slice(3).map((item, index) => (
                  <li key={index}>
                    <a href={item.url}>
                      {item.label}
                    </a>
                  </li>
                ))}

              </ul>
            </>
          )}
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
              <li key={index}>
                <a href={item.url}>
                  {item.label}
                </a>
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
              <li key={index}>
                <a href={item.url}>
                  {item.label}
                </a>
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

        <p>
          {footer.copyright}
        </p>

      </div>

    </footer>
  );
}

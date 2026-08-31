"use client";

import { useEffect, useState } from "react";

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

export default function Footer() {
  const [footer, setFooter] = useState<FooterData | null>(null);

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
                in
              </a>
            )}

            {footer.twitter && (
              <a
                href={footer.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X"
              >
                X
              </a>
            )}

            {footer.youtube && (
              <a
                href={footer.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
              >
                ▶
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
        <div className="codm-footer-column">

          <h3 className="codm-footer-column-title">
            Services
          </h3>

          <ul className="codm-footer-links">

            {services.map((item, index) => (
              <li key={index}>
                <a href={item.url}>
                  {item.label}
                </a>
              </li>
            ))}

          </ul>

        </div>


        {/* AI & LLM */}
        <div className="codm-footer-column">

          <h3 className="codm-footer-column-title">
            AI &amp; LLM Overview
          </h3>

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

        </div>


        {/* INDUSTRIES */}
        <div className="codm-footer-column">

          <h3 className="codm-footer-column-title">
            Industries
          </h3>

          <ul className="codm-footer-links">

            {industries.map((item, index) => (
              <li key={index}>
                <a href={item.url}>
                  {item.label}
                </a>
              </li>
            ))}

          </ul>

        </div>


        {/* COMPANY */}
        <div className="codm-footer-column">

          <h3 className="codm-footer-column-title">
            Company
          </h3>

          <ul className="codm-footer-links">

            {company.map((item, index) => (
              <li key={index}>
                <a href={item.url}>
                  {item.label}
                </a>
              </li>
            ))}

          </ul>

        </div>

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

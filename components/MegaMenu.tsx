"use client";

type MegaMenuColumn = {
  icon: string;
  title: string;
  description: string;
  links: string;
};

type MegaMenuData = {
  enabled: boolean;
  columns: MegaMenuColumn[];
  bannerLabel: string;
  bannerTitle: string;
  bannerDescription: string;
  bannerButtonText: string;
  bannerButtonUrl: string;
  secondaryButtonText?: string;
  secondaryButtonUrl?: string;
};

/* =============================================================
   SERVICE URL OVERRIDES
   Matched by link label (ignores case, spaces and punctuation).
   If a label matches, this URL wins over the WordPress one.
   ============================================================= */

const BASE_URL = "https://codm-frontend.vercel.app/services";

const SERVICE_URLS: Record<string, string> = {
  "Technical Support": `${BASE_URL}/technical-support`,
  "Python Application": `${BASE_URL}/python-application`,
  "React Application": `${BASE_URL}/react-application`,
  ".NET Application": `${BASE_URL}/net-application`,
  "Building LLM": `${BASE_URL}/building-llm`,
  "Salesforce CRM": `${BASE_URL}/salesforce-crm`,
  "Data Integration/Migration": `${BASE_URL}/data-integration-migration`,
  "Data Integration": `${BASE_URL}/data-integration-migration`,
  "Data Migration": `${BASE_URL}/data-integration-migration`,
  "API Integration": `${BASE_URL}/api-integration`,
  "Energy Utilities & Cloud": `${BASE_URL}/energy-utilities-cloud`,
  "Salesforce Energy and Utilities Cloud": `${BASE_URL}/energy-utilities-cloud`,
  "Non Profit Cloud": `${BASE_URL}/non-profit-cloud`,
  "Salesforce Nonprofit Cloud": `${BASE_URL}/non-profit-cloud`,
  "Manufacturing Cloud": `${BASE_URL}/manufacturing-cloud`,
  "Salesforce Manufacturing Cloud": `${BASE_URL}/manufacturing-cloud`,
  "Marketing Cloud": `${BASE_URL}/marketing-cloud`,
  "Salesforce Marketing Cloud": `${BASE_URL}/marketing-cloud`,
};

const normalizeLabel = (label: string) =>
  label.toLowerCase().replace(/[^a-z0-9]/g, "");

const SERVICE_URL_LOOKUP: Record<string, string> = Object.fromEntries(
  Object.entries(SERVICE_URLS).map(([label, url]) => [
    normalizeLabel(label),
    url,
  ])
);

export function parseMegaMenuLinks(value: string = "") {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const pipeIndex = line.indexOf("|");

      const label =
        pipeIndex === -1 ? line : line.substring(0, pipeIndex).trim();

      const wordpressUrl =
        pipeIndex === -1
          ? "#"
          : line.substring(pipeIndex + 1).trim() || "#";

      return {
        label,
        url: SERVICE_URL_LOOKUP[normalizeLabel(label)] ?? wordpressUrl,
      };
    });
}

const ICONS: Record<string, string> = {
  cloud: "☁",
  sparkle: "✦",
  code: "</>",
  database: "🗄",
  integration: "⇄",
  support: "◎",
};

export default function MegaMenu({
  data,
  onMouseEnter,
  onMouseLeave,
}: {
  data: MegaMenuData;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  if (!data.enabled) {
    return null;
  }

  return (
    <div
      className="codm-megamenu"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="codm-megamenu-columns">
        {data.columns.map((col, index) => {
          if (!col.title) return null;

          const links = parseMegaMenuLinks(col.links);

          const splitLinks =
            links.length > 6
              ? [
                  links.slice(0, Math.ceil(links.length / 2)),
                  links.slice(Math.ceil(links.length / 2)),
                ]
              : [links];

          return (
            <div key={index} className="codm-megamenu-column">
              <div className="codm-megamenu-column-header">
                <span className="codm-megamenu-icon">
                  {ICONS[col.icon] || "•"}
                </span>

                <div>
                  <div className="codm-megamenu-column-title">
                    {col.title}
                  </div>

                  {col.description && (
                    <div className="codm-megamenu-column-description">
                      {col.description}
                    </div>
                  )}
                </div>
              </div>

              {links.length > 6 ? (
                <div className="codm-megamenu-links-split">
                  {splitLinks.map((columnLinks, columnIndex) => (
                    <ul key={columnIndex} className="codm-megamenu-links">
                      {columnLinks.map((link, linkIndex) => (
                        <li key={linkIndex}>
                          <a href={link.url} className="codm-megamenu-link">
                            <span
                              className="codm-megamenu-link-dot"
                              aria-hidden="true"
                            />

                            <span className="codm-megamenu-link-text">
                              {link.label}
                            </span>

                            <span
                              className="codm-megamenu-link-arrow"
                              aria-hidden="true"
                            >
                              ›
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  ))}
                </div>
              ) : (
                <ul className="codm-megamenu-links">
                  {links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href={link.url} className="codm-megamenu-link">
                        <span
                          className="codm-megamenu-link-dot"
                          aria-hidden="true"
                        />

                        <span className="codm-megamenu-link-text">
                          {link.label}
                        </span>

                        <span
                          className="codm-megamenu-link-arrow"
                          aria-hidden="true"
                        >
                          ›
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {data.bannerTitle && (
        <div className="codm-megamenu-banner">
          <div className="codm-megamenu-banner-left">
            {data.bannerLabel && (
              <span className="codm-megamenu-banner-label">
                {data.bannerLabel}
              </span>
            )}

            <span className="codm-megamenu-banner-title">
              {data.bannerTitle}
            </span>

            {data.bannerDescription && (
              <span className="codm-megamenu-banner-description">
                {data.bannerDescription}
              </span>
            )}
          </div>

          <div className="codm-megamenu-banner-actions">
            {data.bannerButtonText && (
              <a
                href={data.bannerButtonUrl || "#"}
                className="codm-megamenu-banner-button"
              >
                <span>{data.bannerButtonText}</span>

                <span aria-hidden="true">→</span>
              </a>
            )}

            <a
              href={data.secondaryButtonUrl || "/services"}
              className="codm-megamenu-banner-button codm-megamenu-banner-button--secondary"
            >
              <span>{data.secondaryButtonText || "View all services"}</span>

              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

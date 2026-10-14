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
   COLUMNS DEFINED IN CODE
   Set USE_CODE_COLUMNS to false to use the WordPress columns.
   Links without a page yet go to /services until you have the
   real URL (edit the line, format: Label|url).
   ============================================================= */

const USE_CODE_COLUMNS = true;

const BASE_URL = "https://codm-frontend.vercel.app/services";

const CODE_COLUMNS: MegaMenuColumn[] = [
  {
    icon: "cloud",
    title: "Salesforce CRM",
    description: "",
    links: [
      "Salesforce Education Cloud|/services",
      "Salesforce Financial Services|/services",
      "Salesforce Health & Insurance Cloud|/services",
      "Salesforce Data Cloud|/services",
      `Salesforce Marketing Cloud|${BASE_URL}/marketing-cloud`,
      "Salesforce Sales Cloud|/services",
      "Salesforce Service Cloud|/services",
      `Salesforce Energy and Utilities Cloud|${BASE_URL}/energy-utilities-cloud`,
      `Salesforce Manufacturing Cloud|${BASE_URL}/manufacturing-cloud`,
      `Salesforce Nonprofit Cloud|${BASE_URL}/non-profit-cloud`,
    ].join("\n"),
  },
  {
    icon: "database",
    title: "Data",
    description: "",
    links: [
      `API Integration|${BASE_URL}/api-integration`,
      `Data Integration|${BASE_URL}/data-integration-migration`,
      `Data Migration|${BASE_URL}/data-integration-migration`,
    ].join("\n"),
  },
  {
    icon: "code",
    title: "Development",
    description: "",
    links: [
      "CRM Development|/services",
      `Building LLM|${BASE_URL}/building-llm`,
      `.NET Application|${BASE_URL}/net-application`,
      `React Application|${BASE_URL}/react-application`,
      `Python Application|${BASE_URL}/python-application`,
    ].join("\n"),
  },
  {
    icon: "support",
    title: "Support",
    description: "",
    links: [
      `Technical Support|${BASE_URL}/technical-support`,
      "Deployment Support|/services",
    ].join("\n"),
  },
];

/* =============================================================
   LINK PARSING
   ============================================================= */

export function parseMegaMenuLinks(value: string = "") {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const pipeIndex = line.indexOf("|");

      if (pipeIndex === -1) {
        return { label: line, url: "#" };
      }

      return {
        label: line.substring(0, pipeIndex).trim(),
        url: line.substring(pipeIndex + 1).trim() || "#",
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

/* Removes a trailing arrow from WordPress button text, because the
   component adds its own arrow. */
const stripTrailingArrow = (text: string) =>
  text.replace(/\s*[→›»>]+\s*$/, "").trim();

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

  const columns = USE_CODE_COLUMNS ? CODE_COLUMNS : data.columns;

  return (
    <div
      className="codm-megamenu"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="codm-megamenu-columns">
        {columns.map((col, index) => {
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
                <span>{stripTrailingArrow(data.bannerButtonText)}</span>

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

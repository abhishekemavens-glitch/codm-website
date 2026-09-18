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
};

function parseMegaMenuLinks(value: string = "") {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const pipeIndex = line.indexOf("|");

      if (pipeIndex === -1) {
        return {
          label: line,
          url: "#",
        };
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

export default function MegaMenu({
  data,
}: {
  data: MegaMenuData;
}) {
  if (!data.enabled) {
    return null;
  }

  return (
    <div className="codm-megamenu">
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
            <div
              key={index}
              className="codm-megamenu-column"
            >
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
      <ul
        key={columnIndex}
        className="codm-megamenu-links"
      >
        {columnLinks.map((link, linkIndex) => (
          <li key={linkIndex}>
            <a
              href={link.url}
              className="codm-megamenu-link"
            >
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
        <a
          href={link.url}
          className="codm-megamenu-link"
        >
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

          {data.bannerButtonText && (
            <a
              href={data.bannerButtonUrl || "#"}
              className="codm-megamenu-banner-button"
            >
              <span>{data.bannerButtonText}</span>

              <span aria-hidden="true">
                →
              </span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}

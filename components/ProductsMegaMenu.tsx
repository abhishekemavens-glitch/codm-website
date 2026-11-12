"use client";

/* =========================================================
   PRODUCTS MEGA MENU

   Same look as the Services mega menu (it reuses the same
   .codm-megamenu* styles, so light and dark mode work), but
   everything comes from WordPress:
     wp-admin > Header > Products Mega Menu
   Any number of columns; optional bottom banner.

   Place at: components/ProductsMegaMenu.tsx
   ========================================================= */

export type ProductsMenuColumn = {
  icon: string;
  title: string;
  description: string;
  links: string;
  split: boolean;
};

export type ProductsMenuData = {
  enabled: boolean;
  columns: ProductsMenuColumn[];
  banner: {
    label: string;
    title: string;
    description: string;
    buttonText: string;
    buttonUrl: string;
    secondaryText: string;
    secondaryUrl: string;
  };
};

type MenuLink = { label: string; url: string };

const ICONS: Record<string, string> = {
  product: "▣",
  cloud: "☁",
  sparkle: "✦",
  code: "</>",
  database: "▤",
  integration: "⇄",
  support: "◎",
  chart: "▥",
  shield: "◈",
};

/** One link per line:  Label|/url  (no label-to-URL overrides, unlike Services). */
export function parseProductLinks(value: string = ""): MenuLink[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const pipe = line.indexOf("|");

      if (pipe === -1) {
        return { label: line, url: "#" };
      }

      return {
        label: line.substring(0, pipe).trim(),
        url: line.substring(pipe + 1).trim() || "#",
      };
    });
}

function LinkItem({ link }: { link: MenuLink }) {
  return (
    <li>
      <a href={link.url} className="codm-megamenu-link">
        <span className="codm-megamenu-link-dot" aria-hidden="true" />
        <span className="codm-megamenu-link-text">{link.label}</span>
        <span className="codm-megamenu-link-arrow" aria-hidden="true">
          ›
        </span>
      </a>
    </li>
  );
}

export default function ProductsMegaMenu({
  data,
  onMouseEnter,
  onMouseLeave,
}: {
  data: ProductsMenuData;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  const columns = (data.columns ?? []).filter(
    (col) => col.title || col.links.trim()
  );

  if (!data.enabled || columns.length === 0) return null;

  const banner = data.banner;
  const showBanner = Boolean(banner && (banner.title || banner.label));

  return (
    <div
      className="codm-megamenu codm-megamenu-products"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <style>{`
        .codm-megamenu.codm-megamenu-products .codm-megamenu-columns {
          grid-template-columns: repeat(var(--codm-mm-cols, 3), minmax(0, 1fr)) !important;
        }
      `}</style>

      <div
        className="codm-megamenu-columns"
        style={{ ["--codm-mm-cols" as string]: columns.length }}
      >
        {columns.map((col, index) => {
          const links = parseProductLinks(col.links);
          const half = Math.ceil(links.length / 2);
          const halves = col.split
            ? [links.slice(0, half), links.slice(half)]
            : [links];

          return (
            <div
              key={`${col.title}-${index}`}
              className="codm-megamenu-column"
            >
              <div className="codm-megamenu-column-header">
                {col.icon && (
                  <span className="codm-megamenu-icon">
                    {ICONS[col.icon] || "•"}
                  </span>
                )}

                <div className="codm-megamenu-column-heading">
                  <div className="codm-megamenu-column-title">{col.title}</div>

                  {col.description && (
                    <div className="codm-megamenu-column-description">
                      {col.description}
                    </div>
                  )}
                </div>
              </div>

              {col.split ? (
                <div className="codm-megamenu-links-split">
                  {halves.map((items, i) => (
                    <ul key={i} className="codm-megamenu-links">
                      {items.map((link) => (
                        <LinkItem key={link.label} link={link} />
                      ))}
                    </ul>
                  ))}
                </div>
              ) : (
                <ul className="codm-megamenu-links">
                  {links.map((link) => (
                    <LinkItem key={link.label} link={link} />
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {showBanner && (
        <div className="codm-megamenu-banner">
          <div className="codm-megamenu-banner-label">{banner.label}</div>

          <div className="codm-megamenu-banner-content">
            {banner.title && (
              <span className="codm-megamenu-banner-title">{banner.title}</span>
            )}

            {banner.description && (
              <span className="codm-megamenu-banner-description">
                {banner.description}
              </span>
            )}
          </div>

          <div className="codm-megamenu-banner-actions">
            {banner.buttonText && (
              <a
                href={banner.buttonUrl || "#"}
                className="codm-megamenu-banner-button"
              >
                <span>{banner.buttonText}</span>
                <span aria-hidden="true">→</span>
              </a>
            )}

            {banner.secondaryText && (
              <a
                href={banner.secondaryUrl || "#"}
                className="codm-megamenu-all-services"
              >
                <span>{banner.secondaryText}</span>
                <span aria-hidden="true">→</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react"; 
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import MegaMenu, { parseMegaMenuLinks } from "./MegaMenu";
import MobileServicesMenu, { type ServiceGroup } from "./MobileServicesMenu"; // CHANGE 1 of 3
import ProductsMegaMenu, {
  parseProductLinks,
  type ProductsMenuData,
} from "./ProductsMegaMenu";
import { useStickyNavState } from "@/lib/codm-animations";

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

  megaMenuEnabled: boolean;
  megaMenuCol1Icon: string;
  megaMenuCol1Title: string;
  megaMenuCol1Description: string;
  megaMenuCol1Links: string;
  megaMenuCol2Icon: string;
  megaMenuCol2Title: string;
  megaMenuCol2Description: string;
  megaMenuCol2Links: string;
  megaMenuCol3Icon: string;
  megaMenuCol3Title: string;
  megaMenuCol3Description: string;
  megaMenuCol3Links: string;
  megaMenuBannerLabel: string;
  megaMenuBannerTitle: string;
  megaMenuBannerDescription: string;
  megaMenuBannerButtonText: string;
  megaMenuBannerButtonUrl: string;
};

/* One item of the main menu (managed in WordPress: Header > Main Menu).
   menu: "none" = plain link, "services" / "products" = opens that mega menu. */
type MenuItem = {
  label: string;
  url: string;
  menu: string;
};

type AnnouncementData = {
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

  /* Supports:
     Services|/services
     Services/services
  */

  const pipeIndex = value.indexOf("|");

  if (pipeIndex !== -1) {
    return {
      label: value.substring(0, pipeIndex).trim(),
      url: value.substring(pipeIndex + 1).trim() || "#",
    };
  }

  /*
   * Don't treat the "/" at the beginning of
   * an actual URL as the separator.
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
  const scrolled = useStickyNavState(20);
  const pathname = usePathname();

  /* Active when the path matches exactly, or is a sub-page of it
     (e.g. "/services/salesforce" still highlights "Services"). */
  function isActiveLink(url: string) {
    if (!url || url === "#") return false;

    const clean = url.replace(/\/+$/, "") || "/";
    const current = (pathname || "/").replace(/\/+$/, "") || "/";

    if (clean === "/") {
      return current === "/";
    }

    return current === clean || current.startsWith(clean + "/");
  }

  const [header, setHeader] =
    useState<HeaderData | null>(null);

  const [announcement, setAnnouncement] =
    useState<AnnouncementData>({
      announcementText: "",
      announcementButtonText: "",
      announcementButtonUrl: "#",
    });

  /* Which mega menu is open on desktop: "services", "products" or none */
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const menuCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openMenuFor = (key: string) => {
    if (menuCloseTimer.current) {
      clearTimeout(menuCloseTimer.current);
      menuCloseTimer.current = null;
    }

    setOpenMenu(key);
  };

  const closeMenu = () => {
    if (menuCloseTimer.current) {
      clearTimeout(menuCloseTimer.current);
    }

    menuCloseTimer.current = setTimeout(() => {
      setOpenMenu(null);
      menuCloseTimer.current = null;
    }, 400);
  };

  /* Menu items + Products mega menu come from WordPress (Header settings).
     Loaded separately so the header still works if these fields are missing. */
  const [menuItems, setMenuItems] = useState<MenuItem[] | null>(null);
  const [productsMenu, setProductsMenu] = useState<ProductsMenuData | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadMenu() {
      try {
        const response = await fetch(WORDPRESS_GRAPHQL_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              query HeaderMenu {
                codmHeaders {
                  nodes {
                    menuItems {
                      label
                      url
                      menu
                    }
                    productsMenuData
                  }
                }
              }
            `,
          }),
        });

        if (!response.ok) return;

        const result = await response.json();

        if (result.errors) {
          console.warn(
            "Menu items are not available in WordPress GraphQL yet:",
            result.errors
          );
          return;
        }

        const node = result?.data?.codmHeaders?.nodes?.[0];

        if (!node || !mounted) return;

        if (Array.isArray(node.menuItems)) {
          setMenuItems(
            node.menuItems.map((item: Partial<MenuItem>) => ({
              label: item.label || "",
              url: item.url || "#",
              menu: item.menu || "none",
            }))
          );
        }

        if (node.productsMenuData) {
          try {
            setProductsMenu(JSON.parse(node.productsMenuData));
          } catch {
            /* ignore invalid JSON */
          }
        }
      } catch (error) {
        console.warn("Menu could not be loaded:", error);
      }
    }

    loadMenu();

    return () => {
      mounted = false;
    };
  }, []);

 
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /* Announcement bar: can be closed with the X button.
     The choice is remembered per announcement text, so a NEW
     announcement (different text) appears again automatically. */
  const [dismissedText, setDismissedText] = useState<string | null>(null);

  useEffect(() => {
    try {
      setDismissedText(localStorage.getItem("codm-announcement-dismissed"));
    } catch {
      /* storage blocked: bar simply stays dismissible for this visit */
    }
  }, []);

  /* While the announcement bar is closed, tell the page (via a class on
     <html>) so the header can sit at the very top instead of leaving a gap. */
  const announcementClosed =
    !!announcement.announcementText &&
    dismissedText === announcement.announcementText;

  useEffect(() => {
    document.documentElement.classList.toggle(
      "codm-announcement-closed",
      announcementClosed
    );
    return () => {
      document.documentElement.classList.remove("codm-announcement-closed");
    };
  }, [announcementClosed]);

  const dismissAnnouncement = () => {
    setDismissedText(announcement.announcementText);
    try {
      localStorage.setItem(
        "codm-announcement-dismissed",
        announcement.announcementText
      );
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    let mounted = true;

    async function loadHeader() {
      try {
        const headerResponse = await fetch(
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

          megaMenuEnabled
          megaMenuCol1Icon
          megaMenuCol1Title
          megaMenuCol1Description
          megaMenuCol1Links
          megaMenuCol2Icon
          megaMenuCol2Title
          megaMenuCol2Description
          megaMenuCol2Links
          megaMenuCol3Icon
          megaMenuCol3Title
          megaMenuCol3Description
          megaMenuCol3Links
          megaMenuBannerLabel
          megaMenuBannerTitle
          megaMenuBannerDescription
          megaMenuBannerButtonText
          megaMenuBannerButtonUrl
        }
      }
    }
  `,
}),
          }
        );

        if (!headerResponse.ok) {
          throw new Error(
            `WordPress header request failed: ${headerResponse.status}`
          );
        }

        const headerResult =
          await headerResponse.json();

        console.log(
          "CODM HEADER DATA:",
          headerResult
        );

        if (headerResult.errors) {
          console.error(
            "CODM HEADER GRAPHQL ERROR:",
            headerResult.errors
          );

          return;
        }

        const headerData =
          headerResult?.data?.codmHeaders?.nodes?.[0];

        if (!headerData) {
          console.error(
            "CODM HEADER: No header data found."
          );

          return;
        }

        if (mounted) {
          setHeader(headerData);
        }

        try {
          const announcementResponse =
            await fetch(
              WORDPRESS_GRAPHQL_URL,
              {
                method: "POST",

                headers: {
                  "Content-Type": "application/json",
                },

                body: JSON.stringify({
                  query: `
                    query Announcement {
                      codmHeaders {
                        nodes {
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

          if (!announcementResponse.ok) {
            console.warn(
              "Announcement request failed:",
              announcementResponse.status
            );

            return;
          }

          const announcementResult =
            await announcementResponse.json();

          console.log(
            "CODM ANNOUNCEMENT DATA:",
            announcementResult
          );

          if (announcementResult.errors) {
            console.warn(
              "Announcement fields are not available in WordPress GraphQL yet:",
              announcementResult.errors
            );

            return;
          }

          const announcementData =
            announcementResult
              ?.data
              ?.codmHeaders
              ?.nodes?.[0];

          if (
            announcementData &&
            mounted
          ) {
            setAnnouncement({
              announcementText:
                announcementData.announcementText ||
                "",
              announcementButtonText:
                announcementData.announcementButtonText ||
                "",
              announcementButtonUrl:
                announcementData.announcementButtonUrl ||
                "#",
            });
          }

        } catch (announcementError) {
          console.warn(
            "Announcement could not be loaded:",
            announcementError
          );
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

  if (!header) {
    return null;
  }

  /* The old 5 fixed items, used until the new Main Menu list is available */
  const legacyItems: MenuItem[] = [
    { ...parseLink(header.services), menu: header.megaMenuEnabled ? "services" : "none" },
    { ...parseLink(header.industries), menu: "none" },
    { ...parseLink(header.caseStudies), menu: "none" },
    { ...parseLink(header.about), menu: "none" },
    { ...parseLink(header.insights), menu: "none" },
  ];

  const items: MenuItem[] = (
    menuItems && menuItems.length > 0 ? menuItems : legacyItems
  ).filter((item) => item.label);

  const toServiceLinks = (raw: string) =>
    parseMegaMenuLinks(raw).map((link) => ({
      label: link.label,
      href: link.url,
    }));

  const serviceGroups: ServiceGroup[] = [
    {
      title: header.megaMenuCol1Title,
      links: toServiceLinks(header.megaMenuCol1Links),
    },
    {
      title: header.megaMenuCol2Title,
      links: toServiceLinks(header.megaMenuCol2Links),
    },
    {
      title: header.megaMenuCol3Title,
      links: toServiceLinks(header.megaMenuCol3Links),
    },
  ].filter((group) => group.title && group.links.length > 0);

  const productsEnabled = Boolean(
    productsMenu?.enabled && (productsMenu.columns?.length ?? 0) > 0
  );

  const productGroups: ServiceGroup[] = (productsMenu?.columns ?? [])
  .map((col) => ({
    title: col.title || "",
    links: parseProductLinks(col.links).map((link) => ({
      label: link.label,
      href: link.url,
    })),
  }))
  .filter((group) => group.links.length > 0);

  return (
    <>

      {announcement.announcementText &&
        dismissedText !== announcement.announcementText && (
        <div className="codm-announcement-bar">

          <div className="codm-announcement-inner">

            <span className="codm-announcement-text">
              {announcement.announcementText}
            </span>

            {announcement.announcementButtonText && (
              <a
                href={
                  announcement.announcementButtonUrl ||
                  "#"
                }
                className="codm-announcement-link"
              >

                <span>
                  {announcement.announcementButtonText}
                </span>

              </a>
            )}

            <button
              type="button"
              className="codm-announcement-close"
              onClick={dismissAnnouncement}
              aria-label="Close announcement"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path
                  d="M1 1l8 8M9 1L1 9"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </button>

          </div>

        </div>
      )}

 <header
  className={`codm-header codm-site-header codm-header-sticky ${
    scrolled ? "codm-header-scrolled" : ""
  }`}
>
  <div className="codm-header-inner">

    <a
      href="/"
      className="codm-header-logo-link codm-header-logo"
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

    <nav
      className="codm-header-nav"
      aria-label="Main navigation"
    >

      {items.map((item, index) => {
        const megaKey =
          item.menu === "services" && header.megaMenuEnabled
            ? "services"
            : item.menu === "products" && productsEnabled
              ? "products"
              : null;

        if (megaKey) {
          const isOpen = openMenu === megaKey;

          return (
            <div
              key={`${item.label}-${index}`}
              className={`codm-header-nav-item-wrap codm-${megaKey}-menu-trigger`}
              onMouseEnter={() => openMenuFor(megaKey)}
              onMouseLeave={closeMenu}
            >
             
{megaKey === "services" ? (
  <button
    type="button"
    className="codm-header-nav-link"
    aria-haspopup="true"
    aria-expanded={isOpen}
    onClick={() => setOpenMenu(isOpen ? null : megaKey)}
    onFocus={() => openMenuFor(megaKey)}
  >
    {item.label}
    <svg
      className={`codm-nav-dropdown-icon ${
        isOpen ? "codm-nav-dropdown-icon-open" : ""
      }`}
      width="10"
      height="6"
      viewBox="0 0 10 6"
      fill="none"
      aria-hidden="true"
    >
      <path d="M1 1L5 5L9 1" stroke="currentColor"
        strokeWidth="1.5" strokeLinecap="round"
        strokeLinejoin="round" />
    </svg>
  </button>
) : (
  <a
    href={item.url}
    className={`codm-header-nav-link ${
      isActiveLink(item.url) ? "codm-header-nav-link-active" : ""
    }`}
    aria-haspopup="true"
    aria-expanded={isOpen}
    onFocus={() => openMenuFor(megaKey)}
  >
    {item.label}
    <svg
      className={`codm-nav-dropdown-icon ${
        isOpen ? "codm-nav-dropdown-icon-open" : ""
      }`}
      width="10"
      height="6"
      viewBox="0 0 10 6"
      fill="none"
      aria-hidden="true"
    >
      <path d="M1 1L5 5L9 1" stroke="currentColor"
        strokeWidth="1.5" strokeLinecap="round"
        strokeLinejoin="round" />
    </svg>
  </a>
)}

            </div>
          );
        }

        return (
          <a
            key={`${item.label}-${index}`}
            href={item.url}
            className={`codm-header-nav-link ${
              isActiveLink(item.url) ? "codm-header-nav-link-active" : ""
            }`}
          >
            {item.label}
          </a>
        );
      })}

    </nav>

    {header.megaMenuEnabled && openMenu === "services" && (
      <MegaMenu
  onMouseEnter={() => openMenuFor("services")}
  onMouseLeave={closeMenu}
  data={{
          enabled: true,

          columns: [
            {
              icon: header.megaMenuCol1Icon,
              title: header.megaMenuCol1Title,
              description:
                header.megaMenuCol1Description,
              links: header.megaMenuCol1Links,
            },

            {
              icon: header.megaMenuCol2Icon,
              title: header.megaMenuCol2Title,
              description:
                header.megaMenuCol2Description,
              links: header.megaMenuCol2Links,
            },

            {
              icon: header.megaMenuCol3Icon,
              title: header.megaMenuCol3Title,
              description:
                header.megaMenuCol3Description,
              links: header.megaMenuCol3Links,
            },
          ],

          bannerLabel:
            header.megaMenuBannerLabel,

          bannerTitle:
            header.megaMenuBannerTitle,

          bannerDescription:
            header.megaMenuBannerDescription,

          bannerButtonText:
            header.megaMenuBannerButtonText,

          bannerButtonUrl:
            header.megaMenuBannerButtonUrl,
        }}
      />
    )}

    {productsEnabled && productsMenu && openMenu === "products" && (
      <ProductsMegaMenu
        data={productsMenu}
        onMouseEnter={() => openMenuFor("products")}
        onMouseLeave={closeMenu}
      />
    )}

    {mobileMenuOpen && (
      <div className="codm-mobile-menu">

        {items.map((item, index) => {
          const key = `${item.label}-${index}`;

          if (
            item.menu === "services" &&
            header.megaMenuEnabled &&
            serviceGroups.length > 0
          ) {
            return (
              <MobileServicesMenu
                key={key}
                groups={serviceGroups}
                label={item.label}
                servicesHref={item.url}
                onNavigate={() => setMobileMenuOpen(false)}
              />
            );
          }

          if (
            item.menu === "products" &&
            productsEnabled &&
            productGroups.length > 0
          ) {
            return (
              <MobileServicesMenu
                key={key}
                groups={productGroups}
                label={item.label}
                servicesHref={item.url}
                allLabel={`All ${item.label.toLowerCase()}`}
                onNavigate={() => setMobileMenuOpen(false)}
              />
            );
          }

          return (
            <a
              key={key}
              href={item.url}
              className={`codm-mobile-menu-link ${
                isActiveLink(item.url) ? "codm-mobile-menu-link-active" : ""
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </a>
          );
        })}

        {/* Get in touch: the header button is hidden on tablet + mobile,
            so it appears here at the bottom of the menu instead. */}
        {header.buttonText && (
          <a
            href="/contact-us"
            className="codm-mobile-menu-cta"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span>{header.buttonText}</span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3.5 10.5L10.5 3.5M4.5 3.5h6v6"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        )}

      </div>
    )}

    <div className="codm-header-right">

      <button
        type="button"
        className={`codm-mobile-toggle ${
          mobileMenuOpen
            ? "codm-mobile-toggle-open"
            : ""
        }`}
        onClick={() =>
          setMobileMenuOpen(
            (open) => !open
          )
        }
        aria-label="Toggle menu"
        aria-expanded={mobileMenuOpen}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className="codm-header-theme-toggle">
        <ThemeToggle />
      </div>

    {header.buttonText && (
  <a
    href="/contact-us"
    className="codm-header-cta"
  >
    <span>{header.buttonText}</span>

    <span
      className="codm-header-cta-arrow"
      aria-hidden="true"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
      >
        <path
          d="M3.5 10.5L10.5 3.5M4.5 3.5h6v6"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  </a>
)}

    </div>

  </div>
</header>


      <style>{`
        /* Get in touch button inside the mobile / tablet menu */
        .codm-mobile-menu-cta {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin: 18px 0 6px;
          padding: 14px 22px;
          border-radius: 9999px;
          font-size: 15px;
          font-weight: 500;
          line-height: 1;
          color: #ffffff !important;
          text-decoration: none;
          background: linear-gradient(135deg, #6d4aff, #8b6dff);
          box-shadow: 0 10px 28px rgba(109, 74, 255, 0.3);
          transition: transform 250ms ease, box-shadow 250ms ease;
        }
        .codm-mobile-menu-cta:hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 34px rgba(109, 74, 255, 0.42);
        }
        @media (min-width: 1024px) {
          .codm-mobile-menu-cta { display: none; }
        }

        /* Announcement close button */
        .codm-announcement-close {
          flex: none;
          width: 22px;
          height: 22px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-left: 8px;
          padding: 0;
          border: 0;
          border-radius: 999px;
          background: transparent;
          color: inherit;
          opacity: 0.6;
          cursor: pointer;
          transition: opacity 200ms ease, background 200ms ease;
        }
        .codm-announcement-close:hover {
          opacity: 1;
          background: rgba(114, 92, 255, 0.12);
        }

        /* Announcement closed: your .codm-header rule hard-codes top: 44px
           (the bar height), so move the header to the top when the bar is gone. */
        html.codm-announcement-closed .codm-header,
        html.codm-announcement-closed .codm-site-header,
        html.codm-announcement-closed .codm-header-sticky,
        html.codm-announcement-closed .codm-header-scrolled {
          top: 0 !important;
        }
        .codm-header {
          transition: top 300ms ease;
        }

        /* Theme toggle: keep it visible on tablet + mobile,
           sitting just before the hamburger button */
        @media (max-width: 1023px) {
          .codm-header-right .codm-header-theme-toggle {
            display: flex !important;
            align-items: center;
            order: -1;
            visibility: visible !important;
            opacity: 1 !important;
          }
          .codm-header-right .codm-header-theme-toggle > * {
            display: inline-flex !important;
            visibility: visible !important;
            opacity: 1 !important;
          }
        }
      `}</style>
    </>
  );
}

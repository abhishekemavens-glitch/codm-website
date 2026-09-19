"use client";

import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import MegaMenu from "./MegaMenu";
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

  const [header, setHeader] =
    useState<HeaderData | null>(null);

  const [announcement, setAnnouncement] =
    useState<AnnouncementData>({
      announcementText: "",
      announcementButtonText: "",
      announcementButtonUrl: "#",
    });

  const [servicesMenuOpen, setServicesMenuOpen] = useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadHeader() {
      try {
        /*
         * =====================================================
         * HEADER QUERY
         * =====================================================
         *
         * IMPORTANT:
         * Announcement fields are NOT queried here.
         *
         * This means an announcement GraphQL problem
         * cannot make the complete header disappear.
         */

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


        /*
         * =====================================================
         * ANNOUNCEMENT QUERY
         * =====================================================
         *
         * We try this separately.
         *
         * If WordPress does not yet expose these fields,
         * the HEADER itself will still work.
         */

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

          /*
           * If WordPress does not have these fields yet,
           * only the announcement fails.
           *
           * The main header remains visible.
           */

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
          /*
           * Announcement failure must NEVER
           * hide the main header.
           */

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


  /*
   * =========================================================
   * HEADER DATA NOT LOADED
   * =========================================================
   */

  if (!header) {
    return null;
  }


  /*
   * =========================================================
   * NAVIGATION LINKS
   * =========================================================
   */

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


  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <>

      {/* =====================================================
          ANNOUNCEMENT BAR
      ===================================================== */}

      {announcement.announcementText && (
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

          </div>

        </div>
      )}


      {/* =====================================================
          MAIN HEADER
      ===================================================== */}

    <header
  className={`codm-header codm-site-header codm-header-sticky ${
    scrolled ? "codm-header-scrolled" : ""
  }`}
>

        <div className="codm-header-inner">


          {/* =================================================
              LOGO
          ================================================= */}

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


          {/* =================================================
              NAVIGATION
          ================================================= */}

          <nav
            className="codm-header-nav"
            aria-label="Main navigation"
          >

                    {services.label && (
  <div
    className="codm-header-nav-item-wrap"
    onMouseEnter={() => setServicesMenuOpen(true)}
    onMouseLeave={() => setServicesMenuOpen(false)}
  >
    <a
      href={services.url}
      className="codm-header-nav-link"
      onFocus={() => setServicesMenuOpen(true)}
      aria-haspopup="true"
      aria-expanded={servicesMenuOpen}
    >
      {services.label}

       <svg
    className={`codm-nav-dropdown-icon ${
      servicesMenuOpen ? "codm-nav-dropdown-icon-open" : ""
    }`}
    width="10"
    height="6"
    viewBox="0 0 10 6"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M1 1L5 5L9 1"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>

      
    </a>

    {servicesMenuOpen && header.megaMenuEnabled && (
      <MegaMenu
        data={{
          enabled: header.megaMenuEnabled,
          columns: [
            {
              icon: header.megaMenuCol1Icon,
              title: header.megaMenuCol1Title,
              description: header.megaMenuCol1Description,
              links: header.megaMenuCol1Links,
            },
            {
              icon: header.megaMenuCol2Icon,
              title: header.megaMenuCol2Title,
              description: header.megaMenuCol2Description,
              links: header.megaMenuCol2Links,
            },
            {
              icon: header.megaMenuCol3Icon,
              title: header.megaMenuCol3Title,
              description: header.megaMenuCol3Description,
              links: header.megaMenuCol3Links,
            },
          ],
          bannerLabel: header.megaMenuBannerLabel,
          bannerTitle: header.megaMenuBannerTitle,
          bannerDescription: header.megaMenuBannerDescription,
          bannerButtonText: header.megaMenuBannerButtonText,
          bannerButtonUrl: header.megaMenuBannerButtonUrl,
        }}
      />
    )}
  </div>
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
{mobileMenuOpen && (
  <div className="codm-mobile-menu">

    {services.label && (
      <a
        href={services.url}
        className="codm-mobile-menu-link"
        onClick={() => setMobileMenuOpen(false)}
      >
        {services.label}
      </a>
    )}

    {industries.label && (
      <a
        href={industries.url}
        className="codm-mobile-menu-link"
        onClick={() => setMobileMenuOpen(false)}
      >
        {industries.label}
      </a>
    )}

    {caseStudies.label && (
      <a
        href={caseStudies.url}
        className="codm-mobile-menu-link"
        onClick={() => setMobileMenuOpen(false)}
      >
        {caseStudies.label}
      </a>
    )}

    {about.label && (
      <a
        href={about.url}
        className="codm-mobile-menu-link"
        onClick={() => setMobileMenuOpen(false)}
      >
        {about.label}
      </a>
    )}

    {insights.label && (
      <a
        href={insights.url}
        className="codm-mobile-menu-link"
        onClick={() => setMobileMenuOpen(false)}
      >
        {insights.label}
      </a>
    )}

  </div>
)}

          {/* =================================================
              RIGHT SIDE
          ================================================= */}

          <div className="codm-header-right">


            <button
    type="button"
    className={`codm-mobile-toggle ${
      mobileMenuOpen ? "codm-mobile-toggle-open" : ""
    }`}
    onClick={() => setMobileMenuOpen((open) => !open)}
    aria-label="Toggle menu"
    aria-expanded={mobileMenuOpen}
  >
    <span></span>
    <span></span>
    <span></span>
  </button>
  <ThemeToggle />

  {header.buttonText && (
    <a
      href={header.buttonUrl || "#"}
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

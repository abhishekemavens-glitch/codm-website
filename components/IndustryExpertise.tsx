"use client";

import { useEffect, useState } from "react";
import SectionHeading from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";

/* =========================================================
   INDUSTRY EXPERTISE
   "Technology Solutions Built Around Your Industry"

   All content comes from WordPress (codm-headless.php):
     wp-admin > Industry Expertise
       - text (eyebrow, heading, description)
       - big image: separate LIGHT and DARK versions
       - feature cards (icon, title, description)

   Usage:  <IndustryExpertise />
   Place at: components/IndustryExpertise.tsx
   ========================================================= */

const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

type Card = {
  title: string | null;
  description: string | null;
  icon: string | null;
  iconLight: string | null;
  iconDark: string | null;
};

type Data = {
  eyebrow: string | null;
  title: string | null;
  gradientText: string | null;
  description: string | null;
  imageLight: string | null;
  imageDark: string | null;
  cards: Card[] | null;
};

/* ---------------------------------------------------------
   Theme detection (follows the site's theme toggle)
   --------------------------------------------------------- */

function detectDark(): boolean {
  if (typeof document === "undefined") return false;

  const html = document.documentElement;
  const body = document.body;

  const attr = (
    html.getAttribute("data-theme") ||
    html.getAttribute("data-mode") ||
    body?.getAttribute("data-theme") ||
    ""
  ).toLowerCase();

  if (attr === "dark") return true;
  if (attr === "light") return false;

  if (html.classList.contains("dark") || body?.classList.contains("dark")) {
    return true;
  }
  if (html.classList.contains("light") || body?.classList.contains("light")) {
    return false;
  }

  const probe = getComputedStyle(body || html).backgroundColor;
  const match = probe.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    const [r, g, b] = [Number(match[1]), Number(match[2]), Number(match[3])];
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function useIsDark() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const update = () => setIsDark(detectDark());
    update();

    const observer = new MutationObserver(update);
    const opts = {
      attributes: true,
      attributeFilter: ["class", "data-theme", "data-mode", "style"],
    };
    observer.observe(document.documentElement, opts);
    if (document.body) observer.observe(document.body, opts);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", update);

    return () => {
      observer.disconnect();
      mq.removeEventListener("change", update);
    };
  }, []);

  return isDark;
}

/* ---------------------------------------------------------
   Built-in icons (used when no icon image is uploaded)
   --------------------------------------------------------- */

function BuiltInIcon({ type }: { type: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-9 w-9",
    "aria-hidden": true,
  };

  switch (type) {
    case "ai":
      return (
        <svg {...common}>
          <rect x="6" y="6" width="12" height="12" rx="2" />
          <path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" />
          <path d="M9.5 14.5l1.5-5 1.5 5M10 13h2" />
        </svg>
      );
    case "growth":
      return (
        <svg {...common}>
          <path d="M4 20h16" />
          <path d="M6 20v-5h3v5M11 20v-8h3v8M16 20v-11h3v11" />
          <path d="M5 10l5-4 3 2 6-5M15 3h4v4" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3l7 3v5c0 4.5-3 7.8-7 10-4-2.2-7-5.5-7-10V6l7-3z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "globe":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18" />
        </svg>
      );
    case "cloud":
      return (
        <svg {...common}>
          <path d="M7.5 18h9a4.5 4.5 0 0 0 .5-8.97A6 6 0 0 0 5.4 10.2 4 4 0 0 0 7.5 18Z" />
        </svg>
      );
    case "code":
      return (
        <svg {...common}>
          <path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14" />
        </svg>
      );
    case "database":
      return (
        <svg {...common}>
          <ellipse cx="12" cy="5" rx="7" ry="3" />
          <path d="M5 5v7c0 1.7 3.1 3 7 3s7-1.3 7-3V5" />
          <path d="M5 12v7c0 1.7 3.1 3 7 3s7-1.3 7-3v-7" />
        </svg>
      );
    case "users":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
          <circle cx="17" cy="9" r="2.4" />
          <path d="M16 14.2c2.9.2 5 2.4 5 5.3" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
        </svg>
      );
    case "layers":
    default:
      return (
        <svg {...common}>
          <path d="m12 4 8 4-8 4-8-4 8-4z" />
          <path d="m4 12 8 4 8-4" />
          <path d="m4 16 8 4 8-4" />
        </svg>
      );
  }
}

/* ---------------------------------------------------------
   Component
   --------------------------------------------------------- */

export default function IndustryExpertise() {
  const [data, setData] = useState<Data | null>(null);
  const [loaded, setLoaded] = useState(false);
  const isDark = useIsDark();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(WORDPRESS_GRAPHQL_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              query GetIndustryExpertise {
                industryExpertise {
                  eyebrow
                  title
                  gradientText
                  description
                  imageLight
                  imageDark
                  cards {
                    title
                    description
                    icon
                    iconLight
                    iconDark
                  }
                }
              }
            `,
          }),
        });

        const result = await response.json();

        if (result.errors) {
          console.error("Industry Expertise GraphQL Error:", result.errors);
          return;
        }

        if (!cancelled) {
          setData(result.data?.industryExpertise ?? null);
        }
      } catch (error) {
        console.error("Failed to load Industry Expertise:", error);
      } finally {
        if (!cancelled) {
          setLoaded(true);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!loaded) {
    return (
      <section
        aria-hidden="true"
        className="bg-[var(--background)] px-5 py-14 sm:px-8 md:py-20"
      >
        <div className="min-h-[420px]" />
      </section>
    );
  }

  if (!data) {
    return null;
  }

  const cards = (data.cards ?? []).filter(
    (card) => card.title || card.description
  );

  /* pick the image for the current theme; fall back to the other one */
  const image = isDark
    ? data.imageDark || data.imageLight
    : data.imageLight || data.imageDark;

  return (
    <section
      id="industry-expertise"
      className="relative overflow-hidden bg-[var(--background)] px-5 py-14 transition-colors duration-500 sm:px-8 md:py-20"
    >
      {/* soft background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-10%] top-[-10%] h-[420px] w-[620px] rounded-full blur-[130px]"
        style={{
          background:
            "radial-gradient(circle, rgba(114,92,255,0.14), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-[1250px]">
        {/* TEXT + IMAGE */}
        <div
          className={
            "grid items-center gap-10 lg:gap-14 " +
            (image ? "lg:grid-cols-[1.05fr_1fr]" : "")
          }
        >
          <Reveal distance={20}>
            <SectionHeading
              align="left"
              eyebrow={data.eyebrow ?? ""}
              title={data.title ?? ""}
              gradientText={data.gradientText ?? ""}
              description={data.description ?? undefined}
            />
          </Reveal>

          {image && (
            <Reveal distance={30} duration={0.8}>
              <img
                key={image}
                src={image}
                alt=""
                className="mx-auto h-auto w-full max-w-[620px] object-contain"
              />
            </Reveal>
          )}
        </div>

        {/* FEATURE CARDS */}
        {cards.length > 0 && (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3">
            {cards.map((card, index) => {
              const iconSrc = isDark
                ? card.iconDark || card.iconLight
                : card.iconLight || card.iconDark;

              return (
                <Reveal
                  key={`${card.title}-${index}`}
                  distance={24}
                  duration={0.7}
                >
                  <article className="flex h-full items-start gap-4 rounded-[20px] border border-[var(--border)] bg-[var(--surface)]/60 p-6 backdrop-blur-[2px] transition-all duration-300 hover:-translate-y-[2px] hover:border-[var(--accent)]/40">
                    <div className="flex h-10 w-10 flex-none items-center justify-center text-[var(--accent)]">
                      {iconSrc ? (
                        <img
                          src={iconSrc}
                          alt=""
                          className="h-9 w-9 object-contain"
                        />
                      ) : (
                        <BuiltInIcon type={card.icon ?? "layers"} />
                      )}
                    </div>

                    <div>
                      {card.title && (
                        <h3 className="text-[17px] font-semibold leading-snug tracking-[-0.02em] text-[var(--foreground)]">
                          {card.title}
                        </h3>
                      )}

                      {card.description && (
                        <p className="mt-1.5 text-[13px] leading-[1.55] text-[var(--muted)]">
                          {card.description}
                        </p>
                      )}
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

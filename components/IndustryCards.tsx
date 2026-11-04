"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SectionHeading from "@/components/SectionHeading";
import { Reveal, Stagger, StaggerItem } from "@/components/Reveal";

/* =========================================================
   INDUSTRY CARDS - "Built for Every Industry"

   Cards come from WordPress: Industry Cards (one entry per card).
   The heading comes from Industry Cards > Section heading.
   Works in light and dark mode; each card can have its own
   light-mode photo and icon. Hidden until a card is published.

   Usage:  <IndustryCards />
   Place at: components/IndustryCards.tsx
   ========================================================= */

const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

type Card = {
  id: string;
  title: string;
  cardDescription: string | null;
  cardTags: string[] | null;
  cardLink: string | null;
  iconUrl: string | null;
  iconLightUrl: string | null;
  imageLightUrl: string | null;
  featuredImage?: {
    node?: {
      sourceUrl?: string;
      altText?: string;
    } | null;
  } | null;
};

type Heading = {
  eyebrow: string;
  title: string;
  description: string;
};

/* Used until WordPress answers (and if the heading page isn't set up) */
const DEFAULT_HEADING: Heading = {
  eyebrow: "Explore Our Industries",
  title: "Built for Every Industry",
  description:
    "Adapt sales processes to the way your industry works, with flexible tools and connected customer data.",
};

const CARDS_QUERY = `
  query GetIndustryCards {
    industryCards(
      first: 24
      where: {
        orderby: [
          { field: MENU_ORDER, order: ASC }
          { field: DATE, order: ASC }
        ]
      }
    ) {
      nodes {
        id
        title
        cardDescription
        cardTags
        cardLink
        iconUrl
        iconLightUrl
        imageLightUrl
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
      }
    }
  }
`;

const HEADING_QUERY = `
  query GetIndustryCardsHeading {
    industryCardsSection {
      eyebrow
      title
      description
    }
  }
`;

async function wpQuery<T>(query: string): Promise<T | null> {
  try {
    const response = await fetch(WORDPRESS_GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`WordPress request failed: ${response.status}`);
    }

    const result = await response.json();

    if (result.errors) {
      console.error("Industry Cards GraphQL Error:", result.errors);
      return null;
    }

    return result.data as T;
  } catch (error) {
    console.error("Industry Cards request failed:", error);
    return null;
  }
}

/* WordPress sends titles with HTML entities (e.g. &amp;) */
function decodeEntities(text: string): string {
  if (typeof document === "undefined") return text;
  const el = document.createElement("textarea");
  el.innerHTML = text;
  return el.value;
}

const isExternal = (href: string) => /^(https?:)?\/\//i.test(href);

/*
 * Returns the image(s) to draw. When a separate light-mode image exists
 * both are rendered and CSS shows the right one for the current theme.
 */
function themedImages(dark: string | null, light: string | null) {
  const base = dark || light;

  if (!base) return [];

  if (dark && light && dark !== light) {
    return [
      { src: dark, theme: "codm-ic-theme-dark" },
      { src: light, theme: "codm-ic-theme-light" },
    ];
  }

  return [{ src: base, theme: "" }];
}

function IndustryCard({ card }: { card: Card }) {
  const title = decodeEntities(card.title);
  const tags = card.cardTags ?? [];
  const link = card.cardLink;

  const photoDark = card.featuredImage?.node?.sourceUrl ?? null;
  const photos = themedImages(photoDark, card.imageLightUrl || photoDark);

  const hasLightIcon = Boolean(card.iconLightUrl);
  const icons = hasLightIcon
    ? [
        { src: card.iconUrl || (card.iconLightUrl as string), theme: "codm-ic-theme-dark" },
        { src: card.iconLightUrl as string, theme: "codm-ic-theme-light" },
      ]
    : card.iconUrl
      ? [{ src: card.iconUrl, theme: "" }]
      : [];

  const body = (
    <>
      {photos.map((photo) => (
        <img
          key={photo.src}
          src={photo.src}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className={`codm-ic-photo ${photo.theme}`}
        />
      ))}

      <div className="codm-ic-overlay" aria-hidden="true" />

      <div className="codm-ic-content">
        {icons.length > 0 && (
          <div
            className={`codm-ic-badge${hasLightIcon ? " codm-ic-badge-themed" : ""}`}
            aria-hidden="true"
          >
            {icons.map((icon) => (
              <img
                key={icon.src}
                src={icon.src}
                alt=""
                loading="lazy"
                className={icon.theme}
              />
            ))}
          </div>
        )}

        <h3 className="codm-ic-title">{title}</h3>

        {card.cardDescription && (
          <p className="codm-ic-desc">{card.cardDescription}</p>
        )}

        {tags.length > 0 && (
          <ul className="codm-ic-tags">
            {tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        )}
      </div>
    </>
  );

  if (link) {
    return (
      <a
        href={link}
        className="codm-ic-card"
        {...(isExternal(link)
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {body}
      </a>
    );
  }

  return <article className="codm-ic-card">{body}</article>;
}

/* Mobile + tablet: the card grid becomes a swipeable slider.
   Plain <style> (not styled-jsx) so the build never trips on it. */
const SLIDER_CSS = `
.codm-ic-nav { display: none; }

@media (max-width: 1023px) {
  .codm-ic-wrap .codm-ic-grid {
    position: relative;
    display: flex !important;
    grid-template-columns: none !important;
    gap: 16px !important;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    margin-left: -20px;
    margin-right: -20px;
    padding: 4px 20px 8px;
  }
  .codm-ic-wrap .codm-ic-grid::-webkit-scrollbar { display: none; }

  .codm-ic-wrap .codm-ic-grid > * {
    flex: 0 0 82%;
    max-width: 420px;
    scroll-snap-align: start;
    display: flex;
  }
  .codm-ic-wrap .codm-ic-grid > * > .codm-ic-card {
    width: 100%;
    height: auto;
    min-height: 100%;
  }

  .codm-ic-nav {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    margin-top: 18px;
  }
  .codm-ic-arrow {
    display: inline-flex;
    height: 38px;
    width: 38px;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--foreground);
    cursor: pointer;
    transition: opacity 0.2s, border-color 0.2s;
  }
  .codm-ic-arrow:hover { border-color: var(--accent); }
  .codm-ic-arrow:disabled { opacity: 0.35; cursor: default; }
  .codm-ic-dots { display: flex; align-items: center; gap: 6px; }
  .codm-ic-dot {
    height: 7px;
    width: 7px;
    padding: 0;
    border: 0;
    border-radius: 9999px;
    background: var(--border);
    cursor: pointer;
    transition: width 0.25s, background 0.25s;
  }
  .codm-ic-dot[aria-current="true"] {
    width: 22px;
    background: var(--accent);
  }
}

@media (min-width: 640px) and (max-width: 1023px) {
  .codm-ic-wrap .codm-ic-grid { margin-left: -32px; margin-right: -32px; padding-left: 32px; padding-right: 32px; }
  .codm-ic-wrap .codm-ic-grid > * { flex-basis: 46%; }
}
`;

function SliderNav({
  wrapRef,
  count,
}: {
  wrapRef: React.RefObject<HTMLDivElement | null>;
  count: number;
}) {
  const [active, setActive] = useState(0);

  const scroller = useCallback(
    () => wrapRef.current?.querySelector<HTMLElement>(".codm-ic-grid") ?? null,
    [wrapRef]
  );

  useEffect(() => {
    const el = scroller();
    if (!el) return;

    let raf = 0;
    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const kids = Array.from(el.children) as HTMLElement[];
        const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
        let best = 0;
        let bestDist = Infinity;
        kids.forEach((kid, i) => {
          const d = Math.abs(kid.offsetLeft - pad - el.scrollLeft);
          if (d < bestDist) {
            bestDist = d;
            best = i;
          }
        });
        /* at the far end the last card can never reach the left edge */
        if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) {
          best = kids.length - 1;
        }
        setActive(best);
      });
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [scroller, count]);

  const goTo = (index: number) => {
    const el = scroller();
    if (!el) return;
    const kid = el.children[index] as HTMLElement | undefined;
    if (!kid) return;
    const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({
      left: kid.offsetLeft - pad,
      behavior: reduce ? "auto" : "smooth",
    });
  };

  if (count < 2) return null;

  return (
    <div className="codm-ic-nav">
      <button
        type="button"
        className="codm-ic-arrow"
        aria-label="Previous industry"
        disabled={active <= 0}
        onClick={() => goTo(Math.max(0, active - 1))}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 6-6 6 6 6" /></svg>
      </button>

      <div className="codm-ic-dots">
        {Array.from({ length: count }).map((_, i) => (
          <button
            key={i}
            type="button"
            className="codm-ic-dot"
            aria-label={`Go to industry ${i + 1}`}
            aria-current={i === active}
            onClick={() => goTo(i)}
          />
        ))}
      </div>

      <button
        type="button"
        className="codm-ic-arrow"
        aria-label="Next industry"
        disabled={active >= count - 1}
        onClick={() => goTo(Math.min(count - 1, active + 1))}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
      </button>
    </div>
  );
}

export default function IndustryCards() {
  /* null = still loading, [] = loaded but nothing published */
  const [cards, setCards] = useState<Card[] | null>(null);
  const [heading, setHeading] = useState<Heading>(DEFAULT_HEADING);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [cardData, headingData] = await Promise.all([
        wpQuery<{ industryCards: { nodes: Card[] } }>(CARDS_QUERY),
        wpQuery<{
          industryCardsSection: {
            eyebrow: string | null;
            title: string | null;
            description: string | null;
          } | null;
        }>(HEADING_QUERY),
      ]);

      if (cancelled) return;

      setCards(cardData?.industryCards?.nodes ?? []);

      const saved = headingData?.industryCardsSection;

      if (saved) {
        setHeading({
          eyebrow: saved.eyebrow ?? "",
          title: saved.title ?? "",
          description: saved.description ?? "",
        });
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  /* Loaded, but no cards published: hide the whole section */
  if (cards && cards.length === 0) {
    return null;
  }

  return (
    <section className="codm-ic-section">
      <style>{SLIDER_CSS}</style>
      <div className="codm-ic-container">
        {(heading.eyebrow || heading.title) && (
          <Reveal distance={20}>
            <SectionHeading
              eyebrow={heading.eyebrow}
              title={heading.title}
              gradientText=""
              description={heading.description || undefined}
            />
          </Reveal>
        )}

        {cards === null ? (
          <div className="codm-ic-placeholder" aria-hidden="true" />
        ) : (
          <div ref={wrapRef} className="codm-ic-wrap">
            <Stagger className="codm-ic-grid">
              {cards.map((card) => (
                <StaggerItem key={card.id} className="h-full">
                  <IndustryCard card={card} />
                </StaggerItem>
              ))}
            </Stagger>

            <SliderNav wrapRef={wrapRef} count={cards.length} />
          </div>
        )}
      </div>
    </section>
  );
}

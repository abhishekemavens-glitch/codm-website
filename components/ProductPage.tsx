"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";

/* =========================================================
   PRODUCT PAGE TEMPLATE  (one template, many products)

   All content comes from WordPress:
     wp-admin > Product Pages > (one entry per product)

   Used by app/[...slug]/page.tsx for  /products/<slug>

   Sections: hero, quick facts, intro, features, ecosystem,
   process, impact numbers. Each can be switched off in WordPress.
   Images have a light and a dark version (CSS switches them).
   Light/dark colours follow the site theme (CSS variables).
   Features become a swipeable slider on tablet and mobile.

   Place at: components/ProductPage.tsx
   ========================================================= */

type Pair = { light: string; dark: string };

type Fact = { label: string; value: string; icon: string; iconImage: Pair };
type Card = {
  title: string;
  description: string;
  icon: string;
  iconImage: Pair;
  linkLabel: string;
  linkUrl: string;
};

export type ProductPageData = {
  hero: {
    enabled: boolean;
    title: string;
    gradientText: string;
    description: string;
    primaryLabel: string;
    primaryUrl: string;
    secondaryLabel: string;
    secondaryUrl: string;
    image: Pair;
  };
  facts: { enabled: boolean; items: Fact[] };
  intro: {
    enabled: boolean;
    title: string;
    gradientText: string;
    description: string;
    primaryLabel: string;
    primaryUrl: string;
    secondaryLabel: string;
    secondaryUrl: string;
    image: Pair;
  };
  features: {
    enabled: boolean;
    eyebrow: string;
    title: string;
    gradientText: string;
    description: string;
    cards: Card[];
  };
  ecosystem: {
    enabled: boolean;
    title: string;
    gradientText: string;
    description: string;
    buttonLabel: string;
    buttonUrl: string;
    image: Pair;
  };
  process: {
    enabled: boolean;
    title: string;
    gradientText: string;
    description: string;
    image: Pair;
    steps: { title: string; description: string }[];
  };
  stats: {
    enabled: boolean;
    eyebrow: string;
    title: string;
    gradientText: string;
    description: string;
    items: { value: string; label: string }[];
  };
  shared: {
    showIndustries: boolean;
    showBlogs: boolean;
    showCta: boolean;
  };
};

/* ---------------------------------------------------------
   Small helpers
   --------------------------------------------------------- */

const isExternal = (href: string) => /^(https?:)?\/\//i.test(href);

function SmartLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  if (isExternal(href) || href.startsWith("#") || href.startsWith("mailto:")) {
    return (
      <a
        href={href}
        className={className}
        {...(isExternal(href)
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

/** Light + dark image. CSS shows the right one for the current theme. */
function ThemedImg({
  pair,
  className,
}: {
  pair: Pair | undefined;
  className?: string;
}) {
  const light = pair?.light || "";
  const dark = pair?.dark || "";
  const base = light || dark;

  if (!base) return null;

  if (light && dark && light !== dark) {
    return (
      <>
        <img src={light} alt="" className={`${className ?? ""} codm-pp-light`} />
        <img src={dark} alt="" className={`${className ?? ""} codm-pp-dark`} />
      </>
    );
  }

  return <img src={base} alt="" className={className} />;
}

function Heading({
  eyebrow = "",
  title,
  gradientText,
  description,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  gradientText: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <SectionHeading
      align={align}
      eyebrow={eyebrow}
      title={title}
      gradientText={gradientText}
      description={description || undefined}
    />
  );
}

/* ---------------------------------------------------------
   Built-in icons
   --------------------------------------------------------- */

function BuiltInIcon({ type }: { type: string }) {
  const p = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className: "codm-pp-svg",
  };

  switch (type) {
    case "crm":
      return (
        <svg {...p}>
          <rect x="3" y="4" width="18" height="13" rx="2" />
          <path d="M8 21h8M12 17v4M7 13l3-3 3 2 4-4" />
        </svg>
      );
    case "users":
      return (
        <svg {...p}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
          <circle cx="17" cy="9" r="2.4" />
          <path d="M16 14.2c2.9.2 5 2.4 5 5.3" />
        </svg>
      );
    case "cloud":
      return (
        <svg {...p}>
          <path d="M7.5 18h9a4.5 4.5 0 0 0 .5-8.97A6 6 0 0 0 5.4 10.2 4 4 0 0 0 7.5 18Z" />
        </svg>
      );
    case "industries":
      return (
        <svg {...p}>
          <path d="M3 21V9l6 3V9l6 3V5h6v16H3Z" />
          <path d="M8 21v-4M13 21v-4M18 9h.01M18 13h.01" />
        </svg>
      );
    case "target":
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1.2" />
        </svg>
      );
    case "bolt":
      return (
        <svg {...p}>
          <path d="M13 3 5 13h6l-1 8 8-10h-6l1-8Z" />
        </svg>
      );
    case "ai":
      return (
        <svg {...p}>
          <rect x="6" y="6" width="12" height="12" rx="2" />
          <path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" />
          <path d="M9.5 14.5l1.5-5 1.5 5M10 13h2" />
        </svg>
      );
    case "chart":
      return (
        <svg {...p}>
          <path d="M4 20h16" />
          <path d="M6 20v-5h3v5M11 20v-8h3v8M16 20v-11h3v11" />
        </svg>
      );
    case "link":
      return (
        <svg {...p}>
          <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
          <path d="M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.7l1-1" />
        </svg>
      );
    case "shield":
      return (
        <svg {...p}>
          <path d="M12 3l7 3v5c0 4.5-3 7.8-7 10-4-2.2-7-5.5-7-10V6l7-3z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "globe":
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18" />
        </svg>
      );
    case "code":
      return (
        <svg {...p}>
          <path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14" />
        </svg>
      );
    case "database":
      return (
        <svg {...p}>
          <ellipse cx="12" cy="5" rx="7" ry="3" />
          <path d="M5 5v7c0 1.7 3.1 3 7 3s7-1.3 7-3V5" />
          <path d="M5 12v7c0 1.7 3.1 3 7 3s7-1.3 7-3v-7" />
        </svg>
      );
    case "settings":
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
        </svg>
      );
    case "mail":
      return (
        <svg {...p}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      );
    case "layers":
    default:
      return (
        <svg {...p}>
          <path d="m12 4 8 4-8 4-8-4 8-4z" />
          <path d="m4 12 8 4 8-4" />
          <path d="m4 16 8 4 8-4" />
        </svg>
      );
  }
}

function IconBox({
  icon,
  image,
  className,
}: {
  icon: string;
  image: Pair;
  className: string;
}) {
  const hasImage = Boolean(image?.light || image?.dark);

  return (
    <span className={className} aria-hidden="true">
      {hasImage ? (
        <ThemedImg pair={image} className="codm-pp-icon-img" />
      ) : (
        <BuiltInIcon type={icon} />
      )}
    </span>
  );
}

/* ---------------------------------------------------------
   Styles (plain <style> so the build never trips on it)
   --------------------------------------------------------- */

const CSS = `
.codm-pp { color: var(--foreground); }
.codm-pp-wrap { max-width: 1250px; margin: 0 auto; padding: 0 20px; }
@media (min-width: 640px) { .codm-pp-wrap { padding: 0 32px; } }

/* light / dark image switching */
.codm-pp-dark { display: none; }
[data-theme="dark"] .codm-pp-light, .dark .codm-pp-light { display: none; }
[data-theme="dark"] .codm-pp-dark, .dark .codm-pp-dark { display: block; }

/* breadcrumb */
.codm-pp-crumbs { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin: 0 0 22px; padding: 0; list-style: none; font-size: 13px; color: var(--muted); }
.codm-pp-crumbs a { color: var(--muted); text-decoration: none; transition: color 200ms; }
.codm-pp-crumbs a:hover { color: var(--foreground); }
.codm-pp-crumbs li:last-child { color: var(--accent); }
.codm-pp-crumbs li + li::before { content: "\\203A"; margin-right: 8px; opacity: 0.6; }

/* buttons */
/* PRODUCT PAGE BUTTONS — MATCH INDUSTRIES */

.codm-pp-btns {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  margin-top: 28px;
}

.codm-pp-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 54px;
  padding: 15px 31px;
  border-radius: 9999px;
  font-size: 16px;
  font-weight: 500;
  line-height: 1;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  transition: transform 250ms ease,
    box-shadow 250ms ease,
    border-color 250ms ease,
    background 250ms ease;
}

.codm-pp-btn:hover {
  transform: translateY(-2px);
}

.codm-pp-btn-primary {
  color: #fff;
  background: linear-gradient(110deg, #8957f5, #5145e8);
  box-shadow: 0 12px 26px rgba(109, 74, 255, 0.28);
}

.codm-pp-btn-primary:hover {
  box-shadow: 0 15px 32px rgba(109, 74, 255, 0.4);
}

.codm-pp-btn-ghost {
  color: var(--foreground);
  border: 1px solid rgba(255, 255, 255, 0.85);
  background: rgba(255, 255, 255, 0.24);
  backdrop-filter: blur(8px);
}

.codm-pp-btn-ghost:hover {
  border-color: #8b6cf6;
  background: rgba(255, 255, 255, 0.4);
}

.codm-pp-btn svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

@media (max-width: 600px) {
  .codm-pp-btns {
    gap: 10px;
  }

  .codm-pp-btn {
    min-height: 46px;
    padding: 12px 20px;
    font-size: 14px;
  }
}

/* two-column rows (hero / intro / ecosystem / process) */
.codm-pp-split { display: grid; gap: 40px; align-items: center; grid-template-columns: minmax(0, 1fr); }
@media (min-width: 1024px) {
  .codm-pp-split { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 64px; }
  .codm-pp-split-hero { grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr); }
  .codm-pp-split-flip .codm-pp-media { order: -1; }
}
.codm-pp-media img { display: block; width: 100%; height: auto; border-radius: 18px; }
.codm-pp-desc { margin: 18px 0 0; max-width: 560px; font-size: 16px; line-height: 1.7; color: var(--muted); }

/* hero */
.codm-pp-hero { position: relative; overflow: hidden; padding: 128px 0 48px; background: var(--background); }
@media (min-width: 768px) { .codm-pp-hero { padding: 144px 0 64px; } }
.codm-pp-hero-glow { position: absolute; right: -8%; top: -10%; width: 640px; height: 460px; border-radius: 9999px; filter: blur(130px); pointer-events: none; background: radial-gradient(circle, rgba(114,92,255,0.18), transparent 70%); }
.codm-pp-h1 { margin: 0; font-size: clamp(34px, 4.4vw, 56px); font-weight: 400; line-height: 1.1; letter-spacing: -0.03em; color: var(--foreground); }
.codm-pp-grad { background: linear-gradient(90deg, #6d4aff, #9b86ff); -webkit-background-clip: text; background-clip: text; color: transparent; -webkit-text-fill-color: transparent; }

/* facts strip */
.codm-pp-facts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); margin-top: 48px; border: 1px solid var(--border); border-radius: 22px; background: color-mix(in srgb, var(--surface) 60%, transparent); overflow: hidden; }
@media (min-width: 1024px) { .codm-pp-facts { grid-template-columns: repeat(4, minmax(0, 1fr)); } .codm-pp-facts[data-count="3"] { grid-template-columns: repeat(3, minmax(0, 1fr)); } .codm-pp-facts[data-count="5"] { grid-template-columns: repeat(5, minmax(0, 1fr)); } }
.codm-pp-fact { display: flex; align-items: center; gap: 14px; padding: 22px 24px; border-top: 1px solid var(--border); }
.codm-pp-fact:nth-child(-n+2) { border-top: 0; }
.codm-pp-fact:nth-child(even) { border-left: 1px solid var(--border); }
@media (min-width: 1024px) {
  .codm-pp-fact, .codm-pp-fact:nth-child(-n+2) { border-top: 0; }
  .codm-pp-fact { border-left: 1px solid var(--border); }
  .codm-pp-fact:first-child { border-left: 0; }
}
.codm-pp-fact-icon { display: inline-flex; flex: none; align-items: center; justify-content: center; width: 40px; height: 40px; color: var(--accent); }
.codm-pp-fact-label { display: block; font-size: 12px; color: var(--muted); }
.codm-pp-fact-value { display: block; margin-top: 2px; font-size: 15px; font-weight: 600; color: var(--foreground); }
.codm-pp-svg { width: 26px; height: 26px; }
.codm-pp-icon-img { width: 100%; height: 100%; object-fit: contain; border-radius: 0 !important; }

/* generic band */
.codm-pp-band { padding: 64px 0; background: var(--background); }
.codm-pp-band-alt { background: color-mix(in srgb, var(--surface) 55%, var(--background)); }
@media (min-width: 768px) { .codm-pp-band { padding: 88px 0; } }

/* features */
.codm-pp-cards { display: grid; gap: 20px; margin-top: 40px; grid-template-columns: repeat(3, minmax(0, 1fr)); }
.codm-pp-card { display: flex; flex-direction: column; padding: 26px; border: 1px solid var(--border); border-radius: 20px; background: color-mix(in srgb, var(--surface) 65%, transparent); transition: transform 300ms ease, border-color 300ms ease, box-shadow 300ms ease; }
.codm-pp-card:hover { transform: translateY(-3px); border-color: var(--accent); box-shadow: 0 16px 40px rgba(79, 70, 229, 0.12); }
.codm-pp-card-icon { display: inline-flex; width: 44px; height: 44px; align-items: center; justify-content: center; color: var(--accent); }
.codm-pp-card-title { margin: 18px 0 0; font-size: 18px; font-weight: 600; line-height: 1.3; color: var(--foreground); }
.codm-pp-card-desc { margin: 10px 0 0; font-size: 14px; line-height: 1.65; color: var(--muted); }
.codm-pp-card-link { margin-top: auto; padding-top: 18px; font-size: 13px; font-weight: 500; color: var(--accent); text-decoration: none; }
.codm-pp-card-link:hover { text-decoration: underline; }
.codm-pp-nav { display: none; }

@media (max-width: 1023px) {
  .codm-pp-cards { display: flex; gap: 14px; overflow-x: auto; overflow-y: hidden; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; scrollbar-width: none; position: relative; margin: 32px -20px 0; padding: 4px 20px 8px; }
  .codm-pp-cards::-webkit-scrollbar { display: none; }
  .codm-pp-card { flex: 0 0 80%; max-width: 380px; scroll-snap-align: start; }
  .codm-pp-nav { display: flex; align-items: center; justify-content: center; gap: 14px; margin-top: 18px; }
  .codm-pp-arrow { display: inline-flex; height: 38px; width: 38px; align-items: center; justify-content: center; border-radius: 9999px; border: 1px solid var(--border); background: var(--surface); color: var(--foreground); cursor: pointer; transition: opacity 0.2s, border-color 0.2s; }
  .codm-pp-arrow:hover { border-color: var(--accent); }
  .codm-pp-arrow:disabled { opacity: 0.35; cursor: default; }
  .codm-pp-dots { display: flex; align-items: center; gap: 6px; }
  .codm-pp-dot { height: 7px; width: 7px; padding: 0; border: 0; border-radius: 9999px; background: var(--border); cursor: pointer; transition: width 0.25s, background 0.25s; }
  .codm-pp-dot[aria-current="true"] { width: 22px; background: var(--accent); }
}
@media (min-width: 640px) and (max-width: 1023px) {
  .codm-pp-cards { margin-left: -32px; margin-right: -32px; padding-left: 32px; padding-right: 32px; }
  .codm-pp-card { flex-basis: 44%; }
}

/* process */
.codm-pp-steps { display: grid; gap: 14px; margin: 28px 0 0; padding: 0; list-style: none; }
.codm-pp-step { display: flex; align-items: flex-start; gap: 14px; }
.codm-pp-step-dot { display: inline-flex; flex: none; width: 24px; height: 24px; margin-top: 1px; align-items: center; justify-content: center; border-radius: 9999px; border: 1.5px solid var(--accent); color: var(--accent); background: color-mix(in srgb, var(--accent) 12%, transparent); }
.codm-pp-step-dot svg { width: 12px; height: 12px; }
.codm-pp-step-title { display: block; font-size: 17px; line-height: 1.35; color: var(--foreground); }
.codm-pp-step-text { display: block; margin-top: 2px; font-size: 14px; color: var(--muted); }

/* stats */
.codm-pp-stats { display: grid; margin-top: 44px; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 32px 0; }
@media (min-width: 1024px) { .codm-pp-stats { grid-template-columns: repeat(4, minmax(0, 1fr)); } .codm-pp-stats[data-count="3"] { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.codm-pp-stat { padding: 4px 16px; text-align: center; }
.codm-pp-stat + .codm-pp-stat { border-left: 1px solid var(--border); }
@media (max-width: 1023px) { .codm-pp-stat:nth-child(odd) { border-left: 0; } }
.codm-pp-stat-value { display: block; font-size: clamp(30px, 3.4vw, 42px); font-weight: 400; letter-spacing: -0.02em; color: var(--foreground); }
.codm-pp-stat-label { display: block; margin-top: 6px; font-size: 14px; color: var(--muted); }

@media (prefers-reduced-motion: reduce) {
  .codm-pp-btn, .codm-pp-card { transition: none; }
  .codm-pp-btn:hover, .codm-pp-card:hover { transform: none; }
}
`;

/* ---------------------------------------------------------
   Feature slider navigation (tablet + mobile)
   --------------------------------------------------------- */

function SliderNav({
  trackRef,
  count,
}: {
  trackRef: React.RefObject<HTMLDivElement | null>;
  count: number;
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = trackRef.current;
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
  }, [trackRef, count]);

  const goTo = (index: number) => {
    const el = trackRef.current;
    const kid = el?.children[index] as HTMLElement | undefined;
    if (!el || !kid) return;
    const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({
      left: kid.offsetLeft - pad,
      behavior: reduce ? "auto" : "smooth",
    });
  };

  if (count < 2) return null;

  return (
    <div className="codm-pp-nav">
      <button
        type="button"
        className="codm-pp-arrow"
        aria-label="Previous"
        disabled={active <= 0}
        onClick={() => goTo(Math.max(0, active - 1))}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 6-6 6 6 6" /></svg>
      </button>

      <div className="codm-pp-dots">
        {Array.from({ length: count }).map((_, i) => (
          <button
            key={i}
            type="button"
            className="codm-pp-dot"
            aria-label={`Go to card ${i + 1}`}
            aria-current={i === active}
            onClick={() => goTo(i)}
          />
        ))}
      </div>

      <button
        type="button"
        className="codm-pp-arrow"
        aria-label="Next"
        disabled={active >= count - 1}
        onClick={() => goTo(Math.min(count - 1, active + 1))}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
      </button>
    </div>
  );
}

const Arrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);

const Play = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="m10 8.5 5 3.5-5 3.5v-7Z" /></svg>
);

function Buttons({
  primaryLabel,
  primaryUrl,
  secondaryLabel,
  secondaryUrl,
}: {
  primaryLabel: string;
  primaryUrl: string;
  secondaryLabel: string;
  secondaryUrl: string;
}) {
  if (!primaryLabel && !secondaryLabel) return null;

  return (
    <div className="codm-pp-btns">
      {primaryLabel && (
        <SmartLink
          href={primaryUrl || "/contact"}
          className="codm-pp-btn codm-pp-btn-primary"
        >
          {primaryLabel}
          <Arrow />
        </SmartLink>
      )}

      {secondaryLabel && (
        <SmartLink
          href={secondaryUrl || "#"}
          className="codm-pp-btn codm-pp-btn-ghost"
        >
          {secondaryLabel}
          <Play />
        </SmartLink>
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   Page
   --------------------------------------------------------- */

export default function ProductPage({
  title,
  data,
}: {
  title: string;
  data: ProductPageData;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const { hero, facts, intro, features, ecosystem, process, stats } = data;

  const factItems = (facts?.items ?? []).filter((f) => f.label || f.value);
  const cards = (features?.cards ?? []).filter((c) => c.title || c.description);
  const steps = (process?.steps ?? []).filter((s) => s.title);
  const statItems = (stats?.items ?? []).filter((s) => s.value || s.label);

  return (
    <div className="codm-pp">
      <style>{CSS}</style>

{/* =============== HERO =============== */}
{hero?.enabled && (
  <section className="codm-hero-section relative overflow-hidden">
    <div className="mx-auto grid max-w-[1240px] items-center gap-12 px-6 pb-20 pt-[150px] min-h-[620px] lg:grid-cols-2">

      {/* LEFT: BREADCRUMB + CONTENT */}
      <div>
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[16px]">
          <Link href="/" className="codm-hero-breadcrumb-link transition-colors">
            Home
          </Link>

          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            className="codm-hero-chevron"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>

          <Link href="/products" className="codm-hero-breadcrumb-link transition-colors">
            Products
          </Link>

          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            className="codm-hero-chevron"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>

          <span aria-current="page" className="text-[#8b6cf6]">
            {title}
          </span>
        </nav>

        <h1 className="mt-6 max-w-[640px] text-[clamp(40px,5.2vw,68px)] font-normal leading-[1.05] tracking-[-0.035em] text-[var(--foreground)] [text-wrap:balance]">
          {hero.title}
          {hero.gradientText && (
            <>
              {" "}
              <span className="codm-pp-grad">{hero.gradientText}</span>
            </>
          )}
        </h1>

        {hero.description && (
          <p className="codm-hero-body mt-6 max-w-[560px] text-[clamp(16px,1.4vw,19px)] leading-[1.65]">
            {hero.description}
          </p>
        )}

        <Buttons
          primaryLabel={hero.primaryLabel}
          primaryUrl={hero.primaryUrl}
          secondaryLabel={hero.secondaryLabel}
          secondaryUrl={hero.secondaryUrl}
        />
      </div>

      {/* RIGHT: PRODUCT IMAGE */}
      {(hero.image?.light || hero.image?.dark) && (
        <div className="flex justify-center lg:justify-end">
          <div className="w-full max-w-[560px]">
            <ThemedImg pair={hero.image} />
          </div>
        </div>
      )}

      {/* QUICK FACTS */}
      {facts?.enabled && factItems.length > 0 && (
        <div className="col-span-full">
          <Reveal distance={20}>
            <div className="codm-pp-facts" data-count={factItems.length}>
              {factItems.map((fact, i) => (
                <div key={`${fact.label}-${i}`} className="codm-pp-fact">
                  <IconBox
                    icon={fact.icon}
                    image={fact.iconImage}
                    className="codm-pp-fact-icon"
                  />
                  <div>
                    <span className="codm-pp-fact-label">{fact.label}</span>
                    <span className="codm-pp-fact-value">{fact.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      )}

    </div>
  </section>
)}

      {/* =============== INTRO =============== */}
      {intro?.enabled && (
        <section className="codm-pp-band codm-pp-band-alt">
          <div className="codm-pp-wrap">
            <div className="codm-pp-split">
              <Reveal distance={20}>
                <div>
                  <Heading
                    title={intro.title}
                    gradientText={intro.gradientText}
                    description={intro.description}
                  />
                  <Buttons
                    primaryLabel={intro.primaryLabel}
                    primaryUrl={intro.primaryUrl}
                    secondaryLabel={intro.secondaryLabel}
                    secondaryUrl={intro.secondaryUrl}
                  />
                </div>
              </Reveal>

              {(intro.image?.light || intro.image?.dark) && (
                <Reveal distance={30} duration={0.8}>
                  <div className="codm-pp-media">
                    <ThemedImg pair={intro.image} />
                  </div>
                </Reveal>
              )}
            </div>
          </div>
        </section>
      )}

      {/* =============== FEATURES =============== */}
      {features?.enabled && cards.length > 0 && (
        <section className="codm-pp-band">
          <div className="codm-pp-wrap">
            <Reveal distance={20}>
              <Heading
                eyebrow={features.eyebrow}
                title={features.title}
                gradientText={features.gradientText}
                description={features.description}
              />
            </Reveal>

            <div ref={trackRef} className="codm-pp-cards">
              {cards.map((card, i) => (
                <article key={`${card.title}-${i}`} className="codm-pp-card">
                  <IconBox
                    icon={card.icon}
                    image={card.iconImage}
                    className="codm-pp-card-icon"
                  />
                  {card.title && <h3 className="codm-pp-card-title">{card.title}</h3>}
                  {card.description && (
                    <p className="codm-pp-card-desc">{card.description}</p>
                  )}
                  {card.linkLabel && card.linkUrl && (
                    <SmartLink href={card.linkUrl} className="codm-pp-card-link">
                      {card.linkLabel} &rarr;
                    </SmartLink>
                  )}
                </article>
              ))}
            </div>

            <SliderNav trackRef={trackRef} count={cards.length} />
          </div>
        </section>
      )}

      {/* =============== ECOSYSTEM =============== */}
      {ecosystem?.enabled && (
        <section className="codm-pp-band codm-pp-band-alt">
          <div className="codm-pp-wrap">
            <div className="codm-pp-split">
              <Reveal distance={20}>
                <div>
                  <Heading
                    title={ecosystem.title}
                    gradientText={ecosystem.gradientText}
                    description={ecosystem.description}
                  />
                  {ecosystem.buttonLabel && (
                    <div className="codm-pp-btns">
                      <SmartLink
                        href={ecosystem.buttonUrl || "/contact"}
                        className="codm-pp-btn codm-pp-btn-primary"
                      >
                        {ecosystem.buttonLabel}
                        <Arrow />
                      </SmartLink>
                    </div>
                  )}
                </div>
              </Reveal>

              {(ecosystem.image?.light || ecosystem.image?.dark) && (
                <Reveal distance={30} duration={0.8}>
                  <div className="codm-pp-media">
                    <ThemedImg pair={ecosystem.image} />
                  </div>
                </Reveal>
              )}
            </div>
          </div>
        </section>
      )}

      {/* =============== PROCESS =============== */}
      {process?.enabled && (
        <section className="codm-pp-band">
          <div className="codm-pp-wrap">
            <div className="codm-pp-split codm-pp-split-flip">
              <Reveal distance={20}>
                <div>
                  <Heading
                    title={process.title}
                    gradientText={process.gradientText}
                    description={process.description}
                  />

                  {steps.length > 0 && (
                    <ol className="codm-pp-steps">
                      {steps.map((step, i) => (
                        <li key={`${step.title}-${i}`} className="codm-pp-step">
                          <span className="codm-pp-step-dot" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-10" /></svg>
                          </span>
                          <span>
                            <span className="codm-pp-step-title">{step.title}</span>
                            {step.description && (
                              <span className="codm-pp-step-text">{step.description}</span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </Reveal>

              {(process.image?.light || process.image?.dark) && (
                <Reveal distance={30} duration={0.8}>
                  <div className="codm-pp-media">
                    <ThemedImg pair={process.image} />
                  </div>
                </Reveal>
              )}
            </div>
          </div>
        </section>
      )}

      {/* =============== IMPACT NUMBERS =============== */}
      {stats?.enabled && statItems.length > 0 && (
        <section className="codm-pp-band codm-pp-band-alt">
          <div className="codm-pp-wrap">
            <Reveal distance={20}>
              <div className="mx-auto max-w-[1100px] text-center">
                <Heading
                  align="center"
                  eyebrow={stats.eyebrow}
                  title={stats.title}
                  gradientText={stats.gradientText}
                  description={stats.description}
                />
              </div>
            </Reveal>

            <Reveal distance={20}>
              <div className="codm-pp-stats" data-count={statItems.length}>
                {statItems.map((stat, i) => (
                  <div key={`${stat.value}-${i}`} className="codm-pp-stat">
                    <span className="codm-pp-stat-value">{stat.value}</span>
                    <span className="codm-pp-stat-label">{stat.label}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      )}
    </div>
  );
}

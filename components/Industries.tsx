"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import SectionHeading from "@/components/SectionHeading";
import { useInViewOnce, useParallax, splitWords } from "@/lib/codm-animations";
import { Reveal } from "@/components/Reveal";

type Industry = {
  id: string;
  databaseId: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: {
    node: {
      sourceUrl: string;
      altText: string;
    } | null;
  } | null;
};

const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

/** Time (ms) between automatic industry changes. 7000 = 7 seconds. */
const AUTO_ROTATE_MS = 7000;

/** Keep each industry only once (by slug, then by title). */
function dedupeIndustries(list: Industry[]): Industry[] {
  const seenSlugs = new Set<string>();
  const seenTitles = new Set<string>();
  const out: Industry[] = [];

  for (const item of list) {
    const slug = (item.slug || "").trim().toLowerCase();
    const title = (item.title || "").trim().toLowerCase();
    if ((slug && seenSlugs.has(slug)) || (title && seenTitles.has(title))) {
      continue;
    }
    if (slug) seenSlugs.add(slug);
    if (title) seenTitles.add(title);
    out.push(item);
  }
  return out;
}

export default function Industries() {
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [activeIndustry, setActiveIndustry] = useState(0);
  const [loading, setLoading] = useState(true);

  // bumped on every manual selection so the auto-rotate timer restarts
  const [resetTick, setResetTick] = useState(0);

  const active = industries[activeIndustry];

  const { ref: sectionRef, isVisible } = useInViewOnce<HTMLElement>(0.12);

  const { ref: imageParallaxRef, offset: imageOffset } =
    useParallax<HTMLDivElement>(0.06);

  const [titleVisible, setTitleVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    setTitleVisible(false);
    setContentVisible(false);
    const frame = window.requestAnimationFrame(() => {
      setTitleVisible(true);
      setContentVisible(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [active?.id]);

  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50 });

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    setTilt({ x: (py - 0.5) * -6, y: (px - 0.5) * 6 });
    setSpotlight({ x: px * 100, y: py * 100 });
  };

  const handleCardMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  /* ---------------------------------------------------------
     LOAD INDUSTRIES (de-duplicated)
     --------------------------------------------------------- */
  useEffect(() => {
    async function loadIndustries() {
      try {
        const response = await fetch(WORDPRESS_GRAPHQL_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
              query GetIndustries {
                industries(
                  first: 20
                  where: {
                    orderby: [
                      { field: MENU_ORDER, order: ASC }
                      { field: DATE, order: ASC }
                    ]
                  }
                ) {
                  nodes {
                    id
                    databaseId
                    title
                    slug
                    excerpt
                    content
                    featuredImage {
                      node {
                        sourceUrl
                        altText
                      }
                    }
                  }
                }
              }
            `,
          }),
        });

        const result = await response.json();

        if (result.errors) {
          console.error("GraphQL Error:", result.errors);
          return;
        }

        setIndustries(dedupeIndustries(result.data.industries.nodes));
      } catch (error) {
        console.error("Failed to load industries:", error);
      } finally {
        setLoading(false);
      }
    }

    loadIndustries();
  }, []);

  /* ---------------------------------------------------------
     MANUAL SELECTION (tab click / arrows) — restarts the timer
     --------------------------------------------------------- */
  const selectIndustry = useCallback((index: number) => {
    setActiveIndustry(index);
    setResetTick((t) => t + 1);
  }, []);

  /* ---------------------------------------------------------
     AUTO ROTATION
     The timer restarts whenever activeIndustry or resetTick
     changes, so after a manual click the next auto change
     happens a full interval later.
     --------------------------------------------------------- */
  useEffect(() => {
    if (industries.length < 2) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduceMotion) return;

    const id = window.setInterval(() => {
      if (document.hidden) return;
      setActiveIndustry((i) => (i + 1) % industries.length);
    }, AUTO_ROTATE_MS);

    return () => window.clearInterval(id);
  }, [industries.length, activeIndustry, resetTick]);

  /* ---------------------------------------------------------
     TABS SLIDER (single row, arrows, swipe)
     --------------------------------------------------------- */
  const trackRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });

    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);

    return () => {
      el.removeEventListener("scroll", updateArrows);
      ro.disconnect();
    };
  }, [industries.length, updateArrows]);

  // keep the active tab centred inside the slider (only the slider
  // scrolls — never the page)
  useEffect(() => {
    const track = trackRef.current;
    const pill = pillRefs.current[activeIndustry];
    if (!track || !pill) return;

    const left = pill.offsetLeft - (track.clientWidth - pill.offsetWidth) / 2;
    track.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [activeIndustry, industries.length]);

  const scrollTabs = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.7, behavior: "smooth" });
  };

  const cardStyle: React.CSSProperties & {
    "--spot-x"?: string;
    "--spot-y"?: string;
  } = {
    transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
    "--spot-x": `${spotlight.x}%`,
    "--spot-y": `${spotlight.y}%`,
  };

  const imageWrapperStyle: React.CSSProperties = {
    transform: `translate3d(0, ${imageOffset}px, 0)`,
  };

  return (
    <>
      <section
        id="industries"
        ref={sectionRef}
        className={
          "codm-industries-section relative overflow-hidden bg-[var(--background)] py-24 transition-colors duration-500 md:py-32 " +
          (isVisible ? "codm-industries-visible codm-visible" : "")
        }
      >
        <div
          aria-hidden="true"
          className="codm-industries-glow pointer-events-none absolute left-1/2 top-[0%] h-[500px] w-[800px] -translate-x-1/2 rounded-full"
        />
        <div
          aria-hidden="true"
          className="codm-industries-glow-secondary pointer-events-none absolute left-[10%] top-[35%] h-[350px] w-[350px] rounded-full"
        />

        <div className="relative mx-auto max-w-[1250px] px-5 sm:px-8">
          <div
            className={
              "codm-industries-heading codm-section-heading-reveal " +
              (isVisible ? "codm-section-heading-reveal-in" : "")
            }
          >
            <SectionHeading
              eyebrow="Industries We Serve"
              title="Engineering the systems that run"
              gradientText="Modern enterprises."
              description="We combine Salesforce depth with product-grade engineering, so transformation lands as working software not slideware."
            />
          </div>

          {/* =================================================
              TABS — one row, slider arrows, swipe, auto-centre
              ================================================= */}
          <div className="codm-industries-tabs relative mx-auto mt-9 max-w-[1150px]">
            {loading ? (
              <div className="text-center text-sm text-[var(--muted)]">
                Loading industries...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Previous industries"
                  onClick={() => scrollTabs(-1)}
                  disabled={!canScrollLeft}
                  className="codm-tabs-arrow hidden md:flex"
                >
                  {"←"}
                </button>

                <div
                  ref={trackRef}
                  className="codm-pills-track relative min-w-0 flex-1 overflow-x-auto"
                >
                  {/* w-max + mx-auto: centred when everything fits,
                      scrolls from the left when it doesn't */}
                  <div className="codm-industries-pills codm-stagger-grid mx-auto flex w-max flex-nowrap gap-2.5 px-1 py-1">
                    {industries.map((industry, index) => {
                      const isActive = index === activeIndustry;
                      const pillStyle: React.CSSProperties & {
                        "--pill-delay"?: string;
                      } = {
                        "--pill-delay": `${index * 70}ms`,
                      };

                      return (
                        <button
                          key={industry.id}
                          ref={(el) => {
                            pillRefs.current[index] = el;
                          }}
                          type="button"
                          onClick={() => selectIndustry(index)}
                          style={pillStyle}
                          aria-pressed={isActive}
                          className={
                            "codm-industry-pill codm-stagger-item shrink-0 whitespace-nowrap rounded-full border px-4 py-2.5 text-xs font-medium " +
                            (isActive
                              ? "codm-industry-pill-active border-[var(--accent)] bg-[var(--accent)] text-white"
                              : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--foreground)]")
                          }
                        >
                          {industry.title}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  aria-label="Next industries"
                  onClick={() => scrollTabs(1)}
                  disabled={!canScrollRight}
                  className="codm-tabs-arrow hidden md:flex"
                >
                  {"→"}
                </button>
              </div>
            )}
          </div>

          {active && (
            <Reveal className="mt-9 md:mt-12" distance={40} duration={0.8}>
              <div
                key={active.id}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
                style={cardStyle}
                className="codm-industry-card codm-industry-swap overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface)]"
              >
                <div aria-hidden="true" className="codm-industry-spotlight" />

                <div className="grid items-center lg:grid-cols-[1fr_0.95fr]">
                  {/* =================================================
                      CONTENT
                      ================================================= */}
                  <div
                    className={
                      "codm-industry-card-content order-2 p-8 md:p-12 lg:order-1 lg:pl-12 xl:p-16 " +
                      (isVisible ? "codm-industry-content-in" : "")
                    }
                  >
                    <div className="max-w-[500px]">
                      <div className="codm-industry-accent mb-6 h-[2px] w-10 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#4F46E5]" />

                      <h3
                        className={
                          "codm-word-stagger codm-industry-title-reveal text-3xl font-semibold leading-[1.08] tracking-[-0.045em] text-[var(--foreground)] md:text-4xl " +
                          (titleVisible ? "codm-industry-title-visible" : "")
                        }
                      >
                        {splitWords(active.title)}
                      </h3>

                      <p
                        className={
                          "codm-industry-text-reveal mt-5 text-sm leading-6 text-[var(--muted)] md:text-[15px] " +
                          (isVisible && contentVisible
                            ? "codm-industry-text-reveal-in"
                            : "")
                        }
                        dangerouslySetInnerHTML={{
                          __html: active.content || active.excerpt,
                        }}
                      />

                      <a
                        href={"/industries/" + active.slug}
                        className={
                          "codm-industry-view-link codm-industry-link-reveal mt-7 inline-flex items-center gap-2 text-sm font-medium text-[var(--foreground)] " +
                          (isVisible && contentVisible
                            ? "codm-industry-link-reveal-in"
                            : "")
                        }
                      >
                        <span>View all</span>

                        <span className="codm-industry-arrow">{"→"}</span>
                      </a>
                    </div>
                  </div>

                  {/* =================================================
                      IMAGE
                      ================================================= */}
                  <div
                    ref={imageParallaxRef}
                    style={imageWrapperStyle}
                    className={
                      "codm-hero-media-scale order-1 p-4 md:p-5 lg:order-2 lg:p-5 " +
                      (isVisible && contentVisible ? "codm-media-loaded" : "")
                    }
                  >
                    <div className="codm-industry-image-container relative aspect-[1.2/1] overflow-hidden rounded-[18px] bg-[#f5f3ff] dark:bg-[#111326]">
                      <div
                        aria-hidden="true"
                        className="codm-industry-image-glow absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                      />

                      {active.featuredImage?.node?.sourceUrl && (
                        <img
                          key={active.id}
                          src={active.featuredImage.node.sourceUrl}
                          alt={active.featuredImage.node.altText || active.title}
                          className="codm-industry-image codm-industry-image-swap relative h-full w-full object-contain p-5 md:p-8"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      <style jsx>{`
        /* =====================================================
           TABS SLIDER
           ===================================================== */

        .codm-pills-track {
          scrollbar-width: none;
          -ms-overflow-style: none;
          -webkit-overflow-scrolling: touch;
          scroll-snap-type: x proximity;
          overscroll-behavior-x: contain;
        }

        .codm-pills-track::-webkit-scrollbar {
          display: none;
        }

        .codm-pills-track :global(.codm-industry-pill) {
          scroll-snap-align: center;
        }

        .codm-tabs-arrow {
          flex: none;
          width: 38px;
          height: 38px;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--foreground);
          font-size: 15px;
          cursor: pointer;
          transition:
            border-color 250ms ease,
            color 250ms ease,
            opacity 250ms ease,
            transform 250ms ease;
        }

        .codm-tabs-arrow:hover:not(:disabled) {
          border-color: var(--accent);
          color: var(--accent);
          transform: scale(1.06);
        }

        .codm-tabs-arrow:disabled {
          opacity: 0.35;
          cursor: default;
        }

        /* =====================================================
           SWITCH ANIMATION — replays every time the industry
           changes (the card and the image are re-mounted by key)
           ===================================================== */

        .codm-industry-swap {
          animation: codmIndustrySwapIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .codm-industry-image-swap {
          animation: codmIndustryImageIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes codmIndustrySwapIn {
          from {
            opacity: 0.35;
            translate: 24px 0;
          }
          to {
            opacity: 1;
            translate: 0 0;
          }
        }

        @keyframes codmIndustryImageIn {
          from {
            opacity: 0;
            transform: scale(0.92);
            filter: blur(6px);
          }
          to {
            opacity: 1;
            transform: scale(1);
            filter: blur(0);
          }
        }

        /* =====================================================
           SECTION HEADING REVEAL — blur-in
           ===================================================== */

        .codm-section-heading-reveal {
          opacity: 0;
          transform: translateY(35px);
          filter: blur(4px);
          transition:
            opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.1s,
            transform 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.1s,
            filter 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.1s;
          will-change: opacity, transform, filter;
        }

        .codm-section-heading-reveal-in {
          opacity: 1;
          transform: translateY(0);
          filter: blur(0);
        }

        .codm-industry-card-content {
          opacity: 0;
          transform: translateY(20px);
          transition:
            opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.15s,
            transform 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.15s;
          will-change: opacity, transform;
        }

        .codm-industry-content-in {
          opacity: 1;
          transform: translateY(0);
        }

        .codm-industry-text-reveal {
          opacity: 0;
          transform: translateY(16px);
          filter: blur(4px);
          transition:
            opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.3s,
            transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.3s,
            filter 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.3s;
          will-change: opacity, transform, filter;
        }

        .codm-industry-text-reveal-in {
          opacity: 1;
          transform: translateY(0);
          filter: blur(0);
        }

        .codm-industry-link-reveal {
          opacity: 0;
          filter: blur(4px);
          translate: 0 14px;
          will-change: opacity, translate, filter;
        }

        .codm-industry-link-reveal-in {
          opacity: 1;
          filter: blur(0);
          translate: 0 0;
        }

        .codm-industry-card {
          position: relative;
          transform-style: preserve-3d;
          transition:
            transform 400ms cubic-bezier(0.22, 1, 0.36, 1),
            border-color 500ms ease,
            box-shadow 700ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .codm-industry-card:hover {
          box-shadow:
            0 35px 100px rgba(0, 0, 0, 0.08),
            0 0 80px rgba(114, 92, 255, 0.05);
        }

        .codm-industry-spotlight {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          opacity: 0;
          background: radial-gradient(
            380px circle at var(--spot-x, 50%) var(--spot-y, 50%),
            rgba(145, 135, 251, 0.14),
            transparent 60%
          );
          transition: opacity 400ms ease;
        }

        .codm-industry-card:hover .codm-industry-spotlight {
          opacity: 1;
        }

        .codm-industry-image-container {
          position: relative;
          box-shadow: 0 0 0 rgba(114, 92, 255, 0);
          transition:
            transform 800ms cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 500ms ease;
          animation: codmIdleFloat 6s ease-in-out infinite;
        }

        .codm-industry-image-container::after {
          content: "";
          position: absolute;
          top: 0;
          left: -60%;
          width: 45%;
          height: 100%;
          background: linear-gradient(
            100deg,
            transparent 0%,
            rgba(255, 255, 255, 0.35) 50%,
            transparent 100%
          );
          transform: skewX(-20deg);
          pointer-events: none;
          z-index: 3;
          transition: left 700ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .codm-industry-image-container:hover {
          transform: scale(0.985);
          box-shadow: 0 25px 60px rgba(114, 92, 255, 0.18);
          animation-play-state: paused;
        }

        .codm-industry-image-container:hover::after {
          left: 130%;
        }

        .codm-industry-image-container:hover .codm-industry-image-glow {
          animation-play-state: paused;
        }

        .codm-industry-image-container:hover .codm-industry-image {
          transform: scale(1.06);
          filter: brightness(1.03) saturate(1.06);
        }

        .codm-industry-image-glow {
          background: radial-gradient(
            circle,
            rgba(114, 92, 255, 0.24),
            transparent 70%
          );
          filter: blur(55px);
          opacity: 0.8;
          animation: codmImageGlow 7s ease-in-out infinite;
        }

        .codm-industries-glow {
          background: radial-gradient(
            circle,
            rgba(114, 92, 255, 0.11),
            transparent 70%
          );
          filter: blur(120px);
          opacity: 0.8;
          animation: codmMainGlow 12s ease-in-out infinite;
        }

        .codm-industries-glow-secondary {
          background: radial-gradient(
            circle,
            rgba(79, 70, 229, 0.06),
            transparent 70%
          );
          filter: blur(100px);
          animation: codmSecondaryGlow 10s ease-in-out infinite;
        }

        .codm-industry-view-link {
          position: relative;
          transition:
            color 300ms ease,
            transform 400ms cubic-bezier(0.22, 1, 0.36, 1),
            opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.45s,
            filter 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.45s,
            translate 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.45s;
        }

        .codm-industry-view-link:hover {
          color: var(--accent);
          transform: translateX(4px);
        }

        .codm-industry-arrow {
          display: inline-block;
          transition: transform 400ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .codm-industry-view-link:hover .codm-industry-arrow {
          transform: translateX(5px);
        }

        @keyframes codmImageGlow {
          0%,
          100% {
            transform: translate(-50%, -50%) scale(0.9);
            opacity: 0.55;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.08);
            opacity: 0.85;
          }
        }

        @keyframes codmMainGlow {
          0%,
          100% {
            transform: translateX(-50%) scale(0.95);
            opacity: 0.6;
          }
          50% {
            transform: translateX(-50%) scale(1.08);
            opacity: 1;
          }
        }

        @keyframes codmSecondaryGlow {
          0%,
          100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(50px, -30px);
          }
        }

        @keyframes codmIdleFloat {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @media (max-width: 767px) {
          .codm-industries-section {
            padding-top: 80px;
            padding-bottom: 80px;
          }

          .codm-industry-card:hover {
            transform: none;
          }

          .codm-industry-image-container:hover {
            transform: none;
            box-shadow: none;
          }

          .codm-industry-image-container:hover::after {
            left: -60%;
          }

          .codm-industry-image-container:hover .codm-industry-image {
            transform: scale(1);
            filter: none;
          }

          .codm-industries-glow {
            width: 500px;
            height: 350px;
          }

          .codm-industries-pills {
            padding-left: 5px;
            padding-right: 5px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .codm-industries-heading,
          .codm-section-heading-reveal,
          .codm-industry-card-content,
          .codm-industry-text-reveal,
          .codm-industry-link-reveal,
          .codm-industry-view-link,
          .codm-industry-card,
          .codm-industry-swap,
          .codm-industry-image-swap,
          .codm-industry-image-container,
          .codm-industry-image {
            transition: none !important;
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
            translate: none !important;
            filter: none !important;
          }

          .codm-industries-glow,
          .codm-industries-glow-secondary,
          .codm-industry-image-glow {
            animation: none !important;
          }

          .codm-industry-image-container::after {
            transition: none !important;
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}

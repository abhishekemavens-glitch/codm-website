"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import SectionHeading from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";

type WhyCodmItem = {
  id: string;
  databaseId: number;
  title: string;
  content: string;
  icon: string;
  featuredImage: {
    node: {
      sourceUrl: string;
      altText: string;
    } | null;
  } | null;
};

const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

/* =========================================================
   ENTRANCE DIRECTIONS (desktop 3-column grid only)
   left column  -> from the left
   right column -> from the right
   middle column -> from the top (first row), bottom (next row)
   ========================================================= */

const SLIDE_DISTANCE = 70;

type Offset = { x: number; y: number; delay: number };

function getOffset(index: number): Offset {
  const col = index % 3;
  const row = Math.floor(index / 3);
  const delay = col * 0.1 + row * 0.15;

  if (col === 0) return { x: -SLIDE_DISTANCE, y: 0, delay };
  if (col === 2) return { x: SLIDE_DISTANCE, y: 0, delay };

  return {
    x: 0,
    y: row % 2 === 0 ? -SLIDE_DISTANCE : SLIDE_DISTANCE,
    delay,
  };
}

const EASE = [0.22, 1, 0.36, 1] as const;

/* The whole box slides in, then its contents rise in one by one */
const boxVariants: Variants = {
  hidden: (o: Offset) => ({ opacity: 0, x: o.x, y: o.y }),
  visible: (o: Offset) => ({
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      duration: 0.8,
      delay: o.delay,
      ease: EASE,
      delayChildren: o.delay + 0.3,
      staggerChildren: 0.12,
    },
  }),
};

const contentVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE },
  },
};

/* =========================================================
   FALLBACK ICONS
   ========================================================= */

function LightIcon({ type }: { type: string }) {
  const common = "h-7 w-7 text-[var(--accent)]";

  if (type === "building") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={common}
      >
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" />
        <path d="M10 21v-3h4v3" />
      </svg>
    );
  }

  if (type === "shield") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={common}
      >
        <path d="M12 3l7 3v5c0 4.5-3 7.8-7 10-4-2.2-7-5.5-7-10V6l7-3z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    );
  }

  if (type === "lock") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={common}
      >
        <rect x="5" y="10" width="14" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </svg>
    );
  }

  if (type === "layers") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={common}
      >
        <path d="m12 4 8 4-8 4-8-4 8-4z" />
        <path d="m4 12 8 4 8-4" />
        <path d="m4 16 8 4 8-4" />
      </svg>
    );
  }

  if (type === "cube") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={common}
      >
        <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3z" />
        <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={common}
    >
      <path d="M5 17a7 7 0 1 1 14 0" />
      <path d="M8 13a4 4 0 0 1 8 0" />
      <path d="M12 9a1 1 0 1 1 0 .01" />
    </svg>
  );
}

/* =========================================================
   MOVING BACKGROUND: drifting blobs + pulsing rings
   ========================================================= */

function AnimatedBackground({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Drifting colour blobs */}
      <motion.div
        className="absolute -left-24 top-8 h-[380px] w-[380px] rounded-full bg-[#7C5CFF]/25 blur-[90px]"
        animate={
          reduceMotion
            ? undefined
            : { x: [0, 70, -20, 0], y: [0, 40, -30, 0], scale: [1, 1.15, 0.95, 1] }
        }
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute -right-24 top-1/3 h-[340px] w-[340px] rounded-full bg-[#FF9FFC]/25 blur-[90px]"
        animate={
          reduceMotion
            ? undefined
            : { x: [0, -60, 20, 0], y: [0, -40, 30, 0], scale: [1, 0.92, 1.12, 1] }
        }
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute -bottom-24 left-1/3 h-[320px] w-[320px] rounded-full bg-[#5227FF]/15 blur-[90px]"
        animate={
          reduceMotion
            ? undefined
            : { x: [0, 50, -40, 0], y: [0, -30, 20, 0], scale: [1, 1.1, 0.95, 1] }
        }
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Pulsing rings from the centre */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          className="h-[520px] w-[520px] rounded-full border border-[var(--accent)]/20"
          animate={
            reduceMotion
              ? undefined
              : { scale: [0.9, 1.15, 0.9], opacity: [0.5, 0.15, 0.5] }
          }
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          className="h-[780px] w-[780px] rounded-full border border-[var(--accent)]/12"
          animate={
            reduceMotion
              ? undefined
              : { scale: [1.05, 0.9, 1.05], opacity: [0.35, 0.1, 0.35] }
          }
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}

/* =========================================================
   WHY CODM SECTION
   Desktop (lg+): 3-column grid.
   Tablet / mobile: swipeable slider (2 cards on tablet,
   1 card + a peek of the next on mobile) with arrows + dots.
   ========================================================= */

export default function WhyCodm() {
  const [items, setItems] = useState<WhyCodmItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reduceMotion = useReducedMotion() ?? false;

  /* true on lg+ screens (grid layout), false on tablet/mobile (slider) */
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  /* ---------------- slider state ---------------- */
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateSlider = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    setCanPrev(track.scrollLeft > 2);
    setCanNext(track.scrollLeft + track.clientWidth < track.scrollWidth - 2);

    // active dot = the slide whose left edge is closest to the track's left
    let closest = 0;
    let best = Infinity;
    slideRefs.current.forEach((el, i) => {
      if (!el) return;
      const d = Math.abs(el.offsetLeft - track.offsetLeft - track.scrollLeft);
      if (d < best) {
        best = d;
        closest = i;
      }
    });
    setActiveSlide(closest);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    updateSlider();
    track.addEventListener("scroll", updateSlider, { passive: true });

    const ro = new ResizeObserver(updateSlider);
    ro.observe(track);

    return () => {
      track.removeEventListener("scroll", updateSlider);
      ro.disconnect();
    };
  }, [items.length, updateSlider]);

  const goToSlide = (index: number) => {
    const track = trackRef.current;
    const el = slideRefs.current[index];
    if (!track || !el) return;
    track.scrollTo({
      left: el.offsetLeft - track.offsetLeft,
      behavior: "smooth",
    });
  };

  const stepSlide = (dir: 1 | -1) => {
    const next = Math.min(items.length - 1, Math.max(0, activeSlide + dir));
    goToSlide(next);
  };

  /* ---------------- data ---------------- */
  useEffect(() => {
    const controller = new AbortController();

    async function loadWhyCodm() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(WORDPRESS_GRAPHQL_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
          body: JSON.stringify({
            query: `
              query GetWhyCodm {
                whyCodms(
                  first: 20
                  where: {
                    orderby: {
                      field: DATE
                      order: ASC
                    }
                  }
                ) {
                  nodes {
                    id
                    databaseId
                    title
                    content
                    icon
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

        if (!response.ok) {
          throw new Error(
            `WordPress request failed with status ${response.status}`
          );
        }

        const result = await response.json();

        if (result.errors) {
          console.error("Why CODM GraphQL Error:", result.errors);
          throw new Error("Could not load Why CODM content.");
        }

        const nodes: WhyCodmItem[] =
          result?.data?.whyCodms?.nodes ?? [];

        if (!controller.signal.aborted) {
          setItems(nodes);
        }
      } catch (err) {
        if (controller.signal.aborted) return;

        console.error("Failed to load Why CODM:", err);
        setError("Unable to load Why CODM content.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadWhyCodm();

    return () => {
      controller.abort();
    };
  }, []);

  /* Cursor-follow glow: store the mouse position on the box */
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  const hasItems = !loading && !error && items.length > 0;

  return (
    <section
      id="why-codm"
      className="why-codm-section relative isolate overflow-hidden bg-[var(--background)] py-20 transition-colors duration-500 md:py-28"
    >
      {/* Moving background */}
      <AnimatedBackground reduceMotion={reduceMotion} />

      {/* Section content */}
      <div className="relative z-10 mx-auto max-w-[1110px] px-5 sm:px-8">
        <div className="mx-auto max-w-[1018px]">
          {/* Section heading (word-by-word reveal comes from SectionHeading) */}
          <div className="codm-why-heading-in">
            <Reveal distance={20}>
              <SectionHeading
                eyebrow="Why CODM"
                title="A partner enterprise boards are"
                gradientText="Comfortable signing off."
              />
            </Reveal>
          </div>

          {/* Content area.
              lg+: one big rounded card (clips the boxes as they slide in)
              below lg: no outer card — each box is its own card in a slider */}
          <div
            className={
              "mx-auto mt-10 max-w-[1018px] " +
              (hasItems
                ? "lg:overflow-hidden lg:rounded-[24px] lg:border lg:border-[var(--border)] lg:bg-[var(--surface)]/70 lg:backdrop-blur-[2px]"
                : "overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface)]/70 backdrop-blur-[2px]")
            }
          >
            {loading ? (
              <div className="flex min-h-[250px] items-center justify-center">
                <p className="text-sm text-[var(--muted)]">
                  Loading Why CODM...
                </p>
              </div>
            ) : error ? (
              <div className="flex min-h-[250px] items-center justify-center p-8">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            ) : items.length === 0 ? (
              <div className="flex min-h-[250px] items-center justify-center p-8">
                <p className="text-sm text-[var(--muted)]">
                  No Why CODM items have been published in WordPress.
                </p>
              </div>
            ) : (
              <>
                <div
                  ref={trackRef}
                  className="
                    codm-why-track
                    flex
                    snap-x
                    snap-mandatory
                    gap-4
                    overflow-x-auto
                    overscroll-x-contain
                    scroll-smooth
                    pb-1
                    lg:grid
                    lg:grid-cols-3
                    lg:gap-0
                    lg:snap-none
                    lg:overflow-visible
                    lg:pb-0
                  "
                >
                  {items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      ref={(el) => {
                        slideRefs.current[index] = el;
                      }}
                      className="h-auto w-[84%] shrink-0 snap-start sm:w-[calc(50%-8px)] lg:h-full lg:w-auto"
                      variants={boxVariants}
                      custom={getOffset(index)}
                      initial={
                        reduceMotion || !isDesktop ? false : "hidden"
                      }
                      whileInView="visible"
                      viewport={{ once: true, amount: 0.2 }}
                    >
                      <article
                        onMouseMove={handleMouseMove}
                        className={[
                          "group relative h-full min-h-[180px] overflow-hidden p-7 md:p-8",
                          /* slider: each box is its own rounded, bordered card */
                          "rounded-[20px] border border-[var(--border)] bg-[var(--surface)]/70",
                          /* desktop: flat cells inside the big card */
                          "lg:rounded-none lg:border-l-0 lg:border-t-0 lg:bg-transparent",
                          index % 3 === 2 ? "lg:border-r-0" : "",
                          index >= items.length - 3 ? "lg:border-b-0" : "",
                          "transition-all duration-500 ease-out",
                          "hover:bg-gradient-to-br hover:from-[#11143a] hover:via-[#24206f] hover:to-[#5038e8]",
                        ].join(" ")}
                      >
                        {/* Cursor-follow glow */}
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                          style={{
                            background:
                              "radial-gradient(260px circle at var(--mx, 50%) var(--my, 50%), rgba(170,150,255,0.35), transparent 70%)",
                          }}
                        />

                        {/* Gradient line that sweeps along the bottom on hover */}
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-gradient-to-r from-[#7C5CFF] to-[#FF9FFC] transition-transform duration-500 ease-out group-hover:scale-x-100"
                        />

                        {/* Box content */}
                        <div className="relative z-10">
                          {/* Icon */}
                          <motion.div
                            variants={contentVariants}
                            className="mb-6"
                          >
                            <div
                              className="
                                flex
                                h-8
                                w-8
                                items-center
                                transition-transform
                                duration-300
                                ease-out
                                group-hover:-rotate-6
                                group-hover:scale-110
                              "
                            >
                              {item.featuredImage?.node?.sourceUrl ? (
                                <img
                                  src={item.featuredImage.node.sourceUrl}
                                  alt={
                                    item.featuredImage.node.altText ||
                                    item.title
                                  }
                                  className="
                                    h-8
                                    w-8
                                    object-contain
                                    transition-all
                                    duration-300
                                    group-hover:brightness-0
                                    group-hover:invert
                                  "
                                />
                              ) : (
                                <LightIcon type={item.icon} />
                              )}
                            </div>
                          </motion.div>

                          {/* Title */}
                          <motion.h3
                            variants={contentVariants}
                            className="
                              text-[16px]
                              font-medium
                              tracking-[-0.025em]
                              text-[var(--foreground)]
                              transition-colors
                              duration-300
                              group-hover:text-white
                            "
                          >
                            {item.title}
                          </motion.h3>

                          {/* Description */}
                          <motion.div
                            variants={contentVariants}
                            className="
                              mt-2
                              max-w-[290px]
                              leading-[1.55]
                              text-[var(--muted)]
                              transition-colors
                              duration-300
                            "
                            dangerouslySetInnerHTML={{
                              __html: item.content,
                            }}
                          />
                        </div>
                      </article>
                    </motion.div>
                  ))}
                </div>

                {/* Slider controls — tablet & mobile only */}
                <div className="mt-5 flex items-center justify-center gap-4 lg:hidden">
                  <button
                    type="button"
                    aria-label="Previous"
                    onClick={() => stepSlide(-1)}
                    disabled={!canPrev}
                    className="codm-why-arrow"
                  >
                    {"←"}
                  </button>

                  <div className="flex items-center gap-2">
                    {items.map((item, i) => (
                      <button
                        key={item.id}
                        type="button"
                        aria-label={`Go to item ${i + 1}`}
                        aria-current={i === activeSlide}
                        onClick={() => goToSlide(i)}
                        className={
                          "h-2 rounded-full transition-all duration-300 " +
                          (i === activeSlide
                            ? "w-6 bg-[var(--accent)]"
                            : "w-2 bg-[var(--border)]")
                        }
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    aria-label="Next"
                    onClick={() => stepSlide(1)}
                    disabled={!canNext}
                    className="codm-why-arrow"
                  >
                    {"→"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .codm-why-track {
          scrollbar-width: none;
          -ms-overflow-style: none;
          -webkit-overflow-scrolling: touch;
        }

        .codm-why-track::-webkit-scrollbar {
          display: none;
        }

        .codm-why-arrow {
          width: 36px;
          height: 36px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--foreground);
          font-size: 14px;
          cursor: pointer;
          transition:
            opacity 250ms ease,
            border-color 250ms ease,
            color 250ms ease;
        }

        .codm-why-arrow:hover:not(:disabled) {
          border-color: var(--accent);
          color: var(--accent);
        }

        .codm-why-arrow:disabled {
          opacity: 0.35;
          cursor: default;
        }
      `}</style>
    </section>
  );
}

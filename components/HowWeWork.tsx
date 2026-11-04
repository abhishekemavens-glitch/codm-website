"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SectionHeading from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal"; 

/* =========================================================
   HOW WE WORK
   "Turning Industry Challenges Into Business Opportunities"

   All content comes from WordPress (codm-headless.php):
     wp-admin > How We Work
       - text (eyebrow, heading, optional description)
       - steps (title + description; numbered 01, 02, ... automatically)

   Desktop: one rounded panel with the steps side by side.
   Tablet + mobile: swipeable slider with arrows and dots.
   Light and dark mode follow the site theme (CSS variables).
   Hidden if no steps are published.

   Usage:  <HowWeWork />
   Place at: components/HowWeWork.tsx
   ========================================================= */

const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

type Step = {
  title: string | null;
  description: string | null;
};

type Data = {
  eyebrow: string | null;
  title: string | null;
  gradientText: string | null;
  description: string | null;
  steps: Step[] | null;
};

/* Plain <style> (not styled-jsx) so the build never trips on it. */
const CSS = `
.codm-hw-panel {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border: 1px solid var(--border);
  border-radius: 32px;
  background: color-mix(in srgb, var(--surface) 55%, transparent);
  overflow: hidden;
}
.codm-hw-panel[data-count="1"] { grid-template-columns: minmax(0, 1fr); }
.codm-hw-panel[data-count="2"] { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.codm-hw-panel[data-count="3"] { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.codm-hw-panel[data-count="5"] { grid-template-columns: repeat(5, minmax(0, 1fr)); }

.codm-hw-step {
  padding: 36px 40px 40px;
  border-left: 1px solid var(--border);
  transition: background 300ms ease;
}
.codm-hw-step:first-child { border-left: 0; }
.codm-hw-step:hover {
  background: color-mix(in srgb, var(--accent) 6%, transparent);
}

.codm-hw-num {
  display: block;
  margin: 0 0 40px;
  font-size: 44px;
  font-weight: 300;
  line-height: 1;
  letter-spacing: -0.02em;
  color: color-mix(in srgb, var(--foreground) 14%, transparent);
  transition: color 300ms ease;
}
.codm-hw-step:hover .codm-hw-num { color: var(--accent); }

.codm-hw-title {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
  line-height: 1.25;
  letter-spacing: -0.01em;
  color: var(--foreground);
}
.codm-hw-desc {
  margin: 10px 0 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--muted);
}

.codm-hw-nav { display: none; }

/* Tablet + mobile: slider */
@media (max-width: 1023px) {
  .codm-hw-panel,
  .codm-hw-panel[data-count] {
    display: flex;
    gap: 14px;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    position: relative;
    margin: 0 -20px;
    padding: 4px 20px 8px;
    border: 0;
    border-radius: 0;
    background: transparent;
  }
  .codm-hw-panel::-webkit-scrollbar { display: none; }

  .codm-hw-step,
  .codm-hw-step:first-child {
    flex: 0 0 80%;
    max-width: 380px;
    scroll-snap-align: start;
    border: 1px solid var(--border);
    border-radius: 24px;
    background: color-mix(in srgb, var(--surface) 55%, transparent);
    padding: 28px 26px 30px;
  }
  .codm-hw-num { margin-bottom: 32px; font-size: 38px; }

  .codm-hw-nav {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    margin-top: 18px;
  }
  .codm-hw-arrow {
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
  .codm-hw-arrow:hover { border-color: var(--accent); }
  .codm-hw-arrow:disabled { opacity: 0.35; cursor: default; }
  .codm-hw-dots { display: flex; align-items: center; gap: 6px; }
  .codm-hw-dot {
    height: 7px;
    width: 7px;
    padding: 0;
    border: 0;
    border-radius: 9999px;
    background: var(--border);
    cursor: pointer;
    transition: width 0.25s, background 0.25s;
  }
  .codm-hw-dot[aria-current="true"] { width: 22px; background: var(--accent); }
}

@media (min-width: 640px) and (max-width: 1023px) {
  .codm-hw-panel,
  .codm-hw-panel[data-count] { margin: 0 -32px; padding-left: 32px; padding-right: 32px; }
  .codm-hw-step,
  .codm-hw-step:first-child { flex-basis: 44%; }
}

@media (prefers-reduced-motion: reduce) {
  .codm-hw-step, .codm-hw-num { transition: none; }
}
`;

function SliderNav({
  panelRef,
  count,
}: {
  panelRef: React.RefObject<HTMLDivElement | null>;
  count: number;
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = panelRef.current;
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
  }, [panelRef, count]);

  const goTo = useCallback(
    (index: number) => {
      const el = panelRef.current;
      const kid = el?.children[index] as HTMLElement | undefined;
      if (!el || !kid) return;
      const pad = parseFloat(getComputedStyle(el).paddingLeft) || 0;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollTo({
        left: kid.offsetLeft - pad,
        behavior: reduce ? "auto" : "smooth",
      });
    },
    [panelRef]
  );

  if (count < 2) return null;

  return (
    <div className="codm-hw-nav">
      <button
        type="button"
        className="codm-hw-arrow"
        aria-label="Previous step"
        disabled={active <= 0}
        onClick={() => goTo(Math.max(0, active - 1))}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 6-6 6 6 6" /></svg>
      </button>

      <div className="codm-hw-dots">
        {Array.from({ length: count }).map((_, i) => (
          <button
            key={i}
            type="button"
            className="codm-hw-dot"
            aria-label={`Go to step ${i + 1}`}
            aria-current={i === active}
            onClick={() => goTo(i)}
          />
        ))}
      </div>

      <button
        type="button"
        className="codm-hw-arrow"
        aria-label="Next step"
        disabled={active >= count - 1}
        onClick={() => goTo(Math.min(count - 1, active + 1))}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
      </button>
    </div>
  );
}

export default function HowWeWork() {
  const [data, setData] = useState<Data | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(WORDPRESS_GRAPHQL_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              query GetHowWeWork {
                howWeWork {
                  eyebrow
                  title
                  gradientText
                  description
                  steps {
                    title
                    description
                  }
                }
              }
            `,
          }),
        });

        const result = await response.json();

        if (result.errors) {
          console.error("How We Work GraphQL Error:", result.errors);
          return;
        }

        if (!cancelled) {
          setData(result.data?.howWeWork ?? null);
        }
      } catch (error) {
        console.error("Failed to load How We Work:", error);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const steps = (data?.steps ?? []).filter(
    (step) => step.title || step.description
  );

  if (!data || steps.length === 0) {
    return null;
  }

  return (
    <section
      id="how-we-work"
      className="relative overflow-hidden bg-[var(--background)] px-5 py-14 transition-colors duration-500 sm:px-8 md:py-20"
    >
      <style>{CSS}</style>

      <div className="relative mx-auto max-w-[1250px]">
        <Reveal distance={20}>
          <div className="mx-auto max-w-[1100px] text-center">
            <SectionHeading
              eyebrow={data.eyebrow ?? ""}
              title={data.title ?? ""}
              gradientText={data.gradientText ?? ""}
              description={data.description || undefined}
            />
          </div>
        </Reveal>

        <Reveal distance={24} duration={0.7}>
          <div className="mt-12 md:mt-16">
            <div ref={panelRef} className="codm-hw-panel" data-count={steps.length}>
              {steps.map((step, index) => (
                <article key={`${step.title}-${index}`} className="codm-hw-step">
                  <span className="codm-hw-num" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  {step.title && <h3 className="codm-hw-title">{step.title}</h3>}

                  {step.description && (
                    <p className="codm-hw-desc">{step.description}</p>
                  )}
                </article>
              ))}
            </div>

            <SliderNav panelRef={panelRef} count={steps.length} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

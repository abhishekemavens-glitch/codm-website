"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Reveal, Stagger, StaggerItem } from "@/components/Reveal";

type TrustedLogo = {
  id: string;
  databaseId: number;
  title: string;
  featuredImage: {
    node: {
      sourceUrl: string;
      altText: string;
    } | null;
  } | null;
};

const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

export default function TrustedBy() {
  const [logos, setLogos] = useState<TrustedLogo[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------- slider (tablet + mobile); desktop keeps the wrapped grid ---------- */
  const trackRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState(1);
  const [activePage, setActivePage] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateSlider = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;

    setCanPrev(el.scrollLeft > 2);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);

    const total = Math.max(1, Math.ceil(el.scrollWidth / el.clientWidth - 0.05));
    setPages(total);
    setActivePage(
      Math.min(total - 1, Math.round(el.scrollLeft / el.clientWidth))
    );
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    updateSlider();
    el.addEventListener("scroll", updateSlider, { passive: true });

    const ro = new ResizeObserver(updateSlider);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);

    return () => {
      el.removeEventListener("scroll", updateSlider);
      ro.disconnect();
    };
  }, [logos.length, updateSlider]);

  const scrollByPage = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  const goToPage = (page: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: page * el.clientWidth, behavior: "smooth" });
  };

  useEffect(() => {
    async function loadTrustedLogos() {
      try {
        const response = await fetch(WORDPRESS_GRAPHQL_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
              query GetTrustedBy {
                trustedLogos(
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
            `WordPress request failed: ${response.status}`
          );
        }

        const result = await response.json();

        console.log("TRUSTED BY DATA:", result);

        if (result.errors) {
          console.error(
            "Trusted By GraphQL Error:",
            result.errors
          );
          throw new Error("Could not load Trusted By content.");
        }

        const nodes =
          result?.data?.trustedLogos?.nodes ?? [];

        setLogos(nodes);
      } catch (error) {
        console.error(
          "Failed to load Trusted By:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadTrustedLogos();
  }, []);

  return (
    <section
      id="trusted-by"
      className="
        relative
        overflow-hidden
        bg-[var(--background)]
        py-[72px]
        transition-colors
        duration-500
        md:py-[86px]
      "
    >
      <div className="mx-auto max-w-[1200px] px-6">

       {/* EYEBROW */}
<Reveal distance={16}>
  <div className="heading-codm-eyebrow-wrap">
    <span aria-hidden="true" className="heading-codm-eyebrow-line" />
    <span className="heading-codm-eyebrow">
      Trusted by world best
    </span>
    <span aria-hidden="true" className="heading-codm-eyebrow-line" />
  </div>
</Reveal>

        {/* LOGOS */}
        {loading ? (
          <div className="flex justify-center">
            <p className="text-sm text-[var(--muted)]">
              Loading...
            </p>
          </div>
        ) : logos.length === 0 ? (
          <div className="flex justify-center">
            <p className="text-sm text-[var(--muted)]">
              No trusted companies found.
            </p>
          </div>
               ) : (
          <>
          <div
            ref={trackRef}
            className="
              codm-tb-track
              overflow-x-auto
              overscroll-x-contain
              scroll-smooth
              snap-x
              snap-mandatory
              pb-2
              lg:snap-none
              lg:overflow-visible
              lg:pb-0
            "
          >
          <Stagger
            className="
              mx-auto
              flex
              w-max
              flex-nowrap
              items-center
              gap-[14px]
              px-1
              lg:w-auto
              lg:max-w-[1060px]
              lg:flex-wrap
              lg:justify-center
              lg:px-0
            "
          >
            {logos.map((logo) => (
                <StaggerItem key={logo.id}>
              <div
                className="
                  snap-start
                  flex
                  h-[70px]
                  w-[190px]
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-[#d9dbea]
                  px-7
                  transition-all
                  duration-300
                  hover:-translate-y-[2px]
                  hover:bg-[#e2e3f0]
                "
              >
                {logo.featuredImage?.node?.sourceUrl ? (
                  <img
                    src={
                      logo.featuredImage.node.sourceUrl
                    }
                    alt={
                      logo.featuredImage.node.altText ||
                      logo.title
                    }
                    className="
                      max-h-[42px]
                      max-w-[145px]
                      object-contain
                      opacity-65
                      grayscale
                    "
                  />
                ) : (
                  <span
                    className="
                      text-center
                      text-[20px]
                      font-semibold
                      tracking-[-0.03em]
                      text-[#70727d]
                    "
                  >
                    {logo.title}
                  </span>
                )}
              </div>
                   </StaggerItem>
            ))}
               </Stagger>
          </div>

          {/* Slider controls: tablet + mobile only */}
          {pages > 1 && (
            <div className="mt-5 flex items-center justify-center gap-4 lg:hidden">
              <button
                type="button"
                aria-label="Previous"
                onClick={() => scrollByPage(-1)}
                disabled={!canPrev}
                className="codm-tb-arrow"
              >
                {"\u2190"}
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: pages }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Go to page ${i + 1}`}
                    aria-current={i === activePage}
                    onClick={() => goToPage(i)}
                    className={
                      "h-2 rounded-full transition-all duration-300 " +
                      (i === activePage
                        ? "w-6 bg-[var(--accent)]"
                        : "w-2 bg-[var(--border)]")
                    }
                  />
                ))}
              </div>

              <button
                type="button"
                aria-label="Next"
                onClick={() => scrollByPage(1)}
                disabled={!canNext}
                className="codm-tb-arrow"
              >
                {"\u2192"}
              </button>
            </div>
          )}
          </>
        )}

      </div>
      <style>{`
        .codm-tb-track {
          scrollbar-width: none;
          -ms-overflow-style: none;
          -webkit-overflow-scrolling: touch;
        }
        .codm-tb-track::-webkit-scrollbar {
          display: none;
        }
        .codm-tb-arrow {
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
          transition: opacity 250ms ease, border-color 250ms ease, color 250ms ease;
        }
        .codm-tb-arrow:hover:not(:disabled) {
          border-color: var(--accent);
          color: var(--accent);
        }
        .codm-tb-arrow:disabled {
          opacity: 0.35;
          cursor: default;
        }
      `}</style>
    </section>
  );
}

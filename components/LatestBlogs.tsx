"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SectionHeading from "@/components/SectionHeading";
import { Reveal, Stagger, StaggerItem } from "@/components/Reveal";

type Blog = {
  id: string;
  title: string;
  uri: string;
  date: string;
  featuredImage?: {
    node?: {
      sourceUrl?: string;
      altText?: string;
    };
  };
  categories?: {
    nodes: {
      name: string;
    }[];
  };
};

/** Where the "View all" button goes. Change if your blogs page lives elsewhere. */
const ALL_BLOGS_URL = "/insights";

export default function LatestBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------- slider (tablet + mobile); desktop keeps the 3-column grid ---------- */
  const wrapRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const getTrack = useCallback(
    () =>
      wrapRef.current?.querySelector<HTMLElement>(".codm-lb-track") ?? null,
    []
  );

  const updateSlider = useCallback(() => {
    const track = getTrack();
    if (!track) return;

    setCanPrev(track.scrollLeft > 2);
    setCanNext(track.scrollLeft + track.clientWidth < track.scrollWidth - 2);

    let closest = 0;
    let best = Infinity;
    Array.from(track.children).forEach((child, i) => {
      const el = child as HTMLElement;
      const d = Math.abs(el.offsetLeft - track.offsetLeft - track.scrollLeft);
      if (d < best) {
        best = d;
        closest = i;
      }
    });
    setActiveSlide(closest);
  }, [getTrack]);

  useEffect(() => {
    const track = getTrack();
    if (!track) return;

    updateSlider();
    track.addEventListener("scroll", updateSlider, { passive: true });

    const ro = new ResizeObserver(updateSlider);
    ro.observe(track);

    return () => {
      track.removeEventListener("scroll", updateSlider);
      ro.disconnect();
    };
  }, [blogs.length, getTrack, updateSlider]);

  const goToSlide = (index: number) => {
    const track = getTrack();
    const el = track?.children[index] as HTMLElement | undefined;
    if (!track || !el) return;
    track.scrollTo({
      left: el.offsetLeft - track.offsetLeft,
      behavior: "smooth",
    });
  };

  const stepSlide = (dir: 1 | -1) => {
    const next = Math.min(blogs.length - 1, Math.max(0, activeSlide + dir));
    goToSlide(next);
  };

  /* ---------- data ---------- */
  useEffect(() => {
    async function fetchBlogs() {
      try {
        const response = await fetch("/api/wordpress", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
              query LatestBlogs {
                posts(first: 3, where: { status: PUBLISH }) {
                  nodes {
                    id
                    title
                    uri
                    date
                    featuredImage {
                      node {
                        sourceUrl
                        altText
                      }
                    }
                    categories {
                      nodes {
                        name
                      }
                    }
                  }
                }
              }
            `,
          }),
        });

        const result = await response.json();

        if (result?.data?.posts?.nodes) {
          setBlogs(result.data.posts.nodes);
        }
      } catch (error) {
        console.error("Unable to load blogs:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBlogs();
  }, []);

  return (
    <section className="latest-blogs">
      <div className="latest-blogs-header">
        {/* =================================================
            SECTION HEADING
            inline={true} keeps "Our" and "Latest Blogs" on the
            same line, matching the target design.
            ================================================= */}
        <Reveal distance={20}>
          <SectionHeading
            eyebrow="From Blog"
            title="Our"
            gradientText="Latest Blogs"
            description="Explore the insights and trends shaping our industry"
            inline
          />
        </Reveal>
      </div>

      {loading ? (
        <div className="latest-blogs-loading">Loading blogs...</div>
      ) : blogs.length === 0 ? (
        <div className="latest-blogs-loading">No blogs available.</div>
      ) : (
        <div className="latest-blogs codm-lb-wrap" ref={wrapRef}>
          <Stagger className="latest-blogs-grid codm-lb-track">
            {blogs.map((blog) => (
              <StaggerItem key={blog.id} className="h-full">
                <article className="blog-card">
                  <div className="blog-categories">
                    {blog.categories?.nodes.map((category) => (
                      <span key={category.name}>{category.name}</span>
                    ))}
                  </div>

                  {blog.featuredImage?.node?.sourceUrl && (
                    <div className="blog-image">
                      <img
                        src={blog.featuredImage.node.sourceUrl}
                        alt={blog.featuredImage.node.altText || blog.title}
                      />
                    </div>
                  )}

                  <h3>{blog.title}</h3>

                  <a href={blog.uri} target="_blank" rel="noopener noreferrer">
                    View blog{" "}
                    <span>
                      {" "}
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
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
                </article>
              </StaggerItem>
            ))}
          </Stagger>

          {/* Slider controls: tablet + mobile only */}
          {blogs.length > 1 && (
            <div className="codm-lb-controls">
              <button
                type="button"
                aria-label="Previous"
                onClick={() => stepSlide(-1)}
                disabled={!canPrev}
                className="codm-lb-arrow"
              >
                {"←"}
              </button>

              <div className="codm-lb-dots">
                {blogs.map((blog, i) => (
                  <button
                    key={blog.id}
                    type="button"
                    aria-label={`Go to blog ${i + 1}`}
                    aria-current={i === activeSlide}
                    onClick={() => goToSlide(i)}
                    className={
                      "codm-lb-dot" + (i === activeSlide ? " is-active" : "")
                    }
                  />
                ))}
              </div>

              <button
                type="button"
                aria-label="Next"
                onClick={() => stepSlide(1)}
                disabled={!canNext}
                className="codm-lb-arrow"
              >
                {"→"}
              </button>
            </div>
          )}

          {/* View all button */}
          <div className="codm-lb-viewall-wrap">
            <a href={ALL_BLOGS_URL} className="codm-lb-viewall">
              View all blogs
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path
                  d="M3.5 10.5L10.5 3.5M4.5 3.5h6v6"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
        </div>
      )}

      <style>{`
        /* ---------- tablet + mobile: swipe slider ---------- */
        @media (max-width: 1023px) {
          .codm-lb-wrap .codm-lb-track {
            display: flex !important;
            grid-template-columns: none !important;
            flex-wrap: nowrap !important;
            gap: 16px !important;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            overscroll-behavior-x: contain;
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            -ms-overflow-style: none;
            padding-bottom: 8px;
          }

          .codm-lb-wrap .codm-lb-track::-webkit-scrollbar {
            display: none;
          }

          .codm-lb-wrap .codm-lb-track > * {
            flex: 0 0 84%;
            max-width: 84%;
            scroll-snap-align: start;
          }
        }

        @media (min-width: 640px) and (max-width: 1023px) {
          .codm-lb-wrap .codm-lb-track > * {
            flex: 0 0 calc(50% - 8px);
            max-width: calc(50% - 8px);
          }
        }

        /* ---------- controls ---------- */
        .codm-lb-controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-top: 20px;
        }

        @media (min-width: 1024px) {
          .codm-lb-controls {
            display: none;
          }
        }

        .codm-lb-dots {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .codm-lb-dot {
          width: 8px;
          height: 8px;
          padding: 0;
          border: 0;
          border-radius: 999px;
          background: var(--border);
          cursor: pointer;
          transition: width 300ms ease, background 300ms ease;
        }

        .codm-lb-dot.is-active {
          width: 24px;
          background: var(--accent);
        }

        .codm-lb-arrow {
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

        .codm-lb-arrow:hover:not(:disabled) {
          border-color: var(--accent);
          color: var(--accent);
        }

        .codm-lb-arrow:disabled {
          opacity: 0.35;
          cursor: default;
        }

        /* ---------- View all button ---------- */
        .codm-lb-viewall-wrap {
          display: flex;
          justify-content: center;
          margin-top: 32px;
        }

        .codm-lb-viewall {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 24px;
          border-radius: 999px;
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--foreground);
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
          transition:
            border-color 300ms ease,
            background 300ms ease,
            color 300ms ease,
            transform 300ms ease;
        }

        .codm-lb-viewall:hover {
          border-color: var(--accent);
          color: var(--accent);
          background: rgba(114, 92, 255, 0.06);
          transform: translateY(-1px);
        }
      `}</style>
    </section>
  );
}

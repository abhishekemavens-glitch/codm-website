"use client";
import { useEffect, useState } from "react";
import SectionHeading from "@/components/SectionHeading";
import { useInViewOnce, useParallax, splitWords } from "@/lib/codm-animations";

/*
 * Save as: components/KeyCapabilities.tsx
 *
 * Standalone "Key Capabilities" section -- same tabbed pill + big
 * card pattern as Industries.tsx, backed by its own WordPress
 * custom post type ("Capabilities"), with small tag badges and an
 * optional "Explore capability" link per entry.
 */

type CapabilityItem = {
  id: string;
  databaseId: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  badges: string | null;
  exploreLink: string | null;
  featuredImage: {
    node: {
      sourceUrl: string;
      altText: string;
    } | null;
  } | null;
};

const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

export default function KeyCapabilities() {
  const [items, setItems] = useState<CapabilityItem[]>([]);
  const [activeItem, setActiveItem] = useState(0);
  const [loading, setLoading] = useState(true);

  const active = items[activeItem];

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

  useEffect(() => {
    async function loadCapabilities() {
      try {
        const response = await fetch(WORDPRESS_GRAPHQL_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
              query GetCapabilities {
                capabilities(first: 20) {
                  nodes {
                    id
                    databaseId
                    title
                    slug
                    excerpt
                    content
                    badges
                    exploreLink
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

        setItems(result.data.capabilities.nodes);
      } catch (error) {
        console.error("Failed to load capabilities:", error);
      } finally {
        setLoading(false);
      }
    }

    loadCapabilities();
  }, []);

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

  const badgeList =
    active?.badges
      ?.split(",")
      .map((b) => b.trim())
      .filter(Boolean) ?? [];

  return (
    <>
      <section
        id="capabilities"
        ref={sectionRef}
        className={
          "codm-capabilities-section relative overflow-hidden bg-[var(--background)] py-24 transition-colors duration-500 md:py-32 " +
          (isVisible ? "codm-capabilities-visible codm-visible" : "")
        }
      >
        <div
          aria-hidden="true"
          className="codm-capabilities-glow pointer-events-none absolute left-1/2 top-[0%] h-[500px] w-[800px] -translate-x-1/2 rounded-full"
        />
        <div
          aria-hidden="true"
          className="codm-capabilities-glow-secondary pointer-events-none absolute left-[10%] top-[35%] h-[350px] w-[350px] rounded-full"
        />

        <div className="relative mx-auto max-w-[1250px] px-5 sm:px-8">
          <div
            className={
              "codm-capabilities-heading codm-section-heading-reveal " +
              (isVisible ? "codm-section-heading-reveal-in" : "")
            }
          >
            <SectionHeading
              eyebrow="Key Capabilities"
              title="Everything your institution needs"
              gradientText="to move forward."
            />
          </div>

          <div className="codm-capabilities-pills codm-stagger-grid mx-auto mt-9 flex max-w-[1150px] flex-wrap justify-center gap-2.5">
            {loading ? (
              <div className="text-sm text-[var(--muted)]">
                Loading capabilities...
              </div>
            ) : (
              items.map((item, index) => {
                const isActive = index === activeItem;
                const pillStyle: React.CSSProperties & {
                  "--pill-delay"?: string;
                } = {
                  "--pill-delay": `${index * 70}ms`,
                };

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveItem(index)}
                    style={pillStyle}
                    className={
                      "codm-capability-pill codm-stagger-item rounded-full border px-4 py-2.5 text-xs font-medium " +
                      (isActive
                        ? "codm-capability-pill-active border-[var(--accent)] bg-[var(--accent)] text-white"
                        : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--foreground)]")
                    }
                  >
                    {item.title}
                  </button>
                );
              })
            )}
          </div>

          {active && (
            <div
              key={active.id}
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              style={cardStyle}
              className="codm-capability-card mt-9 overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface)] md:mt-12"
            >
              <div aria-hidden="true" className="codm-capability-spotlight" />

              <div className="grid items-center lg:grid-cols-[1fr_0.95fr]">
                <div
                  className={
                    "codm-capability-card-content order-2 p-8 md:p-12 lg:order-1 lg:pl-12 xl:p-16 " +
                    (isVisible ? "codm-capability-content-in" : "")
                  }
                >
                  <div className="max-w-[500px]">
                    <div className="codm-capability-accent mb-6 h-[2px] w-10 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#4F46E5]" />

                    <h3
                      className={
                        "codm-word-stagger codm-capability-title-reveal text-3xl font-semibold leading-[1.08] tracking-[-0.045em] text-[var(--foreground)] md:text-4xl " +
                        (titleVisible ? "codm-capability-title-visible" : "")
                      }
                    >
                      {splitWords(active.title)}
                    </h3>

                    <p
                      className={
                        "codm-capability-text-reveal mt-5 text-sm leading-6 text-[var(--muted)] md:text-[15px] " +
                        (isVisible && contentVisible
                          ? "codm-capability-text-reveal-in"
                          : "")
                      }
                      dangerouslySetInnerHTML={{
                        __html: active.content || active.excerpt,
                      }}
                    />

                    {badgeList.length > 0 && (
                      <div
                        className={
                          "codm-capability-badges-row mt-6 flex flex-wrap gap-2 " +
                          (isVisible && contentVisible
                            ? "codm-capability-text-reveal-in"
                            : "codm-capability-text-reveal")
                        }
                      >
                        {badgeList.map((badge, i) => (
                          <span
                            key={i}
                            className="rounded-full border border-[var(--border)] bg-[var(--background)] px-3.5 py-1.5 text-xs font-medium text-[var(--muted)]"
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                    )}

                    {active.exploreLink && (
                      <a
                        href={active.exploreLink}
                        className={
                          "codm-capability-view-link codm-capability-link-reveal mt-7 inline-flex items-center gap-2 text-sm font-medium text-[var(--foreground)] " +
                          (isVisible && contentVisible
                            ? "codm-capability-link-reveal-in"
                            : "")
                        }
                      >
                        <span>Explore capability</span>
                        <span className="codm-capability-arrow">{"\u2192"}</span>
                      </a>
                    )}
                  </div>
                </div>

                <div
                  ref={imageParallaxRef}
                  style={imageWrapperStyle}
                  className={
                    "codm-hero-media-scale order-1 p-4 md:p-5 lg:order-2 lg:p-5 " +
                    (isVisible && contentVisible ? "codm-media-loaded" : "")
                  }
                >
                  <div className="codm-capability-image-container relative aspect-[1.2/1] overflow-hidden rounded-[18px] bg-[#f5f3ff] dark:bg-[#111326]">
                    <div
                      aria-hidden="true"
                      className="codm-capability-image-glow absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                    />

                    {active.featuredImage?.node?.sourceUrl && (
                      <img
                        src={active.featuredImage.node.sourceUrl}
                        alt={
                          active.featuredImage.node.altText || active.title
                        }
                        className="codm-capability-image relative h-full w-full object-contain p-5 md:p-8"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <style jsx>{`
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

        .codm-capability-card-content {
          opacity: 0;
          transform: translateY(20px);
          transition:
            opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.15s,
            transform 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.15s;
          will-change: opacity, transform;
        }

        .codm-capability-content-in {
          opacity: 1;
          transform: translateY(0);
        }

        .codm-capability-text-reveal {
          opacity: 0;
          transform: translateY(16px);
          filter: blur(4px);
          transition:
            opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.3s,
            transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.3s,
            filter 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.3s;
          will-change: opacity, transform, filter;
        }

        .codm-capability-text-reveal-in {
          opacity: 1;
          transform: translateY(0);
          filter: blur(0);
        }

        .codm-capability-link-reveal {
          opacity: 0;
          filter: blur(4px);
          translate: 0 14px;
          will-change: opacity, translate, filter;
        }

        .codm-capability-link-reveal-in {
          opacity: 1;
          filter: blur(0);
          translate: 0 0;
        }

        .codm-capability-card {
          position: relative;
          transform-style: preserve-3d;
          transition:
            transform 400ms cubic-bezier(0.22, 1, 0.36, 1),
            border-color 500ms ease,
            box-shadow 700ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .codm-capability-card:hover {
          box-shadow:
            0 35px 100px rgba(0, 0, 0, 0.08),
            0 0 80px rgba(114, 92, 255, 0.05);
        }

        .codm-capability-spotlight {
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

        .codm-capability-card:hover .codm-capability-spotlight {
          opacity: 1;
        }

        .codm-capability-image-container {
          position: relative;
          box-shadow: 0 0 0 rgba(114, 92, 255, 0);
          transition:
            transform 800ms cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 500ms ease;
          animation: codmCapIdleFloat 6s ease-in-out infinite;
        }

        .codm-capability-image-container::after {
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

        .codm-capability-image-container:hover {
          transform: scale(0.985);
          box-shadow: 0 25px 60px rgba(114, 92, 255, 0.18);
          animation-play-state: paused;
        }

        .codm-capability-image-container:hover::after {
          left: 130%;
        }

        .codm-capability-image-container:hover .codm-capability-image-glow {
          animation-play-state: paused;
        }

        .codm-capability-image {
          transition:
            transform 900ms cubic-bezier(0.22, 1, 0.36, 1),
            filter 700ms ease;
        }

        .codm-capability-image-container:hover .codm-capability-image {
          transform: scale(1.06);
          filter: brightness(1.03) saturate(1.06);
        }

        .codm-capability-image-glow {
          background: radial-gradient(
            circle,
            rgba(114, 92, 255, 0.24),
            transparent 70%
          );
          filter: blur(55px);
          opacity: 0.8;
          animation: codmCapImageGlow 7s ease-in-out infinite;
        }

        .codm-capabilities-glow {
          background: radial-gradient(
            circle,
            rgba(114, 92, 255, 0.11),
            transparent 70%
          );
          filter: blur(120px);
          opacity: 0.8;
          animation: codmCapMainGlow 12s ease-in-out infinite;
        }

        .codm-capabilities-glow-secondary {
          background: radial-gradient(
            circle,
            rgba(79, 70, 229, 0.06),
            transparent 70%
          );
          filter: blur(100px);
          animation: codmCapSecondaryGlow 10s ease-in-out infinite;
        }

        .codm-capability-view-link {
          position: relative;
          transition:
            color 300ms ease,
            transform 400ms cubic-bezier(0.22, 1, 0.36, 1),
            opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.45s,
            filter 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.45s,
            translate 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.45s;
        }

        .codm-capability-view-link:hover {
          color: var(--accent);
          transform: translateX(4px);
        }

        .codm-capability-arrow {
          display: inline-block;
          transition: transform 400ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        .codm-capability-view-link:hover .codm-capability-arrow {
          transform: translateX(5px);
        }

        @keyframes codmCapImageGlow {
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

        @keyframes codmCapMainGlow {
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

        @keyframes codmCapSecondaryGlow {
          0%,
          100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(50px, -30px);
          }
        }

        @keyframes codmCapIdleFloat {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @media (max-width: 767px) {
          .codm-capabilities-section {
            padding-top: 80px;
            padding-bottom: 80px;
          }

          .codm-capability-card:hover {
            transform: none;
          }

          .codm-capability-image-container:hover {
            transform: none;
            box-shadow: none;
          }

          .codm-capability-image-container:hover::after {
            left: -60%;
          }

          .codm-capability-image-container:hover .codm-capability-image {
            transform: scale(1);
            filter: none;
          }

          .codm-capabilities-glow {
            width: 500px;
            height: 350px;
          }

          .codm-capabilities-pills {
            padding-left: 5px;
            padding-right: 5px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .codm-capabilities-heading,
          .codm-section-heading-reveal,
          .codm-capability-card-content,
          .codm-capability-text-reveal,
          .codm-capability-link-reveal,
          .codm-capability-view-link,
          .codm-capability-card,
          .codm-capability-image-container,
          .codm-capability-image {
            transition: none !important;
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
            translate: none !important;
            filter: none !important;
          }

          .codm-capabilities-glow,
          .codm-capabilities-glow-secondary,
          .codm-capability-image-glow {
            animation: none !important;
          }

          .codm-capability-image-container::after {
            transition: none !important;
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}

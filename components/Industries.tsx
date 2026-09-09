"use client";

import { useEffect, useState } from "react";
import SectionHeading from "@/components/SectionHeading";
// If you don't have the "@/" path alias set up in tsconfig.json,
// use a relative path instead, e.g. "../SectionHeading" or "./SectionHeading"

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

export default function Industries() {
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [activeIndustry, setActiveIndustry] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  // PREMIUM: tilt + spotlight state for the featured card
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
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        threshold: 0.12,
      }
    );

    const section = document.getElementById("industries");

    if (section) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, []);

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
                industries(first: 20) {
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

        setIndustries(result.data.industries.nodes);
      } catch (error) {
        console.error("Failed to load industries:", error);
      } finally {
        setLoading(false);
      }
    }

    loadIndustries();
  }, []);

  const active = industries[activeIndustry];

  return (
    <>
     <section
  id="industries"
  className={`codm-industries-section relative overflow-hidden bg-[var(--background)] py-24 transition-colors duration-500 md:py-32 ${
    isVisible ? "codm-industries-visible" : ""
  }`}
>
        {/* =====================================================
            BACKGROUND GLOW
            ===================================================== */}

        <div
          aria-hidden="true"
          className="codm-industries-glow pointer-events-none absolute left-1/2 top-[0%] h-[500px] w-[800px] -translate-x-1/2 rounded-full"
        />

        <div
          aria-hidden="true"
          className="codm-industries-glow-secondary pointer-events-none absolute left-[10%] top-[35%] h-[350px] w-[350px] rounded-full"
        />

        <div className="relative mx-auto max-w-[1250px] px-5 sm:px-8">

          {/* =====================================================
              SECTION HEADING
              ===================================================== */}

          <div className="codm-industries-heading">
            <SectionHeading
              eyebrow="Industries We Serve"
              title="Engineering the systems that run"
              gradientText="modern enterprises."
              description="We combine Salesforce depth with product-grade engineering, so transformation lands as working software not slideware."
            />
          </div>

          {/* =====================================================
              INDUSTRY PILLS
              PREMIUM: stagger-in grid — codm-stagger-grid on the
              wrapper + codm-stagger-item on each pill. Fires when
              the section's codm-visible class is added above.
              ===================================================== */}

          <div className="codm-industries-pills codm-stagger-grid mx-auto mt-9 flex max-w-[1150px] flex-wrap justify-center gap-2.5">

            {loading ? (
              <div className="text-sm text-[var(--muted)]">
                Loading industries...
              </div>
            ) : (
              industries.map((industry, index) => {
                const isActive = index === activeIndustry;

                return (
                  <button
                    key={industry.id}
                    type="button"
                    onClick={() => setActiveIndustry(index)}
                    style={
                      {
                        "--pill-delay": `${index * 70}ms`,
                      } as React.CSSProperties
                    }
                    className={`codm-industry-pill codm-stagger-item rounded-full border px-4 py-2.5 text-xs font-medium ${
                      isActive
                        ? "codm-industry-pill-active border-[var(--accent)] bg-[var(--accent)] text-white"
                        : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    {industry.title}
                  </button>
                );
              })
            )}

          </div>


          {/* =====================================================
              FEATURED INDUSTRY CARD
              ===================================================== */}

          {active && (
            <div
              key={active.id}
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              style={
                {
                  transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                  "--spot-x": `${spotlight.x}%`,
                  "--spot-y": `${spotlight.y}%`,
                } as React.CSSProperties
              }
              className="codm-industry-card mt-9 overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface)] md:mt-12"
            >

              <div aria-hidden="true" className="codm-industry-spotlight" />

              <div className="grid items-center lg:grid-cols-[1fr_0.95fr]">

                {/* =================================================
                    CONTENT
                    ================================================= */}

                <div className="codm-industry-card-content order-2 p-8 md:p-12 lg:order-1 lg:pl-12 xl:p-16">

                  <div className="max-w-[500px]">

                    <div className="codm-industry-accent mb-6 h-[2px] w-10 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#4F46E5]" />

                    <h3 className="text-3xl font-semibold leading-[1.08] tracking-[-0.045em] text-[var(--foreground)] md:text-4xl">
                      {active.title}
                    </h3>

                    <p
                      className="mt-5 text-sm leading-6 text-[var(--muted)] md:text-[15px]"
                      dangerouslySetInnerHTML={{
                        __html: active.content || active.excerpt,
                      }}
                    />

                    <a
                      href={`/industries/${active.slug}`}
                      className="codm-industry-view-link mt-7 inline-flex items-center gap-2 text-sm font-medium text-[var(--foreground)]"
                    >
                      <span>View all</span>

                      <span className="codm-industry-arrow">
                        →
                      </span>
                    </a>

                  </div>

                </div>


                {/* =================================================
                    IMAGE
                    ================================================= */}

                <div className="codm-industry-image-wrapper order-1 p-4 md:p-5 lg:order-2 lg:p-5">

                  <div className="codm-industry-image-container relative aspect-[1.2/1] overflow-hidden rounded-[18px] bg-[#f5f3ff] dark:bg-[#111326]">

                    <div
                      aria-hidden="true"
                      className="codm-industry-image-glow absolute left-1/2 top-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                    />

                    {active.featuredImage?.node?.sourceUrl && (
                      <img
                        src={active.featuredImage.node.sourceUrl}
                        alt={
                          active.featuredImage.node.altText ||
                          active.title
                        }
                        className="codm-industry-image relative h-full w-full object-contain p-5 md:p-8"
                      />
                    )}

                  </div>

                </div>

              </div>

            </div>
          )}

        </div>
      </section>


      {/* =========================================================
          INDUSTRIES ANIMATION CSS
          No Framer Motion required
          ========================================================= */}

      <style jsx>{`

        /* =====================================================
           SECTION REVEAL
           ===================================================== */

        .codm-industries-heading,
        .codm-industry-card {
          opacity: 0;
          transform: translateY(35px);
        }

        .codm-industries-visible .codm-industries-heading {
          animation: codmIndustriesHeading 1s cubic-bezier(
            0.16,
            1,
            0.3,
            1
          ) forwards;
        }

        .codm-industries-visible .codm-industry-card {
          animation: codmIndustryCard 1.1s cubic-bezier(
            0.16,
            1,
            0.3,
            1
          ) 0.3s forwards;
        }

        .codm-industries-heading {
          will-change: transform, opacity;
        }


        /* =====================================================
           CARD
           ===================================================== */

        .codm-industry-card {
          position: relative;
          transform-style: preserve-3d;
          transition:
            transform 400ms cubic-bezier(0.16, 1, 0.3, 1),
            border-color 500ms ease,
            box-shadow 700ms cubic-bezier(0.16, 1, 0.3, 1);
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


        /* =====================================================
           CARD CONTENT
           ===================================================== */

        .codm-industry-card-content {
          opacity: 0;
          transform: translateX(-30px);
          animation: codmCardContent 0.9s cubic-bezier(
            0.16,
            1,
            0.3,
            1
          ) 0.15s forwards;
        }

        .codm-industry-accent {
          width: 0;
          opacity: 0;
          animation:
            codmAccentReveal 0.8s cubic-bezier(
              0.16,
              1,
              0.3,
              1
            ) 0.45s forwards;
        }


        /* =====================================================
           IMAGE
           ===================================================== */

        .codm-industry-image-wrapper {
          opacity: 0;
          transform: translateX(30px);
          animation: codmImageWrapper 1s cubic-bezier(
            0.16,
            1,
            0.3,
            1
          ) 0.2s forwards;
        }

        .codm-industry-image-container {
          transition:
            transform 800ms cubic-bezier(0.16, 1, 0.3, 1),
            box-shadow 800ms ease;
          animation: codmIdleFloat 6s ease-in-out infinite;
        }

        .codm-industry-card:hover
        .codm-industry-image-container {
          transform: scale(0.985);
          animation-play-state: paused;
        }

        .codm-industry-image {
          opacity: 0;
          transform: scale(1.055);
          animation: codmIndustryImage 1.2s cubic-bezier(
            0.16,
            1,
            0.3,
            1
          ) 0.35s forwards;

          transition:
            transform 900ms cubic-bezier(0.16, 1, 0.3, 1),
            filter 700ms ease;
        }

        .codm-industry-card:hover .codm-industry-image {
          transform: scale(1.025);
        }


        /* =====================================================
           IMAGE GLOW
           ===================================================== */

        .codm-industry-image-glow {
          background:
            radial-gradient(
              circle,
              rgba(114, 92, 255, 0.24),
              transparent 70%
            );

          filter: blur(55px);
          opacity: 0.8;

          animation: codmImageGlow 7s ease-in-out infinite;
        }

        .codm-industries-glow {
          background:
            radial-gradient(
              circle,
              rgba(114, 92, 255, 0.11),
              transparent 70%
            );

          filter: blur(120px);
          opacity: 0.8;

          animation: codmMainGlow 12s ease-in-out infinite;
        }

        .codm-industries-glow-secondary {
          background:
            radial-gradient(
              circle,
              rgba(79, 70, 229, 0.06),
              transparent 70%
            );

          filter: blur(100px);

          animation: codmSecondaryGlow 10s ease-in-out infinite;
        }


        /* =====================================================
           VIEW ALL
           ===================================================== */

        .codm-industry-view-link {
          position: relative;
          transition:
            color 300ms ease,
            transform 400ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .codm-industry-view-link:hover {
          color: var(--accent);
          transform: translateX(4px);
        }

        .codm-industry-arrow {
          display: inline-block;
          transition:
            transform 400ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .codm-industry-view-link:hover .codm-industry-arrow {
          transform: translateX(5px);
        }


        /* =====================================================
           KEYFRAMES
           ===================================================== */

        @keyframes codmIndustriesHeading {
          from {
            opacity: 0;
            transform: translateY(35px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes codmIndustryCard {
          from {
            opacity: 0;
            transform: translateY(40px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes codmCardContent {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }

          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes codmImageWrapper {
          from {
            opacity: 0;
            transform: translateX(30px);
          }

          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes codmIndustryImage {
          from {
            opacity: 0;
            transform: scale(1.055);
          }

          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes codmAccentReveal {
          from {
            width: 0;
            opacity: 0;
          }

          to {
            width: 40px;
            opacity: 1;
          }
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


        /* =====================================================
           MOBILE
           ===================================================== */

        @media (max-width: 767px) {

          .codm-industries-section {
            padding-top: 80px;
            padding-bottom: 80px;
          }

          .codm-industry-card:hover {
            transform: none;
          }

          .codm-industry-card:hover
          .codm-industry-image-container {
            transform: none;
          }

          .codm-industry-card:hover .codm-industry-image {
            transform: scale(1);
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


        /* =====================================================
           REDUCED MOTION
           ===================================================== */

        @media (prefers-reduced-motion: reduce) {

          .codm-industries-heading,
          .codm-industry-card,
          .codm-industry-card-content,
          .codm-industry-image-wrapper,
          .codm-industry-image,
          .codm-industry-image-container,
          .codm-industry-accent {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }

          .codm-industries-glow,
          .codm-industries-glow-secondary,
          .codm-industry-image-glow {
            animation: none !important;
          }

        }

      `}</style>
    </>
  );
}

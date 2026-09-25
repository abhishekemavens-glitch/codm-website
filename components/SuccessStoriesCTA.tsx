import Link from "next/link";

/*
 * Save as: components/SuccessStoriesCTA.tsx
 *
 * Compact CTA banner: heading, description, button, and a decorative
 * line-chart graphic on the right. Fetches its own content from the
 * "Success Stories CTA" custom post type.
 */

const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

type SuccessCtaFields = {
  heading: string | null;
  description: string | null;
  buttonText: string | null;
  buttonUrl: string | null;
};

async function getSuccessCtaData(): Promise<SuccessCtaFields | null> {
  try {
    const response = await fetch(WORDPRESS_GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query GetSuccessCta {
            successCtas(first: 1) {
              nodes {
                successCtaFields {
                  heading
                  description
                  buttonText
                  buttonUrl
                }
              }
            }
          }
        `,
      }),
      next: { revalidate: 60 },
    });

    if (!response.ok) return null;

    const result = await response.json();
    return result?.data?.successCtas?.nodes?.[0]?.successCtaFields ?? null;
  } catch {
    return null;
  }
}

export default async function SuccessStoriesCTA() {
  const data = await getSuccessCtaData();

  if (!data) return null;

  const hasButton = Boolean(data.buttonText && data.buttonUrl);

  if (!data.heading && !data.description && !hasButton) {
    return null;
  }

  return (
    <section className="px-6 py-12">
      <div className="mx-auto max-w-[1200px]">
        <div className="relative grid items-center overflow-hidden rounded-[24px] bg-[linear-gradient(120deg,#f1eefd_0%,#e6e0fb_55%,#ddd5fa_100%)] p-8 md:grid-cols-[1.2fr_1fr] md:p-12">
          {/* ---------- Left: text ---------- */}
          <div className="relative z-10">
            {data.heading && (
              <h2 className="text-[clamp(22px,2.6vw,30px)] font-medium leading-[1.2] tracking-[-0.02em] text-[#1e2230]">
                {data.heading}
              </h2>
            )}

            {data.description && (
              <p className="mt-3 max-w-[440px] text-[15px] leading-[1.6] text-[#5b6072]">
                {data.description}
              </p>
            )}

            {hasButton && (
              <Link
                href={data.buttonUrl!}
                className="mt-6 inline-flex h-[46px] items-center gap-2 rounded-full bg-[#4b3fce] px-6 text-[14px] font-medium text-white transition-transform hover:-translate-y-0.5"
              >
                {data.buttonText}
                <span aria-hidden="true">→</span>
              </Link>
            )}
          </div>

          {/* ---------- Right: decorative chart ---------- */}
          <div className="pointer-events-none relative mt-8 hidden h-[140px] md:mt-0 md:block">
            <svg
              viewBox="0 0 420 160"
              fill="none"
              className="absolute inset-0 h-full w-full opacity-70"
              aria-hidden="true"
            >
              {/* faint vertical bars */}
              {[20, 60, 100, 140, 180, 220, 260, 300, 340, 380].map(
                (x, i) => (
                  <rect
                    key={i}
                    x={x}
                    y={160 - (30 + (i % 4) * 20)}
                    width="14"
                    height={30 + (i % 4) * 20}
                    rx="3"
                    fill="#7c6cf0"
                    opacity="0.15"
                  />
                )
              )}

              {/* soft area fill under the line */}
              <path
                d="M10 120 L60 90 L110 130 L160 70 L210 100 L260 50 L310 80 L360 20 L410 40 L410 160 L10 160 Z"
                fill="url(#successCtaFade)"
              />

              {/* main line */}
              <path
                d="M10 120 L60 90 L110 130 L160 70 L210 100 L260 50 L310 80 L360 20 L410 40"
                stroke="#4b3fce"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* points */}
              {[
                [10, 120],
                [60, 90],
                [110, 130],
                [160, 70],
                [210, 100],
                [260, 50],
                [310, 80],
                [360, 20],
                [410, 40],
              ].map(([cx, cy], i) => (
                <circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r="4"
                  fill="#ffffff"
                  stroke="#4b3fce"
                  strokeWidth="2"
                />
              ))}

              <defs>
                <linearGradient
                  id="successCtaFade"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#7c6cf0" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#7c6cf0" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

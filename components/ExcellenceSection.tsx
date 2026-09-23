/*
 * Save as: components/ExcellenceSection.tsx
 *
 * "Our Excellence" section: eyebrow + two-line heading (via the shared
 * SectionHeading component), a 3x2 grid of features, and a row of
 * repeated certification badges. Fetches its own content from the
 * "Our Excellence" custom post type. Theme-aware colors live in CSS
 * via .codm-alt-* / .codm-feature-* classes -- see the
 * [data-theme="dark"] overrides in the shared stylesheet.
 */

import SectionHeading from "@/components/SectionHeading";

const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

type ExcellenceFields = {
  eyebrow: string | null;
  heading1: string | null;
  heading2: string | null;
  description: string | null;
  badgeImage: string | null;
  badgeCount: string | null;
  feature1Icon: string | null;
  feature1Title: string | null;
  feature2Icon: string | null;
  feature2Title: string | null;
  feature3Icon: string | null;
  feature3Title: string | null;
  feature4Icon: string | null;
  feature4Title: string | null;
  feature5Icon: string | null;
  feature5Title: string | null;
  feature6Icon: string | null;
  feature6Title: string | null;
};

async function getExcellenceData(): Promise<ExcellenceFields | null> {
  try {
    const response = await fetch(WORDPRESS_GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query GetExcellence {
            excellenceEntries(first: 1) {
              nodes {
                excellenceFields {
                  eyebrow
                  heading1
                  heading2
                  description
                  badgeImage
                  badgeCount
                  feature1Icon
                  feature1Title
                  feature2Icon
                  feature2Title
                  feature3Icon
                  feature3Title
                  feature4Icon
                  feature4Title
                  feature5Icon
                  feature5Title
                  feature6Icon
                  feature6Title
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
    return result?.data?.excellenceEntries?.nodes?.[0]?.excellenceFields ?? null;
  } catch {
    return null;
  }
}

/* =========================================================
   ICONS (thin outline style, currentColor so they follow
   .codm-feature-icon's theme-aware color)
========================================================= */

function SalesforceExpertiseIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
      <path
        d="M8 21C4.7 21 2 18.5 2 15.3C2 12.4 4.2 10 7.1 9.6C8.3 6.3 11.5 4 15.2 4C19.5 4 23.1 6.9 24.2 10.7C27.1 11 29.3 13.3 29.3 16.1C29.3 19 26.9 21.3 24 21.3H8Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="15.5" cy="15" r="3" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M11 21.5C11.7 19 13.4 17.7 15.5 17.7C17.6 17.7 19.3 19 20 21.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IntegrationsIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
      <circle cx="17" cy="17" r="5.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="6" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="28" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="6" cy="25" r="2.4" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="28" cy="25" r="2.4" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M8.2 10.7L13 14.5M25.8 10.7L21 14.5M8.2 23.3L13 19.5M25.8 23.3L21 19.5"
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
  );
}

function AiIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
      <path
        d="M17 3C11.5 3 7.3 7.2 7.3 12.4C7.3 15.9 9.2 18.6 12 20.2V23.5C12 24.3 12.7 25 13.5 25H20.5C21.3 25 22 24.3 22 23.5V20.2C24.8 18.6 26.7 15.9 26.7 12.4C26.7 7.2 22.5 3 17 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M13.5 29H20.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M14 12.5L16 16L20 10"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DatabaseIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
      <ellipse cx="14" cy="8" rx="9" ry="3.4" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5 8V22C5 23.9 9 25.4 14 25.4C15 25.4 16 25.3 16.9 25.2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M23 8V13.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 15C5 16.9 9 18.4 14 18.4" stroke="currentColor" strokeWidth="1.4" />
      <rect
        x="17"
        y="17"
        width="12"
        height="11"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M20 21.5C20 19.8 21.3 18.5 23 18.5C24.7 18.5 26 19.8 26 21.5V22.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <rect
        x="20"
        y="22.5"
        width="6"
        height="4.5"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function IndustryIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
      <circle cx="15" cy="15" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M15 6V24M6 15H24M8.5 8.5L21.5 21.5M21.5 8.5L8.5 21.5"
        stroke="currentColor"
        strokeWidth="1.1"
        opacity="0.6"
      />
      <circle cx="15" cy="15" r="3" fill="currentColor" opacity="0.15" />
      <circle cx="15" cy="15" r="1.6" fill="currentColor" />
      <path d="M21.5 21.5L28 28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function NetworkIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true">
      <circle cx="5" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="17" cy="20" r="2.4" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="29" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M7 10L15 18.5M27 10L19 18.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeDasharray="2.5 2.5"
      />
      <rect
        x="14"
        y="24"
        width="6"
        height="5"
        rx="1.2"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path d="M17 22.4V24" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function FeatureIcon({ type }: { type: string | null | undefined }) {
  switch ((type ?? "").toLowerCase().trim()) {
    case "salesforce":
      return <SalesforceExpertiseIcon />;
    case "integrations":
      return <IntegrationsIcon />;
    case "ai":
      return <AiIcon />;
    case "database":
      return <DatabaseIcon />;
    case "industry":
      return <IndustryIcon />;
    case "network":
      return <NetworkIcon />;
    default:
      return <IntegrationsIcon />;
  }
}

/* =========================================================
   COMPONENT
========================================================= */

export default async function ExcellenceSection() {
  const data = await getExcellenceData();

  if (!data) return null;

  const hasHeading = Boolean(data.eyebrow && data.heading1 && data.heading2);

  const features = ([1, 2, 3, 4, 5, 6] as const)
    .map((n) => ({
      icon: data[`feature${n}Icon` as keyof ExcellenceFields],
      title: data[`feature${n}Title` as keyof ExcellenceFields],
    }))
    .filter((f) => f.title);

  const badgeCount = Math.max(0, Math.min(30, Number(data.badgeCount) || 0));
  const badges = data.badgeImage
    ? Array.from({ length: badgeCount }, (_, i) => i)
    : [];

  if (!hasHeading && features.length === 0 && badges.length === 0) {
    return null;
  }

  return (
    <section className="codm-alt-section px-6 py-24">
      <div className="mx-auto max-w-[1200px]">
        {hasHeading && (
          <SectionHeading
            eyebrow={data.eyebrow!}
            title={data.heading1!}
            gradientText={data.heading2!}
            description={data.description ?? undefined}
          />
        )}

        {features.length > 0 && (
          <div className="mt-14 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="codm-feature-row flex items-center justify-between gap-4 pb-4"
              >
                <div className="flex items-center gap-4">
                  <span className="codm-feature-icon">
                    <FeatureIcon type={feature.icon} />
                  </span>
                  <span className="codm-feature-title text-[17px]">
                    {feature.title}
                  </span>
                </div>

                <span
                  aria-hidden="true"
                  className="codm-feature-plus flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M6 1V11M1 6H11"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </div>
            ))}
          </div>
        )}

        {badges.length > 0 && (
          <div className="mt-14 flex flex-wrap items-center justify-center gap-6">
            {badges.map((i) => (
              <img
                key={i}
                src={data.badgeImage!}
                alt="Certified Administrator"
                className="h-[90px] w-auto select-none"
                draggable={false}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/*
 * Save as: components/PurposeSection.tsx
 *
 * "Our Purpose" section with Vision and Mission cards. Fetches its own
 * content from the "Our Purpose" custom post type in WordPress.
 * Theme-aware colors (light/dark) live in CSS via .codm-alt-* classes
 * -- see the [data-theme="dark"] overrides in the shared stylesheet.
 */

import SectionHeading from "@/components/SectionHeading";

const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

type PurposeFields = {
  eyebrow: string | null;
  heading1: string | null;
  heading2: string | null;
  visionTitle: string | null;
  visionText: string | null;
  missionTitle: string | null;
  missionText: string | null;
};

async function getPurposeData(): Promise<PurposeFields | null> {
  try {
    const response = await fetch(WORDPRESS_GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query GetPurpose {
            purposeEntries(first: 1) {
              nodes {
                purposeFields {
                  eyebrow
                  heading1
                  heading2
                  visionTitle
                  visionText
                  missionTitle
                  missionText
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
    return result?.data?.purposeEntries?.nodes?.[0]?.purposeFields ?? null;
  } catch {
    return null;
  }
}

export default async function PurposeSection() {
  const data = await getPurposeData();

  const eyebrow = data?.eyebrow;
  const heading1 = data?.heading1;
  const heading2 = data?.heading2;
  const visionTitle = data?.visionTitle;
  const visionText = data?.visionText;
  const missionTitle = data?.missionTitle;
  const missionText = data?.missionText;

  const hasHeading = Boolean(eyebrow && heading1 && heading2);
  const hasVision = Boolean(visionTitle || visionText);
  const hasMission = Boolean(missionTitle || missionText);

  if (!hasHeading && !hasVision && !hasMission) {
    return null;
  }

  return (
    <section className="codm-alt-section px-6 py-24">
      <div className="mx-auto max-w-[1100px]">
        {hasHeading && (
          <SectionHeading
            eyebrow={eyebrow!}
            title={heading1!}
            gradientText={heading2!}
          />
        )}

        {(hasVision || hasMission) && (
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {hasVision && (
              <div className="codm-alt-card rounded-[20px] p-9">
                {visionTitle && (
                  <h3 className="text-[24px] font-normal text-[var(--foreground)]">
                    {visionTitle}
                  </h3>
                )}
                {visionText && (
                  <p className="codm-alt-body mt-4 text-[15px] leading-[1.7]">
                    {visionText}
                  </p>
                )}
              </div>
            )}

            {hasMission && (
              <div className="codm-alt-card rounded-[20px] p-9">
                {missionTitle && (
                  <h3 className="text-[24px] font-normal text-[var(--foreground)]">
                    {missionTitle}
                  </h3>
                )}
                {missionText && (
                  <p className="codm-alt-body mt-4 text-[15px] leading-[1.7]">
                    {missionText}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/*
 * Save as: components/PurposeSection.tsx
 *
 * "Our Purpose" section with Vision and Mission cards, editable per-page
 * from WordPress (Pages -> [any page] -> "Our Purpose section" box).
 */

export type PurposeSectionData = {
  eyebrow?: string | null;
  heading1?: string | null;
  heading2?: string | null;
  visionTitle?: string | null;
  visionText?: string | null;
  missionTitle?: string | null;
  missionText?: string | null;
};

type PurposeSectionProps = {
  data?: PurposeSectionData | null;
};

export default function PurposeSection({ data }: PurposeSectionProps) {
  const eyebrow = data?.eyebrow;
  const heading1 = data?.heading1;
  const heading2 = data?.heading2;
  const visionTitle = data?.visionTitle;
  const visionText = data?.visionText;
  const missionTitle = data?.missionTitle;
  const missionText = data?.missionText;

  const hasHeading = Boolean(eyebrow || heading1 || heading2);
  const hasVision = Boolean(visionTitle || visionText);
  const hasMission = Boolean(missionTitle || missionText);

  /* Nothing to show at all: skip the section entirely rather than
     rendering an empty shell. */
  if (!hasHeading && !hasVision && !hasMission) {
    return null;
  }

  return (
    <section className="bg-[#f7f8fb] px-6 py-24">
      <div className="mx-auto max-w-[1100px]">
        {hasHeading && (
          <div className="text-center">
            {eyebrow && (
              <div className="flex items-center justify-center gap-3 text-[13px] font-medium tracking-[0.14em] text-[#6b7086]">
                <span className="h-px w-10 bg-[#c7c2f5]" aria-hidden="true" />
                {eyebrow}
                <span className="h-px w-10 bg-[#c7c2f5]" aria-hidden="true" />
              </div>
            )}

            {(heading1 || heading2) && (
              <h2 className="mx-auto mt-5 max-w-[760px] text-[clamp(32px,4vw,44px)] font-normal leading-[1.15] tracking-[-0.02em] text-[var(--foreground)]">
                {heading1}
                {heading1 && heading2 && <br />}
                {heading2 && (
                  <span className="text-[#7c6cf0]">{heading2}</span>
                )}
              </h2>
            )}
          </div>
        )}

        {(hasVision || hasMission) && (
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {hasVision && (
              <div className="rounded-[20px] border border-black/[0.06] bg-white/60 p-9">
                {visionTitle && (
                  <h3 className="text-[24px] font-normal text-[var(--foreground)]">
                    {visionTitle}
                  </h3>
                )}
                {visionText && (
                  <p className="mt-4 text-[15px] leading-[1.7] text-[#6b7086]">
                    {visionText}
                  </p>
                )}
              </div>
            )}

            {hasMission && (
              <div className="rounded-[20px] border border-black/[0.06] bg-white/60 p-9">
                {missionTitle && (
                  <h3 className="text-[24px] font-normal text-[var(--foreground)]">
                    {missionTitle}
                  </h3>
                )}
                {missionText && (
                  <p className="mt-4 text-[15px] leading-[1.7] text-[#6b7086]">
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

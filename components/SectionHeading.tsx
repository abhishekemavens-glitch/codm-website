// components/SectionHeading.tsx
import { splitWords } from "@/lib/codm-animations";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  gradientText: string;
  description?: string;
};

export default function SectionHeading({
  eyebrow,
  title,
  gradientText,
  description,
}: SectionHeadingProps) {
  return (
    <div className="heading-codm-wrap mx-auto max-w-[900px] text-center">

      {/* EYEBROW */}
      <div className="heading-codm-eyebrow-wrap">
        <span
          aria-hidden="true"
          className="heading-codm-eyebrow-line"
        />

        <span className="heading-codm-eyebrow">
          {eyebrow}
        </span>

        <span
          aria-hidden="true"
          className="heading-codm-eyebrow-line"
        />
      </div>

      {/* HEADING */}
      <h2 className="heading-codm-title">
        {splitWords(title)}

        <span className="heading-codm-title-gradient">
          {splitWords(gradientText)}
        </span>
      </h2>

      {/* DESCRIPTION */}
      {description && (
        <p className="heading-codm-description mx-auto mt-6 max-w-[650px] text-sm leading-6 text-[var(--muted)] md:text-base">
          {description}
        </p>
      )}

    </div>
  );
}

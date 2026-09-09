// components/SectionHeading.tsx
import { splitWords } from "@/lib/codm-animations";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  gradientText: string;
  description?: string;
  /**
   * When true, keeps `title` and `gradientText` on the same line
   * (e.g. "Our Latest Blogs" with only "Latest Blogs" gradient-colored).
   * When false/omitted, gradientText drops to its own line below
   * title (e.g. Industries/Why CODM headings).
   */
  inline?: boolean;
};

export default function SectionHeading({
  eyebrow,
  title,
  gradientText,
  description,
  inline = false,
}: SectionHeadingProps) {
  return (
    <div className="heading-codm-wrap mx-auto max-w-[900px] text-center">
      <div className="heading-codm-eyebrow-wrap">
        <span aria-hidden="true" className="heading-codm-eyebrow-line" />
        <span className="heading-codm-eyebrow">{eyebrow}</span>
        <span aria-hidden="true" className="heading-codm-eyebrow-line" />
      </div>

      <h2 className="heading-codm-title codm-word-stagger">
        {splitWords(title)}
        {inline ? " " : null}
        <span
          className={`heading-codm-title-gradient${
            inline ? " heading-codm-title-gradient-inline" : ""
          }`}
        >
          {gradientText}
        </span>
      </h2>

      {description && (
        <p className="heading-codm-description mx-auto mt-6 max-w-[650px] text-sm leading-6 text-[var(--muted)] md:text-base">
          {description}
        </p>
      )}
    </div>
  );
}

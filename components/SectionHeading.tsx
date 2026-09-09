// components/SectionHeading.tsx
"use client";

import { splitWords, useInViewOnce } from "@/lib/codm-animations";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  gradientText: string;
  description?: string;
  inline?: boolean;
};

export default function SectionHeading({
  eyebrow,
  title,
  gradientText,
  description,
  inline = false,
}: SectionHeadingProps) {
  const { ref, isVisible } = useInViewOnce<HTMLDivElement>(0.2);

  return (
    <div
      ref={ref}
      className={`heading-codm-wrap mx-auto max-w-[900px] text-center ${
        isVisible ? "codm-visible" : ""
      }`}
    >
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

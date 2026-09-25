// components/SectionHeading.tsx
"use client";

import { splitWords, useRevealSequence } from "@/lib/codm-animations";

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
  const {
    ref,
    isVisible,
  } = useRevealSequence<HTMLDivElement>(0);

  return (
    <div
      ref={ref}
      className="heading-codm-wrap mx-auto max-w-[900px] text-center"
    >
      {/* EYEBROW */}
      <div
        className={`
          heading-codm-eyebrow-wrap
          codm-reveal
          ${isVisible ? "codm-visible" : ""}
        `}
        style={{
          transitionDelay: "0.05s",
        }}
      >
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

      {/* MAIN HEADING */}
      <h2
        className={`
          heading-codm-title
          codm-reveal-heading
          ${isVisible ? "codm-visible" : ""}
        `}
        style={{
          transitionDelay: "0.15s",
        }}
      >
        {splitWords(title)}

        {inline ? " " : null}

        <span
          className={`
            heading-codm-title-gradient
            ${inline ? "heading-codm-title-gradient-inline" : ""}
          `}
        >
          {gradientText}
        </span>
      </h2>

      {/* DESCRIPTION */}
      {description && (
        <p
          className={`
            heading-codm-description
            codm-reveal
            ${isVisible ? "codm-visible" : ""}
            mx-auto
            mt-6
            max-w-[650px]
            text-sm
            leading-6
            text-[var(--muted)]
            md:text-base
          `}
          style={{
            transitionDelay: "0.3s",
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}

// components/SectionHeading.tsx
"use client";

import { splitWords, useInViewOnce } from "@/lib/codm-animations";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  gradientText: string;
  description?: string;
  inline?: boolean;
  /* "center" (default, unchanged) or "left" for split / two-column layouts */
  align?: "center" | "left";
};

export default function SectionHeading({
  eyebrow,
  title,
  gradientText,
  description,
  inline = false,
  align = "center",
}: SectionHeadingProps) {
  const { ref, isVisible } = useInViewOnce<HTMLDivElement>(0.2);

  const isLeft = align === "left";

  return (
    <div
      ref={ref}
      className={`heading-codm-wrap max-w-[900px] ${
        isLeft ? "text-left" : "mx-auto text-center"
      } ${isVisible ? "codm-visible" : ""}`}
    >
      {/* EYEBROW */}
      {eyebrow && (
        <div
          className="heading-codm-eyebrow-wrap"
          style={
            isLeft
              ? { justifyContent: "flex-start", marginLeft: 0 }
              : undefined
          }
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
      )}

      {/* MAIN HEADING */}
      <h2
        className="heading-codm-title"
        style={
          isLeft
            ? { textAlign: "left", marginLeft: 0 }
            : undefined
        }
      >
        {/* NORMAL TEXT */}
        <span className="codm-word-stagger">
          {splitWords(title)}
        </span>

        {/* GRADIENT TEXT */}
        {gradientText && (
          <>
            {" "}
            <span className="heading-codm-title-gradient codm-gradient-text">
              {splitWords(gradientText)}
            </span>
          </>
        )}
      </h2>

      {/* DESCRIPTION */}
      {description && (
        <p
          className={`heading-codm-description mt-6 max-w-[650px] text-sm leading-6 text-[var(--muted)] md:text-base ${
            isLeft ? "" : "mx-auto"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}

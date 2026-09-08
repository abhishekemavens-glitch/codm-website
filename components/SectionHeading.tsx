// components/SectionHeading.tsx
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
      <div className="heading-codm-eyebrow-wrap">
        <span aria-hidden="true" className="heading-codm-eyebrow-line" />
        <span className="heading-codm-eyebrow">{eyebrow}</span>
        <span aria-hidden="true" className="heading-codm-eyebrow-line" />
      </div>

      <h2 className="heading-codm-title">
        {title}
        <span className="heading-codm-title-gradient">{gradientText}</span>
      </h2>

      {description && (
        <p className="heading-codm-description mx-auto mt-6 max-w-[650px] text-sm leading-6 text-[var(--muted)] md:text-base">
          {description}
        </p>
      )}
    </div>
  );
}

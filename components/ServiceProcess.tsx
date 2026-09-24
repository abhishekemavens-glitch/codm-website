"use client";

type ServiceProcessData = {
  processEyebrow: string;
  processHeading: string;
  processHighlight: string;
  processDescription: string;
  processCtaText: string;
  processCtaUrl: string;

  processStep1Title: string;
  processStep1Description: string;

  processStep2Title: string;
  processStep2Description: string;

  processStep3Title: string;
  processStep3Description: string;

  processStep4Title: string;
  processStep4Description: string;
};

export default function ServiceProcess({
  data,
}: {
  data: ServiceProcessData;
}) {
  const steps = [
    {
      title: data.processStep1Title,
      description: data.processStep1Description,
    },
    {
      title: data.processStep2Title,
      description: data.processStep2Description,
    },
    {
      title: data.processStep3Title,
      description: data.processStep3Description,
    },
    {
      title: data.processStep4Title,
      description: data.processStep4Description,
    },
  ].filter((step) => step.title);

  /*
   * Don't render the section if there is
   * no heading and no process steps.
   */
  if (steps.length === 0 && !data.processHeading) {
    return null;
  }

  return (
    <section className="codm-process-section-wrap">
      <div className="codm-process-inner">

        {/* EYEBROW */}
        {data.processEyebrow && (
          <div className="codm-process-eyebrow">
            <span></span>

            {data.processEyebrow}

            <span></span>
          </div>
        )}

        {/* HEADING */}
        {data.processHeading && (
          <h2 className="codm-process-heading">
            {data.processHeading}{" "}

            {data.processHighlight && (
              <span className="codm-process-highlight">
                {data.processHighlight}
              </span>
            )}
          </h2>
        )}

        {/* DESCRIPTION */}
        {data.processDescription && (
          <p className="codm-process-description">
            {data.processDescription}
          </p>
        )}

        {/* PROCESS STEPS */}
        {steps.length > 0 && (
          <div className="codm-process-steps">
            {steps.map((step, index) => (
              <div
                key={index}
                className="codm-process-step"
              >
                <div className="codm-process-step-number">
                  0{index + 1}
                </div>

                <div className="codm-process-step-title">
                  {step.title}
                </div>

                {step.description && (
                  <div className="codm-process-step-description">
                    {step.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        {data.processCtaText && (
          <a
            href={data.processCtaUrl || "/contact"}
            className="codm-process-cta"
          >
            {data.processCtaText}

            <span aria-hidden="true">
              ↗
            </span>
          </a>
        )}

      </div>
    </section>
  );
}

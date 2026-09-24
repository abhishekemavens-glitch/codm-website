/*
 * Save as: components/ServiceProcess.tsx
 *
 * "The CODM Difference" process section. The fields for this live on
 * an individual Service entry (see the "The CODM Difference" admin
 * screen under Services), so this fetches every Service and uses
 * whichever one actually has process content filled in.
 */
 
import SectionHeading from "@/components/SectionHeading";

const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

type ServiceProcessData = {
  processEyebrow: string | null;
  processHeading: string | null;
  processHighlight: string | null;
  processDescription: string | null;
  processCtaText: string | null;
  processCtaUrl: string | null;

  processStep1Title: string | null;
  processStep1Description: string | null;

  processStep2Title: string | null;
  processStep2Description: string | null;

  processStep3Title: string | null;
  processStep3Description: string | null;

  processStep4Title: string | null;
  processStep4Description: string | null;
};

async function getServiceProcessData(): Promise<ServiceProcessData | null> {
  try {
    const response = await fetch(WORDPRESS_GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query GetServiceProcess {
            services(first: 50) {
              nodes {
                processEyebrow
                processHeading
                processHighlight
                processDescription
                processCtaText
                processCtaUrl
                processStep1Title
                processStep1Description
                processStep2Title
                processStep2Description
                processStep3Title
                processStep3Description
                processStep4Title
                processStep4Description
              }
            }
          }
        `,
      }),
      next: { revalidate: 60 },
    });

    if (!response.ok) return null;

    const result = await response.json();
    if (result.errors) {
      console.error("GraphQL Error (ServiceProcess):", result.errors);
      return null;
    }

    const nodes = result?.data?.services?.nodes ?? [];

    /* Use whichever Service entry actually has this section filled in */
    return (
      nodes.find((node: ServiceProcessData) => node.processHeading) ?? null
    );
  } catch (error) {
    console.error("Failed to load service process:", error);
    return null;
  }
}

export default async function ServiceProcess() {
  const data = await getServiceProcessData();

  if (!data) return null;

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

  if (steps.length === 0 && !data.processHeading) {
    return null;
  }

  return (
    <section className="codm-process-section-wrap">
      <div className="codm-process-inner">
       {data.processHeading && (
  <SectionHeading
    eyebrow={data.processEyebrow}
    title={data.processHeading}
    gradientText={data.processHighlight}
    description={data.processDescription}
  />
)}

        {steps.length > 0 && (
          <div className="codm-process-steps">
            {steps.map((step, index) => (
              <div key={index} className="codm-process-step">
                <div className="codm-process-step-number">
                  0{index + 1}
                </div>

                <div className="codm-process-step-title">{step.title}</div>

                {step.description && (
                  <div className="codm-process-step-description">
                    {step.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      {data.processCtaText && (
  <a href={data.processCtaUrl || "/contact"} className="contact-cta-button">
    {data.processCtaText}
    <span className="codm-header-cta-arrow" aria-hidden="true">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M3.5 10.5L10.5 3.5M4.5 3.5h6v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  </a>
)}
      </div>
    </section>
  );
}

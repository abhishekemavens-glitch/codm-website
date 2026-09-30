import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";

/*
 * Save as: components/AiIntelligenceOverview.tsx
 *
 * "AI & Intelligence" overview: eyebrow + full-gradient heading (via
 * the shared SectionHeading component), then a 3-card grid. Fetches
 * its own content from the "AI & Intelligence Overview" custom post
 * type.
 */

const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

type AiCard = {
  id: string;
  title: string;
  aiFields: {
    icon: string | null;
    description: string | null;
    linkText: string | null;
    linkUrl: string | null;
  } | null;
};

async function getAiCards(): Promise<AiCard[]> {
  try {
    const response = await fetch(WORDPRESS_GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query GetAiOverviews {
            aiOverviews(
              first: 20
              where: { orderby: { field: MENU_ORDER, order: ASC } }
            ) {
              nodes {
                id
                title
                aiFields {
                  icon
                  description
                  linkText
                  linkUrl
                }
              }
            }
          }
        `,
      }),
      next: { revalidate: 60 },
    });

    if (!response.ok) return [];

    const result = await response.json();
    if (result.errors) {
      console.error("GraphQL Error (AiIntelligenceOverview):", result.errors);
      return [];
    }
    return result?.data?.aiOverviews?.nodes ?? [];
  } catch {
    return [];
  }
}

/* =========================================================
   ICONS
========================================================= */

function SparkleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M11 2L12.6 8.4L19 10L12.6 11.6L11 18L9.4 11.6L3 10L9.4 8.4L11 2Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M18.5 14L19.2 16.3L21.5 17L19.2 17.7L18.5 20L17.8 17.7L15.5 17L17.8 16.3L18.5 14Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LlmIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 3C6 3 5 4.5 5.3 6.2C3.7 6.7 3 8.4 3.8 9.8C3 11 3.3 12.8 4.7 13.5C4.4 15.2 5.6 16.7 7.3 16.7C7.5 18.4 9.3 19.5 10.8 18.6"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M16 3C18 3 19 4.5 18.7 6.2C20.3 6.7 21 8.4 20.2 9.8C21 11 20.7 12.8 19.3 13.5C19.6 15.2 18.4 16.7 16.7 16.7C16.5 18.4 14.7 19.5 13.2 18.6"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M12 3V19"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeDasharray="1.5 2.5"
      />
    </svg>
  );
}

function DataAiIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="5.5" cy="18" r="2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="18.5" cy="18" r="2" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M12 6.5V11M12 11L5.5 16M12 11L18.5 16"
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
  );
}

function AiCardIcon({ type }: { type: string | null | undefined }) {
  switch ((type ?? "").toLowerCase().trim()) {
    case "agentforce":
      return <SparkleIcon />;
    case "llm":
      return <LlmIcon />;
    case "data":
      return <DataAiIcon />;
    default:
      return <SparkleIcon />;
  }
}

/* =========================================================
   COMPONENT
========================================================= */

export default async function AiIntelligenceOverview() {
  const cards = await getAiCards();

  if (cards.length === 0) return null;

  return (
    <section className="bg-[var(--background)] px-6 py-24 intelligence-sect">
      <div className="mx-auto max-w-[1200px]">
        <SectionHeading
          eyebrow="AI & Intelligence"
          title=""
          gradientText="Build Smarter with AI"
          description="Combine AI, LLMs and business data to automate workflows, improve decision-making and create intelligent customer experiences."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {cards.map((card) => {
            const fields = card.aiFields;
            const hasLink = Boolean(fields?.linkText && fields?.linkUrl);

            return (
              <div
                key={card.id}
                className="rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-8"
              >
                <div className="flex h-9 w-9 items-center justify-center text-[var(--accent)]">
                  <AiCardIcon type={fields?.icon} />
                </div>

                <h3 className="mt-6 text-[19px] font-semibold text-[var(--foreground)]">
                  {card.title}
                </h3>

                {fields?.description && (
                  <p className="mt-2 text-[14px] leading-[1.6] text-[var(--muted)]">
                    {fields.description}
                  </p>
                )}

                {hasLink && (
                  <Link
                    href={fields!.linkUrl!}
                    className="mt-5 inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--accent)] transition-transform hover:translate-x-0.5"
                  >
                    {fields!.linkText}
                    <span aria-hidden="true">→</span>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

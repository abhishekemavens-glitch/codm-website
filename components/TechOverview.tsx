import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";

/*
 * Save as: components/TechOverview.tsx
 *
 * "Custom Technology" overview: eyebrow + full-gradient heading (via
 * the shared SectionHeading component), then a grid of cards using a
 * horizontal layout (icon circle on the left, text stacked to the
 * right). Fetches its own content from the "Custom Technology
 * Overview" custom post type.
 */

const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

type TechCard = {
  id: string;
  title: string;
  techFields: {
    icon: string | null;
    description: string | null;
    linkText: string | null;
    linkUrl: string | null;
  } | null;
};

async function getTechCards(): Promise<TechCard[]> {
  try {
    const response = await fetch(WORDPRESS_GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query GetTechOverviews {
            techOverviews(
              first: 20
              where: { orderby: { field: MENU_ORDER, order: ASC } }
            ) {
              nodes {
                id
                title
                techFields {
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
      console.error("GraphQL Error (TechOverview):", result.errors);
      return [];
    }
    return result?.data?.techOverviews?.nodes ?? [];
  } catch {
    return [];
  }
}

/* =========================================================
   ICONS
========================================================= */

function DotnetIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M4 14V6L11 14V6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="15" cy="14" r="1.1" fill="currentColor" />
    </svg>
  );
}

function ReactIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="1.6" fill="currentColor" />
      <ellipse cx="10" cy="10" rx="8" ry="3.2" stroke="currentColor" strokeWidth="1.2" />
      <ellipse
        cx="10"
        cy="10"
        rx="8"
        ry="3.2"
        stroke="currentColor"
        strokeWidth="1.2"
        transform="rotate(60 10 10)"
      />
      <ellipse
        cx="10"
        cy="10"
        rx="8"
        ry="3.2"
        stroke="currentColor"
        strokeWidth="1.2"
        transform="rotate(120 10 10)"
      />
    </svg>
  );
}

function PythonIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 2.5C7.5 2.5 7.2 3.6 7.2 3.6V5.3H10.1V5.8H5.8C5.8 5.8 3.5 5.5 3.5 9.9C3.5 14.3 5.5 14.1 5.5 14.1H6.9V12.1C6.9 12.1 6.8 10.1 8.8 10.1H11.6C11.6 10.1 13.5 10.1 13.5 8.2V4.6C13.5 4.6 13.8 2.5 10 2.5Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <path
        d="M10 17.5C12.5 17.5 12.8 16.4 12.8 16.4V14.7H9.9V14.2H14.2C14.2 14.2 16.5 14.5 16.5 10.1C16.5 5.7 14.5 5.9 14.5 5.9H13.1V7.9C13.1 7.9 13.2 9.9 11.2 9.9H8.4C8.4 9.9 6.5 9.9 6.5 11.8V15.4C6.5 15.4 6.2 17.5 10 17.5Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="4.2" r="0.5" fill="currentColor" />
      <circle cx="12" cy="15.8" r="0.5" fill="currentColor" />
    </svg>
  );
}

function ApiIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="7.2" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="10" cy="10" r="1.6" fill="currentColor" />
      <path
        d="M10 2.8V5.4M10 14.6V17.2M2.8 10H5.4M14.6 10H17.2"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DataMigrationIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <ellipse cx="6.5" cy="5" rx="3.7" ry="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M2.8 5V9.5C2.8 10.3 4.4 11 6.5 11C8.6 11 10.2 10.3 10.2 9.5V5"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path d="M2.8 7.3C2.8 8.1 4.4 8.7 6.5 8.7C8.6 8.7 10.2 8.1 10.2 7.3" stroke="currentColor" strokeWidth="1.1" />
      <path
        d="M11.5 10.5L14 13L11.5 15.5M14 13H8"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <ellipse cx="14" cy="15.5" rx="2.7" ry="1.1" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

function TechCardIcon({ type }: { type: string | null | undefined }) {
  switch ((type ?? "").toLowerCase().trim()) {
    case "dotnet":
      return <DotnetIcon />;
    case "react":
      return <ReactIcon />;
    case "python":
      return <PythonIcon />;
    case "api":
      return <ApiIcon />;
    case "data":
      return <DataMigrationIcon />;
    default:
      return <ApiIcon />;
  }
}

/* =========================================================
   COMPONENT
========================================================= */

export default async function TechOverview() {
  const cards = await getTechCards();

  if (cards.length === 0) return null;

  return (
    <section className="bg-[var(--background)] px-6 py-24 custom-technology">
      <div className="mx-auto max-w-[1200px]">
        <SectionHeading
          eyebrow="Custom Technology"
          title=""
          gradientText="Technology Built Around Your Business"
          description="Build custom applications and integrations using modern technologies."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {cards.map((card) => {
            const fields = card.techFields;
            const hasLink = Boolean(fields?.linkText && fields?.linkUrl);

            return (
              <div
                key={card.id}
                className="flex items-start gap-4 rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-7"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
                  <TechCardIcon type={fields?.icon} />
                </div>

                <div>
                  <h3 className="text-[17px] font-semibold text-[var(--foreground)]">
                    {card.title}
                  </h3>

                  {fields?.description && (
                    <p className="mt-1.5 text-[14px] leading-[1.55] text-[var(--muted)]">
                      {fields.description}
                    </p>
                  )}

                  {hasLink && (
                    <Link
                      href={fields!.linkUrl!}
                      className="mt-3 inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--accent)] transition-transform hover:translate-x-0.5"
                    >
                      {fields!.linkText}
                      <span aria-hidden="true">→</span>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

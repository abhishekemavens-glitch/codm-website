import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";

const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

type ProductCard = {
  id: string;
  title: string;
  overviewFields: {
    icon: string | null;
    description: string | null;
    linkText: string | null;
    linkUrl: string | null;
  } | null;
};

async function getProductCards(): Promise<ProductCard[]> {
  try {
    const response = await fetch(WORDPRESS_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          query GetProductOverviews {
            productOverviews(first: 20) {
              nodes {
                id
                title
                overviewFields {
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
      next: {
        revalidate: 60,
      },
    });

    const result = await response.json();

    console.log(
      "========================================"
    );
    console.log(
      "PRODUCT OVERVIEWS GRAPHQL RESPONSE"
    );
    console.log(
      "========================================"
    );
    console.log(
      JSON.stringify(result, null, 2)
    );

    if (!response.ok) {
      console.error(
        "GraphQL HTTP ERROR:",
        response.status
      );
      return [];
    }

    if (result.errors) {
      console.error(
        "GRAPHQL ERRORS:",
        result.errors
      );
      return [];
    }

    const cards =
      result?.data?.productOverviews?.nodes ?? [];

    console.log(
      "PRODUCT CARDS FOUND:",
      cards.length
    );

    return cards;
  } catch (error) {
    console.error(
      "PRODUCT OVERVIEWS FETCH ERROR:",
      error
    );

    return [];
  }
}

function SalesforceIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 26 26"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6.5 16.5C3.5 16.5 1 14.2 1 11.4C1 8.9 3 6.9 5.6 6.6C6.5 4 8.9 2.2 11.7 2.2C14.7 2.2 17.2 4.2 18.1 6.9C20.5 7.1 22.4 9 22.4 11.4C22.4 13.9 20.3 16 17.8 16H6.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />

      <circle
        cx="11.5"
        cy="12"
        r="2.1"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}

function AiIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 26 26"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="6"
        y="6"
        width="14"
        height="14"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.4"
      />

      <circle
        cx="10.5"
        cy="12"
        r="1.2"
        fill="currentColor"
      />

      <circle
        cx="15.5"
        cy="12"
        r="1.2"
        fill="currentColor"
      />

      <path
        d="M9 16.5C10 17.5 16 17.5 17 16.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      <path
        d="M13 6V2.5M9 2.5H17"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      <path
        d="M2.5 10.5H6M20 10.5H23.5M2.5 15.5H6M20 15.5H23.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CustomTechIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 26 26"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="2"
        y="4"
        width="22"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.4"
      />

      <path
        d="M9 21H17M13 18V21"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />

      <path
        d="M9 8L6.5 11L9 14M17 8L19.5 11L17 14"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CardIcon({
  type,
}: {
  type: string | null | undefined;
}) {
  switch (
    (type ?? "").toLowerCase().trim()
  ) {
    case "salesforce":
      return <SalesforceIcon />;

    case "ai":
      return <AiIcon />;

    case "custom":
      return <CustomTechIcon />;

    default:
      return <CustomTechIcon />;
  }
}

export default async function ProductsOverview() {
  const cards = await getProductCards();

  console.log(
    "ProductsOverview cards:",
    cards
  );

  if (cards.length === 0) {
    return (
      <section className="px-6 py-24">
        <div className="mx-auto max-w-[1200px]">
          <p className="text-center text-red-500">
            Products & Platforms data not found.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[var(--background)] px-6 py-24">
      <div className="mx-auto max-w-[1200px]">

        <SectionHeading
          eyebrow="Overview"
          title=""
          gradientText="Products & Platforms"
          description="From Salesforce and AI-powered technologies to modern application platforms, CODM brings together the right technology to solve complex business challenges."
        />

        <div className="mt-14 grid gap-6 md:grid-cols-3">

          {cards.map((card) => {
            const fields = card.overviewFields;

            const hasLink =
              Boolean(
                fields?.linkText &&
                fields?.linkUrl
              );

            return (
              <div
                key={card.id}
                className="rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-8"
              >

                <div className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-[var(--accent)]/30 text-[var(--accent)]">
                  <CardIcon
                    type={fields?.icon}
                  />
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
                    <span aria-hidden="true">
                      →
                    </span>
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

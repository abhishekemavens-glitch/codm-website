import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";

const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

type TechnologyCard = {
  id: string;
  title: string;
  technologyFields: {
    icon: string | null;
    description: string | null;
    linkText: string | null;
    linkUrl: string | null;
  } | null;
};

/* =========================================================
   FETCH TECHNOLOGY CARDS FROM WORDPRESS
   ========================================================= */

async function getTechnologyCards(): Promise<TechnologyCard[]> {
  try {
    const response = await fetch(WORDPRESS_GRAPHQL_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        query: `
          query GetTechnologyCards {
            technologyCards(
              first: 20
              where: {
                orderby: {
                  field: MENU_ORDER
                  order: ASC
                }
              }
            ) {
              nodes {
                id
                title

                technologyFields {
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
      "TECHNOLOGY CARDS GRAPHQL RESPONSE"
    );

    console.log(
      "========================================"
    );

    console.log(
      JSON.stringify(result, null, 2)
    );

    /* -------------------------------------------------------
       HTTP ERROR
    ------------------------------------------------------- */

    if (!response.ok) {
      console.error(
        "GRAPHQL HTTP ERROR:",
        response.status
      );

      return [];
    }

    /* -------------------------------------------------------
       GRAPHQL ERROR
    ------------------------------------------------------- */

    if (result.errors) {
      console.error(
        "GRAPHQL ERRORS:",
        result.errors
      );

      return [];
    }

    /* -------------------------------------------------------
       GET CARDS
    ------------------------------------------------------- */

    const cards =
      result?.data?.technologyCards?.nodes ?? [];

    console.log(
      "TECHNOLOGY CARDS FOUND:",
      cards.length
    );

    console.log(
      "TECHNOLOGY CARDS:",
      cards
    );

    return cards;
  } catch (error) {
    console.error(
      "TECHNOLOGY CARDS FETCH ERROR:",
      error
    );

    return [];
  }
}


/* =========================================================
   SALESFORCE ICON
   ========================================================= */

function SalesforceIcon() {
  return (
    <img
      src="https://lightyellow-echidna-411021.hostingersite.com/wp-content/uploads/2026/08/image-257.png"
      alt="Salesforce"
      width={26}
      height={26}
      style={{ display: "block", objectFit: "contain" }}
    />
  );
}


/* =========================================================
   AI ICON
   ========================================================= */

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


/* =========================================================
   CUSTOM TECHNOLOGY ICON
   ========================================================= */

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


/* =========================================================
   CARD ICON
   ========================================================= */

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


/* =========================================================
   PRODUCTS & PLATFORMS SECTION
   ========================================================= */

export default async function ProductsOverview() {
  const cards = await getTechnologyCards();

  console.log(
    "ProductsOverview cards:",
    cards
  );

  /* -------------------------------------------------------
     NO DATA
  ------------------------------------------------------- */

  if (cards.length === 0) {
    return (
      <section className="bg-[var(--background)] px-6 py-24">
        <div className="mx-auto max-w-[1200px]">
          <p className="text-center text-red-500">
            Technology Cards data not found.
          </p>
        </div>
      </section>
    );
  }

  /* -------------------------------------------------------
     SECTION
  ------------------------------------------------------- */

  return (
    <section className="bg-[var(--background)] px-6 py-24 overview-sect">
      <div className="mx-auto max-w-[1200px]">

        {/* SECTION HEADING */}

        <SectionHeading
          eyebrow="Overview"
          title=""
          gradientText="Products & Platforms"
          description="From Salesforce and AI-powered technologies to modern application platforms, CODM brings together the right technology to solve complex business challenges."
        />

        {/* CARDS */}

        <div className="mt-14 grid gap-6 md:grid-cols-3">

          {cards.map((card) => {
            const fields =
              card.technologyFields;

            const hasLink =
              Boolean(
                fields?.linkText &&
                fields?.linkUrl
              );

            return (
              <div
  key={card.id}
  className="rounded-[20px] border border-[rgba(124,108,240,0.14)] bg-gradient-to-br from-[#f3f1fd] to-[#fbfaff] p-8 shadow-[0_20px_45px_-30px_rgba(76,60,190,0.35)] dark:from-[var(--surface)] dark:to-[var(--surface)] dark:shadow-none"
>
  <div className="flex h-9 w-9 items-center justify-center text-[var(--accent)]">
    <CardIcon type={fields?.icon} />
  </div>


                {/* TITLE */}

                <h3
                  className="
                    mt-6
                    text-[19px]
                    font-semibold
                    text-[var(--foreground)]
                  "
                >
                  {card.title}
                </h3>


                {/* DESCRIPTION */}

                {fields?.description && (
                  <p
                    className="
                      mt-2
                      text-[14px]
                      leading-[1.6]
                      text-[var(--muted)]
                    "
                  >
                    {fields.description}
                  </p>
                )}


                {/* LINK */}

                {hasLink && (
                  <Link
                    href={fields!.linkUrl!}
                    className="
                      mt-5
                      inline-flex
                      items-center
                      gap-1.5
                      text-[14px]
                      font-medium
                      text-[var(--accent)]
                      transition-transform
                      hover:translate-x-0.5
                    "
                  >
                    {fields!.linkText}

                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path d="M3 7h8m0 0L7.5 3.5M11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
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

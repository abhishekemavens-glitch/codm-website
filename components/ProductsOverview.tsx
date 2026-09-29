import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";

/* =========================================================
   PRODUCTS & PLATFORMS OVERVIEW

   WordPress CPT:
   codm_product_overview

   GraphQL:
   productOverviews {
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
========================================================= */

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

/* =========================================================
   FETCH PRODUCTS FROM WORDPRESS
========================================================= */

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
            productOverviews(
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

    if (!response.ok) {
      console.error(
        "ProductsOverview: WordPress request failed",
        response.status
      );

      return [];
    }

    const result = await response.json();

    if (result?.errors) {
      console.error(
        "GraphQL Error (ProductsOverview):",
        result.errors
      );

      return [];
    }

    return result?.data?.productOverviews?.nodes ?? [];
  } catch (error) {
    console.error(
      "ProductsOverview: Failed to fetch WordPress data",
      error
    );

    return [];
  }
}

/* =========================================================
   ICONS
========================================================= */

function SalesforceIcon() {
  return (
    <svg
      width="34"
      height="34"
      viewBox="0 0 34 34"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8.5 21.5C4.8 21.5 2 18.7 2 15.3C2 12.2 4.4 9.7 7.5 9.4C8.6 6.2 11.5 4 15 4C18.7 4 21.8 6.5 22.9 9.8C25.9 10.1 28.2 12.4 28.2 15.3C28.2 18.4 25.6 21 22.5 21H8.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <circle
        cx="15"
        cy="15"
        r="2.6"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function AiIcon() {
  return (
    <svg
      width="34"
      height="34"
      viewBox="0 0 34 34"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="8"
        y="8"
        width="18"
        height="18"
        rx="4"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <circle
        cx="13"
        cy="15"
        r="1.5"
        fill="currentColor"
      />

      <circle
        cx="21"
        cy="15"
        r="1.5"
        fill="currentColor"
      />

      <path
        d="M12.5 20C14 21.5 20 21.5 21.5 20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      <path
        d="M17 8V3.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="M12 3.5H22"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="M3.5 13H8M26 13H30.5M3.5 21H8M26 21H30.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CustomTechIcon() {
  return (
    <svg
      width="34"
      height="34"
      viewBox="0 0 34 34"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="5"
        width="28"
        height="18"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <path
        d="M11 28H23"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="M17 23V28"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="M12 10L8.5 14L12 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M22 10L25.5 14L22 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* =========================================================
   ICON SELECTOR

   WordPress value:
   salesforce
   ai
   custom
========================================================= */

function CardIcon({
  type,
}: {
  type: string | null | undefined;
}) {
  const normalizedType = (type ?? "")
    .toLowerCase()
    .trim();

  switch (normalizedType) {
    case "salesforce":
      return <SalesforceIcon />;

    case "ai":
    case "artificial intelligence":
    case "ai & intelligent platforms":
      return <AiIcon />;

    case "custom":
    case "custom technology":
      return <CustomTechIcon />;

    default:
      return <CustomTechIcon />;
  }
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default async function ProductsOverview() {
  const cards = await getProductCards();

  /*
   * If no cards exist in WordPress,
   * don't render an empty section.
   */
  if (!cards.length) {
    return null;
  }

  return (
    <section className="relative overflow-hidden bg-[var(--background)] px-6 py-[90px] md:px-8 md:py-[110px]">

      {/* =====================================================
          BACKGROUND GLOW
      ===================================================== */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full opacity-40 blur-[100px]"
        style={{
          background:
            "radial-gradient(circle, rgba(111,91,255,0.16) 0%, rgba(111,91,255,0.06) 35%, rgba(111,91,255,0) 72%)",
        }}
      />

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="relative mx-auto max-w-[1240px]">

        {/* SECTION HEADING */}

        <SectionHeading
          eyebrow="Overview"
          title=""
          gradientText="Products & Platforms"
          description="From Salesforce and AI-powered technologies to modern application platforms, CODM brings together the right technology to solve complex business challenges."
        />

        {/* ===================================================
            CARDS
        =================================================== */}

        <div className="mt-[54px] grid grid-cols-1 gap-6 md:grid-cols-3">

          {cards.map((card) => {
            const fields = card.overviewFields;

            if (!fields) {
              return null;
            }

            const hasLink =
              Boolean(fields.linkText) &&
              Boolean(fields.linkUrl);

            return (
              <article
                key={card.id}
                className="
                  group
                  relative
                  min-h-[270px]
                  overflow-hidden
                  rounded-[28px]
                  border
                  border-[#D8DDED]
                  bg-[linear-gradient(135deg,rgba(239,238,255,0.95),rgba(245,248,252,0.92))]
                  p-[34px]
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:shadow-[0_18px_45px_rgba(61,74,130,0.10)]
                "
              >

                {/* CARD ICON */}

                <div
                  className="
                    flex
                    h-[50px]
                    w-[50px]
                    items-center
                    justify-center
                    text-[#8B7CFF]
                  "
                >
                  <CardIcon type={fields.icon} />
                </div>

                {/* CARD TITLE */}

                <h3
                  className="
                    mt-[22px]
                    text-[20px]
                    font-semibold
                    leading-[1.25]
                    tracking-[-0.02em]
                    text-[#4D5A73]
                  "
                >
                  {card.title}
                </h3>

                {/* CARD DESCRIPTION */}

                {fields.description && (
                  <p
                    className="
                      mt-[8px]
                      max-w-[330px]
                      text-[16px]
                      leading-[1.45]
                      text-[#697791]
                    "
                  >
                    {fields.description}
                  </p>
                )}

                {/* CARD LINK */}

                {hasLink && (
                  <Link
                    href={fields.linkUrl!}
                    className="
                      mt-[20px]
                      inline-flex
                      items-center
                      gap-[10px]
                      text-[15px]
                      font-medium
                      text-[#6655FF]
                      transition-all
                      duration-200
                      hover:gap-[14px]
                    "
                  >
                    <span>{fields.linkText}</span>

                    <span
                      aria-hidden="true"
                      className="text-[19px] leading-none"
                    >
                      →
                    </span>
                  </Link>
                )}

              </article>
            );
          })}

        </div>
      </div>
    </section>
  );
}

import Link from "next/link";

const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

type HighlightFields = {
  eyebrow: string | null;
  heading: string | null;
  paragraph1: string | null;
  paragraph2: string | null;
  check1: string | null;
  check2: string | null;
  check3: string | null;
  check4: string | null;
  buttonText: string | null;
  buttonUrl: string | null;
};

type HighlightEntry = {
  highlightFields: HighlightFields | null;
  featuredImage: {
    node: {
      sourceUrl: string;
      altText: string;
    } | null;
  } | null;
};

async function getHighlight(): Promise<HighlightEntry | null> {
  try {
    const response = await fetch(WORDPRESS_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          query GetFeaturedHighlight {
            featuredHighlights(first: 1) {
              nodes {
                featuredImage {
                  node {
                    sourceUrl
                    altText
                  }
                }

                highlightFields {
                  eyebrow
                  heading
                  paragraph1
                  paragraph2
                  check1
                  check2
                  check3
                  check4
                  buttonText
                  buttonUrl
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
        "FEATURED HIGHLIGHT HTTP ERROR:",
        response.status
      );

      return null;
    }

    const result = await response.json();

    console.log(
      "FEATURED HIGHLIGHT GRAPHQL RESPONSE:",
      JSON.stringify(result, null, 2)
    );

    if (result.errors) {
      console.error(
        "FEATURED HIGHLIGHT GRAPHQL ERRORS:",
        result.errors
      );

      return null;
    }

    return (
      result?.data?.featuredHighlights?.nodes?.[0] ??
      null
    );
  } catch (error) {
    console.error(
      "FEATURED HIGHLIGHT FETCH ERROR:",
      error
    );

    return null;
  }
}


/* =========================================================
 * CHECK ICON
 * ========================================================= */

function CheckIcon() {
  return (
    <svg
      width="23"
      height="23"
      viewBox="0 0 23 23"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="11.5"
        cy="11.5"
        r="9"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      <path
        d="M7.5 11.7L10.2 14.3L15.7 8.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


/* =========================================================
 * FEATURED HIGHLIGHT
 * ========================================================= */

export default async function FeaturedHighlight() {
  const entry = await getHighlight();

  const fields = entry?.highlightFields;

  const image =
    entry?.featuredImage?.node;

  if (!fields) {
    return null;
  }


  /* -------------------------------------------------------
   * Heading
   * ------------------------------------------------------- */

  const headingLines =
    fields.heading
      ?.split("\n")
      .map((line) => line.trim())
      .filter(Boolean) ?? [];


  /* -------------------------------------------------------
   * Checklist
   * ------------------------------------------------------- */

  const checklist = [
    fields.check1,
    fields.check2,
    fields.check3,
    fields.check4,
  ].filter(Boolean) as string[];


  const hasButton =
    Boolean(
      fields.buttonText &&
      fields.buttonUrl
    );


  return (
    <section className="bg-[var(--background)] px-6 py-24">

      <div className="mx-auto max-w-[1240px]">


        {/* =================================================
         * TOP HEADING
         * ================================================= */}

        <div className="text-center">

          {fields.eyebrow && (
            <div className="flex items-center justify-center gap-3 text-[13px] font-medium uppercase tracking-[0.12em] text-[var(--muted)]">

              <span
                className="h-px w-12 bg-gradient-to-r from-transparent to-[var(--accent)]"
                aria-hidden="true"
              />

              <span>
                {fields.eyebrow}
              </span>

              <span
                className="h-px w-12 bg-gradient-to-l from-transparent to-[var(--accent)]"
                aria-hidden="true"
              />

            </div>
          )}


          {headingLines.length > 0 && (
            <h2 className="mx-auto mt-5 max-w-[850px] text-[clamp(38px,5vw,60px)] font-medium leading-[1.08] tracking-[-0.035em]">

              {headingLines.map(
                (line, index) => (
                  <span
                    key={index}
                    className="block bg-gradient-to-r from-[#315fdc] via-[#6372ef] to-[#8b76f4] bg-clip-text text-transparent"
                  >
                    {line}
                  </span>
                )
              )}

            </h2>
          )}

        </div>


        {/* =================================================
         * CONTENT
         * ================================================= */}

        <div className="mt-12 grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">


          {/* =================================================
           * LEFT IMAGE
           * ================================================= */}

          <div>

            {image?.sourceUrl && (
              <div className="overflow-hidden rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[0_25px_60px_-30px_rgba(76,60,190,0.45)]">

                <img
                  src={image.sourceUrl}
                  alt={
                    image.altText ||
                    fields.heading ||
                    "Featured Salesforce solution"
                  }
                  className="block w-full rounded-[18px]"
                />

              </div>
            )}

          </div>


          {/* =================================================
           * RIGHT CONTENT
           * ================================================= */}

          <div>


            {/* Paragraph 1 */}

            {fields.paragraph1 && (
              <p className="text-[18px] leading-[1.55] text-[var(--muted)]">

                {fields.paragraph1}

              </p>
            )}


            {/* Paragraph 2 */}

            {fields.paragraph2 && (
              <p className="mt-5 text-[16px] leading-[1.65] text-[var(--muted)]">

                {fields.paragraph2}

              </p>
            )}


            {/* =================================================
             * CHECKLIST
             * ================================================= */}

            {checklist.length > 0 && (
              <div className="mt-7 grid gap-x-10 gap-y-4 sm:grid-cols-2">

                {checklist.map(
                  (item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3"
                    >

                      <span className="shrink-0 text-[var(--accent)]">
                        <CheckIcon />
                      </span>

                      <span className="text-[17px] leading-[1.4] text-[var(--muted)]">
                        {item}
                      </span>

                    </div>
                  )
                )}

              </div>
            )}


            {/* =================================================
             * BUTTON
             * ================================================= */}

            {hasButton && (
              <Link
                href={fields.buttonUrl!}
                className="mt-9 inline-flex h-[50px] items-center gap-2 rounded-full bg-[var(--accent)] px-7 text-[15px] font-medium text-white shadow-[0_10px_25px_-10px_rgba(99,81,220,0.7)] transition-transform hover:-translate-y-0.5"
              >

                {fields.buttonText}

                <span
                  aria-hidden="true"
                  className="text-[18px]"
                >
                  →
                </span>

              </Link>
            )}

          </div>

        </div>

      </div>

    </section>
  );
}

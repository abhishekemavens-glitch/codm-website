"use client";

import { useEffect, useState } from "react";

const PER_PAGE = 12;

type CaseStudy = {
  id: string;
  title: string;
  uri: string;
  date: string;
  featuredImage?: {
    node?: {
      sourceUrl?: string;
      altText?: string;
    };
  };
};

type CaseStudyResponse = {
  data?: {
    caseStudies?: {
      nodes: CaseStudy[];
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string | null;
      };
    };
  };
  errors?: unknown;
};

export default function CaseStudiesGrid() {
  const [items, setItems] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function fetchAllCaseStudies() {
      try {
        let allItems: CaseStudy[] = [];
        let hasNextPage = true;
        let after: string | null = null;

        while (hasNextPage) {
          const response = await fetch("/api/wordpress", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: `
                query AllCaseStudies($after: String) {
                  caseStudies(
                    first: 100
                    after: $after
                    where: { status: PUBLISH }
                  ) {
                    nodes {
                      id
                      title
                      uri
                      date
                      featuredImage {
                        node {
                          sourceUrl
                          altText
                        }
                      }
                    }

                    pageInfo {
                      hasNextPage
                      endCursor
                    }
                  }
                }
              `,
              variables: {
                after,
              },
            }),
          });

          if (!response.ok) {
            throw new Error(
              `WordPress request failed: ${response.status}`
            );
          }

          const result: CaseStudyResponse =
            await response.json();

          if (result.errors) {
            console.error(
              "GraphQL Error:",
              result.errors
            );
            break;
          }

          const caseStudies =
            result?.data?.caseStudies;

          if (!caseStudies) {
            break;
          }

          allItems = [
            ...allItems,
            ...caseStudies.nodes,
          ];

          hasNextPage =
            caseStudies.pageInfo.hasNextPage;

          after =
            caseStudies.pageInfo.endCursor;

          /*
           * Safety check so we don't accidentally
           * create an infinite loop.
           */
          if (hasNextPage && !after) {
            break;
          }
        }

        console.log(
          "Total Case Studies loaded:",
          allItems.length
        );

        setItems(allItems);
      } catch (error) {
        console.error(
          "Unable to load case studies:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    fetchAllCaseStudies();
  }, []);

  /*
   * FRONTEND PAGINATION
   * 12 Case Studies per page
   */
  const totalPages = Math.ceil(
    items.length / PER_PAGE
  );

  const startIndex =
    (page - 1) * PER_PAGE;

  const visibleItems = items.slice(
    startIndex,
    startIndex + PER_PAGE
  );

  function goToPage(newPage: number) {
    if (
      newPage < 1 ||
      newPage > totalPages
    ) {
      return;
    }

    setPage(newPage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <section className="case-studies-grid-section">

      {/* LOADING */}
      {loading && (
        <div className="case-studies-loading">
          Loading case studies...
        </div>
      )}

      {/* EMPTY */}
      {!loading && items.length === 0 && (
        <div className="case-studies-loading">
          No case studies available.
        </div>
      )}

      {/* RESULTS */}
      {!loading && items.length > 0 && (
        <>
          <div className="case-studies-grid">
            {visibleItems.map((item) => (
              <article
                className="case-study-card"
                key={item.id}
              >
                {/* IMAGE */}
                {item.featuredImage?.node
                  ?.sourceUrl && (
                  <div className="case-study-image">
                    <img
                      src={
                        item.featuredImage.node
                          .sourceUrl
                      }
                      alt={
                        item.featuredImage.node
                          .altText ||
                        item.title
                      }
                    />
                  </div>
                )}

                {/* TITLE */}
                <h3>{item.title}</h3>

                {/* LINK */}
                <a
                  className="case-study-link"
                  href={item.uri}
                >
                  View case study
                  <span>→</span>
                </a>
              </article>
            ))}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <nav
              className="case-studies-pagination"
              aria-label="Case study pagination"
            >
              {/* PREVIOUS */}
              <button
                type="button"
                onClick={() =>
                  goToPage(page - 1)
                }
                disabled={page === 1}
                aria-label="Previous page"
              >
                ←
              </button>

              {/* PAGE NUMBERS */}
              {Array.from(
                { length: totalPages },
                (_, index) => index + 1
              ).map((pageNumber) => (
                <button
                  type="button"
                  key={pageNumber}
                  onClick={() =>
                    goToPage(pageNumber)
                  }
                  className={
                    pageNumber === page
                      ? "active"
                      : ""
                  }
                  aria-current={
                    pageNumber === page
                      ? "page"
                      : undefined
                  }
                >
                  {pageNumber}
                </button>
              ))}

              {/* NEXT */}
              <button
                type="button"
                onClick={() =>
                  goToPage(page + 1)
                }
                disabled={
                  page === totalPages
                }
                aria-label="Next page"
              >
                →
              </button>
            </nav>
          )}
        </>
      )}
    </section>
  );
}


"use client";

import { useEffect, useMemo, useState } from "react";

const PER_PAGE = 12;

type CaseStudy = {
  id: string;
  title: string;
  uri: string;
  date: string;
  excerpt?: string | null;
  featuredImage?: {
    node?: {
      sourceUrl?: string;
      altText?: string;
    } | null;
  } | null;
};

type CaseStudiesResponse = {
  data?: {
    caseStudies?: {
      nodes: CaseStudy[];
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string | null;
      };
    };
  };
  errors?: Array<{
    message?: string;
  }>;
};

export default function CaseStudiesGrid() {
  const [items, setItems] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchAllCaseStudies() {
      try {
        setLoading(true);
        setError("");

        const allItems: CaseStudy[] = [];
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
                      excerpt
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

          const result: CaseStudiesResponse = await response.json();

          console.log("CASE STUDIES API RESPONSE:", result);

          if (result.errors?.length) {
            console.error("GraphQL Error:", result.errors);

            throw new Error(
              result.errors
                .map((item) => item.message || "GraphQL error")
                .join(", ")
            );
          }

          const caseStudies = result.data?.caseStudies;

          if (!caseStudies) {
            throw new Error(
              "The WordPress response does not contain caseStudies."
            );
          }

          allItems.push(...caseStudies.nodes);

          hasNextPage = caseStudies.pageInfo.hasNextPage;
          after = caseStudies.pageInfo.endCursor;

          if (hasNextPage && !after) {
            throw new Error(
              "WordPress returned another page without an end cursor."
            );
          }
        }

        if (!cancelled) {
          setItems(allItems);
        }
      } catch (err) {
        console.error("Unable to load case studies:", err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load case studies."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchAllCaseStudies();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) {
      return items;
    }

    return items.filter((item) => {
      const title = item.title.toLowerCase();
      const excerpt = (item.excerpt ?? "")
        .replace(/<[^>]*>/g, " ")
        .toLowerCase();

      return title.includes(term) || excerpt.includes(term);
    });
  }, [items, searchTerm]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredItems.length / PER_PAGE)
  );

  const visibleItems = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return filteredItems.slice(start, start + PER_PAGE);
  }, [filteredItems, page]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  function goToPage(newPage: number) {
    if (newPage < 1 || newPage > totalPages) {
      return;
    }

    setPage(newPage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function getPageNumbers(): (number | "ellipsis")[] {
    const pages: (number | "ellipsis")[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }

      return pages;
    }

    pages.push(1);

    if (page > 3) {
      pages.push("ellipsis");
    }

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (page < totalPages - 2) {
      pages.push("ellipsis");
    }

    pages.push(totalPages);

    return pages;
  }

  if (loading) {
    return (
      <section className="case-studies-grid-section">
        <div className="case-studies-loading">
          Loading case studies...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="case-studies-grid-section">
        <div className="case-studies-loading" role="alert">
          Unable to load case studies. Please try again later.
        </div>
      </section>
    );
  }

  return (
    <section className="case-studies-grid-section">
      {/* SEARCH */}
      <div className="case-studies-toolbar">
        <div className="case-studies-search">
          <span aria-hidden="true">⌕</span>

          <input
            type="search"
            placeholder="Search case studies..."
            aria-label="Search case studies"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* GRID / EMPTY STATE */}
      {filteredItems.length === 0 ? (
        <div className="case-studies-loading">
          {items.length === 0
            ? "No published case studies found."
            : "No case studies match your search."}
        </div>
      ) : (
        <>
          <div className="case-studies-grid">
            {visibleItems.map((item) => (
              <article
                className="case-study-card"
                key={item.id}
              >
                {item.featuredImage?.node?.sourceUrl && (
                  <div className="case-study-image">
                    <img
                      src={item.featuredImage.node.sourceUrl}
                      alt={
                        item.featuredImage.node.altText ||
                        item.title
                      }
                      loading="lazy"
                    />
                  </div>
                )}

                <div className="case-study-content">
                  <div className="case-study-category">
                    Case Study
                  </div>

                  <h3>{item.title}</h3>

                  {item.excerpt && (
                    <div
                      className="case-study-excerpt"
                      dangerouslySetInnerHTML={{
                        __html: item.excerpt,
                      }}
                    />
                  )}

                  <a
                    href={item.uri}
                    className="case-study-link"
                  >
                    Read More
                    <span>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M3.5 10.5L10.5 3.5M4.5 3.5h6v6"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </a>
                </div>
              </article>
            ))}
          </div>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <nav
              className="case-studies-pagination"
              aria-label="Case study pagination"
            >
              <button
                type="button"
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                aria-label="Previous page"
              >
                ←
              </button>

              {getPageNumbers().map((pageNumber, index) => {
                if (pageNumber === "ellipsis") {
                  return (
                    <span
                      key={`ellipsis-${index}`}
                      className="pagination-ellipsis"
                    >
                      ...
                    </span>
                  );
                }

                return (
                  <button
                    type="button"
                    key={pageNumber}
                    onClick={() => goToPage(pageNumber)}
                    className={
                      pageNumber === page ? "active" : ""
                    }
                    aria-current={
                      pageNumber === page ? "page" : undefined
                    }
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
                aria-label="Next page"
              >
                Next Page
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3.5 10.5L10.5 3.5M4.5 3.5h6v6"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </nav>
          )}
        </>
      )}
    </section>
  );
}

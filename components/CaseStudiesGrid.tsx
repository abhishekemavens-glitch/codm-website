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

type PostsResponse = {
  data?: {
    posts?: {
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
    async function fetchAllPosts() {
      try {
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
                query AllPosts($after: String) {
                  posts(
                    first: 100
                    after: $after
                    where: {
                      status: PUBLISH
                    }
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

          const result: PostsResponse =
            await response.json();

          if (result.errors) {
            console.error(
              "GraphQL Error:",
              result.errors
            );

            break;
          }

          const posts = result.data?.posts;

          if (!posts) {
            break;
          }

          allItems.push(...posts.nodes);

          hasNextPage =
            posts.pageInfo.hasNextPage;

          after =
            posts.pageInfo.endCursor;

          if (hasNextPage && !after) {
            console.error(
              "WordPress returned hasNextPage=true but no cursor."
            );

            break;
          }
        }

        console.log(
          "TOTAL POSTS LOADED:",
          allItems.length
        );

        setItems(allItems);
      } catch (error) {
        console.error(
          "Unable to load posts:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    fetchAllPosts();
  }, []);

  /*
   * -----------------------------------------
   * PAGINATION
   * -----------------------------------------
   */

  const totalPages = Math.max(
    1,
    Math.ceil(items.length / PER_PAGE)
  );

  const visibleItems = useMemo(() => {
    const start =
      (page - 1) * PER_PAGE;

    return items.slice(
      start,
      start + PER_PAGE
    );
  }, [items, page]);

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

  /*
   * -----------------------------------------
   * PAGINATION NUMBERS
   * -----------------------------------------
   */

  function getPageNumbers() {
    const pages: (
      | number
      | "ellipsis"
    )[] = [];

    if (totalPages <= 7) {
      for (
        let i = 1;
        i <= totalPages;
        i++
      ) {
        pages.push(i);
      }

      return pages;
    }

    pages.push(1);

    if (page > 3) {
      pages.push("ellipsis");
    }

    const start = Math.max(
      2,
      page - 1
    );

    const end = Math.min(
      totalPages - 1,
      page + 1
    );

    for (
      let i = start;
      i <= end;
      i++
    ) {
      pages.push(i);
    }

    if (page < totalPages - 2) {
      pages.push("ellipsis");
    }

    pages.push(totalPages);

    return pages;
  }

  /*
   * -----------------------------------------
   * LOADING
   * -----------------------------------------
   */

  if (loading) {
    return (
      <section className="case-studies-grid-section">
        <div className="case-studies-loading">
          Loading case studies...
        </div>
      </section>
    );
  }

  /*
   * -----------------------------------------
   * EMPTY
   * -----------------------------------------
   */

  if (items.length === 0) {
    return (
      <section className="case-studies-grid-section">
        <div className="case-studies-loading">
          No case studies available.
        </div>
      </section>
    );
  }

  /*
   * -----------------------------------------
   * RESULTS
   * -----------------------------------------
   */

  return (
    <section className="case-studies-grid-section">

      {/* FILTERS */}

      <div className="case-studies-toolbar">

        <select
          className="case-studies-filter"
          defaultValue=""
        >
          <option value="">
            Industries
          </option>
        </select>

        <select
          className="case-studies-filter"
          defaultValue=""
        >
          <option value="">
            Salesforce products
          </option>
        </select>

        <div className="case-studies-search">
          <span>⌕</span>

          <input
            type="search"
            placeholder="Search"
          />
        </div>

      </div>

      {/* GRID */}

      <div className="case-studies-grid">

        {visibleItems.map((item) => (
          <article
            className="case-study-card"
            key={item.id}
          >

            {/* IMAGE */}

            {item.featuredImage?.node?.sourceUrl && (
              <div className="case-study-image">
                <img
                  src={
                    item.featuredImage.node.sourceUrl
                  }
                  alt={
                    item.featuredImage.node.altText ||
                    item.title
                  }
                />
              </div>
            )}

            {/* CONTENT */}

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
                <span>→</span>
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

          {getPageNumbers().map(
            (pageNumber, index) => {

              if (
                pageNumber === "ellipsis"
              ) {
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
              );
            }
          )}

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
            Next Page →
          </button>

        </nav>
      )}

    </section>
  );
}

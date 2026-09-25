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

  categories?: {
    nodes: { name: string }[];
  } | null;

  tags?: {
    nodes: { name: string }[];
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

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");

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

                      categories {
                        nodes {
                          name
                        }
                      }

                      tags {
                        nodes {
                          name
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

          const result: PostsResponse = await response.json();

          if (result.errors) {
            console.error("GraphQL Error:", result.errors);
            break;
          }

          const posts = result.data?.posts;

          if (!posts) {
            break;
          }

          allItems.push(...posts.nodes);

          hasNextPage = posts.pageInfo.hasNextPage;
          after = posts.pageInfo.endCursor;

          if (hasNextPage && !after) {
            console.error(
              "WordPress returned hasNextPage=true but no cursor."
            );
            break;
          }
        }

        setItems(allItems);
      } catch (error) {
        console.error("Unable to load posts:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAllPosts();
  }, []);

  /*
   * -----------------------------------------
   * FILTER OPTIONS (built from real data)
   * -----------------------------------------
   */

  const industryOptions = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      item.categories?.nodes.forEach((c) => set.add(c.name));
    });
    return Array.from(set).sort();
  }, [items]);

  const productOptions = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      item.tags?.nodes.forEach((t) => set.add(t.name));
    });
    return Array.from(set).sort();
  }, [items]);

  /*
   * -----------------------------------------
   * FILTERING
   * -----------------------------------------
   */

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = searchTerm.trim()
        ? item.title.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
          (item.excerpt ?? "")
            .toLowerCase()
            .includes(searchTerm.trim().toLowerCase())
        : true;

      const matchesIndustry = selectedIndustry
        ? item.categories?.nodes.some((c) => c.name === selectedIndustry)
        : true;

      const matchesProduct = selectedProduct
        ? item.tags?.nodes.some((t) => t.name === selectedProduct)
        : true;

      return matchesSearch && matchesIndustry && matchesProduct;
    });
  }, [items, searchTerm, selectedIndustry, selectedProduct]);

  /* reset to page 1 whenever a filter changes */
  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedIndustry, selectedProduct]);

  /*
   * -----------------------------------------
   * PAGINATION
   * -----------------------------------------
   */

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PER_PAGE));

  const visibleItems = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return filteredItems.slice(start, start + PER_PAGE);
  }, [filteredItems, page]);

  function goToPage(newPage: number) {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function getPageNumbers() {
    const pages: (number | "ellipsis")[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);
    if (page > 3) pages.push("ellipsis");

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    if (page < totalPages - 2) pages.push("ellipsis");
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
        <div className="case-studies-loading">Loading case studies...</div>
      </section>
    );
  }

  return (
    <section className="case-studies-grid-section">
      {/* FILTERS */}
      <div className="case-studies-toolbar">
        <select
          className="case-studies-filter"
          value={selectedIndustry}
          onChange={(e) => setSelectedIndustry(e.target.value)}
        >
          <option value="">Industries</option>
          {industryOptions.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        <select
          className="case-studies-filter"
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
        >
          <option value="">Salesforce products</option>
          {productOptions.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        <div className="case-studies-search">
          <span>⌕</span>
          <input
            type="search"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* GRID / EMPTY STATE */}
      {filteredItems.length === 0 ? (
        <div className="case-studies-loading">
          No case studies match your filters.
        </div>
      ) : (
        <>
          <div className="case-studies-grid">
            {visibleItems.map((item) => (
              <article className="case-study-card" key={item.id}>
                {item.featuredImage?.node?.sourceUrl && (
                  <div className="case-study-image">
                    <img
                      src={item.featuredImage.node.sourceUrl}
                      alt={item.featuredImage.node.altText || item.title}
                    />
                  </div>
                )}

                <div className="case-study-content">
                  <div className="case-study-category">
                    {item.categories?.nodes[0]?.name || "Case Study"}
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

                  <a href={item.uri} className="case-study-link">
                    Read More
                    <span> <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M3.5 10.5L10.5 3.5M4.5 3.5h6v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg></span>
                  </a>
                </div>
              </article>
            ))}
          </div>

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
                    className={pageNumber === page ? "active" : ""}
                    aria-current={pageNumber === page ? "page" : undefined}
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
                Next Page  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M3.5 10.5L10.5 3.5M4.5 3.5h6v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
              </button>
            </nav>
          )}
        </>
      )}
    </section>
  );
}

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

export default function CaseStudiesGrid() {
  const [items, setItems] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function fetchCaseStudies() {
      try {
        const response = await fetch("/api/wordpress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              query AllCaseStudies {
                caseStudies(first: 100, where: { status: PUBLISH }) {
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
                }
              }
            `,
          }),
        });

        const result = await response.json();

        if (result?.data?.caseStudies?.nodes) {
          setItems(result.data.caseStudies.nodes);
        }
      } catch (error) {
        console.error("Unable to load case studies:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCaseStudies();
  }, []);

  const totalPages = Math.max(1, Math.ceil(items.length / PER_PAGE));
  const start = (page - 1) * PER_PAGE;
  const visible = items.slice(start, start + PER_PAGE);

  function goToPage(p: number) {
    if (p < 1 || p > totalPages) return;
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <section className="case-studies-grid-section">
     
      {loading ? (
        <div className="case-studies-loading">Loading case studies...</div>
      ) : items.length === 0 ? (
        <div className="case-studies-loading">No case studies available.</div>
      ) : (
        <>
          <div className="case-studies-grid">
            {visible.map((item) => (
              <article className="case-study-card" key={item.id}>
                {item.featuredImage?.node?.sourceUrl && (
                  <div className="case-study-image">
                    <img
                      src={item.featuredImage.node.sourceUrl}
                      alt={item.featuredImage.node.altText || item.title}
                    />
                  </div>
                )}

                <h3>{item.title}</h3>

                <a
                  className="case-study-link"
                  href={item.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View case study <span>→</span>
                </a>
              </article>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="case-studies-pagination">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                aria-label="Previous page"
              >
                ←
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={p === page ? "active" : ""}
                  aria-current={p === page ? "page" : undefined}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
                aria-label="Next page"
              >
                →
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

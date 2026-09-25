"use client";

import { useEffect, useState } from "react";

const PER_PAGE = 6;

type BlogPost = {
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
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function LatestBlogsGrid() {
  const [items, setItems] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PER_PAGE);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch("/api/wordpress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              query LatestBlogs {
                posts(first: 100, where: { status: PUBLISH }) {
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
                  }
                }
              }
            `,
          }),
        });

        const result = await response.json();

        if (result.errors) {
          console.error("GraphQL Error:", result.errors);
          return;
        }

        setItems(result.data?.posts?.nodes ?? []);
      } catch (error) {
        console.error("Unable to load posts:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  if (loading) {
    return (
      <section className="latest-blogs-grid-section">
        <div className="latest-blogs-loading">Loading articles...</div>
      </section>
    );
  }

  return (
    <section className="latest-blogs-grid-section">
      <div className="latest-blogs-grid-header">
        <h2>Latest Blogs</h2>
        <a href="/blog" className="latest-blogs-view-all">
          View All Blogs
          <span aria-hidden="true">→</span>
        </a>
      </div>

      <div className="latest-blogs-cards-grid">
        {visibleItems.map((item) => (
          <article className="latest-blog-card" key={item.id}>
            <div className="latest-blog-image">
              {item.featuredImage?.node?.sourceUrl ? (
                <img
                  src={item.featuredImage.node.sourceUrl}
                  alt={item.featuredImage.node.altText || item.title}
                />
              ) : (
                <div className="latest-blog-image-placeholder" />
              )}

              {item.categories?.nodes[0]?.name && (
                <span className="latest-blog-badge">
                  {item.categories.nodes[0].name}
                </span>
              )}
            </div>

            <div className="latest-blog-content">
              <div className="latest-blog-meta">
                {formatDate(item.date)} &middot; 6 min read
              </div>

              <h3>{item.title}</h3>

              {item.excerpt && (
                <div
                  className="latest-blog-excerpt"
                  dangerouslySetInnerHTML={{ __html: item.excerpt }}
                />
              )}

              <a href={item.uri} className="latest-blog-link">
                Read More
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </article>
        ))}
      </div>

      {hasMore && (
        <div className="latest-blogs-load-more-wrap">
          <button
            type="button"
            className="latest-blogs-load-more"
            onClick={() => setVisibleCount((count) => count + PER_PAGE)}
          >
            Load More Blogs
            <span aria-hidden="true">→</span>
          </button>
        </div>
      )}

      <div className="latest-blogs-cta-banner">
        <div className="latest-blogs-cta-content">
          <h3>Explore Success Through Stories</h3>
          <p>
            Discover how we help businesses transform challenges into
            measurable results.
          </p>
          <a href="/case-studies" className="latest-blogs-cta-button">
            View Success Stories
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";

const INITIAL_COUNT = 9; 
const LOAD_MORE_COUNT = 3;

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
    nodes: {
      name: string;
    }[];
  } | null;
};

type PostsResponse = {
  data?: {
    posts?: {
      nodes: BlogPost[];
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string | null;
      };
    };
  };
  errors?: unknown;
};

function formatDate(dateString: string) {
  const date = new Date(dateString);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function stripHtml(html: string) {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&amp;/g, "&")
    .trim();
}

function truncateText(text: string, length = 110) {
  if (text.length <= length) return text;

  return `${text.slice(0, length).trim()}...`;
}

export default function BlogGrid() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

  const [hasNextPage, setHasNextPage] = useState(false);
  const [endCursor, setEndCursor] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch("/api/wordpress", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
              query LatestBlogs {
                posts(
                  first: 12
                  where: {
                    status: PUBLISH
                    orderby: {
                      field: DATE
                      order: DESC
                    }
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
                  }

                  pageInfo {
                    hasNextPage
                    endCursor
                  }
                }
              }
            `,
          }),
        });

        if (!response.ok) {
          throw new Error(
            `WordPress request failed: ${response.status}`
          );
        }

        const result: PostsResponse = await response.json();

        if (result.errors) {
          console.error(
            "GraphQL Error (Latest Blogs):",
            result.errors
          );
          return;
        }

        const blogPosts = result.data?.posts;

        if (!blogPosts) {
          return;
        }

        setPosts(blogPosts.nodes);
        setHasNextPage(blogPosts.pageInfo.hasNextPage);
        setEndCursor(blogPosts.pageInfo.endCursor);
      } catch (error) {
        console.error(
          "Unable to load latest blogs:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  async function loadMoreBlogs() {
    /*
     * If we already have more posts locally, simply reveal them.
     */
    if (visibleCount < posts.length) {
      setVisibleCount((previous) => previous + LOAD_MORE_COUNT);
      return;
    }

    /*
     * Otherwise request the next WordPress page.
     */
    if (!hasNextPage || !endCursor) {
      return;
    }

    setLoadingMore(true);

    try {
      const response = await fetch("/api/wordpress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            query MoreBlogs($after: String) {
              posts(
                first: 12
                after: $after
                where: {
                  status: PUBLISH
                  orderby: {
                    field: DATE
                    order: DESC
                  }
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
                }

                pageInfo {
                  hasNextPage
                  endCursor
                }
              }
            }
          `,
          variables: {
            after: endCursor,
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
        console.error(
          "GraphQL Error (More Blogs):",
          result.errors
        );
        return;
      }

      const nextPosts = result.data?.posts;

      if (!nextPosts) {
        return;
      }

      setPosts((previous) => [
        ...previous,
        ...nextPosts.nodes,
      ]);

      setVisibleCount(
        (previous) => previous + LOAD_MORE_COUNT
      );

      setHasNextPage(nextPosts.pageInfo.hasNextPage);
      setEndCursor(nextPosts.pageInfo.endCursor);
    } catch (error) {
      console.error(
        "Unable to load more blogs:",
        error
      );
    } finally {
      setLoadingMore(false);
    }
  }

  const visiblePosts = posts.slice(0, visibleCount);

  if (loading) {
    return (
      <section className="blog-grid-section">
        <div className="blog-grid-loading">
          Loading latest blogs...
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="blog-grid-section">

      {/* =========================================
          HEADER
      ========================================= */}

      <div className="blog-grid-header">

        <div className="blog-grid-heading">
          <SectionHeading
            title=""
            eyebrow="Latest Blogs"
            gradientText=""
          />
        </div>

        <a
          href="/insights"
          className="blog-grid-view-all"
        >
          View All Blogs
          <span>→</span>
        </a>

      </div>

      {/* =========================================
          BLOG GRID
      ========================================= */}

      <div className="blog-grid">

        {visiblePosts.map((post) => {

          const image =
            post.featuredImage?.node;

          const category =
            post.categories?.nodes?.[0]?.name ||
            "Insight";

          const excerpt = stripHtml(
            post.excerpt ?? ""
          );

          return (
            <article
              className="blog-card"
              key={post.id}
            >

              {/* IMAGE */}

              <a
                href={post.uri}
                className="blog-card-image"
              >

                {image?.sourceUrl ? (
                  <img
                    src={image.sourceUrl}
                    alt={
                      image.altText ||
                      post.title
                    }
                  />
                ) : (
                  <div className="blog-card-image-placeholder" />
                )}

                <span className="blog-card-category">
                  {category}
                </span>

              </a>

              {/* CONTENT */}

              <div className="blog-card-content">

                <div className="blog-card-meta">
                  {formatDate(post.date)}
                </div>

                <h3 className="blog-card-title">
                  <a href={post.uri}>
                    {post.title}
                  </a>
                </h3>

                {excerpt && (
                  <p className="blog-card-excerpt">
                    {truncateText(excerpt)}
                  </p>
                )}

                <a
                  href={post.uri}
                  className="blog-card-link"
                >
                  Read More
                  <span>→</span>
                </a>

              </div>

            </article>
          );
        })}

      </div>

      {/* =========================================
          LOAD MORE
      ========================================= */}

      {(visibleCount < posts.length ||
        hasNextPage) && (
        <div className="blog-grid-load-more-wrap">

          <button
            type="button"
            className="blog-grid-load-more"
            onClick={loadMoreBlogs}
            disabled={loadingMore}
          >
            {loadingMore
              ? "Loading..."
              : "Load More Blogs"}

            {!loadingMore && (
              <span>→</span>
            )}
          </button>

        </div>
      )}

    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import SectionHeading from "@/components/SectionHeading";

type Blog = {
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
  categories?: {
    nodes: {
      name: string;
    }[];
  };
}; 

export default function LatestBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const response = await fetch("/api/wordpress", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
              query LatestBlogs {
                posts(first: 3, where: { status: PUBLISH }) {
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

        if (result?.data?.posts?.nodes) {
          setBlogs(result.data.posts.nodes);
        }
      } catch (error) {
        console.error("Unable to load blogs:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBlogs();
  }, []);

  return (
    <section className="latest-blogs">
      <div className="latest-blogs-header">

        {/* =================================================
            SECTION HEADING
            inline={true} keeps "Our" and "Latest Blogs" on the
            same line, matching the target design.
            ================================================= */}

        <SectionHeading
          eyebrow="From Blog"
          title="Our"
          gradientText="Latest Blogs"
          description="Explore the insights and trends shaping our industry"
          inline
        />

      </div>

      {loading ? (
        <div className="latest-blogs-loading">
          Loading blogs...
        </div>
      ) : blogs.length === 0 ? (
        <div className="latest-blogs-loading">
          No blogs available.
        </div>
      ) : (
        <div className="latest-blogs-grid">
          {blogs.map((blog) => (
            <article className="blog-card" key={blog.id}>
              <div className="blog-categories">
                {blog.categories?.nodes.map((category) => (
                  <span key={category.name}>{category.name}</span>
                ))}
              </div>

              {blog.featuredImage?.node?.sourceUrl && (
                <div className="blog-image">
                  <img
                    src={blog.featuredImage.node.sourceUrl}
                    alt={
                      blog.featuredImage.node.altText ||
                      blog.title
                    }
                  />
                </div>
              )}

              <h3>{blog.title}</h3>

              <a
                href={blog.uri}
                target="_blank"
                rel="noopener noreferrer"
              >
                View blog <span>→</span>
              </a>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import SectionHeading from "@/components/SectionHeading";

const FEATURED_COUNT = 4;
const AUTOPLAY_DELAY = 6000;

type WpFeaturedPost = {
  id: string;
  title: string;
  content: string | null;
  uri: string;
  date: string;
  badge: string | null;
  readTime: string | null;
  featuredImage?: {
    node?: {
      sourceUrl?: string;
      altText?: string;
    } | null;
  } | null;
};

type FeaturedPostsResponse = {
  data?: {
    featuredStories?: {
      nodes: WpFeaturedPost[];
    };
  };
  errors?: unknown;
};

type FeaturedStory = {
  id: string;
  badge: string;
  date: string;
  readTime: string;
  title: string;
  excerpt: string;
  uri: string;
  imageUrl: string | null;
  imageAlt: string;
};

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&amp;/g, "&")
    .trim();
}

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function FeaturedStorySection() {
  const [stories, setStories] = useState<FeaturedStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    async function fetchFeaturedPosts() {
      try {
        const response = await fetch("/api/wordpress", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
              query FeaturedStories {
                featuredStories(
                  first: ${FEATURED_COUNT}
                  where: {
                    status: PUBLISH
                    orderby: {
                      field: MENU_ORDER
                      order: ASC
                    }
                  }
                ) {
                  nodes {
                    id
                    title
                    content
                    uri
                    date
                    badge
                    readTime
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

        const result: FeaturedPostsResponse = await response.json();

        if (result.errors) {
          console.error(
            "GraphQL Error (Featured Story):",
            result.errors
          );
          return;
        }

        const nodes =
          result.data?.featuredStories?.nodes ?? [];

        const mapped: FeaturedStory[] = nodes.map((post) => ({
          id: post.id,

          badge: post.badge || "Insight",

          date: formatDate(post.date),

          readTime: post.readTime || "",

          title: post.title,

          excerpt: stripHtml(post.content ?? ""),

          uri: post.uri,

          imageUrl:
            post.featuredImage?.node?.sourceUrl ?? null,

          imageAlt:
            post.featuredImage?.node?.altText ||
            post.title,
        }));

        setStories(mapped);
      } catch (error) {
        console.error(
          "Unable to load featured stories:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedPosts();
  }, []);

  const total = stories.length;

  useEffect(() => {
    if (total <= 1) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, AUTOPLAY_DELAY);

    return () => clearInterval(timer);
  }, [total]);

  if (loading) {
    return (
      <section className="featured-story-section">
        <div className="featured-story-loading">
          Loading featured story...
        </div>
      </section>
    );
  }

  if (total === 0) {
    return null;
  }

  const story = stories[activeIndex];

  return (
    <section className="featured-story-section">

      {/* HEADING */}
      <div className="featured-story-heading">
  <SectionHeading
    eyebrow="Featured Story"
    title=""
    gradientText=""
  />
</div>

      {/* MAIN CARD */}
      <div className="featured-story-card">

        {/* IMAGE */}
        <div className="featured-story-image-wrap">

          {story.imageUrl && (
            <img
              src={story.imageUrl}
              alt={story.imageAlt}
              className="featured-story-image"
            />
          )}

          <span className="featured-story-badge">
            {story.badge}
          </span>

        </div>

        {/* CONTENT */}
        <div className="featured-story-content">

          {/* META */}
          <div className="featured-story-meta">

            <span>
              {story.date}
            </span>

            {story.readTime && (
              <>
                <span className="featured-story-meta-dot">
                  •
                </span>

                <span>
                  {story.readTime}
                </span>
              </>
            )}

          </div>

          {/* TITLE */}
          <h2 className="featured-story-title">
            {story.title}
          </h2>

          {/* DESCRIPTION */}
          {story.excerpt && (
            <p className="featured-story-excerpt">
              {story.excerpt}
            </p>
          )}

          {/* BUTTON */}
          <a
            href={story.uri}
            className="featured-story-cta"
          >
            <span>Read Full Article</span>
            <span>→</span>
          </a>

        </div>
      </div>

      {/* DOTS */}
      {total > 1 && (
        <div
          className="featured-story-dots"
          role="tablist"
        >
          {stories.map((storyItem, index) => (
            <button
              key={storyItem.id}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-label={`Show featured story ${
                index + 1
              }`}
              className={
                index === activeIndex
                  ? "featured-story-dot-btn active"
                  : "featured-story-dot-btn"
              }
              onClick={() =>
                setActiveIndex(index)
              }
            />
          ))}
        </div>
      )}

    </section>
  );
}

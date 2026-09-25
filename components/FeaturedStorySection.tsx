"use client";

import { useEffect, useState } from "react";

const FEATURED_COUNT = 4;

type WpFeaturedPost = {
  id: string;
  title: string;
  uri: string;
  date: string;
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
  title: string;
  uri: string;
  date: string;
};

const AUTOPLAY_DELAY = 6000;

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
                    uri
                    date
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

        const result: FeaturedPostsResponse =
          await response.json();

        console.log(
          "Featured Stories Response:",
          result
        );

        if (result.errors) {
          console.error(
            "GraphQL Error:",
            result.errors
          );
          return;
        }

        const nodes =
          result.data?.featuredStories?.nodes ?? [];

        const mapped: FeaturedStory[] =
          nodes.map((post) => ({
            id: post.id,
            title: post.title,
            uri: post.uri,
            date: formatDate(post.date),
          }));

        console.log(
          "Mapped Featured Stories:",
          mapped
        );

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
    if (total <= 1) {
      return;
    }

    const timer = setInterval(() => {
      setActiveIndex(
        (previous) => (previous + 1) % total
      );
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

      {/* EYEBROW */}
      <div className="featured-story-eyebrow">
        <span className="featured-story-eyebrow-line" />

        <span>
          Featured Story
        </span>

        <span className="featured-story-eyebrow-line" />
      </div>

      {/* CARD */}
      <div className="featured-story-card">

        <div className="featured-story-content">

          {/* META */}
          <div className="featured-story-meta">
            <span>{story.date}</span>
          </div>

          {/* TITLE */}
          <h2 className="featured-story-title">
            {story.title}
          </h2>

          {/* LINK */}
          <a
            href={story.uri}
            className="featured-story-cta"
          >
            Read Full Article
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
          {stories.map((item, index) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={
                index === activeIndex
              }
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

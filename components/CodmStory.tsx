"use client";

import { useEffect, useState } from "react";

type StoryData = {
  eyebrow: string;
  heading: string;
  highlight: string;
  paragraph1: string;
  paragraph2: string;
  imageUrl: string;
  imageCaption: string;
  badge1Icon: string;
  badge1Title: string;
  badge1Subtitle: string;
  badge2Icon: string;
  badge2Title: string;
  badge2Subtitle: string;
  badge3Icon: string;
  badge3Title: string;
  badge3Subtitle: string;
};

const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

const ICONS: Record<string, string> = {
  salesforce: "☁",
  globe: "🌐",
  certified: "🛡",
  shield: "🛡",
  cloud: "☁",
};

export default function CodmStory() {
  const [story, setStory] = useState<StoryData | null>(null);

  useEffect(() => {
    async function loadStory() {
      try {
        const response = await fetch(WORDPRESS_GRAPHQL_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              query GetStory {
                codmStories(first: 1) {
                  nodes {
                    eyebrow
                    heading
                    highlight
                    paragraph1
                    paragraph2
                    imageUrl
                    imageCaption
                    badge1Icon
                    badge1Title
                    badge1Subtitle
                    badge2Icon
                    badge2Title
                    badge2Subtitle
                    badge3Icon
                    badge3Title
                    badge3Subtitle
                  }
                }
              }
            `,
          }),
        });

        const result = await response.json();
        const data = result?.data?.codmStories?.nodes?.[0];

        if (data) {
          setStory(data);
        }
      } catch (error) {
        console.error("Failed to load story:", error);
      }
    }

    loadStory();
  }, []);

  if (!story) return null;

  const badges = [
    { icon: story.badge1Icon, title: story.badge1Title, subtitle: story.badge1Subtitle },
    { icon: story.badge2Icon, title: story.badge2Title, subtitle: story.badge2Subtitle },
    { icon: story.badge3Icon, title: story.badge3Title, subtitle: story.badge3Subtitle },
  ].filter((b) => b.title);

  return (
    <section className="codm-story-section">
      <div className="codm-story-grid">
        <div className="codm-story-content">
          {story.eyebrow && (
            <div className="codm-story-eyebrow">
              <span></span>
              {story.eyebrow}
              <span></span>
            </div>
          )}

          <h2 className="codm-story-heading">
            {story.heading}{" "}
            <span className="codm-story-highlight">{story.highlight}</span>
          </h2>

          {story.paragraph1 && <p className="codm-story-paragraph">{story.paragraph1}</p>}
          {story.paragraph2 && <p className="codm-story-paragraph">{story.paragraph2}</p>}

          {badges.length > 0 && (
            <div className="codm-story-badges">
              {badges.map((badge, index) => (
                <div key={index} className="codm-story-badge">
                  <span className="codm-story-badge-icon">
                    {ICONS[badge.icon] || "•"}
                  </span>
                  <div>
                    <div className="codm-story-badge-title">{badge.title}</div>
                    <div className="codm-story-badge-subtitle">{badge.subtitle}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {story.imageUrl && (
          <div className="codm-story-image-wrap">
            <img src={story.imageUrl} alt="" className="codm-story-image" />

            {story.imageCaption && (
              <p className="codm-story-image-caption">{story.imageCaption}</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

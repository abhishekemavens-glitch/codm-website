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

/* =========================================================
   ICONS
========================================================= */
/* =========================================================
   ICONS
========================================================= */

function SalesforceIcon() {
  return (
    <img
      src="https://lightyellow-echidna-411021.hostingersite.com/wp-content/uploads/2026/08/image-257.png"
      alt="Salesforce"
      width={56}
      height={56}
      style={{
        display: "block",
        width: "56px",
        height: "56px",
        objectFit: "contain",
      }}
    />
  );
}

function GlobeIcon() {
  return (
    <svg
      width="42"
      height="42"
      viewBox="0 0 42 42"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="21" cy="21" r="18" stroke="#8B7CFF" strokeWidth="1.8" />
      <ellipse cx="21" cy="21" rx="8" ry="18" stroke="#8B7CFF" strokeWidth="1.8" />
      <path d="M3 21H39" stroke="#8B7CFF" strokeWidth="1.8" />
      <path d="M6 12.5H36" stroke="#8B7CFF" strokeWidth="1.4" />
      <path d="M6 29.5H36" stroke="#8B7CFF" strokeWidth="1.4" />
    </svg>
  );
}

function CertifiedIcon() {
  return (
    <img
      src="/hugeicons_id-verified.png"
      alt="Certified Experts"
      width={42}
      height={42}
      style={{
        display: "block",
        width: "42px",
        height: "42px",
        objectFit: "contain",
      }}
    />
  );
}

function BadgeIcon({ type }: { type: string }) {
  const normalized = type?.toLowerCase().trim();

  switch (normalized) {
    case "salesforce":
    case "cloud":
      return <SalesforceIcon />;

    case "globe":
      return <GlobeIcon />;

    case "certified":
    case "shield":
      return <CertifiedIcon />;

    default:
      return <GlobeIcon />;
  }
}

/* =========================================================
   COMPONENT
========================================================= */

export default function CodmStory() {
  const [story, setStory] = useState<StoryData | null>(null);

  useEffect(() => {
    async function loadStory() {
      try {
        const response = await fetch(WORDPRESS_GRAPHQL_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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

        const data =
          result?.data?.codmStories?.nodes?.[0];

        if (data) {
          setStory(data);
        }
      } catch (error) {
        console.error(
          "Failed to load CODM story:",
          error
        );
      }
    }

    loadStory();
  }, []);

  if (!story) return null;

  const badges = [
    {
      icon: story.badge1Icon,
      title: story.badge1Title,
      subtitle: story.badge1Subtitle,
    },
    {
      icon: story.badge2Icon,
      title: story.badge2Title,
      subtitle: story.badge2Subtitle,
    },
    {
      icon: story.badge3Icon,
      title: story.badge3Title,
      subtitle: story.badge3Subtitle,
    },
  ].filter((badge) => badge.title);

  return (
    <section className="codm-story-section">

      {/* =====================================================
          MAIN STORY
      ===================================================== */}

      <div className="codm-story-grid">

        <div className="codm-story-content">

          {story.eyebrow && (
  <div className="heading-codm-eyebrow-wrap">
    <span
      aria-hidden="true"
      className="heading-codm-eyebrow-line"
    />

    <span className="heading-codm-eyebrow">
      {story.eyebrow}
    </span>

    <span
      aria-hidden="true"
      className="heading-codm-eyebrow-line"
    />
  </div>
)}

          {story.heading && (
            <h2 className="codm-story-heading">
              {story.heading}{" "}
              {story.highlight && (
                <span className="codm-story-highlight">
                  {story.highlight}
                </span>
              )}
            </h2>
          )}

          {story.paragraph1 && (
            <p className="codm-story-paragraph">
              {story.paragraph1}
            </p>
          )}

          {story.paragraph2 && (
            <p className="codm-story-paragraph">
              {story.paragraph2}
            </p>
          )}

        </div>

        {story.imageUrl && (
          <div className="codm-story-image-wrap">
            <img
              src={story.imageUrl}
              alt={story.imageCaption || "CODM"}
              className="codm-story-image"
            />

            {story.imageCaption && (
              <p className="codm-story-image-caption">
                {story.imageCaption}
              </p>
            )}
          </div>
        )}

      </div>

      {/* =====================================================
          BADGES / TRUST STRIP
      ===================================================== */}

      {badges.length > 0 && (
        <div className="codm-story-badges">

          {badges.map((badge, index) => (
            <div
              key={index}
              className="codm-story-badge"
            >

              <div className="codm-story-badge-icon">
                <BadgeIcon type={badge.icon} />
              </div>

              <div className="codm-story-badge-text">

                <div className="codm-story-badge-title">
                  {badge.title}
                </div>

                {badge.subtitle && (
                  <div className="codm-story-badge-subtitle">
                    {badge.subtitle}
                  </div>
                )}

              </div>

            </div>
          ))}

        </div>
      )}

    </section>
  );
}

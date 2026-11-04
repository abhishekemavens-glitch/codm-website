
"use client";

import { useEffect, useState } from "react";

const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

type IndustryCard = {
  id: string;
  title: string;
  cardDescription: string | null;
  cardLink: string | null;
  iconUrl: string | null;
  featuredImage?: {
    node?: {
      sourceUrl?: string;
      altText?: string;
    } | null;
  } | null;
};

type SectionData = {
  eyebrow: string;
  title: string;
  description: string;
  enabled: boolean;
};

const QUERY = `
  query BuiltForEveryIndustry {
    builtForEveryIndustrySection {
      eyebrow
      title
      description
      enabled
    }

    builtIndustryCards(
      first: 100
      where: {
        orderby: [
          { field: MENU_ORDER, order: ASC }
          { field: DATE, order: ASC }
        ]
      }
    ) {
      nodes {
        id
        title
        cardDescription
        cardLink
        iconUrl
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
      }
    }
  }
`;

export default function BuiltForEveryIndustry() {
  const [section, setSection] = useState<SectionData | null>(null);
  const [cards, setCards] = useState<IndustryCard[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(WORDPRESS_GRAPHQL_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: QUERY }),
        });

        const result = await response.json();

        if (result.errors) {
          console.error("Built for Every Industry:", result.errors);
          return;
        }

        if (cancelled) return;

        setSection(result.data?.builtForEveryIndustrySection ?? null);
        setCards(result.data?.builtIndustryCards?.nodes ?? []);
      } catch (error) {
        console.error("Industry section failed:", error);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!section || !section.enabled || cards.length === 0) {
    return null;
  }

  return (
    <section className="bie-section">
      <div className="bie-container">

        <div className="bie-heading">
          {section.eyebrow && (
            <p className="bie-eyebrow">{section.eyebrow}</p>
          )}

          <h2>{section.title}</h2>

          {section.description && (
            <p className="bie-description">
              {section.description}
            </p>
          )}
        </div>

        <div className="bie-grid">
          {cards.map((card) => {
            const image = card.featuredImage?.node?.sourceUrl;

            const content = (
              <>
                {image && (
                  <img
                    src={image}
                    alt={card.featuredImage?.node?.altText || card.title}
                    className="bie-card-image"
                    loading="lazy"
                  />
                )}

                <div className="bie-card-overlay" />

                <div className="bie-card-content">
                  {card.iconUrl && (
                    <div className="bie-icon">
                      <img src={card.iconUrl} alt="" />
                    </div>
                  )}

                  <h3>{card.title}</h3>

                  {card.cardDescription && (
                    <p>{card.cardDescription}</p>
                  )}
                </div>
              </>
            );

            return card.cardLink ? (
              <a
                key={card.id}
                href={card.cardLink}
                className="bie-card"
              >
                {content}
              </a>
            ) : (
              <article key={card.id} className="bie-card">
                {content}
              </article>
            );
          })}
        </div>

      </div>

      <style jsx>{`
        .bie-section {
          width: 100%;
          padding: 76px 24px 84px;
          background: #101328;
          color: #fff;
        }

        .bie-container {
          max-width: 1240px;
          margin: 0 auto;
        }

        .bie-heading {
          max-width: 760px;
          margin: 0 auto 42px;
          text-align: center;
        }

        .bie-eyebrow {
          color: #9b85ff;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .bie-heading h2 {
          color: #fff;
          font-size: clamp(32px, 4vw, 48px);
          line-height: 1.15;
          font-weight: 500;
          margin: 0;
        }

        .bie-description {
          color: #aeb8d2;
          font-size: 19px;
          line-height: 1.6;
          margin: 18px 0 0;
        }

        .bie-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 22px;
        }

        .bie-card {
          position: relative;
          display: block;
          min-height: 330px;
          overflow: hidden;
          border: 1px solid rgba(48, 126, 226, 0.5);
          border-radius: 17px;
          background: #19223d;
          isolation: isolate;
          text-decoration: none;
          color: #fff;
          transition: transform 0.3s ease, border-color 0.3s ease;
        }

        .bie-card:hover {
          transform: translateY(-5px);
          border-color: #6b9cff;
        }

        .bie-card-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: -2;
          transition: transform 0.5s ease;
        }

        .bie-card:hover .bie-card-image {
          transform: scale(1.05);
        }

        .bie-card-overlay {
          position: absolute;
          inset: 0;
          z-index: -1;
          background: linear-gradient(
            180deg,
            rgba(5, 13, 31, 0.08) 5%,
            rgba(5, 13, 31, 0.25) 40%,
            rgba(5, 13, 31, 0.96) 100%
          );
        }

        .bie-card-content {
          position: absolute;
          right: 20px;
          bottom: 20px;
          left: 20px;
        }

        .bie-icon {
          display: flex;
          width: 68px;
          height: 68px;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          border-radius: 13px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(8px);
        }

        .bie-icon img {
          width: 42px;
          height: 42px;
          object-fit: contain;
        }

        .bie-card h3 {
          color: #fff;
          font-size: 17px;
          font-weight: 600;
          line-height: 1.3;
          margin: 0 0 8px;
        }

        .bie-card-content p {
          color: #bdc9df;
          font-size: 14px;
          line-height: 1.45;
          margin: 0;
        }

        @media (max-width: 1050px) {
          .bie-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 600px) {
          .bie-section {
            padding: 55px 18px;
          }

          .bie-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .bie-card {
            min-height: 340px;
          }

          .bie-description {
            font-size: 16px;
          }
        }
      `}</style>
    </section>
  );
}

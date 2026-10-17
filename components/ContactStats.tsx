"use client";

import { useEffect, useState } from "react";
import { Stagger, StaggerItem } from "@/components/Reveal";

/* =========================================================
   CONTACT STATS - the row of big numbers on the Contact page
   ("<24h  Average first response...", "4  Offices across...").

   Content comes from WordPress: Contact Stats (one entry per
   stat; Title = the big number). Hidden until at least one stat
   is published.

   Usage:  <ContactStats />
   Place at: components/ContactStats.tsx
   ========================================================= */

const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

type Stat = {
  id: string;
  statValue: string | null;
  statDescription: string | null;
};

export default function ContactStats() {
  /* null = still loading, [] = loaded but nothing to show */
  const [stats, setStats] = useState<Stat[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(WORDPRESS_GRAPHQL_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              query GetContactStats {
                contactStats(
                  first: 12
                  where: {
                    orderby: [
                      { field: MENU_ORDER, order: ASC }
                      { field: DATE, order: ASC }
                    ]
                  }
                ) {
                  nodes {
                    id
                    statValue
                    statDescription
                  }
                }
              }
            `,
          }),
        });

        const result = await response.json();

        if (result.errors) {
          console.error("Contact Stats GraphQL Error:", result.errors);
          if (!cancelled) setStats([]);
          return;
        }

        const nodes: Stat[] = result?.data?.contactStats?.nodes ?? [];

        if (!cancelled) {
          setStats(nodes.filter((node) => Boolean(node.statValue)));
        }
      } catch (error) {
        console.error("Failed to load contact stats:", error);
        if (!cancelled) setStats([]);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  /* Loaded, but nothing published: hide the whole strip */
  if (stats && stats.length === 0) {
    return null;
  }

  const columns = stats ? Math.min(stats.length, 4) : 4;

  return (
    <section className="codm-stats" aria-label="CODM at a glance">
      <div
        className="codm-stats-inner"
        style={{ "--stat-cols": columns } as React.CSSProperties}
      >
        {stats === null ? (
          /* keeps the space reserved while loading, so the page doesn't jump */
          <div className="codm-stats-placeholder" aria-hidden="true" />
        ) : (
          <Stagger className="codm-stats-grid">
            {stats.map((stat) => (
              <StaggerItem key={stat.id} className="codm-stat-cell">
                <span className="codm-stat-value">{stat.statValue}</span>

                {stat.statDescription && (
                  <p className="codm-stat-label">{stat.statDescription}</p>
                )}
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </div>
    </section>
  );
}

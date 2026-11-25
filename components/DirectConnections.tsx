"use client";

import { useEffect, useState } from "react";
import SectionHeading from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";

/* =========================================================
   DIRECT CONNECTIONS — "A human connection. However you reach us."

   All content comes from WordPress (codm-headless.php):
     - heading + intro -> Contact Cards > Section settings
     - the columns     -> Contact Cards > All Cards (ordered by "Order")
   Hidden if no cards are published.

   Usage:  <DirectConnections />
   Place at: components/DirectConnections.tsx
   ========================================================= */

const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

type Entry = {
  tag: string | null;
  value: string | null;
  href: string | null;
};

type Card = {
  id: string;
  title: string;
  icon: string | null;
  description: string | null;
  entries: Entry[] | null;
  footnote: string | null;
};

type Settings = {
  eyebrow: string | null;
  title: string | null;
  gradientText: string | null;
  intro: string | null;
};

function Icon({ name }: { name: string | null }) {
  const common = {
    width: 26,
    height: 26,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "phone":
      return (
        <svg {...common}>
          <path d="M6.6 3.5h2.7l1.4 3.8-1.8 1.3a11 11 0 0 0 5.5 5.5l1.3-1.8 3.8 1.4v2.7a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2Z" />
        </svg>
      );
    case "building":
      return (
        <svg {...common}>
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2" />
          <path d="M10.5 21v-3h3v3" />
        </svg>
      );
    case "globe":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        </svg>
      );
    case "chat":
      return (
        <svg {...common}>
          <path d="M20 12a8 8 0 0 1-11.7 7.1L4 20l1-4.1A8 8 0 1 1 20 12Z" />
        </svg>
      );
    case "pin":
      return (
        <svg {...common}>
          <path d="M12 21s7-5.6 7-11a7 7 0 0 0-14 0c0 5.4 7 11 7 11Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
        </svg>
      );
  }
}

export default function DirectConnections() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(WORDPRESS_GRAPHQL_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              query GetDirectConnections {
                contactSection {
                  eyebrow
                  title
                  gradientText
                  intro
                }
                contactCards(
                  first: 20
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
                    icon
                    description
                    footnote
                    entries {
                      tag
                      value
                      href
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

        if (!cancelled) {
          setSettings(result.data?.contactSection ?? null);
          setCards(result.data?.contactCards?.nodes ?? []);
        }
      } catch (error) {
        console.error("Failed to load contact cards:", error);
      } finally {
        if (!cancelled) {
          setLoaded(true);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!loaded || cards.length === 0) {
    return null;
  }

  return (
    <section
      id="direct-connections"
      className="relative overflow-hidden bg-[var(--background)] px-5 py-16 transition-colors duration-500 sm:px-8 md:py-24"
    >
      {/* soft purple glow behind the section */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-[#6D4AFF]/10 blur-[120px]"
      />

      <div className="relative mx-auto max-w-[1250px]">
        {/* =================================================
            HEADING
            ================================================= */}
        <Reveal distance={20}>
          <div className="mx-auto max-w-[900px] text-center">
            <SectionHeading
              align="center"
              eyebrow={settings?.eyebrow ?? ""}
              title={settings?.title ?? ""}
              gradientText={settings?.gradientText ?? ""}
              description={settings?.intro ?? ""}
            />
          </div>
        </Reveal>

        {/* =================================================
            CARDS
            [&>*]:h-full + [&>*>*]:h-full make every card the
            same height so the footnotes line up in one row.
            ================================================= */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 [&>*]:h-full [&>*>*]:h-full">
          {cards.map((card, index) => {
            const entries = (card.entries ?? []).filter((e) => e.value);

            return (
              <Reveal key={card.id} distance={24} duration={0.7}>
                <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--foreground)]/[0.03] p-7 transition-all duration-500 hover:-translate-y-1.5 hover:border-[#6D4AFF]/40 hover:shadow-[0_24px_60px_-20px_rgba(109,74,255,0.35)]">
                  {/* top accent line, grows on hover */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-[#6D4AFF] to-[#8B6DFF] transition-transform duration-500 group-hover:scale-x-100"
                  />

                  {/* big faint number */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute right-5 top-3 select-none text-[64px] font-semibold leading-none tracking-tight tabular-nums text-[var(--foreground)]/[0.05] transition-colors duration-500 group-hover:text-[#6D4AFF]/15"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  {/* icon tile */}
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6D4AFF]/10 text-[#6D4AFF] transition-all duration-500 group-hover:bg-gradient-to-br group-hover:from-[#6D4AFF] group-hover:to-[#8B6DFF] group-hover:text-white">
                    <Icon name={card.icon} />
                  </div>

                  <h3 className="mt-8 text-[24px] font-medium leading-tight tracking-[-0.02em] text-[var(--foreground)]">
                    {card.title}
                  </h3>

                  {card.description && (
                    <p className="mt-3 text-[15px] leading-7 text-[var(--muted)]">
                      {card.description}
                    </p>
                  )}

                  {/* entries grow to fill space, pushing the footnote to the bottom */}
                  <div className="mt-6 flex-1">
                    {entries.length > 0 && (
                      <ul className="space-y-4">
                        {entries.map((entry, i) => {
                          const isEmail = entry.href?.startsWith("mailto:");

                          return (
                            <li
                              key={i}
                              className="flex items-start gap-3 text-[15px] leading-6 text-[var(--foreground)]"
                            >
                              {entry.tag && (
                                <span className="mt-0.5 inline-flex h-6 min-w-[30px] shrink-0 items-center justify-center rounded-full bg-[#6D4AFF]/10 px-2 text-[10.5px] font-semibold uppercase tracking-wide text-[#6D4AFF]">
                                  {entry.tag}
                                </span>
                              )}

                              {entry.href ? (
                                <a
                                  href={entry.href}
                                  className={
                                    "break-words transition-colors duration-300 hover:text-[#6D4AFF] " +
                                    (isEmail ? "font-medium text-[#6D4AFF]" : "")
                                  }
                                >
                                  {entry.value}
                                </a>
                              ) : (
                                <span className="break-words">
                                  {entry.value}
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>

                  {/* footnote, always at the same height across cards */}
                  {card.footnote && (
                    <p className="mt-7 flex items-start gap-2 border-t border-[var(--border)] pt-5 text-[13px] leading-5 text-[var(--muted)]">
                      <span
                        aria-hidden="true"
                        className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#6D4AFF]"
                      />
                      <span>{card.footnote}</span>
                    </p>
                  )}
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

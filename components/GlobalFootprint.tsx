"use client";

import { useEffect, useState } from "react";
import SectionHeading from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";

/* =========================================================
   OUR GLOBAL FOOTPRINT — "Local presence. Global perspective."

   All content comes from WordPress (codm-headless.php):
     - heading, intro, labels -> Offices > Section settings
     - the offices            -> Offices > All Offices (ordered by "Order")
   The map + directions link are built from each office's address.
   Hidden if no offices are published.

   Usage:  <GlobalFootprint />
   Place at: components/GlobalFootprint.tsx
   ========================================================= */

const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

type Office = {
  id: string;
  title: string;
  tagline: string | null;
  region: string | null;
  greeting: string | null;
  address: string | null;
  phone: string | null;
  hours: string | null;
  mapUrl: string | null;
  directionsUrl: string | null;
  isDefault: boolean | null;
};

type Settings = {
  eyebrow: string | null;
  title: string | null;
  gradientText: string | null;
  intro: string | null;
  findLabel: string | null;
  touchLabel: string | null;
  buttonText: string | null;
};

const splitLines = (value: string | null | undefined) =>
  (value ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M4.5 11.5 11.5 4.5M5.5 4.5h6v6" />
    </svg>
  );
}

export default function GlobalFootprint() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [offices, setOffices] = useState<Office[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
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
              query GetOffices {
                officesSection {
                  eyebrow
                  title
                  gradientText
                  intro
                  findLabel
                  touchLabel
                  buttonText
                }
                offices(
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
                    tagline
                    region
                    greeting
                    address
                    phone
                    hours
                    mapUrl
                    directionsUrl
                    isDefault
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
          const nodes: Office[] = result.data?.offices?.nodes ?? [];
          setSettings(result.data?.officesSection ?? null);
          setOffices(nodes);
          setActiveId((nodes.find((o) => o.isDefault) ?? nodes[0])?.id ?? null);
        }
      } catch (error) {
        console.error("Failed to load offices:", error);
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

  if (!loaded || offices.length === 0) {
    return null;
  }

  const active = offices.find((o) => o.id === activeId) ?? offices[0];
  const introLines = splitLines(settings?.intro);
  const addressLines = splitLines(active.address);
  const hasContact = Boolean(active.phone || active.hours);

  return (
    <section
      id="global-footprint"
      className="relative overflow-hidden bg-[var(--background)] px-5 py-16 transition-colors duration-500 sm:px-8 md:py-24"
    >
      <div className="relative mx-auto max-w-[1250px]">
        {/* HEADING + intro */}
        <Reveal distance={20}>
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              align="left"
              eyebrow={settings?.eyebrow ?? ""}
              title={settings?.title ?? ""}
              gradientText={settings?.gradientText ?? ""}
            />

            {introLines.length > 0 && (
              <div className="max-w-[360px] text-[15px] leading-7 text-[var(--muted)] md:pb-2 md:text-base">
                {introLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            )}
          </div>
        </Reveal>

        {/* LIST + DETAIL */}
        <Reveal distance={24} duration={0.7}>
          <div className="mt-12 grid border-y border-[var(--border)] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,2.1fr)]">
            {/* office list */}
            <ul
              role="tablist"
              aria-label="Offices"
              className="divide-y divide-[var(--border)] border-b border-[var(--border)] lg:border-b-0 lg:border-r"
            >
              {offices.map((office, index) => {
                const isActive = office.id === active.id;

                return (
                  <li key={office.id}>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveId(office.id)}
                      className={
                        "group relative flex w-full items-center gap-5 px-5 py-6 text-left transition-colors duration-300 sm:px-7 " +
                        (isActive
                          ? "bg-[var(--surface)]"
                          : "hover:bg-[var(--surface)]/60")
                      }
                    >
                      <span
                        aria-hidden="true"
                        className={
                          "absolute inset-y-0 left-0 w-[3px] bg-[#6D4AFF] transition-opacity duration-300 " +
                          (isActive ? "opacity-100" : "opacity-0")
                        }
                      />

                      <span className="w-6 shrink-0 self-start pt-[7px] text-[12px] tabular-nums text-[var(--muted)]">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span className="flex-1">
                        <span
                          className={
                            "block text-[22px] font-normal leading-tight tracking-[-0.02em] transition-colors duration-300 " +
                            (isActive
                              ? "text-[var(--foreground)]"
                              : "text-[var(--muted)] group-hover:text-[var(--foreground)]")
                          }
                        >
                          {office.title}
                        </span>

                        {office.tagline && (
                          <span className="mt-2 block text-[13px] text-[var(--muted)]">
                            {office.tagline}
                          </span>
                        )}
                      </span>

                      <Arrow
                        className={
                          "shrink-0 transition-all duration-300 " +
                          (isActive
                            ? "text-[#6D4AFF]"
                            : "text-[var(--muted)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5")
                        }
                      />
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* detail panel */}
            <div
              key={active.id}
              role="tabpanel"
              className="grid gap-8 p-6 sm:p-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] xl:gap-10"
              style={{ animation: "fp-fade 0.45s ease both" }}
            >
              <div className="flex flex-col">
                {active.region && (
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--muted)]">
                    {active.region}
                  </p>
                )}

                <h3 className="mt-5 text-[34px] font-normal leading-[1.1] tracking-[-0.03em] text-[var(--foreground)] sm:text-[40px]">
                  {active.greeting || `Hello from ${active.title}.`}
                </h3>

                <div className="mt-10 grid gap-8 sm:grid-cols-2 xl:grid-cols-1">
                  {addressLines.length > 0 && (
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--muted)]">
                        {settings?.findLabel}
                      </p>
                      <address className="mt-3 text-[15px] not-italic leading-7 text-[var(--muted)]">
                        {addressLines.map((line) => (
                          <span key={line} className="block">
                            {line}
                          </span>
                        ))}
                      </address>
                    </div>
                  )}

                  {hasContact && (
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--muted)]">
                        {settings?.touchLabel}
                      </p>
                      <div className="mt-3 text-[15px] leading-7">
                        {active.phone && (
                          <a
                            href={`tel:${active.phone.replace(/[^0-9+]/g, "")}`}
                            className="block font-medium text-[var(--foreground)] transition-colors duration-300 hover:text-[#6D4AFF]"
                          >
                            {active.phone}
                          </a>
                        )}
                        {active.hours && (
                          <span className="block text-[var(--muted)]">
                            {active.hours}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {active.directionsUrl && (
                  <a
                    href={active.directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-10 inline-flex w-fit items-center gap-3 rounded-full border border-[var(--foreground)]/80 px-6 py-3 text-[15px] font-medium text-[var(--foreground)] transition-all duration-300 hover:border-[#6D4AFF] hover:bg-[#6D4AFF] hover:text-white xl:mt-auto"
                  >
                    {settings?.buttonText || "Get directions"}
                    <Arrow />
                  </a>
                )}
              </div>

              {/* map */}
              {active.mapUrl && (
                <div className="min-h-[300px] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] xl:min-h-[420px]">
                  <iframe
                    key={active.mapUrl}
                    src={active.mapUrl}
                    title={`Map of our ${active.title} office`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                    className="h-full min-h-[300px] w-full border-0 xl:min-h-[420px]"
                  />
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </div>

      <style>{`
        @keyframes fp-fade {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}

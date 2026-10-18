"use client";

import { useEffect, useMemo, useState } from "react";
import { Reveal } from "@/components/Reveal";
import ApplyModal, { type ApplyFormSettings } from "@/components/ApplyModal";

/* =========================================================
   CAREERS — "Explore opportunities"

   Everything comes from WordPress (codm-headless.php):
     - roles          -> Careers > All Roles
     - heading, filter label, search box, side card
                      -> Careers > Section settings
   The filter pills are built from the roles' Department field.

   Usage:  <CareersSection />
   Place at: components/CareersSection.tsx
   ========================================================= */

const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

type Role = {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  jobType: string | null;
  summary: string | null;
  roleLink: string | null;
};

type Settings = {
  eyebrow: string | null;
  title: string | null;
  gradientText: string | null;
  allLabel: string | null;
  searchPlaceholder: string | null;
  viewButtonText: string | null;
  emptyText: string | null;
  cardTitle: string | null;
  cardText: string | null;
  cardButtonText: string | null;
  cardButtonLink: string | null;
};

function Tag({
  icon,
  children,
}: {
  icon: "dept" | "pin" | "clock";
  children: React.ReactNode;
}) {
  const paths = {
    dept: (
      <>
        <rect x="3" y="4" width="10" height="9" rx="1.6" />
        <path d="M6 4V2.8h4V4M3 8h10" />
      </>
    ),
    pin: (
      <>
        <path d="M8 14s4.5-3.6 4.5-7A4.5 4.5 0 0 0 3.5 7C3.5 10.4 8 14 8 14Z" />
        <circle cx="8" cy="7" r="1.5" />
      </>
    ),
    clock: (
      <>
        <circle cx="8" cy="8" r="5.5" />
        <path d="M8 5v3.2l2 1.2" />
      </>
    ),
  };

  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)]/[0.08] px-3 py-1.5 text-[12px] text-[var(--muted)]">
      <svg
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="text-[var(--accent)]"
      >
        {paths[icon]}
      </svg>
      {children}
    </span>
  );
}

function ArrowIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function CareersSection() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [department, setDepartment] = useState("");
  const [query, setQuery] = useState("");
  const [formSettings, setFormSettings] = useState<ApplyFormSettings | null>(null);
  // popup: null = closed, { role: null } = "Send us your profile"
  const [applyFor, setApplyFor] = useState<{ role: Role | null } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(WORDPRESS_GRAPHQL_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              query GetCareers {
                careersSection {
                  eyebrow
                  title
                  gradientText
                  allLabel
                  searchPlaceholder
                  viewButtonText
                  emptyText
                  cardTitle
                  cardText
                  cardButtonText
                  cardButtonLink
                }
                applicationForm {
                  roleTitle
                  profileTitle
                  intro
                  submitText
                  privacyText
                  successTitle
                  successText
                }
                jobRoles(
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
                    department
                    location
                    jobType
                    summary
                    roleLink
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
          setSettings(result.data?.careersSection ?? null);
          setRoles(result.data?.jobRoles?.nodes ?? []);
          setFormSettings(result.data?.applicationForm ?? null);
        }
      } catch (error) {
        console.error("Failed to load careers:", error);
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

  /* pills = unique departments, in the order roles appear */
  const departments = useMemo(
    () =>
      Array.from(
        new Set(roles.map((r) => r.department?.trim()).filter(Boolean))
      ) as string[],
    [roles]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();

    return roles.filter((role) => {
      if (department && role.department?.trim() !== department) {
        return false;
      }

      if (!q) {
        return true;
      }

      return [role.title, role.department, role.location, role.jobType, role.summary]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [roles, department, query]);

  if (!loaded || roles.length === 0) {
    return null;
  }

  const s = settings;

  return (
    <section
      id="careers"
      className="relative overflow-hidden bg-[var(--background)] py-16 transition-colors duration-500 md:py-24"
    >
      <div className="relative mx-auto max-w-[1180px] px-5 sm:px-8">
        {/* =================================================
            HEADER: title + filters + search
            ================================================= */}
        <Reveal distance={20}>
          {/* eyebrow sits above the whole row, like the design */}
          {s?.eyebrow && (
  <div
    className="pis-eyebrow"
    style={{ justifyContent: "flex-start", marginLeft: 0 }}
  >
    <span className="pis-eyebrow-line" />
    <span className="pis-eyebrow-dot" />
    <span>{s.eyebrow}</span>
    <span className="pis-eyebrow-dot" />
    <span className="pis-eyebrow-line pis-eyebrow-line--r" />
  </div>
)}

          {/* heading + filters + search share one row, vertically centred */}
          <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="text-[34px] font-normal leading-[1.15] tracking-[-0.02em] text-[var(--foreground)] md:text-[40px]">
              {s?.title}
              {s?.title && s?.gradientText && " "}
              {s?.gradientText && (
                <span
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, #4F5DFF 0%, #8B5CF6 60%, #A78BFA 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    color: "transparent",
                  }}
                >
                  {s.gradientText}
                </span>
              )}
            </h2>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* FILTER PILLS */}
              <div
                role="tablist"
                aria-label="Filter roles by department"
                className="flex max-w-full gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {["", ...departments].map((dep) => {
                  const isActive = dep === department;

                  return (
                    <button
                      key={dep || "all"}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setDepartment(dep)}
                      className={
                        "shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-300 " +
                        (isActive
                          ? "bg-gradient-to-r from-[#6D4AFF] to-[#8B5CF6] text-white shadow-[0_8px_20px_rgba(109,74,255,0.28)]"
                          : "bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--accent)]/10")
                      }
                    >
                      {dep || s?.allLabel || "All Roles"}
                    </button>
                  );
                })}
              </div>

              {/* SEARCH */}
              <label className="flex w-full items-center gap-2.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 sm:w-[210px]">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  aria-hidden="true"
                  className="shrink-0 text-[var(--accent)]"
                >
                  <circle cx="7" cy="7" r="4.5" />
                  <path d="m10.5 10.5 3 3" />
                </svg>

                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={s?.searchPlaceholder || "Search roles..."}
                  aria-label="Search roles"
                  className="w-full bg-transparent text-[13px] text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
                />
              </label>
            </div>
          </div>
        </Reveal>

        {/* =================================================
            ROLES + SIDE CARD
            ================================================= */}
        <div className="mt-8 grid items-start gap-5 lg:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-3.5">
            {visible.length === 0 && (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-10 text-center text-sm text-[var(--muted)]">
                {s?.emptyText || "No roles match your search right now."}
              </div>
            )}

            {visible.map((role) => {
              return (
                <article
                  key={role.id}
                  className="group flex flex-col gap-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--accent)]/40 hover:shadow-[0_18px_44px_rgba(80,56,232,0.12)] sm:flex-row sm:items-center sm:justify-between sm:p-6"
                >
                  <div className="min-w-0">
                    <h3 className="text-[19px] font-medium tracking-[-0.02em] text-[var(--foreground)]">
                      {role.title}
                    </h3>

                    {role.summary && (
                      <p className="mt-1.5 text-[14px] leading-6 text-[var(--muted)]">
                        {role.summary}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2.5">
                      {role.department && <Tag icon="dept">{role.department}</Tag>}
                      {role.location && <Tag icon="pin">{role.location}</Tag>}
                      {role.jobType && <Tag icon="clock">{role.jobType}</Tag>}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setApplyFor({ role })}
                    className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-full border border-[#6D4AFF]/60 px-6 py-2.5 text-[14px] font-medium text-[#6D4AFF] transition-all duration-300 hover:border-transparent hover:bg-gradient-to-r hover:from-[#6D4AFF] hover:to-[#8B5CF6] hover:text-white sm:self-center"
                  >
                    {s?.viewButtonText || "View role"}
                    <ArrowIcon />
                  </button>
                </article>
              );
            })}
          </div>

          {/* SIDE CARD */}
          {(s?.cardTitle || s?.cardText || s?.cardButtonText) && (
            <aside className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#ece8ff] to-[#ddd5ff] p-8 dark:from-[#1a1840] dark:to-[#241f5c] lg:sticky lg:top-28">
              <svg
                width="34"
                height="34"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#6D4AFF"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
              </svg>

              {s?.cardTitle && (
                <h3 className="mt-6 text-[30px] font-medium leading-[1.15] tracking-[-0.03em] text-[#14123a] dark:text-white">
                  {s.cardTitle}
                </h3>
              )}

              {s?.cardText && (
                <p className="mt-4 text-[15px] leading-6 text-[#4a4870] dark:text-white/70">
                  {s.cardText}
                </p>
              )}

              {s?.cardButtonText && (
                <button
                  type="button"
                  onClick={() => setApplyFor({ role: null })}
                  className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] px-7 py-3.5 text-[14px] font-medium text-white shadow-[0_14px_34px_rgba(99,79,240,0.32)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(99,79,240,0.42)]"
                >
                  {s.cardButtonText}
                  <ArrowIcon />
                </button>
              )}
            </aside>
          )}
        </div>
      </div>

      <ApplyModal
        open={applyFor !== null}
        onClose={() => setApplyFor(null)}
        role={applyFor?.role ?? null}
        roleOptions={roles.map((r) => r.title)}
        settings={formSettings}
      />
    </section>
  );
}

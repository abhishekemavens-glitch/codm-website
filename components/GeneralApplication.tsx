"use client";

import { useEffect, useState } from "react";
import SectionHeading from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";

/* =========================================================
   GENERAL APPLICATION — "Your skills could be our next big idea."

   All content comes from WordPress (codm-headless.php):
   Careers > General Application. Hidden if nothing is saved.

   Usage:  <GeneralApplication />
   Place at: components/GeneralApplication.tsx
   ========================================================= */

const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

type Content = {
  eyebrow: string | null;
  title: string | null;
  gradientText: string | null;
  description: string | null;
  checklist: string[] | null;
  buttonText: string | null;
  buttonLink: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
};

const isExternal = (href: string) => /^(https?:)?\/\//i.test(href);

/* Built-in drawing, used when no illustration is chosen in WordPress */
function ProfileIllustration() {
  return (
    <div className="relative mx-auto aspect-[1.45/1] w-full max-w-[420px]">
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-[40px] bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.22),transparent_70%)] blur-xl"
      />

      <div className="absolute left-[16%] top-[8%] h-[84%] w-[64%] rounded-2xl border border-white/80 bg-white/90 p-[7%] shadow-[0_22px_50px_rgba(99,79,240,0.18)] dark:border-white/10 dark:bg-[#1d1f45]">
        <svg
          viewBox="0 0 48 48"
          fill="none"
          stroke="#6D4AFF"
          strokeWidth="3.2"
          strokeLinecap="round"
          className="h-[34%] w-auto"
          aria-hidden="true"
        >
          <circle cx="24" cy="15" r="8" />
          <path d="M8 43c0-9 7-15 16-15s16 6 16 15" />
        </svg>

        <div className="mt-[7%] space-y-[6%]">
          <div className="h-2 w-[70%] rounded-full bg-[#c9bdfb]" />
          <div className="h-2 w-[85%] rounded-full bg-[#ddd5fd]" />
          <div className="h-2 w-[40%] rounded-full bg-[#ddd5fd]" />
        </div>

        <div className="absolute inset-x-[7%] bottom-[8%] space-y-[5%]">
          <div className="h-1.5 w-full rounded-full bg-[#e4defd]" />
          <div className="h-1.5 w-[75%] rounded-full bg-[#e4defd]" />
        </div>
      </div>

      <div className="absolute bottom-[10%] right-[14%] flex h-[17%] w-[12%] min-h-10 min-w-10 items-center justify-center rounded-[40%_40%_40%_8%] bg-gradient-to-br from-[#6D4AFF] to-[#8B5CF6] text-white shadow-[0_12px_26px_rgba(99,79,240,0.4)]">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M21.5 3 2.8 10.4c-.8.3-.8 1.4 0 1.7l4.6 1.8 1.8 4.6c.3.8 1.4.8 1.7 0L18 3.8c.2-.6-.2-1-.6-.8Z" />
        </svg>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className="shrink-0 text-[#6D4AFF]"
    >
      <path
        d="M3 8.5l3.2 3.2L13 4.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function GeneralApplication() {
  const [content, setContent] = useState<Content | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(WORDPRESS_GRAPHQL_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              query GetGeneralApplication {
                generalApplication {
                  eyebrow
                  title
                  gradientText
                  description
                  checklist
                  buttonText
                  buttonLink
                  imageUrl
                  imageAlt
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
          setContent(result.data?.generalApplication ?? null);
        }
      } catch (error) {
        console.error("Failed to load general application:", error);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!content) {
    return null;
  }

  const items = (content.checklist ?? []).filter(Boolean);

  const link = content.buttonLink || "#";

  return (
    <section
      id="general-application"
      className="relative overflow-hidden bg-[var(--background)] px-5 py-16 transition-colors duration-500 sm:px-8 md:py-24"
    >
      <div className="relative mx-auto max-w-[1000px]">
        <Reveal distance={20}>
          <SectionHeading
            eyebrow={content.eyebrow ?? ""}
            title={content.title ?? ""}
            gradientText={content.gradientText ?? ""}
            description={content.description ?? undefined}
          />
        </Reveal>

        <Reveal className="mt-10 md:mt-12" distance={30} duration={0.8}>
          <div className="grid items-center gap-8 rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_20px_60px_rgba(99,79,240,0.06)] md:grid-cols-[1.05fr_1fr] md:gap-0 md:p-8">
            {/* ILLUSTRATION */}
            <div className="px-2 md:px-6">
              {content.imageUrl ? (
                <img
                  src={content.imageUrl}
                  alt={content.imageAlt || content.title || ""}
                  className="mx-auto h-auto max-h-[260px] w-full max-w-[420px] object-contain"
                />
              ) : (
                <ProfileIllustration />
              )}
            </div>

            {/* CHECKLIST + BUTTON */}
            <div className="md:border-l md:border-[var(--border)] md:pl-10">
              {items.length > 0 && (
                <ul className="space-y-3.5">
                  {items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-3 text-[15px] text-[var(--foreground)]"
                    >
                      <CheckIcon />
                      {item}
                    </li>
                  ))}
                </ul>
              )}

              {content.buttonText && (
                <a
                  href={link}
                  {...(isExternal(link)
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] px-8 py-3.5 text-[14px] font-medium text-white shadow-[0_14px_34px_rgba(99,79,240,0.32)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(99,79,240,0.42)]"
                >
                  {content.buttonText}
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
                </a>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

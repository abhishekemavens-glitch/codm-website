"use client";

import { useEffect, useState } from "react";
import SectionHeading from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";

/* =========================================================
   THE NEXT STEPS — "No runaround. Just a way forward."

   All content comes from WordPress (codm-headless.php):
     - heading -> Next Steps > Section settings
     - steps   -> Next Steps > All Steps (numbered by "Order")
   Hidden if no steps are published.

   Usage:  <NextSteps />
   Place at: components/NextSteps.tsx
   ========================================================= */

const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

type Step = {
  id: string;
  title: string;
  description: string | null;
};

type Settings = {
  eyebrow: string | null;
  title: string | null;
  gradientText: string | null;
};

export default function NextSteps() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
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
              query GetNextSteps {
                nextStepsSection {
                  eyebrow
                  title
                  gradientText
                }
                nextSteps(
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
                    title
                    description
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
          setSettings(result.data?.nextStepsSection ?? null);
          setSteps(result.data?.nextSteps?.nodes ?? []);
        }
      } catch (error) {
        console.error("Failed to load next steps:", error);
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

  if (!loaded || steps.length === 0) {
    return null;
  }

  return (
    <section
      id="next-steps"
      className="relative overflow-hidden bg-[var(--surface)]/50 px-5 py-14 transition-colors duration-500 sm:px-8 md:py-20"
    >
      <div className="relative mx-auto grid max-w-[1250px] gap-12 lg:grid-cols-[0.8fr_2.2fr] lg:gap-16">
        {/* HEADING */}
        <Reveal distance={20}>
          <SectionHeading
            align="left"
            eyebrow={settings?.eyebrow ?? ""}
            title={settings?.title ?? ""}
            gradientText={settings?.gradientText ?? ""}
          />
        </Reveal>

        {/* STEPS */}
        <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-12">
          {steps.map((step, index) => (
            <Reveal key={step.id} distance={24} duration={0.7}>
              <article className="h-full border-t border-[var(--border)] pt-8">
                <p className="text-[14px] tabular-nums text-[#6D4AFF]">
                  {String(index + 1).padStart(2, "0")} /
                </p>

                <h3 className="mt-6 text-[22px] font-normal leading-tight tracking-[-0.02em] text-[var(--foreground)]">
                  {step.title}
                </h3>

                {step.description && (
                  <p className="mt-4 max-w-[360px] text-[15px] leading-7 text-[var(--muted)]">
                    {step.description}
                  </p>
                )}
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

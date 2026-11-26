import Hero from "../components/Hero";
import Industries from "../components/Industries";
import WhyCodm from "../components/WhyCodm";
import ServicesSection from "../components/ServicesSection";
import TrustedBy from "../components/TrustedBy";
import Testimonials from "../components/Testimonials";
import LatestBlogs from "../components/LatestBlogs";
import ContactCTA from "../components/ContactCTA";
import { Reveal } from "@/components/Reveal";

/* Heading text managed in WordPress > Homepage Manager.
   Any field can be empty: the section then keeps its own built-in text. */
export type SectionHeading = {
  eyebrow?: string;
  title?: string;
  highlight?: string;
  description?: string;
};

type HomepageSection = {
  key: string;
  enabled: boolean;
  order: number;
  eyebrow?: string | null;
  title?: string | null;
  highlight?: string | null;
  description?: string | null;
};

type HomepageSettingsResponse = {
  data?: {
    codmHomepageSettings?: {
      sections?: HomepageSection[];
    };
  };
};

const WORDPRESS_GRAPHQL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

const sectionComponents: Record<
  string,
  React.ComponentType<{ heading?: SectionHeading }>
> = {
  hero: Hero,
  industries: Industries,
  whyCodm: WhyCodm,
  services: ServicesSection,
  trustedBy: TrustedBy,
  testimonials: Testimonials,
  latestBlogs: LatestBlogs,
  contactCta: ContactCTA,
};

/* Used if WordPress / the Homepage Manager cannot be reached,
   so the homepage never turns blank. */
const FALLBACK_SECTIONS: HomepageSection[] = [
  "hero",
  "industries",
  "whyCodm",
  "services",
  "trustedBy",
  "testimonials",
  "latestBlogs",
  "contactCta",
].map((key, index) => ({ key, enabled: true, order: index + 1 }));

async function getHomepageSettings(): Promise<HomepageSection[]> {
  try {
    const response = await fetch(WORDPRESS_GRAPHQL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          query HomepageSettings {
            codmHomepageSettings {
              sections {
                key
                enabled
                order
                eyebrow
                title
                highlight
                description
              }
            }
          }
        `,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch homepage settings");
    }

    const result: HomepageSettingsResponse = await response.json();

    const sections = result.data?.codmHomepageSettings?.sections;

    if (!sections || sections.length === 0) {
      throw new Error("Homepage settings are missing");
    }

    return sections;
  } catch (error) {
    console.error("Homepage settings error:", error);
    return FALLBACK_SECTIONS;
  }
}

function toHeading(section: HomepageSection): SectionHeading | undefined {
  const heading: SectionHeading = {
    eyebrow: section.eyebrow?.trim() || undefined,
    title: section.title?.trim() || undefined,
    highlight: section.highlight?.trim() || undefined,
    description: section.description?.trim() || undefined,
  };

  const hasAny = Object.values(heading).some(Boolean);

  return hasAny ? heading : undefined;
}

export default async function Home() {
  const sections = await getHomepageSettings();

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {sortedSections.map((section) => {
        if (!section.enabled) return null;

        const Component = sectionComponents[section.key];

        if (!Component) return null;

        if (section.key === "hero") {
          /* Hero text is edited under "Hero" in WordPress, not here */
          return (
            <Reveal
              key={section.key}
              className="relative z-10"
              distance={24}
              duration={0.7}
            >
              <Component />
            </Reveal>
          );
        }

        return (
          <div key={section.key} className="relative z-10">
            <Component heading={toHeading(section)} />
          </div>
        );
      })}
    </main>
  );
}

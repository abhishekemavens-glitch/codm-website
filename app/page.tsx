
import Hero from "../components/Hero";
import Industries from "../components/Industries";
import WhyCodm from "../components/WhyCodm";
import ServicesSection from "../components/ServicesSection";
import TrustedBy from "../components/TrustedBy";
import Testimonials from "../components/Testimonials";
import LatestBlogs from "../components/LatestBlogs";
import ContactCTA from "../components/ContactCTA";
import { Reveal } from "@/components/Reveal";

type HomepageSection = {
  key: string;
  enabled: boolean;
  order: number;
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

const sectionComponents: Record<string, React.ComponentType> = {
  hero: Hero,
  industries: Industries,
  whyCodm: WhyCodm,
  services: ServicesSection,
  trustedBy: TrustedBy,
  testimonials: Testimonials,
  latestBlogs: LatestBlogs,
  contactCta: ContactCTA,
};

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

    if (!result.data?.codmHomepageSettings?.sections) {
      throw new Error("Homepage settings are missing");
    }

    return result.data.codmHomepageSettings.sections;
  } catch (error) {
    console.error("Homepage settings error:", error);
    return [];
  }
}

export default async function Home() {
  const sections = await getHomepageSettings();

  const sortedSections = [...sections].sort(
    (a, b) => a.order - b.order
  );

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {sortedSections.map((section) => {
        if (!section.enabled) return null;

        const Component = sectionComponents[section.key];

        if (!Component) return null;

        if (section.key === "hero") {
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
            <Component />
          </div>
        );
      })}
    </main>
  );
}

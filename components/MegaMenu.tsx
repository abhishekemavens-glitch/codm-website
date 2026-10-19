"use client";

type MegaMenuColumn = {
  icon: string;
  title: string;
  description: string;
  links: string;
};

type MegaMenuData = {
  enabled: boolean;
  columns: MegaMenuColumn[];
  bannerLabel: string;
  bannerTitle: string;
  bannerDescription: string;
  bannerButtonText: string;
  bannerButtonUrl: string;
};

type MegaMenuLink = {
  label: string;
  url: string;
};

const BASE_URL = "https://codm-frontend.vercel.app";

const URLS: Record<string, string> = {
  // Salesforce CRM
  "Salesforce CRM": `${BASE_URL}/services/salesforce-crm`,

  "Salesforce Education Cloud": `${BASE_URL}/services/education-cloud`,

  "Salesforce Financial Services": `${BASE_URL}/services/sales-force-financial-services-cloud`,

  "Salesforce Financial Services Cloud": `${BASE_URL}/services/sales-force-financial-services-cloud`,

  "Salesforce Health & Insurance Cloud": `${BASE_URL}/services/health-cloud`,

  "Health Cloud": `${BASE_URL}/services/health-cloud`,

  "Salesforce Data Cloud": `${BASE_URL}/services/data-cloud`,

  "Data Cloud": `${BASE_URL}/services/data-cloud`,

  "Salesforce Marketing Cloud": `${BASE_URL}/services/marketing-cloud`,

  "Marketing Cloud": `${BASE_URL}/services/marketing-cloud`,

  "Salesforce Sales Cloud": `${BASE_URL}/services/sales-cloud`,

  "Sales Cloud": `${BASE_URL}/services/sales-cloud`,

  "Salesforce Service Cloud": `${BASE_URL}/services/service-cloud`,

  "Service Cloud": `${BASE_URL}/services/service-cloud`,

  "Salesforce Energy and Utilities Cloud": `${BASE_URL}/services/energy-utilities-cloud`,

  "Energy Utilities & Cloud": `${BASE_URL}/services/energy-utilities-cloud`,

  "Salesforce Manufacturing Cloud": `${BASE_URL}/services/manufacturing-cloud`,

  "Manufacturing Cloud": `${BASE_URL}/services/manufacturing-cloud`,

  "Salesforce Nonprofit Cloud": `${BASE_URL}/services/non-profit-cloud`,

  "Non Profit Cloud": `${BASE_URL}/services/non-profit-cloud`,

  // Data and Integration
  "API Integration": `${BASE_URL}/services/api-integration`,

  "Data Integration": `${BASE_URL}/services/data-integration-migration`,

  "Data Migration": `${BASE_URL}/services/data-integration-migration`,

  "Data Integration/Migration": `${BASE_URL}/services/data-integration-migration`,

  "Data Integration and Migration": `${BASE_URL}/services/data-integration-migration`,

  // Development
  "CRM Development": `${BASE_URL}/services/salesforce-crm`,

  "Building LLM": `${BASE_URL}/services/building-llm`,

  ".NET Application": `${BASE_URL}/services/net-application`,

  ".Net Application": `${BASE_URL}/services/net-application`,

  "React Application": `${BASE_URL}/services/react-application`,

  "Python Application": `${BASE_URL}/services/python-application`,

  // Support
  "Technical Support": `${BASE_URL}/services/technical-support`,

  "Deployment Support": `${BASE_URL}/services/deployment-support`,
};

const MENU_COLUMNS: {
  icon: string;
  title: string;
  description: string;
  split?: boolean;
  links: MegaMenuLink[];
}[] = [
  {
    icon: "cloud",
    title: "Salesforce CRM",
    description:
      "End-to-end Salesforce solutions to transform and grow your business.",
    split: true,
    links: [
      {
        label: "Salesforce Education Cloud",
        url: URLS["Salesforce Education Cloud"],
      },
      {
        label: "Salesforce Financial Services",
        url: URLS["Salesforce Financial Services"],
      },
      {
        label: "Salesforce Health & Insurance Cloud",
        url: URLS["Salesforce Health & Insurance Cloud"],
      },
      {
        label: "Salesforce Data Cloud",
        url: URLS["Salesforce Data Cloud"],
      },
      {
        label: "Salesforce Marketing Cloud",
        url: URLS["Salesforce Marketing Cloud"],
      },
      {
        label: "Salesforce Sales Cloud",
        url: URLS["Salesforce Sales Cloud"],
      },
      {
        label: "Salesforce Service Cloud",
        url: URLS["Salesforce Service Cloud"],
      },
      {
        label: "Salesforce Energy and Utilities Cloud",
        url: URLS["Salesforce Energy and Utilities Cloud"],
      },
      {
        label: "Salesforce Manufacturing Cloud",
        url: URLS["Salesforce Manufacturing Cloud"],
      },
      {
        label: "Salesforce Nonprofit Cloud",
        url: URLS["Salesforce Nonprofit Cloud"],
      },
    ],
  },
  {
    icon: "database",
    title: "Data",
    description: "Connect, integrate and migrate your data with confidence.",
    links: [
      {
        label: "API Integration",
        url: URLS["API Integration"],
      },
      {
        label: "Data Integration",
        url: URLS["Data Integration"],
      },
      {
        label: "Data Migration",
        url: URLS["Data Migration"],
      },
    ],
  },
  {
    icon: "code",
    title: "Development",
    description: "Scalable and secure custom solutions built for your needs.",
    links: [
      {
        label: "CRM Development",
        url: URLS["CRM Development"],
      },
      {
        label: "Building LLM",
        url: URLS["Building LLM"],
      },
      {
        label: ".NET Application",
        url: URLS[".NET Application"],
      },
      {
        label: "React Application",
        url: URLS["React Application"],
      },
      {
        label: "Python Application",
        url: URLS["Python Application"],
      },
    ],
  },
  {
    icon: "support",
    title: "Support",
    description: "Reliable run, release and technical support services.",
    links: [
      {
        label: "Technical Support",
        url: URLS["Technical Support"],
      },
      {
        label: "Deployment Support",
        url: URLS["Deployment Support"],
      },
    ],
  },
];

const ICONS: Record<string, string> = {
  cloud: "☁",
  sparkle: "✦",
  code: "</>",
  database: "▤",
  integration: "⇄",
  support: "◎",
};

export function parseMegaMenuLinks(value: string = "") {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const pipeIndex = line.indexOf("|");

      if (pipeIndex === -1) {
        return {
          label: line,
          url: URLS[line] || "#",
        };
      }

      const label = line.substring(0, pipeIndex).trim();
      const suppliedUrl = line.substring(pipeIndex + 1).trim();

      return {
        label,
        url: URLS[label] || suppliedUrl || "#",
      };
    });
}

function LinkItem({ link }: { link: MegaMenuLink }) {
  return (
    <li>
      <a href={link.url} className="codm-megamenu-link">
        <span className="codm-megamenu-link-dot" aria-hidden="true" />

        <span className="codm-megamenu-link-text">{link.label}</span>

        <span className="codm-megamenu-link-arrow" aria-hidden="true">
          ›
        </span>
      </a>
    </li>
  );
}

export default function MegaMenu({
  data,
  onMouseEnter,
  onMouseLeave,
}: {
  data: MegaMenuData;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  if (!data.enabled) return null;

  return (
    <div
      className="codm-megamenu"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="codm-megamenu-columns">
        {MENU_COLUMNS.map((col) => {
          const halves = col.split
            ? [
                col.links.slice(0, Math.ceil(col.links.length / 2)),
                col.links.slice(Math.ceil(col.links.length / 2)),
              ]
            : [col.links];

          return (
            <div
              key={col.title}
              className={`codm-megamenu-column ${
                col.split ? "codm-megamenu-column-salesforce" : ""
              }`}
            >
              <div className="codm-megamenu-column-header">
                <span className="codm-megamenu-icon">
                  {ICONS[col.icon] || "•"}
                </span>

                <div className="codm-megamenu-column-heading">
                  <div className="codm-megamenu-column-title">
                    {col.title}
                  </div>

                  {col.description && (
                    <div className="codm-megamenu-column-description">
                      {col.description}
                    </div>
                  )}
                </div>
              </div>

              {col.split ? (
                <div className="codm-megamenu-links-split">
                  {halves.map((half, i) => (
                    <ul key={i} className="codm-megamenu-links">
                      {half.map((link) => (
                        <LinkItem key={link.label} link={link} />
                      ))}
                    </ul>
                  ))}
                </div>
              ) : (
                <ul className="codm-megamenu-links">
                  {col.links.map((link) => (
                    <LinkItem key={link.label} link={link} />
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {/* G-Cloud banner: one bordered box, three sections */}
      <div className="codm-megamenu-banner">
        <div className="codm-megamenu-banner-label">
          Government Commercial Agency <em>Supplier</em>
        </div>

        <div className="codm-megamenu-banner-content">
          <span className="codm-megamenu-banner-title">
            G-Cloud 15 <i aria-hidden="true">•</i> Lot 3: Cloud Support
          </span>

          <span className="codm-megamenu-banner-description">
            Salesforce, AI, integration, data and cloud application services
            for the public sector
          </span>
        </div>

        <div className="codm-megamenu-banner-actions">
          <a
            href={`${BASE_URL}/services/technical-support`}
            className="codm-megamenu-banner-button"
          >
            <span>Explore G-Cloud 15</span>
            <span aria-hidden="true">→</span>
          </a>

          <a
            href={`${BASE_URL}/services/salesforce-crm`}
            className="codm-megamenu-all-services"
          >
            <span>View all services</span>
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </div>
  );
}

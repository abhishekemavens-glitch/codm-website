import type { ReactNode } from "react";
import Link from "next/link";

export type ServiceLink = { label: string; href: string };
export type ServiceGroup = {
  title: string;
  description?: string;
  links: ServiceLink[];
};

type Props = {
  groups: ServiceGroup[];
  label?: string;
  servicesHref?: string;
  allLabel?: string;
  footer?: ReactNode; // e.g. the G-Cloud banner
  onNavigate?: () => void;
};

export default function MobileServicesMenu({
  groups,
  label = "Services",
  servicesHref = "/services",
  allLabel = "All services",
  footer,
  onNavigate,
}: Props) {
  return (
    <details className="codm-mobile-services">
      <summary className="codm-mobile-menu-link codm-mobile-services-summary">
        {label}
      </summary>

      <div className="codm-mobile-services-panel">
        <Link
          href={servicesHref}
          className="codm-mobile-services-all"
          onClick={onNavigate}
        >
          {allLabel}
        </Link>

        {groups.map((group, groupIndex) => (
          <section
            key={`${group.title}-${groupIndex}`}
            className="codm-mobile-services-group"
          >
            {group.title && (
              <p className="codm-mobile-services-group-title">{group.title}</p>
            )}

            {group.description && (
              <p className="codm-mobile-services-group-desc">
                {group.description}
              </p>
            )}

            <ul className="codm-mobile-services-links">
              {group.links.map((link, linkIndex) => (
                <li key={`${groupIndex}-${link.label}-${linkIndex}`}>
                  <Link
                    href={link.href}
                    className="codm-mobile-services-link"
                    onClick={onNavigate}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {footer}
      </div>
    </details>
  );
}

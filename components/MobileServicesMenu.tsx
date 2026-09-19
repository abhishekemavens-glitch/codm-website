import Link from "next/link";

export type ServiceLink = { label: string; href: string };
export type ServiceGroup = { title: string; links: ServiceLink[] };

type Props = {
  groups: ServiceGroup[];
  label?: string;
  servicesHref?: string;
  onNavigate?: () => void;
};

export default function MobileServicesMenu({
  groups,
  label = "Services",
  servicesHref = "/services",
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
          All services
        </Link>

        {groups.map((group) => (
          <section key={group.title} className="codm-mobile-services-group">
            <p className="codm-mobile-services-group-title">{group.title}</p>

            <ul className="codm-mobile-services-links">
              {group.links.map((link) => (
                <li key={`${group.title}-${link.label}`}>
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
      </div>
    </details>
  );
}

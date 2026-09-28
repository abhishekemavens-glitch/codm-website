type Props = {
  data?: {
    eyebrow: string | null;
    headingLine1: string | null;
    headingLine2: string | null;
    stats: { value: string | null; label: string | null }[] | null;
    badges: { text: string | null }[] | null;
  } | null;
};

const FALLBACK = {
  eyebrow: "Partners in success",
  headingLine1: "Trusted by teams",
  headingLine2: "building what's next",
  stats: [
    { value: "15+", label: "Projects" },
    { value: "10+", label: "Clients" },
    { value: "5+", label: "Experts" },
    { value: "24/7", label: "Support" },
  ],
  badges: [
    { text: "Enterprise clients" },
    { text: "Technology ecosystem" },
    { text: "Education & institutions" },
    { text: "Innovation partners" },
  ],
};

export default function PartnersInSuccess({ data }: Props) {
  const eyebrow = data?.eyebrow || FALLBACK.eyebrow;
  const line1 = data?.headingLine1 || FALLBACK.headingLine1;
  const line2 = data?.headingLine2 || FALLBACK.headingLine2;
  const stats = data?.stats?.length ? data.stats : FALLBACK.stats;
  const badges = data?.badges?.length ? data.badges : FALLBACK.badges;

  return (
    <section className="pis-section">
      <div className="pis-inner">
        <div className="pis-eyebrow">
          <span className="pis-eyebrow-line" />
          <span className="pis-eyebrow-dot" />
          <span>{eyebrow}</span>
          <span className="pis-eyebrow-dot" />
          <span className="pis-eyebrow-line pis-eyebrow-line--r" />
        </div>

        <h2 className="pis-title">
          {line1}
          <br />
          <span className="pis-title-gradient">{line2}</span>
        </h2>

        <div className="pis-stats">
          {stats.map((s, i) => (
            <div className="pis-stat" key={i}>
              <div className="pis-stat-value">{s.value}</div>
              <div className="pis-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="pis-badges">
          {badges.map((b, i) => (
            <div className="pis-badge" key={i}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8.5l3.2 3.2L13 4.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>{b.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

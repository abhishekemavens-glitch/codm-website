export default function Footer() {
  const services = [
    "Education Cloud",
    "Financial Services",
    "API Integration",
    "Data Integration",
    "Data Migration",
    "React Application",
    "Technical Support",
  ];

  const aiServices = [
    "LLM & Custom AI Development",
    "Business Process Automation",
  ];

  const customDevelopment = [
    ".NET Application Development",
    "Python Application Development",
    "React Application Development",
  ];

  const industries = [
    "Financial Services",
    "Healthcare & Insurance",
    "Manufacturing",
    "Higher Education",
    "Nonprofit",
  ];

  const company = [
    "About",
    "White Label Programme",
    "Case Studies",
    "Career",
    "Contact",
    "Blogs",
  ];

  return (
    <footer className="site-footer">
      <div className="footer-container">

        {/* BRAND */}
        <div className="footer-brand">
          <div className="footer-logo">
            <span>cod</span>
            <strong>m</strong>
            <sup>⌟</sup>
          </div>

          <div className="footer-socials">
            <a href="#" aria-label="LinkedIn">
              in
            </a>

            <a href="#" aria-label="X">
              X
            </a>

            <a href="#" aria-label="YouTube">
              ▶
            </a>
          </div>

          <p className="footer-description">
            AI-driven enterprise software
            <br />
            solutions built around Salesforce,
            <br />
            custom development and intelligent
            <br />
            technology.
          </p>

          <div className="footer-partners">
            <div className="partner-logo salesforce-logo">
              salesforce
            </div>

            <div className="partner-logo">
              Government
              <br />
              Commercial
              <br />
              Agency
              <br />
              Supplier
            </div>

            <div className="partner-logo google-logo">
              <span>◆</span>
              Google Cloud
            </div>

            <div className="partner-logo iso-logo">
              <strong>ISO</strong>
              <small>
                International
                <br />
                Organization for
                <br />
                Standardization
              </small>
            </div>
          </div>
        </div>

        {/* SERVICES */}
        <div className="footer-column">
          <h3>Services</h3>

          {services.map((item) => (
            <a href="#" key={item}>
              {item}
            </a>
          ))}
        </div>

        {/* AI & CUSTOM DEVELOPMENT */}
        <div className="footer-column">
          <h3>
            AI &amp; LLM Overview
            <span>⌄</span>
          </h3>

          {aiServices.map((item) => (
            <a href="#" key={item}>
              {item}
            </a>
          ))}

          <h3 className="footer-subheading">
            Custom
            <br />
            Development
            <span>⌄</span>
          </h3>

          {customDevelopment.map((item) => (
            <a href="#" key={item}>
              {item}
            </a>
          ))}
        </div>

        {/* INDUSTRIES */}
        <div className="footer-column">
          <h3>Industries</h3>

          {industries.map((item) => (
            <a href="#" key={item}>
              {item}
            </a>
          ))}

          <div className="footer-certifications">
            <div className="cert-badge">CERTIFIED</div>
            <div className="cert-badge">SRP</div>
            <div className="cert-badge">3score</div>
            <div className="cert-badge">
              CYBER
              <br />
              ESSENTIALS
            </div>
          </div>
        </div>

        {/* COMPANY */}
        <div className="footer-column">
          <h3>Company</h3>

          {company.map((item) => (
            <a href="#" key={item}>
              {item}
            </a>
          ))}
        </div>

      </div>

      <div className="footer-bottom">
        <p>Copyright © 2025 eMavens</p>
      </div>
    </footer>
  );
}

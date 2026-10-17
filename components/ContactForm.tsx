"use client";

import { useEffect, useState, type FormEvent } from "react";
import SectionHeading from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";

/* =========================================================
   CONTACT FORM — "Ambition meets possibility."

   Content comes from WordPress (codm-headless.php):
   Contact Cards > Contact Form. The form posts straight to
   Salesforce Web-to-Lead (URL + org ID are set in WordPress).

   Usage:  <ContactForm />
   Place at: components/ContactForm.tsx
   ========================================================= */

const WORDPRESS_GRAPHQL_URL =
  "https://lightyellow-echidna-411021.hostingersite.com/graphql/";

type LinkRow = {
  icon: string | null;
  label: string | null;
  value: string | null;
  href: string | null;
};

type Content = {
  eyebrow: string | null;
  title: string | null;
  gradientText: string | null;
  intro: string | null;
  links: LinkRow[] | null;
  hours: string | null;
  formTitle: string | null;
  requiredNote: string | null;
  services: string[] | null;
  buttonText: string | null;
  privacyLines: string[] | null;
  successTitle: string | null;
  successText: string | null;
  sfUrl: string | null;
  sfOid: string | null;
  leadSource: string | null;
};

type Status = "idle" | "sending" | "sent" | "error";

const isExternal = (href: string) => /^(https?:)?\/\//i.test(href);

function RowIcon({ name }: { name: string | null }) {
  const common = {
    width: 26,
    height: 26,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className: "text-[#6D4AFF]",
  };

  if (name === "phone") {
    return (
      <svg {...common}>
        <path d="M6.6 3.5h2.7l1.4 3.8-1.8 1.3a11 11 0 0 0 5.5 5.5l1.3-1.8 3.8 1.4v2.7a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2Z" />
      </svg>
    );
  }

  if (name === "pin") {
    return (
      <svg {...common}>
        <path d="M12 21s7-5.6 7-11a7 7 0 0 0-14 0c0 5.4 7 11 7 11Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 6.5 8.5 6.5 8.5-6.5" />
    </svg>
  );
}

const fieldClass =
  "w-full border-0 border-b border-[var(--border)] bg-[var(--foreground)]/[0.04] px-4 py-4 text-[15px] text-[var(--foreground)] outline-none transition-colors duration-300 placeholder:text-[var(--muted)] focus:border-[#6D4AFF] focus:bg-[var(--foreground)]/[0.06]";

const labelClass =
  "mb-3 block text-[14px] font-medium text-[var(--foreground)]";

function Req() {
  return (
    <span className="text-[#6D4AFF]" aria-hidden="true">
      {" "}
      *
    </span>
  );
}

export default function ContactForm() {
  const [content, setContent] = useState<Content | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(WORDPRESS_GRAPHQL_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              query GetContactForm {
                contactForm {
                  eyebrow
                  title
                  gradientText
                  intro
                  links { icon label value href }
                  hours
                  formTitle
                  requiredNote
                  services
                  buttonText
                  privacyLines
                  successTitle
                  successText
                  sfUrl
                  sfOid
                  leadSource
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
          setContent(result.data?.contactForm ?? null);
        }
      } catch (error) {
        console.error("Failed to load contact form:", error);
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!content?.sfUrl || !content?.sfOid) {
      setStatus("error");
      return;
    }

    const form = event.currentTarget;
    const data = new FormData(form);

    /* spam trap: real visitors never fill this hidden field */
    if (String(data.get("website") ?? "").trim() !== "") {
      setStatus("sent");
      return;
    }

    const interested = String(data.get("interest") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    const body = new URLSearchParams({
      oid: content.sfOid,
      retURL: window.location.href,
      lead_source: content.leadSource || "Web",
      first_name: String(data.get("first_name") ?? "").trim(),
      last_name: String(data.get("last_name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim(),
      /* Salesforce requires a Company on every lead */
      company:
        String(data.get("company") ?? "").trim() || "[Not provided]",
      description: interested
        ? `Interested in: ${interested}\n\n${message}`
        : message,
    });

    try {
      setStatus("sending");

      /* Salesforce doesn't allow cross-site reads, so the reply is
         opaque (no-cors). If the request leaves, we treat it as sent. */
      await fetch(content.sfUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });

      form.reset();
      setStatus("sent");
    } catch (error) {
      console.error("Contact form failed:", error);
      setStatus("error");
    }
  }

  const links = (content.links ?? []).filter((l) => l.value);

  const services = (content.services ?? []).filter(Boolean);

  return (
    <section
      id="contact-form"
      className="relative overflow-hidden bg-[var(--background)] px-5 py-16 transition-colors duration-500 sm:px-8 md:py-24"
    >
      <div className="relative mx-auto grid max-w-[1250px] gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        {/* =================================================
            LEFT: heading, intro, contact rows, hours
            ================================================= */}
        <Reveal distance={24}>
          <div>
            <SectionHeading
              align="left"
              eyebrow={content.eyebrow ?? ""}
              title={content.title ?? ""}
              gradientText={content.gradientText ?? ""}
              description={content.intro ?? undefined}
            />

            {links.length > 0 && (
              <ul className="mt-12 border-t border-[var(--border)]">
                {links.map((row, i) => {
                  const inner = (
                    <>
                      <RowIcon name={row.icon} />

                      <span className="min-w-0 flex-1">
                        {row.label && (
                          <span className="block text-[13px] text-[var(--muted)]">
                            {row.label}
                          </span>
                        )}

                        <span className="mt-1 block text-[17px] text-[var(--foreground)]">
                          {row.value}
                        </span>
                      </span>

                      {row.href && (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 16 16"
                          fill="none"
                          aria-hidden="true"
                          className="shrink-0 text-[var(--muted)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#6D4AFF]"
                        >
                          <path
                            d="M4.5 11.5l7-7M5.5 4.5h6v6"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </>
                  );

                  const rowClass =
                    "group flex items-center gap-5 border-b border-[var(--border)] py-6";

                  return (
                    <li key={i}>
                      {row.href ? (
                        <a
                          href={row.href}
                          {...(isExternal(row.href)
                            ? { target: "_blank", rel: "noopener noreferrer" }
                            : {})}
                          className={rowClass}
                        >
                          {inner}
                        </a>
                      ) : (
                        <div className={rowClass}>{inner}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            {content.hours && (
              <p className="mt-6 flex items-center gap-3 text-[14px] text-[var(--muted)]">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
                {content.hours}
              </p>
            )}
          </div>
        </Reveal>

        {/* =================================================
            RIGHT: form
            ================================================= */}
        <Reveal distance={30} duration={0.8}>
          <div>
            <div className="flex items-start justify-between gap-4">
              {content.formTitle && (
                <h3 className="text-[28px] font-normal leading-tight tracking-[-0.02em] text-[var(--foreground)] md:text-[32px]">
                  {content.formTitle}
                </h3>
              )}

              {content.requiredNote && (
                <span className="shrink-0 pt-2 text-[12px] text-[var(--muted)]">
                  {content.requiredNote}
                </span>
              )}
            </div>

            {status === "sent" ? (
              <div
                role="status"
                className="mt-12 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-10 text-center"
              >
                <h4 className="text-2xl font-normal text-[var(--foreground)]">
                  {content.successTitle || "Thank you."}
                </h4>

                {content.successText && (
                  <p className="mx-auto mt-3 max-w-[420px] text-[15px] leading-7 text-[var(--muted)]">
                    {content.successText}
                  </p>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-10" noValidate={false}>
                <div className="grid gap-x-9 gap-y-8 sm:grid-cols-2">
                  <div>
                    <label htmlFor="cf-first" className={labelClass}>
                      First name
                      <Req />
                    </label>
                    <input
                      id="cf-first"
                      name="first_name"
                      type="text"
                      required
                      maxLength={40}
                      placeholder="Jane"
                      autoComplete="given-name"
                      className={fieldClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="cf-last" className={labelClass}>
                      Last name
                      <Req />
                    </label>
                    <input
                      id="cf-last"
                      name="last_name"
                      type="text"
                      required
                      maxLength={80}
                      placeholder="Smith"
                      autoComplete="family-name"
                      className={fieldClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="cf-email" className={labelClass}>
                      Work email
                      <Req />
                    </label>
                    <input
                      id="cf-email"
                      name="email"
                      type="email"
                      required
                      maxLength={80}
                      placeholder="jane@company.com"
                      autoComplete="email"
                      className={fieldClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="cf-phone" className={labelClass}>
                      Phone number
                    </label>
                    <input
                      id="cf-phone"
                      name="phone"
                      type="tel"
                      maxLength={40}
                      placeholder="+44"
                      autoComplete="tel"
                      className={fieldClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="cf-company" className={labelClass}>
                      Company
                    </label>
                    <input
                      id="cf-company"
                      name="company"
                      type="text"
                      maxLength={40}
                      placeholder="Your company"
                      autoComplete="organization"
                      className={fieldClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="cf-interest" className={labelClass}>
                      I’m interested in
                    </label>
                    <select
                      id="cf-interest"
                      name="interest"
                      defaultValue=""
                      className={fieldClass + " cursor-pointer"}
                    >
                      <option value="">Select a service</option>
                      {services.map((service) => (
                        <option key={service} value={service}>
                          {service}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="cf-message" className={labelClass}>
                      Tell us about your project
                      <Req />
                    </label>
                    <textarea
                      id="cf-message"
                      name="message"
                      required
                      rows={5}
                      maxLength={3000}
                      placeholder="Your goals, your challenges, or simply where you’d like to start…"
                      className={fieldClass + " resize-y"}
                    />
                  </div>
                </div>

                {/* spam trap: hidden from people */}
                <div
                  aria-hidden="true"
                  style={{ position: "absolute", left: "-9999px" }}
                >
                  <label htmlFor="cf-website">Website</label>
                  <input
                    id="cf-website"
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <div className="mt-9 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="inline-flex w-fit items-center gap-10 bg-[#6D4AFF] px-8 py-5 text-[15px] font-medium text-white transition duration-300 hover:bg-[#5a3be0] hover:shadow-[0_14px_34px_rgba(99,79,240,0.32)] disabled:opacity-60"
                  >
                    {status === "sending"
                      ? "Sending…"
                      : content.buttonText || "Send"}

                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M4.5 11.5l7-7M5.5 4.5h6v6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {(content.privacyLines ?? []).length > 0 && (
                    <div className="text-[12px] leading-6 text-[var(--muted)] sm:text-right">
                      {(content.privacyLines ?? []).map((line) => (
                        <p key={line}>{line}</p>
                      ))}
                    </div>
                  )}
                </div>

                {status === "error" && (
                  <p role="alert" className="mt-5 text-sm text-red-500">
                    Sorry, something went wrong sending your message. Please try
                    again or email us directly.
                  </p>
                )}
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

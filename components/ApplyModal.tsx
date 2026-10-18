"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/* =========================================================
   ApplyModal — popup application form.

   Opened from CareersSection ("View role" / "Send us your profile").
   Posts to WordPress: /wp-json/codm/v1/apply  (see codm-applications.php)
   All texts come from WordPress: Applications > Form settings.

   Place at: components/ApplyModal.tsx
   ========================================================= */

const APPLY_ENDPOINT =
  "https://lightyellow-echidna-411021.hostingersite.com/wp-json/codm/v1/apply";

const MAX_FILE_BYTES = 5 * 1024 * 1024;

export type ApplyFormSettings = {
  roleTitle: string | null;
  profileTitle: string | null;
  intro: string | null;
  submitText: string | null;
  privacyText: string | null;
  successTitle: string | null;
  successText: string | null;
};

type ApplyRole = {
  title: string;
  department?: string | null;
  location?: string | null;
  jobType?: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  /** the role that was clicked; null = "Send us your profile" */
  role: ApplyRole | null;
  /** role titles offered when no specific role is chosen */
  roleOptions: string[];
  settings: ApplyFormSettings | null;
};

const inputClass =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[14px] text-[var(--foreground)] outline-none transition-colors duration-200 placeholder:text-[var(--muted)] focus:border-[#6D4AFF]";

const labelClass = "mb-1.5 block text-[12px] font-medium text-[var(--muted)]";

export default function ApplyModal({
  open,
  onClose,
  role,
  roleOptions,
  settings,
}: Props) {
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  // reset every time the popup opens
  useEffect(() => {
    if (open) {
      setStatus("idle");
      setError("");
      setFileName("");
      const t = window.setTimeout(() => firstFieldRef.current?.focus(), 50);
      return () => window.clearTimeout(t);
    }
  }, [open, role?.title]);

  // Esc to close + lock page scroll
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  const title = role
    ? settings?.roleTitle || "Apply for this role"
    : settings?.profileTitle || "Send us your profile";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;

    const form = e.currentTarget;
    const data = new FormData(form);

    const file = data.get("cv");
    if (file instanceof File && file.size > MAX_FILE_BYTES) {
      setError("Please upload a file smaller than 5 MB.");
      return;
    }
    if (file instanceof File && file.size === 0) {
      data.delete("cv");
    }

    if (role) {
      data.set("role", role.title);
    }

    setError("");
    setStatus("sending");

    try {
      const response = await fetch(APPLY_ENDPOINT, {
        method: "POST",
        body: data,
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || result?.ok !== true) {
        setError(
          result?.message || "Something went wrong. Please try again."
        );
        setStatus("idle");
        return;
      }

      form.reset();
      setFileName("");
      setStatus("done");
    } catch {
      setError("We couldn’t send your application. Please check your connection and try again.");
      setStatus("idle");
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-end justify-center overflow-y-auto bg-black/55 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{ animation: "apply-fade 0.25s ease both" }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative my-auto w-full max-w-[560px] rounded-t-3xl border border-[var(--border)] bg-[var(--background)] p-6 shadow-[0_30px_90px_rgba(40,24,120,0.35)] sm:rounded-3xl sm:p-9"
        style={{ animation: "apply-pop 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both" }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-[var(--muted)] transition-colors duration-200 hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
            <path d="m3.5 3.5 9 9M12.5 3.5l-9 9" />
          </svg>
        </button>

        {status === "done" ? (
          <div className="py-10 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#6D4AFF] to-[#8B5CF6] text-white">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m5 12.5 4.5 4.5L19 7.5" />
              </svg>
            </span>

            <h3 className="mt-6 text-[28px] font-medium tracking-[-0.02em] text-[var(--foreground)]">
              {settings?.successTitle || "Thank you."}
            </h3>
            <p className="mx-auto mt-3 max-w-[360px] text-[15px] leading-7 text-[var(--muted)]">
              {settings?.successText ||
                "We’ve received your application and will be in touch soon."}
            </p>

            <button
              type="button"
              onClick={onClose}
              className="mt-8 inline-flex rounded-full border border-[#6D4AFF]/60 px-7 py-2.5 text-[14px] font-medium text-[#6D4AFF] transition-all duration-300 hover:border-transparent hover:bg-gradient-to-r hover:from-[#6D4AFF] hover:to-[#8B5CF6] hover:text-white"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h3 className="pr-10 text-[26px] font-medium leading-[1.15] tracking-[-0.03em] text-[var(--foreground)] sm:text-[30px]">
              {title}
            </h3>

            {role && (
              <p className="mt-3 inline-flex flex-wrap items-center gap-x-2 rounded-lg bg-[var(--accent)]/[0.08] px-3 py-1.5 text-[13px] text-[var(--foreground)]">
                <span className="font-medium">{role.title}</span>
                {[role.department, role.location, role.jobType]
                  .filter(Boolean)
                  .map((item) => (
                    <span key={item} className="text-[var(--muted)]">
                      · {item}
                    </span>
                  ))}
              </p>
            )}

            {settings?.intro && (
              <p className="mt-4 text-[14px] leading-6 text-[var(--muted)]">
                {settings.intro}
              </p>
            )}

            <form ref={formRef} onSubmit={handleSubmit} className="mt-6 grid gap-4" noValidate={false}>
              {/* honeypot - hidden from people */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute left-[-9999px] h-0 w-0 opacity-0"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="apply-name" className={labelClass}>
                    Full name *
                  </label>
                  <input
                    ref={firstFieldRef}
                    id="apply-name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Your name"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="apply-email" className={labelClass}>
                    Email *
                  </label>
                  <input
                    id="apply-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="apply-phone" className={labelClass}>
                    Phone
                  </label>
                  <input
                    id="apply-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+91 …"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="apply-linkedin" className={labelClass}>
                    LinkedIn / portfolio
                  </label>
                  <input
                    id="apply-linkedin"
                    name="linkedin"
                    type="url"
                    placeholder="https://"
                    className={inputClass}
                  />
                </div>
              </div>

              {!role && (
                <div>
                  <label htmlFor="apply-role" className={labelClass}>
                    Role you’re interested in
                  </label>
                  <select
                    id="apply-role"
                    name="role"
                    defaultValue=""
                    className={inputClass}
                  >
                    <option value="">General application</option>
                    {roleOptions.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label htmlFor="apply-message" className={labelClass}>
                  Message
                </label>
                <textarea
                  id="apply-message"
                  name="message"
                  rows={4}
                  placeholder="Tell us about your experience and what you’re looking for."
                  className={inputClass + " resize-y"}
                />
              </div>

              <div>
                <label htmlFor="apply-cv" className={labelClass}>
                  CV / resume (PDF, DOC, DOCX — max 5 MB)
                </label>
                <label
                  htmlFor="apply-cv"
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[14px] text-[var(--muted)] transition-colors duration-200 hover:border-[#6D4AFF]"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6D4AFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 16V4m0 0-4 4m4-4 4 4M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
                  </svg>
                  <span className="truncate">
                    {fileName || "Choose a file"}
                  </span>
                </label>
                <input
                  id="apply-cv"
                  name="cv"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="sr-only"
                  onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
                />
              </div>

              {error && (
                <p role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-[13px] text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "sending"}
                className="mt-1 inline-flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[#4F46E5] to-[#8B5CF6] px-7 py-3.5 text-[14px] font-medium text-white shadow-[0_14px_34px_rgba(99,79,240,0.32)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(99,79,240,0.42)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {status === "sending" ? (
                  <>
                    <span
                      aria-hidden="true"
                      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                    />
                    Sending…
                  </>
                ) : (
                  settings?.submitText || "Submit application"
                )}
              </button>

              {settings?.privacyText && (
                <p className="text-center text-[12px] text-[var(--muted)]">
                  {settings.privacyText}
                </p>
              )}
            </form>
          </>
        )}
      </div>

      <style>{`
        @keyframes apply-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes apply-pop {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>,
    document.body
  );
}

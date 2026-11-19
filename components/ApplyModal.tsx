"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/*
 * ApplyModal — premium CODM careers application popup.
 * Keeps the existing WordPress REST endpoint and payload contract.
 * Notification recipients are configured in WordPress:
 * Applications > Form settings > Send applications to (email).
 */

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
  role: ApplyRole | null;
  roleOptions: string[];
  settings: ApplyFormSettings | null;
};

const fieldClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-[14px] text-slate-900 outline-none transition duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10";
const labelClass =
  "block text-[12px] font-semibold tracking-[0.01em] text-slate-600";

function FieldIcon({ type }: { type: "user" | "mail" | "phone" | "link" | "file" }) {
  const common = {
    width: 17,
    height: 17,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };
  const paths = {
    user: <><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.7-3.2 3-5 7-5s6.3 1.8 7 5" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m4 7 8 6 8-6" /></>,
    phone: <path d="M7 3h3l1.5 4-2 1.5a15 15 0 0 0 6 6l1.5-2 4 1.5v3c0 1.1-.9 2-2 2C10.7 19.5 4.5 13.3 4.5 5c0-1.1.9-2 2.5-2Z" />,
    link: <><path d="M10 13.5a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.7 1.7" /><path d="M14 10.5a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 19.2l1.7-1.7" /></>,
    file: <><path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10Z" /><path d="M13 3v7h7M8 15h8M8 18h6" /></>,
  };
  return <svg {...common}>{paths[type]}</svg>;
}

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

  useEffect(() => {
    if (!open) return;
    setStatus("idle");
    setError("");
    setFileName("");
    const timer = window.setTimeout(() => firstFieldRef.current?.focus(), 120);
    return () => window.clearTimeout(timer);
  }, [open, role?.title]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && status !== "sending") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, status]);

  if (!open || typeof document === "undefined") return null;

  const title = role
    ? settings?.roleTitle || "Apply for this role"
    : settings?.profileTitle || "Send us your profile";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const file = data.get("cv");

    if (file instanceof File && file.size > MAX_FILE_BYTES) {
      setError("Your CV must be smaller than 5 MB. Please choose another file.");
      return;
    }
    if (file instanceof File && file.size === 0) data.delete("cv");
    if (role) data.set("role", role.title);

    setError("");
    setStatus("sending");

    try {
      const response = await fetch(APPLY_ENDPOINT, { method: "POST", body: data });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result?.ok !== true) {
        setError(result?.message || "We couldn't submit your application. Please try again.");
        setStatus("idle");
        return;
      }
      form.reset();
      setFileName("");
      setStatus("done");
    } catch {
      setError("We couldn't connect to the application service. Please check your connection and try again.");
      setStatus("idle");
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-end justify-center overflow-y-auto bg-slate-950/60 p-0 backdrop-blur-md sm:items-center sm:p-5 md:p-8"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && status !== "sending") onClose();
      }}
      style={{ animation: "codm-apply-fade .22s ease both" }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="codm-apply-title"
        className="relative my-auto w-full max-w-[690px] overflow-hidden rounded-t-[28px] bg-[#fbfbfe] shadow-[0_32px_100px_rgba(15,12,45,.35)] sm:rounded-[28px]"
        style={{ animation: "codm-apply-rise .28s cubic-bezier(.2,.8,.2,1) both" }}
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-[#5146e5] via-[#7657f5] to-[#b49aff]" />

        <div className="max-h-[calc(100dvh-16px)] overflow-y-auto px-5 pb-7 pt-6 sm:max-h-[calc(100dvh-64px)] sm:px-9 sm:pb-9 sm:pt-8">
          <button
            type="button"
            onClick={onClose}
            disabled={status === "sending"}
            aria-label="Close application form"
            className="absolute right-4 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 disabled:opacity-40 sm:right-7 sm:top-7"
          >
            <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
              <path d="m4.5 4.5 11 11m0-11-11 11" />
            </svg>
          </button>

          {status === "done" ? (
            <div className="px-2 py-10 text-center sm:px-8 sm:py-14">
              <div className="mx-auto flex h-[68px] w-[68px] items-center justify-center rounded-[22px] bg-gradient-to-br from-[#5548e8] to-[#9875ff] text-white shadow-[0_14px_35px_rgba(109,74,255,.28)]">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
              </div>
              <p className="mt-7 text-[11px] font-bold uppercase tracking-[.2em] text-violet-600">Application received</p>
              <h3 id="codm-apply-title" className="mt-3 text-[29px] font-semibold tracking-[-.04em] text-slate-950 sm:text-[34px]">
                {settings?.successTitle || "Thank you for applying."}
              </h3>
              <p className="mx-auto mt-3 max-w-[390px] text-[14px] leading-7 text-slate-500">
                {settings?.successText || "We've received your application and our team will be in touch soon."}
              </p>
              <button type="button" onClick={onClose} className="mt-8 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#5146e5] to-[#8b5cf6] px-8 py-3.5 text-[14px] font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5 hover:shadow-xl">
                Back to careers
              </button>
            </div>
          ) : (
            <>
              <div className="pr-10 sm:pr-14">
                <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.17em] text-violet-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-500" /> CODM Careers
                </p>
                <h3 id="codm-apply-title" className="text-[29px] font-semibold leading-[1.12] tracking-[-.045em] text-slate-950 sm:text-[36px]">
                  {title}
                </h3>
                <p className="mt-3 max-w-[520px] text-[13px] leading-6 text-slate-500 sm:text-[14px]">
                  {settings?.intro || "Tell us a little about yourself. Share your experience and our team will be in touch."}
                </p>
              </div>

              {role && (
                <div className="mt-5 flex flex-wrap items-center gap-2 rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50 to-indigo-50/70 px-4 py-3">
                  <span className="mr-1 flex h-8 w-8 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 5V3h8v2M3 10h18"/></svg>
                  </span>
                  <span className="text-[13px] font-semibold text-slate-800">{role.title}</span>
                  {[role.department, role.location, role.jobType].filter(Boolean).map((item) => (
                    <span key={item} className="text-[12px] text-slate-500">· {item}</span>
                  ))}
                </div>
              )}

              <form ref={formRef} onSubmit={handleSubmit} className="mt-7 space-y-5">
                {/* Honeypot field for basic spam protection. */}
                <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 opacity-0" />

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="apply-name" className={labelClass}>Full name <span className="text-violet-600">*</span></label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-[26px] -translate-y-1/2 text-slate-400"><FieldIcon type="user" /></span>
                      <input ref={firstFieldRef} id="apply-name" name="name" type="text" required autoComplete="name" placeholder="Your full name" className={`${fieldClass} pl-11`} />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="apply-email" className={labelClass}>Email address <span className="text-violet-600">*</span></label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-[26px] -translate-y-1/2 text-slate-400"><FieldIcon type="mail" /></span>
                      <input id="apply-email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className={`${fieldClass} pl-11`} />
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="apply-phone" className={labelClass}>Phone number</label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-[26px] -translate-y-1/2 text-slate-400"><FieldIcon type="phone" /></span>
                      <input id="apply-phone" name="phone" type="tel" autoComplete="tel" placeholder="+91 …" className={`${fieldClass} pl-11`} />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="apply-linkedin" className={labelClass}>LinkedIn / portfolio</label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-[26px] -translate-y-1/2 text-slate-400"><FieldIcon type="link" /></span>
                      <input id="apply-linkedin" name="linkedin" type="url" placeholder="https://" className={`${fieldClass} pl-11`} />
                    </div>
                  </div>
                </div>

                {!role && (
                  <div>
                    <label htmlFor="apply-role" className={labelClass}>Role you’re interested in</label>
                    <select id="apply-role" name="role" defaultValue="" className={fieldClass}>
                      <option value="">General application</option>
                      {roleOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                  </div>
                )}

                <div>
                  <label htmlFor="apply-message" className={labelClass}>A little about you <span className="font-normal text-slate-400">(optional)</span></label>
                  <textarea id="apply-message" name="message" rows={4} placeholder="Tell us about your experience, skills and what you’re looking for…" className={`${fieldClass} min-h-[118px] resize-y leading-6`} />
                </div>

                <div>
                  <label htmlFor="apply-cv" className={labelClass}>CV / resume <span className="font-normal text-slate-400">(PDF, DOC or DOCX · max 5 MB)</span></label>
                  <label htmlFor="apply-cv" className="group mt-2 flex cursor-pointer items-center gap-4 rounded-2xl border border-dashed border-violet-200 bg-gradient-to-r from-violet-50/70 to-indigo-50/50 px-4 py-4 transition duration-200 hover:border-violet-400 hover:bg-violet-50 sm:px-5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm ring-1 ring-violet-100 transition group-hover:scale-105">
                      <FieldIcon type="file" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold text-slate-800">{fileName || "Choose your resume"}</span>
                      <span className="mt-1 block text-[11px] text-slate-500">{fileName ? "File selected · click to replace" : "Select a file from your device"}</span>
                    </span>
                    <span className="shrink-0 rounded-full border border-violet-200 bg-white px-3.5 py-2 text-[11px] font-semibold text-violet-700 transition group-hover:border-violet-400">Browse</span>
                  </label>
                  <input id="apply-cv" name="cv" type="file" accept=".pdf,.doc,.docx" className="sr-only" onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")} />
                </div>

                {error && <p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-[12px] leading-5 text-red-700">{error}</p>}

                <div className="border-t border-slate-100 pt-5">
                  <button type="submit" disabled={status === "sending"} className="inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[#5146e5] via-[#7051ef] to-[#8b5cf6] px-7 py-4 text-[14px] font-semibold text-white shadow-[0_12px_28px_rgba(99,79,240,.25)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(99,79,240,.34)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0">
                    {status === "sending" ? <><span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Sending your application…</> : <>{settings?.submitText || "Submit application"}<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" /></svg></>}
                  </button>
                  <p className="mt-3 text-center text-[11px] leading-5 text-slate-400">{settings?.privacyText || "Your details will only be used to review your application."}</p>
                </div>
              </form>
            </>
          )}
        </div>
      </section>

      <style>{`
        @keyframes codm-apply-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes codm-apply-rise { from { opacity: 0; transform: translateY(14px) scale(.99); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </div>,
    document.body
  );
}

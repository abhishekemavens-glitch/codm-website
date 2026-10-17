"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/* =========================================================
   PageLoader — full-screen spinner on every page load.

   - First visit / refresh: covers the page until the browser
     finishes loading (with a safety timeout), then fades out.
   - Navigating between pages: shows briefly, then fades out.

   Place at: components/PageLoader.tsx
   Add once in app/layout.tsx, as the first child of <body>:
       <PageLoader />
   ========================================================= */

const MIN_VISIBLE_MS = 500; // never flash faster than this
const MAX_WAIT_MS = 4000; // never block the page longer than this
const ROUTE_VISIBLE_MS = 450; // spinner time on in-site navigation
const FADE_MS = 400;

export default function PageLoader() {
  const pathname = usePathname();

  const [visible, setVisible] = useState(true); // true on the server => no content flash
  const [mounted, setMounted] = useState(true); // false once the fade-out has finished
  const firstRun = useRef(true);

  // keep the page from scrolling behind the overlay
  useEffect(() => {
    if (visible) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previous;
      };
    }
  }, [visible]);

  // remove from the DOM after the fade-out
  useEffect(() => {
    if (visible) {
      setMounted(true);
      return;
    }
    const t = window.setTimeout(() => setMounted(false), FADE_MS);
    return () => window.clearTimeout(t);
  }, [visible]);

  // every page load / route change
  useEffect(() => {
    const timers: number[] = [];
    const hide = (delay: number) => {
      timers.push(window.setTimeout(() => setVisible(false), delay));
    };

    if (firstRun.current) {
      firstRun.current = false;

      const started = performance.now();
      const finish = () => {
        const elapsed = performance.now() - started;
        hide(Math.max(0, MIN_VISIBLE_MS - elapsed));
      };

      if (document.readyState === "complete") {
        finish();
      } else {
        window.addEventListener("load", finish, { once: true });
        timers.push(window.setTimeout(finish, MAX_WAIT_MS));
      }

      return () => {
        window.removeEventListener("load", finish);
        timers.forEach((t) => window.clearTimeout(t));
      };
    }

    // in-site navigation
    setVisible(true);
    hide(ROUTE_VISIBLE_MS);

    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [pathname]);

  if (!mounted) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-hidden={!visible}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--background,#ffffff)]"
      style={{
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transition: `opacity ${FADE_MS}ms ease`,
      }}
    >
      <span
        aria-hidden="true"
        className="inline-block h-12 w-12 animate-spin rounded-full border-[3px] border-[var(--border,#e5e7eb)] border-t-[#6D4AFF]"
      />
      <span className="sr-only">Loading…</span>
    </div>
  );
}

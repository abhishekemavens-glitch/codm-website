"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/* =========================================================
   PageLoader — full-screen loader on every page load.
   Shows the CODM head icon with a soft pulse.

   - First visit / refresh: covers the page until the browser
     finishes loading (with a safety timeout), then fades out.
   - Navigating between pages: shows briefly, then fades out.

   Needs the image at:  public/loader-icon.png
   Place at: components/PageLoader.tsx
   Add once in app/layout.tsx, as the first child of <body>:
       <PageLoader />
   ========================================================= */

const MIN_VISIBLE_MS = 500; // never flash faster than this
const MAX_WAIT_MS = 4000; // never block the page longer than this
const ROUTE_VISIBLE_MS = 450; // loader time on in-site navigation
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
      <div className="codm-loader-wrap">
        {/* soft glow behind the icon */}
        <span aria-hidden="true" className="codm-loader-glow" />

        <img
          src="/loader-icon.png"
          alt=""
          width={72}
          height={86}
          className="codm-loader-icon"
          draggable={false}
        />
      </div>

      <span className="sr-only">Loading…</span>

      <style>{`
        .codm-loader-wrap {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 120px;
          height: 120px;
        }

        .codm-loader-icon {
          position: relative;
          z-index: 1;
          width: 72px;
          height: auto;
          user-select: none;
          animation: codmLoaderPulse 1.4s ease-in-out infinite;
        }

        .codm-loader-glow {
          position: absolute;
          inset: 10px;
          border-radius: 999px;
          background: radial-gradient(
            circle,
            rgba(109, 74, 255, 0.35),
            transparent 70%
          );
          filter: blur(14px);
          animation: codmLoaderGlow 1.4s ease-in-out infinite;
        }

        @keyframes codmLoaderPulse {
          0%,
          100% {
            transform: scale(0.92);
            opacity: 0.75;
          }
          50% {
            transform: scale(1.06);
            opacity: 1;
          }
        }

        @keyframes codmLoaderGlow {
          0%,
          100% {
            transform: scale(0.85);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.15);
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .codm-loader-icon,
          .codm-loader-glow {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

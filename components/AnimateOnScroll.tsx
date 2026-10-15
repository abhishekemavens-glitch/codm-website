"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/* =========================================================
   ANIMATE ON SCROLL  (Animate.css)

   Plays any Animate.css animation once, when the element
   scrolls into view. Reusable on any section / page:

     <AnimateOnScroll animation="fadeInUp" delay={120}>
       ...anything...
     </AnimateOnScroll>

   Animation names: https://animate.style  (e.g. fadeInUp, zoomIn,
   fadeInLeft, bounceIn, flipInX, slideInUp, backInUp ...)

   Setup (once):
     1. npm i animate.css
     2. in app/globals.css (top):  @import "animate.css";
        (or in app/layout.tsx:    import "animate.css";)

   IMPORTANT: put the animation on a wrapper, not on an element that
   has its own hover transform. Animate.css keeps the final
   keyframe's transform after it ends, which would override
   hover:-translate-y-* on the same element.
   Place at: components/AnimateOnScroll.tsx
   ========================================================= */

export default function AnimateOnScroll({
  children,
  animation = "fadeInUp",
  delay = 0,
  duration = 800,
  threshold = 0.15,
  className = "",
}: {
  children: ReactNode;
  /* Animate.css name without the "animate__" prefix */
  animation?: string;
  /* ms to wait before playing (use index * 100 for a stagger) */
  delay?: number;
  /* ms the animation takes */
  duration?: number;
  /* how much of the element must be visible first (0 to 1) */
  threshold?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;

    if (!el) {
      return;
    }

    /* browsers without IntersectionObserver: just show it */
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect(); // play once
        }
      },
      { threshold, rootMargin: "0px 0px -6% 0px" }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={
        className +
        " " +
        (visible
          ? `animate__animated animate__${animation}`
          : "opacity-0")
      }
      style={
        visible
          ? ({
              animationDelay: `${delay}ms`,
              "--animate-duration": `${duration}ms`,
            } as React.CSSProperties)
          : undefined
      }
    >
      {children}
    </div>
  );
}

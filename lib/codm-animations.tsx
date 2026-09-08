"use client";

/* =============================================================
   CODM ANIMATION UTILITIES
   Companion hooks for codm-animations.css. Import what you need
   into any client component. All hooks are self-contained and
   clean up their own listeners.
   ============================================================= */

import { useEffect, useRef, useState } from "react";

/* -------------------------------------------------------------
   1. splitWords — turns a heading string into stagger-ready spans

   Usage:
     import { splitWords } from "@/lib/codm-animations";

     <h2 className="codm-word-stagger">
       {splitWords("Engineering the systems that run")}
     </h2>
   ------------------------------------------------------------- */

export function splitWords(text: string) {
  return text.split(" ").map((word, i) => (
    <span
      key={`${word}-${i}`}
      className="codm-word"
      style={{ "--word-index": i } as React.CSSProperties}
    >
      {word}
      {i < text.split(" ").length - 1 ? "\u00A0" : ""}
    </span>
  ));
}


/* -------------------------------------------------------------
   2. useInViewOnce — generic IntersectionObserver hook.
   Replaces the repeated isVisible + IntersectionObserver block
   you currently paste into every section component.

   Usage:
     const { ref, isVisible } = useInViewOnce();
     <section ref={ref} className={isVisible ? "codm-visible" : ""}>
   ------------------------------------------------------------- */

export function useInViewOnce<T extends HTMLElement = HTMLDivElement>(
  threshold = 0.12
) {
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}


/* -------------------------------------------------------------
   3. useCountUp — animates a number from 0 to target when the
   element scrolls into view.

   Usage:
     const { ref, value } = useCountUp(250, { duration: 1500 });
     <span ref={ref} className="codm-count-number">{value}+</span>
   ------------------------------------------------------------- */

export function useCountUp(
  target: number,
  options: { duration?: number; suffix?: string } = {}
) {
  const { duration = 1500 } = options;
  const ref = useRef<HTMLElement | null>(null);
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started.current) {
            started.current = true;
            const start = performance.now();

            const tick = (now: number) => {
              const progress = Math.min((now - start) / duration, 1);
              // ease-out cubic
              const eased = 1 - Math.pow(1 - progress, 3);
              setValue(Math.round(eased * target));
              if (progress < 1) requestAnimationFrame(tick);
            };

            requestAnimationFrame(tick);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { ref, value };
}


/* -------------------------------------------------------------
   4. useMagneticButton — pulls an element toward the cursor
   within a radius, springs back on leave.

   Usage:
     const magneticRef = useMagneticButton(40);
     <button ref={magneticRef} className="codm-magnetic">Book a Call</button>
   ------------------------------------------------------------- */

export function useMagneticButton(strength = 30) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);
      const x = (relX / rect.width) * strength;
      const y = (relY / rect.height) * strength;
      el.style.setProperty("--mag-x", `${x}px`);
      el.style.setProperty("--mag-y", `${y}px`);
    };

    const handleLeave = () => {
      el.style.setProperty("--mag-x", "0px");
      el.style.setProperty("--mag-y", "0px");
    };

    el.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseleave", handleLeave);

    return () => {
      el.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseleave", handleLeave);
    };
  }, [strength]);

  return ref;
}


/* -------------------------------------------------------------
   5. useScrollProgress — 0–100 value representing scroll
   position down the whole page.

   Usage:
     const progress = useScrollProgress();
     <div className="codm-scroll-progress" style={{ "--progress": progress } as React.CSSProperties} />
   ------------------------------------------------------------- */

export function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return progress;
}


/* -------------------------------------------------------------
   6. useStickyNavState — returns true once the page has
   scrolled past a threshold, for the shrink/blur nav effect.

   Usage:
     const scrolled = useStickyNavState(40);
     <header className={`... ${scrolled ? "codm-nav-scrolled" : ""}`}>
   ------------------------------------------------------------- */

export function useStickyNavState(threshold = 40) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > threshold);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return scrolled;
}


/* -------------------------------------------------------------
   7. useCursorGlow — updates --cursor-x / --cursor-y on
   document.body for the site-wide cursor-trailing glow.
   Call this ONCE near the root of your app (e.g. in layout.tsx
   inside a small client wrapper component).

   Usage:
     useCursorGlow();
     <div className="codm-cursor-glow" />
   ------------------------------------------------------------- */

export function useCursorGlow() {
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      document.body.style.setProperty("--cursor-x", `${e.clientX}px`);
      document.body.style.setProperty("--cursor-y", `${e.clientY}px`);
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);
}


/* -------------------------------------------------------------
   8. useParallax — returns a translateY offset based on scroll
   position relative to the element, for background blobs.

   Usage:
     const { ref, offset } = useParallax(0.15);
     <div ref={ref} className="codm-parallax-blob" style={{ "--parallax-y": `${offset}px` } as React.CSSProperties} />
   ------------------------------------------------------------- */

export function useParallax<T extends HTMLElement = HTMLDivElement>(
  speed = 0.15
) {
  const ref = useRef<T | null>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const centerDelta = rect.top - window.innerHeight / 2;
      setOffset(centerDelta * speed);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed]);

  return { ref, offset };
}

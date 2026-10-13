"use client";

import { useEffect, useRef, type ReactNode } from "react";

/* =========================================================
   STICKY ASIDE

   Keeps the whole sidebar (Table of Contents + "Talk to our
   Experts today!" form) fixed in view while the article scrolls.

   Why a component and not only CSS: `position: sticky` silently
   stops working when ANY parent has overflow hidden / auto /
   scroll (very common with animated landing-page wrappers).
   On mount this finds those parents and switches them to
   `overflow: clip`, which looks the same but doesn't break sticky.
   The sticky styles are applied inline, so they don't depend on
   globals.css. Below 1024px the sidebar is a normal block.

   Place at: components/StickyAside.tsx
   ========================================================= */

export default function StickyAside({
  children,
  className,
  top = 130,
}: {
  children: ReactNode;
  className?: string;
  /* distance from the top of the viewport, below your floating header */
  top?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;

    if (!el) {
      return;
    }

    /* 1. un-break sticky: ancestors must not be scroll containers */
    const restore: Array<() => void> = [];

    const isScrollable = (value: string) =>
      value === "hidden" || value === "auto" || value === "scroll";

    let node: HTMLElement | null = el.parentElement;

    while (node && node !== document.documentElement) {
      const cs = getComputedStyle(node);

      if (isScrollable(cs.overflowX) || isScrollable(cs.overflowY)) {
        const target = node;
        const prevX = target.style.overflowX;
        const prevY = target.style.overflowY;

        target.style.overflowX = "clip";
        target.style.overflowY = "visible";

        restore.push(() => {
          target.style.overflowX = prevX;
          target.style.overflowY = prevY;
        });
      }

      node = node.parentElement;
    }

    /* 2. apply / remove the sticky styles depending on screen size */
    const mq = window.matchMedia("(min-width: 1024px)");

    const apply = () => {
      if (mq.matches) {
        el.style.position = "sticky";
        el.style.top = `${top}px`;
        el.style.alignSelf = "flex-start";
        el.style.maxHeight = `calc(100vh - ${top + 20}px)`;
        el.style.overflowY = "auto";
        el.style.scrollbarWidth = "none";
      } else {
        el.style.position = "";
        el.style.top = "";
        el.style.alignSelf = "";
        el.style.maxHeight = "";
        el.style.overflowY = "";
      }
    };

    apply();

    mq.addEventListener("change", apply);

    return () => {
      mq.removeEventListener("change", apply);

      restore.forEach((fn) => fn());
    };
  }, [top]);

  return (
    <aside ref={ref} className={className}>
      {children}
    </aside>
  );
}

"use client";

/* =============================================================
   CODM GLOBAL ANIMATION UTILITIES
   =============================================================
   Use this file across the entire website.

   Supports:
   • Text & heading reveals
   • Word-by-word heading reveals
   • Cards & content block reveals
   • Image reveals
   • Background / ambient parallax
   • Header / navigation scroll state
   • Magnetic buttons
   • Cursor glow
   • Scroll progress
   • Count-up numbers
   • Reduced-motion accessibility
   ============================================================= */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";


/* =============================================================
   1. SPLIT WORDS
   =============================================================
   Turns text into individual spans for premium staggered
   word-by-word heading animation.

   Usage:

   <h2 className="codm-word-stagger">
     {splitWords("Engineering the systems that run")}
   </h2>
   ============================================================= */

export function splitWords(text: string) {
  const words = text.split(" ");

  return words.map((word, index) => (
    <span
      key={`${word}-${index}`}
      className="codm-word"
      style={
        {
          "--word-index": index,
        } as CSSProperties
      }
    >
      {word}
      {index < words.length - 1 ? "\u00A0" : ""}
    </span>
  ));
}


/* =============================================================
   2. SPLIT LETTERS
   =============================================================
   Optional letter-by-letter animation.

   Usage:

   <h1 className="codm-letter-stagger">
     {splitLetters("CODM")}
   </h1>
   ============================================================= */

export function splitLetters(text: string) {
  return text.split("").map((letter, index) => (
    <span
      key={`${letter}-${index}`}
      className="codm-letter"
      style={
        {
          "--letter-index": index,
        } as CSSProperties
      }
    >
      {letter === " " ? "\u00A0" : letter}
    </span>
  ));
}


/* =============================================================
   3. useInViewOnce
   =============================================================
   Generic IntersectionObserver.

   Use this for:
   • Sections
   • Headings
   • Paragraphs
   • Cards
   • Images
   • Testimonials
   • Industries
   • Services
   • Contact sections
   ============================================================= */

export function useInViewOnce<T extends HTMLElement = HTMLDivElement>(
  threshold = 0.12
) {
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    /*
     * Respect reduced-motion users.
     */
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        threshold,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold]);

  return {
    ref,
    isVisible,
  };
}


/* =============================================================
   4. useInView
   =============================================================
   Same idea as useInViewOnce but allows the element to animate
   again when it leaves and re-enters the viewport.

   Useful for:
   • Repeating card animations
   • Interactive sections
   • Scroll-based presentations
   ============================================================= */

export function useInView<T extends HTMLElement = HTMLDivElement>(
  threshold = 0.15
) {
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      {
        threshold,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold]);

  return {
    ref,
    isVisible,
  };
}


/* =============================================================
   5. useCountUp
   =============================================================
   Animates numbers from 0 to target when visible.

   Usage:

   const { ref, value } = useCountUp(250);

   <span ref={ref}>
     {value}+
   </span>
   ============================================================= */

export function useCountUp(
  target: number,
  options: {
    duration?: number;
  } = {}
) {
  const {
    duration = 1500,
  } = options;

  const ref = useRef<HTMLElement | null>(null);
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setValue(target);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (
            entry.isIntersecting &&
            !started.current
          ) {
            started.current = true;

            const startTime = performance.now();

            const tick = (now: number) => {
              const progress = Math.min(
                (now - startTime) / duration,
                1
              );

              /*
               * Premium ease-out cubic.
               */
              const eased =
                1 - Math.pow(1 - progress, 3);

              setValue(
                Math.round(eased * target)
              );

              if (progress < 1) {
                requestAnimationFrame(tick);
              }
            };

            requestAnimationFrame(tick);

            observer.disconnect();
          }
        });
      },
      {
        threshold: 0.3,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [target, duration]);

  return {
    ref,
    value,
  };
}


/* =============================================================
   6. useMagneticButton
   =============================================================
   Premium magnetic cursor effect.

   Usage:

   const magneticRef = useMagneticButton(30);

   <button
     ref={magneticRef}
     className="codm-magnetic"
   >
     Book a Consultation
   </button>
   ============================================================= */

export function useMagneticButton(
  strength = 30
) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    /*
     * Disable magnetic effect for touch devices.
     */
    if (
      window.matchMedia("(pointer: coarse)").matches
    ) {
      return;
    }

    const handleMove = (event: MouseEvent) => {
      const rect =
        element.getBoundingClientRect();

      const centerX =
        rect.left + rect.width / 2;

      const centerY =
        rect.top + rect.height / 2;

      const relativeX =
        event.clientX - centerX;

      const relativeY =
        event.clientY - centerY;

      const x =
        (relativeX / rect.width) * strength;

      const y =
        (relativeY / rect.height) * strength;

      element.style.setProperty(
        "--mag-x",
        `${x}px`
      );

      element.style.setProperty(
        "--mag-y",
        `${y}px`
      );
    };

    const handleLeave = () => {
      element.style.setProperty(
        "--mag-x",
        "0px"
      );

      element.style.setProperty(
        "--mag-y",
        "0px"
      );
    };

    element.addEventListener(
      "mousemove",
      handleMove
    );

    element.addEventListener(
      "mouseleave",
      handleLeave
    );

    return () => {
      element.removeEventListener(
        "mousemove",
        handleMove
      );

      element.removeEventListener(
        "mouseleave",
        handleLeave
      );
    };
  }, [strength]);

  return ref;
}


/* =============================================================
   7. useScrollProgress
   =============================================================
   Returns page scroll percentage from 0 → 100.

   Usage:

   const progress = useScrollProgress();

   <div
     className="codm-scroll-progress"
     style={
       {
         "--progress": progress,
       } as CSSProperties
     }
   />
   ============================================================= */

export function useScrollProgress() {
  const [progress, setProgress] =
    useState(0);

  useEffect(() => {
    let ticking = false;

    const updateProgress = () => {
      const scrollTop =
        window.scrollY;

      const documentHeight =
        document.documentElement
          .scrollHeight -
        window.innerHeight;

      const nextProgress =
        documentHeight > 0
          ? (scrollTop / documentHeight) * 100
          : 0;

      setProgress(nextProgress);

      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(
          updateProgress
        );

        ticking = true;
      }
    };

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );

    updateProgress();

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  return progress;
}


/* =============================================================
   8. useStickyNavState
   =============================================================
   Header becomes "scrolled" after user moves down the page.

   Usage:

   const scrolled = useStickyNavState(40);

   <header
     className={
       scrolled
         ? "codm-nav-scrolled"
         : ""
     }
   >
   ============================================================= */

export function useStickyNavState(
  threshold = 40
) {
  const [scrolled, setScrolled] =
    useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(
        window.scrollY > threshold
      );
    };

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );

    handleScroll();

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, [threshold]);

  return scrolled;
}


/* =============================================================
   9. useCursorGlow
   =============================================================
   Site-wide cursor glow.

   Call ONCE near the root of the application.

   Usage:

   useCursorGlow();
   ============================================================= */

export function useCursorGlow() {
  useEffect(() => {
    /*
     * Disable on touch devices.
     */
    if (
      window.matchMedia("(pointer: coarse)").matches
    ) {
      return;
    }

    const handleMove = (
      event: MouseEvent
    ) => {
      document.body.style.setProperty(
        "--cursor-x",
        `${event.clientX}px`
      );

      document.body.style.setProperty(
        "--cursor-y",
        `${event.clientY}px`
      );
    };

    window.addEventListener(
      "mousemove",
      handleMove,
      {
        passive: true,
      }
    );

    return () => {
      window.removeEventListener(
        "mousemove",
        handleMove
      );
    };
  }, []);
}


/* =============================================================
   10. useParallax
   =============================================================
   Smooth background / ambient parallax.

   Usage:

   const {
     ref,
     offset
   } = useParallax(0.15);

   <div
     ref={ref}
     style={
       {
         "--parallax-y":
           `${offset}px`,
       } as CSSProperties
     }
   />
   ============================================================= */

export function useParallax<
  T extends HTMLElement = HTMLDivElement
>(
  speed = 0.15
) {
  const ref = useRef<T | null>(null);
  const [offset, setOffset] =
    useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const element = ref.current;

      if (!element) return;

      const rect =
        element.getBoundingClientRect();

      const centerDelta =
        rect.top -
        window.innerHeight / 2;

      setOffset(
        centerDelta * speed
      );
    };

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );

    handleScroll();

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, [speed]);

  return {
    ref,
    offset,
  };
}


/* =============================================================
   11. useScrollDirection
   =============================================================
   Detects whether the user is scrolling UP or DOWN.

   Useful for premium navigation behavior.

   Usage:

   const direction =
     useScrollDirection();

   direction === "down"
   direction === "up"
   ============================================================= */

export function useScrollDirection() {
  const [direction, setDirection] =
    useState<"up" | "down">("up");

  const previousScroll =
    useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll =
        window.scrollY;

      if (
        Math.abs(
          currentScroll -
            previousScroll.current
        ) < 4
      ) {
        return;
      }

      if (
        currentScroll >
        previousScroll.current
      ) {
        setDirection("down");
      } else {
        setDirection("up");
      }

      previousScroll.current =
        currentScroll;
    };

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  return direction;
}


/* =============================================================
   12. useMousePosition
   =============================================================
   Gives components access to cursor position.

   Useful for:
   • Cards
   • Hover gradients
   • Spotlight effects
   • Interactive backgrounds
   ============================================================= */

export function useMousePosition() {
  const [position, setPosition] =
    useState({
      x: 0,
      y: 0,
    });

  useEffect(() => {
    if (
      window.matchMedia("(pointer: coarse)").matches
    ) {
      return;
    }

    const handleMove = (
      event: MouseEvent
    ) => {
      setPosition({
        x: event.clientX,
        y: event.clientY,
      });
    };

    window.addEventListener(
      "mousemove",
      handleMove,
      {
        passive: true,
      }
    );

    return () => {
      window.removeEventListener(
        "mousemove",
        handleMove
      );
    };
  }, []);

  return position;
}


/* =============================================================
   13. useHover
   =============================================================
   Simple hover state for interactive cards.

   Usage:

   const {
     ref,
     isHovered
   } = useHover();

   <div ref={ref}>
   ============================================================= */

export function useHover<
  T extends HTMLElement = HTMLDivElement
>() {
  const ref = useRef<T | null>(null);
  const [isHovered, setIsHovered] =
    useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const handleEnter = () => {
      setIsHovered(true);
    };

    const handleLeave = () => {
      setIsHovered(false);
    };

    element.addEventListener(
      "mouseenter",
      handleEnter
    );

    element.addEventListener(
      "mouseleave",
      handleLeave
    );

    return () => {
      element.removeEventListener(
        "mouseenter",
        handleEnter
      );

      element.removeEventListener(
        "mouseleave",
        handleLeave
      );
    };
  }, []);

  return {
    ref,
    isHovered,
  };
}


/* =============================================================
   14. useLockBodyScroll
   =============================================================
   Useful for mobile navigation menus.

   Usage:

   useLockBodyScroll(
     mobileMenuOpen
   );
   ============================================================= */

export function useLockBodyScroll(
  locked: boolean
) {
  useEffect(() => {
    if (!locked) return;

    const originalOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        originalOverflow;
    };
  }, [locked]);
}


/* =============================================================
   15. usePageLoaded
   =============================================================
   Useful for the initial website entrance animation.

   Usage:

   const loaded = usePageLoaded();

   <div
     className={
       loaded
         ? "codm-page-loaded"
         : ""
     }
   >
   ============================================================= */

export function usePageLoaded() {
  const [loaded, setLoaded] =
    useState(false);

  useEffect(() => {
    /*
     * Wait one frame so the browser can paint
     * the initial state before revealing content.
     */
    const frame =
      window.requestAnimationFrame(() => {
        setLoaded(true);
      });

    return () =>
      window.cancelAnimationFrame(
        frame
      );
  }, []);

  return loaded;
}


/* =============================================================
   16. useRevealSequence
   =============================================================
   Provides a visibility state for an entire section.

   Useful when you want:

   Eyebrow
      ↓
   Heading
      ↓
   Description
      ↓
   Buttons
      ↓
   Cards

   to reveal in sequence.

   Usage:

   const {
     ref,
     isVisible
   } = useRevealSequence();

   <section
     ref={ref}
     className={
       isVisible
         ? "codm-visible"
         : ""
     }
   >
   ============================================================= */

export function useRevealSequence<
  T extends HTMLElement = HTMLDivElement
>(
  threshold = 0.15
) {
  return useInViewOnce<T>(
    threshold
  );
}


/* =============================================================
   17. useTilt
   =============================================================
   Subtle 3D card tilt.

   Usage:

   const tiltRef = useTilt(4);

   <div
     ref={tiltRef}
     className="codm-tilt"
   >
   ============================================================= */

export function useTilt(
  strength = 4
) {
  const ref =
    useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    if (
      window.matchMedia("(pointer: coarse)").matches
    ) {
      return;
    }

    const handleMove = (
      event: MouseEvent
    ) => {
      const rect =
        element.getBoundingClientRect();

      const x =
        (event.clientX -
          rect.left) /
        rect.width;

      const y =
        (event.clientY -
          rect.top) /
        rect.height;

      const rotateY =
        (x - 0.5) * strength;

      const rotateX =
        (0.5 - y) * strength;

      element.style.setProperty(
        "--tilt-x",
        `${rotateX}deg`
      );

      element.style.setProperty(
        "--tilt-y",
        `${rotateY}deg`
      );
    };

    const handleLeave = () => {
      element.style.setProperty(
        "--tilt-x",
        "0deg"
      );

      element.style.setProperty(
        "--tilt-y",
        "0deg"
      );
    };

    element.addEventListener(
      "mousemove",
      handleMove
    );

    element.addEventListener(
      "mouseleave",
      handleLeave
    );

    return () => {
      element.removeEventListener(
        "mousemove",
        handleMove
      );

      element.removeEventListener(
        "mouseleave",
        handleLeave
      );
    };
  }, [strength]);

  return ref;
}

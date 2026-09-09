"use client";

import { useLayoutEffect } from "react";

export default function ScrollReset() {
  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const navigation = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming | undefined;

    if (navigation?.type === "reload") {
      window.scrollTo(0, 0);
    }

    return () => {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "auto";
      }
    };
  }, []);

  return null;
}

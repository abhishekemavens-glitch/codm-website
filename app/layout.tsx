"use client";

import { useLayoutEffect } from "react";

export default function ScrollToTop() {
  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, []);

  return null;
}

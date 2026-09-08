"use client";

import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={
        theme === "light"
          ? "Switch to dark mode"
          : "Switch to light mode"
      }
      className="codm-theme-toggle"
    >
      <span
        className="codm-theme-toggle-icons"
        aria-hidden="true"
      >
        <span>☀</span>
        <span>☾</span>
      </span>

      <span
        className={`codm-theme-toggle-knob ${
          theme === "dark"
            ? "codm-theme-toggle-knob-dark"
            : ""
        }`}
        aria-hidden="true"
      >
        {theme === "light" ? "☀" : "☾"}
      </span>
    </button>
  );
}

"use client";

import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      className="codm-theme-toggle"
    >
      <span className="codm-theme-toggle-track">
        <span
          className={`codm-theme-toggle-knob ${
            isDark ? "codm-theme-toggle-dark" : ""
          }`}
        >
          {isDark ? "☾" : "☀"}
        </span>

        <span className="codm-theme-toggle-icons">
          <span>☀</span>
          <span>☾</span>
        </span>
      </span>
    </button>
  );
}

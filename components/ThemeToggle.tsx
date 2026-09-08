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
        className={`codm-theme-toggle-knob ${
          theme === "dark"
            ? "codm-theme-toggle-knob-dark"
            : ""
        }`}
      >
        {theme === "light" ? "☀" : "☾"}
      </span>

      <span className="codm-theme-toggle-icons">
        <span>☀</span>
        <span>☾</span>
      </span>
    </button>
  );
}

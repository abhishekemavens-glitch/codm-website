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
      className="codm-theme-switch"
    >
      <span
        className={`codm-theme-switch-knob ${
          theme === "dark"
            ? "codm-theme-switch-knob-dark"
            : ""
        }`}
      >
        {theme === "light" ? "☀" : "☾"}
      </span>

      <span className="codm-theme-switch-icons">
        <span>☀</span>
        <span>☾</span>
      </span>
    </button>
  );
}

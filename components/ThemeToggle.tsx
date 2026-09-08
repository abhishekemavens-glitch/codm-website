"use client";

import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={
        isDark
          ? "Switch to light mode"
          : "Switch to dark mode"
      }
      aria-pressed={isDark}
      className="codm-theme-toggle relative flex h-10 w-[76px] items-center rounded-full border border-[var(--border)] bg-[var(--surface)] p-1 transition-all duration-300"
    >
      {/* Sliding Circle */}
      <span
        className={`absolute left-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--foreground)] text-[var(--background)] transition-transform duration-500 ${
          isDark ? "translate-x-9" : "translate-x-0"
        }`}
      >
        <span
          className={`text-[15px] leading-none transition-all duration-300 ${
            isDark
              ? "rotate-0 scale-100"
              : "rotate-0 scale-100"
          }`}
        >
          {isDark ? "☾" : "☀"}
        </span>
      </span>

      {/* Background Icons */}
      <span className="pointer-events-none flex w-full items-center justify-between px-2 text-[13px]">
        <span
          className={`transition-all duration-300 ${
            isDark
              ? "opacity-35"
              : "opacity-0"
          }`}
        >
          ☀
        </span>

        <span
          className={`transition-all duration-300 ${
            isDark
              ? "opacity-0"
              : "opacity-35"
          }`}
        >
          ☾
        </span>
      </span>
    </button>
  );
}

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
      className="codm-theme-toggle relative flex h-10 w-[76px] cursor-pointer items-center rounded-full border border-[var(--border)] bg-[var(--surface)] p-1 transition-all duration-300"
    >
      {/* Sliding button */}
      <span
        className={`absolute left-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--foreground)] text-[var(--background)] transition-transform duration-300 ease-out ${
          theme === "dark"
            ? "translate-x-9"
            : "translate-x-0"
        }`}
      >
        {theme === "light" ? "☀" : "☾"}
      </span>

      {/* Background icons */}
      <span className="pointer-events-none flex w-full justify-between px-2 text-xs opacity-40">
        <span>☀</span>
        <span>☾</span>
      </span>
    </button>
  );
}

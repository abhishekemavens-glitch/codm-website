"use client";

import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={() => {
        console.log("Theme toggle clicked");
        toggleTheme();
      }}
      aria-label={
        theme === "light"
          ? "Switch to dark mode"
          : "Switch to light mode"
      }
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        width: "76px",
        height: "40px",
        padding: "4px",
        borderRadius: "9999px",
        border: "1px solid var(--border)",
        background: "var(--surface)",
        cursor: "pointer",
        zIndex: 9999,
      }}
    >
      {/* Sliding button */}
      <span
        style={{
          position: "absolute",
          top: "4px",
          left: theme === "dark" ? "42px" : "4px",
          width: "30px",
          height: "30px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--foreground)",
          color: "var(--background)",
          transition:
            "left 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
          pointerEvents: "none",
        }}
      >
        {theme === "dark" ? "☾" : "☀"}
      </span>

      {/* Icons */}
      <span
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 10px",
          fontSize: "12px",
          opacity: 0.45,
          pointerEvents: "none",
        }}
      >
        <span>☀</span>
        <span>☾</span>
      </span>
    </button>
  );
}

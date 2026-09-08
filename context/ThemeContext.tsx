"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // LIGHT MODE IS THE DEFAULT
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("codm-theme");

    // Only restore a valid saved theme.
    // Otherwise remain LIGHT.
    const initialTheme: Theme =
      savedTheme === "dark" ? "dark" : "light";

    setTheme(initialTheme);

    // Use the Tailwind-compatible .dark class
    document.documentElement.classList.toggle(
      "dark",
      initialTheme === "dark"
    );

    // Also keep data-theme available if any CSS uses it
    document.documentElement.setAttribute(
      "data-theme",
      initialTheme
    );
  }, []);

  const toggleTheme = () => {
    setTheme((currentTheme) => {
      const newTheme: Theme =
        currentTheme === "light" ? "dark" : "light";

      // Save preference
      localStorage.setItem("codm-theme", newTheme);

      // IMPORTANT:
      // Add/remove .dark class on <html>
      document.documentElement.classList.toggle(
        "dark",
        newTheme === "dark"
      );

      // Keep data-theme synchronized too
      document.documentElement.setAttribute(
        "data-theme",
        newTheme
      );

      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider"
    );
  }

  return context;
}

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
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("codm-theme");

    const initialTheme: Theme =
      savedTheme === "dark" ? "dark" : "light";

    setTheme(initialTheme);

    document.documentElement.setAttribute(
      "data-theme",
      initialTheme
    );

    document.documentElement.classList.toggle(
      "dark",
      initialTheme === "dark"
    );
  }, []);

  const toggleTheme = () => {
    setTheme((currentTheme) => {
      const newTheme: Theme =
        currentTheme === "light" ? "dark" : "light";

      localStorage.setItem("codm-theme", newTheme);

      document.documentElement.setAttribute(
        "data-theme",
        newTheme
      );

      document.documentElement.classList.toggle(
        "dark",
        newTheme === "dark"
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

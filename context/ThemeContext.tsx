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

const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("codm-theme");

    const initialTheme: Theme =
      saved === "dark" ? "dark" : "light";

    setTheme(initialTheme);

    document.documentElement.setAttribute(
      "data-theme",
      initialTheme
    );

    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const nextTheme: Theme =
      theme === "light" ? "dark" : "light";

    setTheme(nextTheme);

    document.documentElement.setAttribute(
      "data-theme",
      nextTheme
    );

    localStorage.setItem("codm-theme", nextTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
      }}
    >
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

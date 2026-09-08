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

const ThemeContext = createContext<
  ThemeContextType | undefined
>(undefined);

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("codm-theme");

    const initialTheme: Theme =
      savedTheme === "dark" ? "dark" : "light";

    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  function applyTheme(newTheme: Theme) {
    const html = document.documentElement;

    if (newTheme === "dark") {
      html.classList.add("dark");
      html.setAttribute("data-theme", "dark");
    } else {
      html.classList.remove("dark");
      html.setAttribute("data-theme", "light");
    }
  }

  function toggleTheme() {
    setTheme((currentTheme) => {
      const newTheme: Theme =
        currentTheme === "light" ? "dark" : "light";

      localStorage.setItem("codm-theme", newTheme);
      applyTheme(newTheme);

      return newTheme;
    });
  }

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

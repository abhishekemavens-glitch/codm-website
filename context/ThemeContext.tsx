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
  /*
   * LIGHT MODE IS THE DEFAULT
   */
  const [theme, setTheme] = useState<Theme>("light");

  /*
   * Load saved theme
   */
  useEffect(() => {
    const savedTheme = localStorage.getItem("codm-theme");

    /*
     * Only use dark mode if the user previously
     * selected dark mode.
     */
    if (savedTheme === "dark") {
      setTheme("dark");

      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute(
        "data-theme",
        "dark"
      );
    } else {
      /*
       * LIGHT MODE DEFAULT
       */
      setTheme("light");

      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute(
        "data-theme",
        "light"
      );

      /*
       * Save light mode for first-time visitors
       */
      if (!savedTheme) {
        localStorage.setItem("codm-theme", "light");
      }
    }
  }, []);

  /*
   * Toggle between LIGHT and DARK
   */
  const toggleTheme = () => {
    const newTheme: Theme =
      theme === "light" ? "dark" : "light";

    setTheme(newTheme);

    localStorage.setItem(
      "codm-theme",
      newTheme
    );

    /*
     * Add/remove .dark
     * This is important because your CSS
     * uses html.dark for dark mode.
     */
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    /*
     * Keep data-theme as well
     */
    document.documentElement.setAttribute(
      "data-theme",
      newTheme
    );
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

"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { flushSync } from "react-dom";

const STORAGE_KEY = "theme";

const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function applyTheme(theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export default function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState("light");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const initial = stored === "light" || stored === "dark"
      ? stored
      : window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    setThemeState(initial);
    applyTheme(initial);
  }, []);

  const setTheme = useCallback((next, origin) => {
    const commit = () => {
      setThemeState(next);
      applyTheme(next);
      window.localStorage.setItem(STORAGE_KEY, next);
    };

    if (!origin || !document.startViewTransition) {
      commit();
      return;
    }

    const { x, y } = origin;
    const transition = document.startViewTransition(() => flushSync(commit));

    transition.ready.then(() => {
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );
      document.documentElement.animate(
        {
          clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`],
        },
        {
          duration: 600,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    });
  }, []);

  const toggleTheme = useCallback(
    (origin) => {
      setTheme(theme === "dark" ? "light" : "dark", origin);
    },
    [theme, setTheme]
  );

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

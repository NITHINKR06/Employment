"use client";

import { IoSunnyOutline, IoMoonOutline } from "react-icons/io5";
import { useTheme } from "@/lib/ThemeProvider";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const handleClick = (event) => {
    toggleTheme({ x: event.clientX, y: event.clientY });
  };

  return (
    <button
      onClick={handleClick}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      className={`flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary ${className}`}
    >
      {isDark ? <IoSunnyOutline size={20} aria-hidden="true" /> : <IoMoonOutline size={20} aria-hidden="true" />}
    </button>
  );
}

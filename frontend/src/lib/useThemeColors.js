"use client";

import { useEffect, useState } from "react";

const TOKENS = [
  "--color-primary",
  "--color-on-primary",
  "--color-error",
  "--color-on-surface",
  "--color-on-surface-variant",
  "--color-outline-variant",
  "--color-surface-container-lowest",
  "--color-surface-container-high",
];

function readTokens() {
  if (typeof window === "undefined") return {};
  const styles = getComputedStyle(document.documentElement);
  const values = {};
  for (const token of TOKENS) {
    values[token] = styles.getPropertyValue(token).trim();
  }
  return values;
}

/** Tracks this app's CSS custom properties so charts stay in sync with the
 * `.dark` class toggle on <html> (see ThemeProvider) instead of hardcoding hex values. */
export default function useThemeColors() {
  const [colors, setColors] = useState(readTokens);

  useEffect(() => {
    setColors(readTokens());
    const observer = new MutationObserver(() => setColors(readTokens()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return colors;
}

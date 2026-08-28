/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        md: "3rem",
      },
      screens: {
        xl: "1280px",
      },
    },
    extend: {
      colors: {
        primary: "#006948",
        "on-primary": "#ffffff",
        "primary-container": "#00855d",
        "on-primary-container": "#f5fff7",
        "primary-fixed": "#85f8c4",
        "primary-fixed-dim": "#68dba9",
        "on-primary-fixed": "#002114",
        "on-primary-fixed-variant": "#005137",
        "inverse-primary": "#68dba9",
        "surface-tint": "#006c4a",

        secondary: "#565e74",
        "on-secondary": "#ffffff",
        "secondary-container": "#dae2fd",
        "on-secondary-container": "#5c647a",
        "secondary-fixed": "#dae2fd",
        "secondary-fixed-dim": "#bec6e0",
        "on-secondary-fixed": "#131b2e",
        "on-secondary-fixed-variant": "#3f465c",

        tertiary: "#825100",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#a36700",
        "on-tertiary-container": "#fffbff",
        "tertiary-fixed": "#ffddb8",
        "tertiary-fixed-dim": "#ffb95f",
        "on-tertiary-fixed": "#2a1700",
        "on-tertiary-fixed-variant": "#653e00",

        error: "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",

        surface: "#f7f9fb",
        "surface-dim": "#d8dadc",
        "surface-bright": "#f7f9fb",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f2f4f6",
        "surface-container": "#eceef0",
        "surface-container-high": "#e6e8ea",
        "surface-container-highest": "#e0e3e5",
        "surface-variant": "#e0e3e5",
        "on-surface": "#191c1e",
        "on-surface-variant": "#3d4a42",

        "inverse-surface": "#2d3133",
        "inverse-on-surface": "#eff1f3",
        outline: "#6d7a72",
        "outline-variant": "#bccac0",

        background: "#f7f9fb",
        "on-background": "#191c1e",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: [
          "var(--font-plus-jakarta-sans)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      fontSize: {
        "display-lg": ["32px", { lineHeight: "40px", letterSpacing: "-0.01em", fontWeight: "700" }],
        "display-lg-desktop": ["48px", { lineHeight: "56px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "headline-sm": ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "label-md": ["14px", { lineHeight: "20px", letterSpacing: "0.01em", fontWeight: "600" }],
        "label-sm": ["12px", { lineHeight: "16px", fontWeight: "500" }],
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem",
        full: "9999px",
      },
      boxShadow: {
        "elevation-1": "0 1px 4px 0 rgb(25 28 30 / 0.05), 0 0 0 1px rgb(188 202 192 / 0.4)",
        "elevation-2": "0 4px 12px 0 rgb(25 28 30 / 0.12)",
      },
    },
  },
  plugins: [],
};

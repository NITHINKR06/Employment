/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "20px",
        md: "64px",
      },
      screens: {
        xl: "1440px",
      },
    },
    extend: {
      colors: {
        primary: "#a43716",
        "on-primary": "#ffffff",
        "primary-container": "#c54f2c",
        "on-primary-container": "#fffbff",
        "primary-fixed": "#ffdbd1",
        "primary-fixed-dim": "#ffb5a0",
        "on-primary-fixed": "#3b0900",
        "on-primary-fixed-variant": "#862201",
        "inverse-primary": "#ffb5a0",
        "surface-tint": "#a73918",

        secondary: "#5f5e5e",
        "on-secondary": "#ffffff",
        "secondary-container": "#e2dfde",
        "on-secondary-container": "#636262",
        "secondary-fixed": "#e5e2e1",
        "secondary-fixed-dim": "#c8c6c5",
        "on-secondary-fixed": "#1c1b1b",
        "on-secondary-fixed-variant": "#474746",

        tertiary: "#5c5c58",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#757571",
        "on-tertiary-container": "#fefcf7",
        "tertiary-fixed": "#e4e2dd",
        "tertiary-fixed-dim": "#c8c6c2",
        "on-tertiary-fixed": "#1b1c19",
        "on-tertiary-fixed-variant": "#474744",

        error: "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",

        background: "#fbf9f8",
        "on-background": "#1b1c1c",
        surface: "#fbf9f8",
        "on-surface": "#1b1c1c",
        "on-surface-variant": "#58423c",
        "surface-dim": "#dbdad9",
        "surface-bright": "#fbf9f8",
        "surface-variant": "#e4e2e2",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f5f3f3",
        "surface-container": "#efeded",
        "surface-container-high": "#e9e8e7",
        "surface-container-highest": "#e4e2e2",

        outline: "#8b716a",
        "outline-variant": "#dfc0b7",
        "inverse-surface": "#303031",
        "inverse-on-surface": "#f2f0f0",
      },
      fontFamily: {
        serif: ["var(--font-libre-caslon-text)", "serif"],
        sans: ["var(--font-geist)", "sans-serif"],
      },
      fontSize: {
        "display-lg": ["72px", { lineHeight: "80px", letterSpacing: "-0.02em", fontWeight: "400" }],
        "display-lg-mobile": ["40px", { lineHeight: "48px", letterSpacing: "-0.01em", fontWeight: "400" }],
        "headline-md": ["40px", { lineHeight: "48px", fontWeight: "400" }],
        "headline-sm": ["24px", { lineHeight: "32px", fontWeight: "400" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "label-caps": ["12px", { lineHeight: "16px", letterSpacing: "0.1em", fontWeight: "600" }],
        "numeric-data": ["32px", { lineHeight: "40px", letterSpacing: "-0.03em", fontWeight: "300" }],
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
      },
      boxShadow: {
        "elevation-1": "0 8px 24px rgba(26, 26, 26, 0.04)",
        "elevation-2": "0 12px 32px rgba(26, 26, 26, 0.08)",
      },
    },
  },
  plugins: [],
};

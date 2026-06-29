import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cream-minimal palette. Color is used sparingly — accent only where it matters.
        cream: {
          50: "#FBF8F1",
          100: "#F4EEE2", // page background
          200: "#ECE3D2",
          300: "#E1D5BE",
        },
        ink: {
          DEFAULT: "#1A1815",
          soft: "#3A352E",
        },
        muted: {
          DEFAULT: "#7A7268",
          light: "#A89F92",
        },
        line: "#E6DCC9",
        accent: {
          DEFAULT: "#E2613B", // terracotta — CTAs / single highlight
          dark: "#C44E2C",
          soft: "#F3D9CE",
        },
        sage: {
          DEFAULT: "#6F7F66", // secondary accent, used rarely
          soft: "#DfE4D9",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        frame: "0 12px 40px -12px rgba(26,24,21,0.28)",
        soft: "0 1px 2px rgba(26,24,21,0.04), 0 8px 24px -16px rgba(26,24,21,0.15)",
      },
    },
  },
  plugins: [],
};
export default config;

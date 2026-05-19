import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        // 30% — deep green: navbars, headings, dark UI
        primary: {
          DEFAULT: "#0a2e1e",
          50: "#e8efec",
          100: "#c8d8d1",
          200: "#9bb6a8",
          300: "#6e937e",
          400: "#427054",
          500: "#1f4d33",
          600: "#0a2e1e",
          700: "#082619",
          800: "#061c13",
          900: "#04130d",
        },
        // 10% — gold accent: highlights, badges, CTAs
        accent: {
          DEFAULT: "#c9a84c",
          50: "#fbf6e7",
          100: "#f4e7b9",
          200: "#ecd388",
          300: "#e0bf5d",
          400: "#d5b352",
          500: "#c9a84c",
          600: "#a98a3a",
          700: "#856c2a",
        },
        // 60% — page background
        background: "#FFFFFF",
        // text + dark UI
        foreground: "#0a2e1e",
        muted: {
          DEFAULT: "#F4F6F5",
          foreground: "#475569",
        },
        border: "#E2E8E5",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        heading: ["var(--font-inter)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.6s ease-out",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
      },
      boxShadow: {
        soft: "0 4px 24px -4px rgba(10, 46, 30, 0.08)",
        card: "0 8px 32px -8px rgba(10, 46, 30, 0.10)",
        glow: "0 0 0 4px rgba(10, 46, 30, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;

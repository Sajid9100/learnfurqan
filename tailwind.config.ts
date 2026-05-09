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
        primary: {
          DEFAULT: "#0F766E",
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#0F766E",
          700: "#0D6661",
          800: "#0B524E",
          900: "#083E3B",
        },
        accent: {
          DEFAULT: "#D4A017",
          50: "#FEF8E7",
          100: "#FCEFC4",
          200: "#F9DF89",
          300: "#F0CB47",
          400: "#E2B428",
          500: "#D4A017",
          600: "#A67C12",
          700: "#7A5A0D",
        },
        background: "#F8FAF9",
        foreground: "#0F172A",
        muted: {
          DEFAULT: "#F1F5F4",
          foreground: "#64748B",
        },
        border: "#E2E8E5",
      },
      fontFamily: {
        heading: ["var(--font-poppins)", "system-ui", "sans-serif"],
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
        soft: "0 4px 24px -4px rgba(15, 118, 110, 0.08)",
        card: "0 8px 32px -8px rgba(15, 23, 42, 0.08)",
        glow: "0 0 0 4px rgba(15, 118, 110, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;

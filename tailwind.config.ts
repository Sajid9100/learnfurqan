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
        // Single primary color: a clean, modern green. 60-30-10 means
        // primary appears in ~10% of the UI as the CTA / highlight.
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
        // Accent is intentionally another shade of the same green family — no
        // second hue. Existing components reference `accent` for badges,
        // ratings, and pending states; remapping (rather than deleting) keeps
        // them rendering in-palette.
        accent: {
          DEFAULT: "#0D6661",
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#0D6661",
          700: "#0B524E",
        },
        // 60% — page background
        background: "#FFFFFF",
        // 30% — text + dark UI; near-black for high contrast
        foreground: "#0A0F1A",
        muted: {
          DEFAULT: "#F4F6F5",
          foreground: "#475569",
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

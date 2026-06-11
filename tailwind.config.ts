import type { Config } from "tailwindcss";

/**
 * Apex / Reef-Native design system.
 * A deep-sea palette: abyssal backgrounds, bioluminescent teal, and coral accents.
 */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        abyss: "#04141f", // deepest background
        deep: "#082233", // panel background
        surface: "#0d3247", // raised surface
        tide: "#0e7490", // primary teal
        glow: "#22d3ee", // bioluminescent cyan accent
        coral: "#ff6b5e", // coral / alert accent
        sand: "#e8d8a8", // warm sand
        foam: "#e6f6fb", // light foreground text
      },
      fontFamily: {
        display: ["'Space Grotesk'", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        drift: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
        drift: "drift 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;

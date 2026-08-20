import type { Config } from "tailwindcss";

/**
 * Apex / Reef-Native design system.
 * A deep-sea palette: abyssal backgrounds, bioluminescent teal, and coral accents.
 *
 * The warm "reef" accents (kelp / ember / urchin) and the sunlit "shallow" blues
 * are sampled from the program's hero painting (public/images/hero.png) so the coded
 * UI and the artwork share one coherent light.
 */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        abyss: "#04141f",
        deep: "#082233",
        surface: "#0d3247",
        tide: "#0e7490",
        glow: "#22d3ee",
        coral: "#ff6b5e",
        lagoon: "#2a7fa3",
        shallow: "#8fd4e0",
        kelp: "#e0a64f",
        ember: "#d2603a",
        urchin: "#9a7fb5",
        sand: "#e8d8a8",
        foam: "#e6f6fb",
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
        "float-slow": {
          "0%, 100%": { transform: "translateY(0) translateX(0)" },
          "50%": { transform: "translateY(-18px) translateX(6px)" },
        },
        sway: {
          "0%, 100%": { transform: "translateX(-2%) skewX(-3deg)", opacity: "0.35" },
          "50%": { transform: "translateX(2%) skewX(3deg)", opacity: "0.7" },
        },
        caustic: {
          "0%": { transform: "translate3d(0,0,0) scale(1)", opacity: "0.25" },
          "50%": { transform: "translate3d(2%,-1%,0) scale(1.08)", opacity: "0.5" },
          "100%": { transform: "translate3d(0,0,0) scale(1)", opacity: "0.25" },
        },
        rise: {
          "0%": { transform: "translateY(0)", opacity: "0" },
          "10%": { opacity: "0.8" },
          "90%": { opacity: "0.4" },
          "100%": { transform: "translateY(-120px)", opacity: "0" },
        },
        shimmer: {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
        drift: "drift 6s ease-in-out infinite",
        "float-slow": "float-slow 12s ease-in-out infinite",
        sway: "sway 9s ease-in-out infinite",
        caustic: "caustic 14s ease-in-out infinite",
        rise: "rise 9s linear infinite",
        shimmer: "shimmer 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;

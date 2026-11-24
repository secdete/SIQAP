import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        siqap: {
          navy:     "#1E1240", // Primary dark background
          "navy-dark": "#100820", // Deeper shade for shadows/hover
          // Orange comes in three weights so every pairing clears WCAG AA:
          // orange on navy = 6.9:1 (text), orange on light = 2.4:1 (fills only),
          // orange-dark on light = 4.7:1 (text), navy on orange = 6.9:1 (text).
          orange:   "#FC8235", // Accent + fills; text ONLY on navy
          "orange-dark": "#B45309", // Orange text/borders on light surfaces
          "orange-hover": "#EA580C", // Hover for orange fills (navy text stays 4.85:1)
          peach:    "#FFA566", // Lighter accent (decorative / large only)
          sand:     "#FBF2EB", // Light page background
          cream:    "#FFF7F2", // Card background
          border:   "#F3E1D5", // Soft border
          muted:    "#6B6188", // Muted text
          beige:    "#E5DAC6", // Neutral fill
        },
        quiz: {
          red: "#C93C42",    // Answer A
          "red-dark": "#B03035", // Answer A hover/border shade
          yellow: "#F5B031", // Answer B
          "yellow-dark": "#DF9F26", // Answer B hover/border shade
          green: "#2DB87A",  // Answer C
          "green-dark": "#259F69", // Answer C hover/border shade
          purple: "#6F52E0", // Answer D
          "purple-dark": "#5F44C6", // Answer D hover/border shade
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-montserrat)", "var(--font-inter)", "system-ui", "sans-serif"],
        brand: ["var(--font-anton)", "var(--font-montserrat)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        siqap: {
          maroon: "#1E1240", // Poster navy-purple (replaces burgundy)
          navy:   "#1E1240", // alias - primary dark background
          "navy-dark": "#100820", // deeper navy for shadows/dark accents
          orange: "#FC8235", // Vibrant Orange Poster accent
          peach:  "#FFA566", // Warm Peach lighter accent
          dark:   "#100820", // Dark navy shadow
          sand:   "#FBF2EB", // Warm Sand (light pages)
          cream:  "#FFF7F2", // Light Warm Cream
          border: "#F3E1D5", // Soft Cream Border
          muted:  "#6B6188", // Muted text
          beige:  "#E5DAC6", // Team Card Beige
        },
        quiz: {
          red: "#C93C42",    // Kahoot Option A (Red)
          yellow: "#F5B031", // Kahoot Option B (Yellow)
          green: "#2DB87A",  // Kahoot Option C (Green)
          purple: "#6F52E0", // Kahoot Option D (Purple)
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        display: ["Inter", "Montserrat", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

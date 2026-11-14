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
          maroon: "#7B034D", // Deep Maroon / Plum Poster
          orange: "#FC8235", // Vibrant Orange Poster
          peach: "#FFA566",  // Warm Peach Accent
          dark: "#560035",   // Dark Plum Shadow
          sand: "#FBF2EB",   // Warm Sand Background
          cream: "#FFF7F2",  // Light Warm Cream
          border: "#F3E1D5", // Soft Cream Border
          muted: "#7E5B6E",  // Muted Plum Text
          beige: "#E5DAC6",  // Poster Team Card Beige
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

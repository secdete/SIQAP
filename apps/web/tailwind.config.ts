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
          primary: "#6366f1", // Indigo
          secondary: "#06b6d4", // Cyan
          accent: "#f59e0b", // Amber
          dark: "#0f172a", // Slate 900
          card: "#1e293b", // Slate 800
        },
        quiz: {
          red: "#ef4444",
          blue: "#3b82f6",
          yellow: "#eab308",
          green: "#10b981",
        },
      },
    },
  },
  plugins: [],
};

export default config;

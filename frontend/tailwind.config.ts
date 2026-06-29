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
        maroon: { DEFAULT: "#8B1A1A", dark: "#6B1414", light: "#A52020" },
        gold: { DEFAULT: "#D4A017", light: "#E8B820" },
        navy: { DEFAULT: "#1a1a2e", light: "#16213e" },
      },
      fontFamily: {
        sans: ["Open Sans", "sans-serif"],
        heading: ["Montserrat", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

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
        primary: "#FFAB00", // <--- HEX color
        secondary: "#0891B2", // <--- HEX color
        badge: "#DD0000",
        success: "#36B37E",
        background: "#ffffff", // static background
        foreground: "#171717", // static foreground
        border: "#e5e5e5",
        input: "#e5e5e5",
        ring: "#171717",
        // Optional: keep chart colors if you want them
        chart: {
          "1": "#f97316",
          "2": "#10b981",
          "3": "#3b82f6",
          "4": "#facc15",
          "5": "#ec4899",
        },
      },
      fontFamily: {
        custom: ["Swiss721"],
      },
      borderRadius: {
        lg: "0.5rem", // fixed value
        md: "0.375rem",
        sm: "0.25rem",
      },
    },
  },
  plugins: [],
};

export default config;

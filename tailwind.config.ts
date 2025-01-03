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
        primary: "#FFAB00",
        secondary: "#0891B2",
        badge: "#DD0000",
        success: "#36B37E",
      },
      fontFamily: {
        custom: ["Swiss721"],
      },
    },
  },
  plugins: [],
};
export default config;

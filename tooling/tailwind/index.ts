import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      colors: {
        "primary-100": "#ffefe8",
        "primary-200": "#ffdccf",
        "primary-300": "#ffcfba",
        "primary-500": "#ff8271",
        "primary-600": "#ff725c",
        "primary-700": "#ff6f5e",
        "primary-900": "#ff3d00",
        "blind-100": "#e6e1f5",
        "blind-200": "#c4b7e8",
        "blind-300": "#a18edb",
        "blind-400": "#7f64ce",
        "blind-500": "#5d3bc1",
        "blind-600": "#4a2f9a",
        "blind-700": "#382373",
        "blind-800": "#25174c",
        "blind-900": "#130c26",
        "frip-primary-500": "#7a29fa",
      },
    },
  },
  plugins: [],
} satisfies Config;

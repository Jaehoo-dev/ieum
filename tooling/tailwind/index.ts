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
        "primary-300": "#ffcfba",
        "primary-500": "#ff8271",
        "primary-600": "#ff725c",
        "primary-700": "#ff6f5e",
        "primary-900": "#ff3d00",
      },
    },
  },
  plugins: [],
} satisfies Config;

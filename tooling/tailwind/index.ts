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
        "primary-300": "#ffebd9",
        "primary-400": "#ffcfb7",
        "primary-500": "#ff8271",
        "primary-700": "#ff6f5e",
        "primary-900": "#ff3d00",
      },
    },
  },
  plugins: [],
} satisfies Config;

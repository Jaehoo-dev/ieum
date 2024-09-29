import type { Config } from "tailwindcss";

import baseConfig from "@acme/tailwind-config";

export default {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}", "../../packages/profile/**/*.{ts,tsx}"],
  presets: [baseConfig],
  plugins: [require("tailwindcss-animate")],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {},
    },
  },
} satisfies Config;

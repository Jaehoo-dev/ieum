import type { Config } from "tailwindcss";

import baseConfig from "@acme/tailwind-config";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  presets: [baseConfig],
  theme: {
    extend: {
      colors: {
        primary: "#2F68A8",
        background: "#FDFCF9",
      },
    },
  },
} satisfies Config;

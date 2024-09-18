import type { Config } from "tailwindcss";

import baseConfig from "@acme/tailwind-config";

export default {
  content: ["./src/**/*.{ts,tsx}", "../../packages/profile/**/*.{ts,tsx}"],
  presets: [baseConfig],
  plugins: [require("tailwindcss-animate")],
  theme: {
    extend: {
      keyframes: {
        glowBorder: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(255, 130, 113, 0)" },
          "50%": { boxShadow: "0 0 12px 4px rgba(255, 130, 113, 0.7)" },
        },
      },
      animation: {
        "glow-border": "glowBorder 3s infinite",
      },
    },
  },
} satisfies Config;

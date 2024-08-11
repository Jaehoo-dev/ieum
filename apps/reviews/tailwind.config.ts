import type { Config } from "tailwindcss";

import baseConfig from "@acme/tailwind-config";

export default {
  content: ["./src/**/*.{ts,tsx}", "../../packages/profile/**/*.{ts,tsx}"],
  presets: [baseConfig],
} satisfies Config;

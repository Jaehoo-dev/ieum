// Importing env files here to validate on build
import "./src/env.mjs";

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: false,
  /** Enables hot reloading for local packages without a build step */
  transpilePackages: [
    "@ieum/firebase",
    "@ieum/prisma",
    "@ieum/supabase",
    "@ieum/matchmaker-trpc-server",
    "@ieum/slack",
    "@ieum/utils",
    "@ieum/constants",
  ],
  /** We already do linting and typechecking as separate tasks in CI */
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: {
    remotePatterns: [
      {
        hostname: process.env.NEXT_PUBLIC_SUPABASE_HOSTNAME ?? "",
      },
    ],
  },
  experimental: {
    scrollRestoration: true,
  },
};

export default config;

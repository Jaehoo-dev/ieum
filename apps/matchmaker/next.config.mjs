// Importing env files here to validate on build
import "./src/env.mjs";

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  /** Enables hot reloading for local packages without a build step */
  transpilePackages: [
    "@ieum/firebase",
    "@ieum/prisma",
    "@ieum/supabase",
    "@ieum/matchmaker-trpc-server",
    "@ieum/slack",
    "@ieum/utils",
    "@ieum/labels",
  ],
  /** We already do linting and typechecking as separate tasks in CI */
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

export default config;

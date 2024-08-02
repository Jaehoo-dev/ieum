// Importing env files here to validate on build
import "./src/env.mjs";

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: false,
  /** Enables hot reloading for local packages without a build step */
  transpilePackages: [],
  /** We already do linting and typechecking as separate tasks in CI */
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  experimental: {
    scrollRestoration: true,
  },
};

export default config;

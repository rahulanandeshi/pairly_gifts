import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React Three Fiber's imperative Three.js lifecycle doesn't tolerate
  // Strict Mode's intentional dev-only double-invoked effects — it can
  // leave the R3F event system attached to a torn-down canvas ref.
  reactStrictMode: false,
  experimental: {
    serverActions: {
      // Default 1MB is too small for audio recordings / photo uploads.
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone" supports self-hosted Node deployments; Vercel ignores it and
  // uses its own optimized output, so this is safe for both targets.
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  // Enforce type safety at build time (app code is type-clean; sandbox demo
  // folders are excluded via tsconfig).
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: true,
};

export default nextConfig;

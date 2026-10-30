import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  // Anti-slop invariant: TypeScript build errors are NEVER ignored.
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;

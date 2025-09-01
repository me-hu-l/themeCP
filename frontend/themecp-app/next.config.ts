import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // ⚠️ Warning: this ignores ESLint errors during build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

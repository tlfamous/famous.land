import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/July2026",
        destination: "/july2026",
        permanent: false
      },
      {
        source: "/July2026/:path*",
        destination: "/july2026/:path*",
        permanent: false
      }
    ];
  },
  turbopack: {
    root: process.cwd()
  }
};

export default nextConfig;

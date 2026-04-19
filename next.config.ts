import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@xenova/transformers"],
  turbopack: {},
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@xenova/transformers": "@xenova/transformers/src/transformers.js",
    };
    return config;
  },
};

export default nextConfig;

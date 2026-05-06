import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@modular-monolith/clients-shared"],
};

export default nextConfig;

import type { NextConfig } from "next";

// Allow self-signed certs on localhost in development.
if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const nextConfig: NextConfig = {
  transpilePackages: ["@modular-monolith/clients-shared"],
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the LAN address used to open this demo from another device.
  allowedDevOrigins: ["192.168.1.3"],
  // Keep unrelated lockfiles outside this repository out of Turbopack's root.
  turbopack: { root: process.cwd() },
};

export default nextConfig;

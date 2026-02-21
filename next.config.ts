import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // turbopack: {}, // If needed to bypass the webpack detection
  }
};

export default process.env.NODE_ENV === "development"
  ? nextConfig
  : withPWAInit({
      dest: "public",
      register: true,
      skipWaiting: true,
    })(nextConfig);

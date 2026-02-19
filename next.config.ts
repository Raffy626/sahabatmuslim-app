import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const nextConfig: NextConfig = {
  /* config options here */
};

export default process.env.NODE_ENV === "development"
  ? nextConfig
  : withPWAInit({
      dest: "public",
      register: true,
      skipWaiting: true,
    })(nextConfig);

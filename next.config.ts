import withPWAInit from "next-pwa";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nextConfig: any = {
  experimental: {
    turbopack: {},
  }
};

export default process.env.NODE_ENV === "development"
  ? nextConfig
  : withPWAInit({
      dest: "public",
      register: true,
      skipWaiting: true,
    })(nextConfig);
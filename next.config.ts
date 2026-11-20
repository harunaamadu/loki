import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
];

/** LAN addresses allowed to load the dev server (e.g. testing on a phone). */
function getLocalIPs() {
  const ips = ["localhost"];
  for (const iface of Object.values(networkInterfaces())) {
    for (const config of iface ?? []) {
      if (config.family === "IPv4" && !config.internal) ips.push(config.address);
    }
  }
  return ips;
}

const nextConfig: NextConfig = {
  // Dev-only setting; skip the network lookup in production builds.
  ...(process.env.NODE_ENV === "development" && {
    allowedDevOrigins: getLocalIPs(),
  }),
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: cloudName ? `/${cloudName}/**` : "/**",
      },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;

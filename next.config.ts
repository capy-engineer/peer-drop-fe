import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.icons8.com',
        pathname: '/**',
      },
    ],
  },

  env: {
    NEXT_PUBLIC_CN_URL: "ws://192.168.1.14:8080/connect",
    NEXT_PUBLIC_WS_URL: "ws://192.168.1.14:8080/ws",
    NEXT_PUBLIC_HTTP_URL: "http://192.168.1.14:3000"
  },
};
module.exports = {
  output: 'standalone',
};

export default nextConfig;

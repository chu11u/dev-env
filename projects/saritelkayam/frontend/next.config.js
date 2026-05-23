/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },

  allowedDevOrigins: ["saritelkayam.apps.elkayam.me", "saritelkayam.com"],

  // Proxy /api/ requests to the backend
  async rewrites() {
    const apiHost = process.env.NEXT_PUBLIC_API_HOST || "localhost";
    const apiPort = process.env.NEXT_PUBLIC_API_PORT || "30061";
    return [
      {
        source: "/api/:path*",
        destination: `http://${apiHost}:${apiPort}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },

  allowedDevOrigins: ["saritelkayam.apps.elkayam.me", "saritelkayam.com"],

  // Proxy /api/ requests to the backend
  // Use beforeFiles to ensure non-GET requests (PUT, POST, DELETE) are properly forwarded
  async rewrites() {
    const apiHost = process.env.BACKEND_HOST || "localhost";
    const apiPort = process.env.BACKEND_PORT || "30061";

    return {
      beforeFiles: [
        {
          source: "/api/:path*",
          destination: `http://${apiHost}:${apiPort}/api/:path*`,
        },
        {
          source: "/uploads/:path*",
          destination: `http://${apiHost}:${apiPort}/uploads/:path*`,
        },
      ],
    };
  },
};

module.exports = nextConfig;

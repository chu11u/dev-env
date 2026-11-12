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
    const umami = process.env.UMAMI_URL || "http://192.168.131.50:3017";

    return {
      beforeFiles: [
        // Umami analytics (first-party). Only the tracker, event intake and the
        // read endpoints Blog Ginie needs are exposed — not user/team admin APIs.
        { source: "/stats/script.js", destination: `${umami}/script.js` },
        { source: "/stats/api/send", destination: `${umami}/api/send` },
        { source: "/stats/api/auth/:path*", destination: `${umami}/api/auth/:path*` },
        { source: "/stats/api/websites/:path*", destination: `${umami}/api/websites/:path*` },
        { source: "/stats/api/reports/:path*", destination: `${umami}/api/reports/:path*` },
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

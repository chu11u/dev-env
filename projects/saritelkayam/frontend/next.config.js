/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',

  images: {
    unoptimized: true,
  },

  allowedDevOrigins: [
    'saritelkayam.apps.elkayam.me',
    'saritelkayam.com',
  ],
};

module.exports = nextConfig;

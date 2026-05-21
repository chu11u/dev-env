import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Sarit Elkayam | Professional Cosmetician',
    short_name: 'Sarit Elkayam',
    description:
        'Professional cosmetician dedicated to enhancing your natural beauty. Book your appointment today for personalized skincare, makeup, and beauty treatments.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAF6F2',
    theme_color: '#D4A59A',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
        },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        },
     ],
    };
}

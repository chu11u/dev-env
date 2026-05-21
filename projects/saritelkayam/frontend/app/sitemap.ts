import type { MetadataRoute } from 'next';
import { getAllBlogPosts } from '@/lib/blog';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://saritelkayam.com';
  const blogPosts = getAllBlogPosts();

  const staticRoutes = [
      '',
      '/services',
      '/testimonials',
      '/shop',
      '/book',
      '/blog',
      '/contact',
   ].map((route) => ({
     url: `${baseUrl}${route}`,
     lastModified: new Date(),
     changeFrequency: 'monthly' as const,
     priority: route === '' ? 1 : route === '/services' ? 0.9 : 0.7,
   }));

  const blogRoutes = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
    }));

  return [...staticRoutes, ...blogRoutes];
}

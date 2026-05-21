'use client';

import { Card } from '@/components/ui/Card';
import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import { SectionDivider } from '@/components/common/SectionDivider';
import { FadeInSection } from '@/components/common/FadeInSection';
import { Calendar, Clock } from 'lucide-react';

interface BlogListContentProps {
  posts: {
    slug: string;
    title: string;
    excerpt: string;
    date: string;
    readTime: number;
    category?: string;
    coverImage?: string;
  }[];
}

export function BlogListContent({ posts }: BlogListContentProps) {
  return (
       <>
         {/* Page header */}
         <FadeInSection>
           <section className="bg-cream-100 py-8 md:py-16 lg:py-20">
             <Container>
               <div className="text-center max-w-2xl mx-auto">
                 <Badge variant="accent">Blog</Badge>
                 <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal-800 mt-4 mb-4">
                  Beauty Tips & Insights
                 </h1>
                 <SectionDivider className="mb-4" />
                 <p className="font-body text-charcoal-500">
                  Expert advice, skincare routines, and beauty insights from
                  professional cosmetician Sarit Elkayam.
                 </p>
               </div>
             </Container>
           </section>
         </FadeInSection>

         {/* Posts grid */}
         <FadeInSection>
           <section className="py-8 md:py-16">
             <Container>
               {posts.length === 0 ? (
                 <div className="text-center py-12">
                   <p className="font-body text-charcoal-500">
                    No blog posts yet. Check back soon for beauty tips!
                   </p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {posts.map((post) => (
                     <a
                      key={post.slug}
                      href={`/blog/${post.slug}`}
                      className="block h-full hover:-translate-y-1 transition-transform duration-200 ease-[0.4,0,0.2,1]"
                     >
                       <Card className="p-6 flex flex-col h-full">
                         {/* Category */}
                         {post.category && (
                           <Badge variant="default">{post.category}</Badge>
                         )}

                         {/* Title */}
                         <h2 className="font-heading text-lg md:text-xl font-semibold text-charcoal-800 mt-3 mb-2">
                           {post.title}
                         </h2>

                         {/* Excerpt */}
                         <p className="font-body text-sm text-charcoal-500 leading-relaxed mb-4 flex-1">
                           {post.excerpt}
                         </p>

                         {/* Meta */}
                         <div className="flex items-center gap-4 text-xs text-charcoal-400 pt-4 border-t border-cream-200">
                           <span className="flex items-center gap-1">
                             <Calendar size={12} />{' '}
                             {new Date(post.date).toLocaleDateString('en-US', {
                               year: 'numeric',
                               month: 'short',
                               day: 'numeric',
                              })}
                           </span>
                           <span className="flex items-center gap-1">
                             <Clock size={12} /> {post.readTime} min read
                           </span>
                         </div>
                       </Card>
                     </a>
                   ))}
                 </div>
               )}
             </Container>
           </section>
         </FadeInSection>
       </>
     );
}

export default BlogListContent;

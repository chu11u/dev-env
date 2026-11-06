"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Calendar, Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/layout/Section";
import { useTranslation } from "@/lib/i18n";
import type { BlogPost } from "@/lib/blog";

interface PreviewPost {
  slug: string;
  title: string;
  excerpt: string;
  featuredImage: string;
  date: string;
  readTime: number;
}

function toPreview(post: BlogPost): PreviewPost {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    featuredImage: post.coverImage || "/assets/blog/featured-skincare.png",
    date: post.date,
    readTime: post.readTime,
  };
}

const cardVariants = {
  hidden: { y: 24 },
  visible: {
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

interface BlogPreviewProps {
  /** Server-fetched featured posts — baked into SSR HTML. */
  initialPosts?: BlogPost[];
}

export function BlogPreview({ initialPosts = [] }: BlogPreviewProps) {
  const { t, locale } = useTranslation();
  const shouldReduce = useReducedMotion();
  const posts = initialPosts.map(toPreview);
  const dateLocale = locale === "he" ? "he-IL" : "en-US";

  if (posts.length === 0) {
    return null;
  }

  return (
    <Section title={t.blogTitle} subtitle={t.blogSubtitle} bg="cream">
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.12, delayChildren: 0.1 },
          },
        }}
        initial={shouldReduce ? false : "hidden"}
        whileInView={shouldReduce ? undefined : "visible"}
        viewport={{ once: true, margin: "-100px" }}
      >
        {posts.map((post) => (
          <motion.div
            key={post.slug}
            variants={shouldReduce ? undefined : cardVariants}
          >
            <Card className="overflow-hidden flex flex-col h-full hover:-translate-y-1 transition-transform duration-200 ease-[0.4,0,0.2,1]">
              <div className="relative h-48 bg-cream-100">
                <Image
                  src={post.featuredImage}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-6 flex flex-col flex-1">
                <h3 className="font-heading text-lg md:text-xl font-semibold text-charcoal-800 mb-2">
                  {post.title}
                </h3>

                <p className="font-body text-sm text-charcoal-500 leading-relaxed mb-4 flex-1">
                  {post.excerpt}
                </p>

                <div className="flex items-center gap-4 text-xs text-charcoal-400 pt-4 border-t border-cream-200">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />{" "}
                    {new Date(post.date).toLocaleDateString(dateLocale, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {post.readTime} {t.blogReadTime}
                  </span>
                </div>

                <div className="mt-4 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    href={`/blog/${post.slug}`}
                  >
                    {t.blogReadMore}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="text-center mt-10">
        <Button variant="secondary" size="md" href="/blog">
          {t.blogViewAll}
        </Button>
      </div>
    </Section>
  );
}

export default BlogPreview;

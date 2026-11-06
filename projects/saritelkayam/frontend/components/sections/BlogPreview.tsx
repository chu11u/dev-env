"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/layout/Section";
import { useTranslation } from "@/lib/i18n";
import { getHomepagePosts, type Post } from "@/lib/api";
import type { HomepageFeaturedPost } from "@/lib/blog";

function estimateReadTime(content: string): number {
  return Math.max(
    1,
    Math.ceil(
      content
        .replace(/#{1,6}\s.+/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .split(/\s+/).length / 200,
    ),
  );
}

function adaptPost(post: Post): HomepageFeaturedPost {
  const dateSource = post.publishedAt || post.createdAt;
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    featuredImage:
      post.featuredImage || "/assets/blog/featured-skincare.png",
    date: dateSource.split("T")[0],
    readTime: estimateReadTime(post.content || ""),
  };
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

interface BlogPreviewProps {
  /** From server (SSR/ISR); HTML includes these slugs for crawlers and first paint. */
  initialPosts?: HomepageFeaturedPost[];
}

export function BlogPreview({ initialPosts = [] }: BlogPreviewProps) {
  const { t, locale } = useTranslation();
  const [posts, setPosts] = useState<HomepageFeaturedPost[]>(initialPosts);
  const dateLocale = locale === "he" ? "he-IL" : "en-US";

  useEffect(() => {
    let cancelled = false;
    getHomepagePosts()
      .then((data) => {
        if (cancelled || !data?.length) return;
        setPosts(data.slice(0, 3).map(adaptPost));
      })
      .catch(() => {
        /* keep server-rendered posts */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (posts.length === 0) {
    return null;
  }

  return (
    <Section title={t.blogTitle} subtitle={t.blogSubtitle} bg="cream">
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.12, delayChildren: 0.1 },
          },
        }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {posts.map((post) => (
          <motion.div key={post.slug} variants={cardVariants}>
            <Card className="overflow-hidden flex flex-col h-full hover:-translate-y-1 transition-transform duration-200 ease-[0.4,0,0.2,1]">
              <div className="relative h-48 bg-cream-100 overflow-hidden">
                {/* Plain <img> so /uploads/* is not forced through next/image */}
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="absolute inset-0 h-full w-full object-cover"
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

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/layout/Section";
import { useTranslation } from "@/lib/i18n";
import { getHomepagePosts, type Post } from "@/lib/api";

interface PreviewPost {
  slug: string;
  title: string;
  excerpt: string;
  featuredImage: string;
  date: string;
  readTime: number;
}

const fallbackPostsEn: PreviewPost[] = [
  {
    slug: "understanding-skin-types",
    title: "Understanding Skin Types",
    excerpt: "Learn to identify your skin type and give it the care it needs",
    featuredImage: "/assets/blog/featured-skincare.png",
    date: "2024-06-15",
    readTime: 5,
  },
  {
    slug: "summer-skincare-essentials",
    title: "5 Essentials for Glowing Summer Skin",
    excerpt:
      "The must-have products and routines for healthy glowing skin all summer",
    featuredImage: "/assets/blog/featured-seasonal.png",
    date: "2024-05-20",
    readTime: 7,
  },
  {
    slug: "natural-makeup-guide",
    title: "Natural Makeup Guide",
    excerpt: "Professional tips for a natural look that enhances your beauty",
    featuredImage: "/assets/blog/featured-beauty-tip.png",
    date: "2024-04-10",
    readTime: 6,
  },
];

const fallbackPostsHe: PreviewPost[] = [
  {
    slug: "understanding-skin-types",
    title: "הכרת סוגי העור",
    excerpt: "ללמוד לזהות את סוג העור שלך ולתת לו את הטיפול המתאים",
    featuredImage: "/assets/blog/featured-skincare.png",
    date: "2024-06-15",
    readTime: 5,
  },
  {
    slug: "summer-skincare-essentials",
    title: "5 חיוניים לטיפוח עור זוהר לקיץ",
    excerpt: "המוצרים והשגרות החיוניים לעור בריא וזוהר לאורך הקיץ",
    featuredImage: "/assets/blog/featured-seasonal.png",
    date: "2024-05-20",
    readTime: 7,
  },
  {
    slug: "natural-makeup-guide",
    title: "מדריך לאיפור טבעי",
    excerpt: "טיפים מקצועיים לאיפור טבעי שמדגיש את היופי שלך",
    featuredImage: "/assets/blog/featured-beauty-tip.png",
    date: "2024-04-10",
    readTime: 6,
  },
];

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

function adaptPost(post: Post): PreviewPost {
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

export function BlogPreview() {
  const { t, locale } = useTranslation();
  const fallback = locale === "he" ? fallbackPostsHe : fallbackPostsEn;
  const [posts, setPosts] = useState<PreviewPost[]>(fallback);
  const dateLocale = locale === "he" ? "he-IL" : "en-US";

  useEffect(() => {
    let cancelled = false;
    getHomepagePosts()
      .then((data) => {
        if (cancelled || !data?.length) return;
        setPosts(data.slice(0, 3).map(adaptPost));
      })
      .catch(() => {
        /* keep fallback */
      });
    return () => {
      cancelled = true;
    };
  }, []);

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

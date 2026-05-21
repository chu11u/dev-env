import type { Metadata } from "next";
import { getAllBlogPosts } from "@/lib/blog";
import FadeInSection from "@/components/common/FadeInSection";
import BlogListContent from "./BlogListContent";

export const metadata: Metadata = {
  title: "Blog | Sarit Elkayam",
  description:
    "Beauty tips, skincare advice, and industry insights from professional cosmetician Sarit Elkayam.",
  openGraph: {
    title: "Blog | Sarit Elkayam",
    description: "Expert beauty tips and skincare advice.",
  },
};

export default function BlogPage() {
  const posts = getAllBlogPosts();
  return <BlogListContent posts={posts} />;
}

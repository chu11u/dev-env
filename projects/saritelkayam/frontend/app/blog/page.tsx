import type { Metadata } from "next";
import { getAllBlogPosts } from "@/lib/blog";
import BlogListContent from "./BlogListContent";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog | Sarit Elkayam",
  description:
    "Beauty tips, skincare advice, and industry insights from professional cosmetician Sarit Elkayam.",
  openGraph: {
    title: "Blog | Sarit Elkayam",
    description: "Expert beauty tips and skincare advice.",
  },
};

export default async function BlogPage() {
  const posts = await getAllBlogPosts();
  return <BlogListContent posts={posts} />;
}

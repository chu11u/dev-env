import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlogPostBySlug } from "@/lib/blog";
import BlogPostContent from "./BlogPostContent";

export function generateStaticParams() {
  try {
    const { getBlogSlugs } = require("@/lib/blog");
    return getBlogSlugs().map((slug: string) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const post = getBlogPostBySlug(params.slug);
  if (!post) {
    return {
      title: "Blog Post Not Found | Sarit Elkayam",
      description: "The requested blog post could not be found.",
    };
  }
  return {
    title: `${post.title} | Sarit Elkayam Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const post = getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return <BlogPostContent post={post} />;
}

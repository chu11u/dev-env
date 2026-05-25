"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getPost, updatePost } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { ImageUpload } from "@/components/admin/ImageUpload";

interface PostData {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string | null;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string | null;
  authorNames?: string[];
}

export default function EditPostPage() {
  const router = useRouter();
  const { id } = useParams();
  const postId = String(id);
  const [post, setPost] = useState<PostData | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getPost(postId)
      .then((data) => {
        setPost(data);
        setTitle(data.title);
        setSlug(data.slug);
        setExcerpt(data.excerpt);
        setContent(data.content);
        setFeaturedImage(data.featuredImage || "");
        setAuthorName(data.authors?.[0]?.name || "");
        setIsPublished(data.status === "PUBLISHED");
        setIsLoading(false);
      })
      .catch(() => {
        setError("Failed to load post.");
        setIsLoading(false);
      });
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title || !excerpt || !content) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      await updatePost(postId, {
        title,
        slug,
        excerpt,
        content,
        featuredImage: featuredImage || undefined,
        status: isPublished ? "PUBLISHED" : "DRAFT",
        publishedAt: isPublished
          ? post?.publishedAt || new Date().toISOString()
          : undefined,
        authorNames: authorName ? [authorName] : [],
      });
      router.push("/admin/blog");
    } catch (err) {
      setError("Failed to update post. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <p className="font-body text-charcoal-500">Loading post...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <a
          href="/admin/blog"
          className="font-body text-sm text-rose-400 hover:text-rose-500 transition-colors mb-4 inline-block"
        >
          ← Back to Posts
        </a>
        <h1 className="font-heading text-3xl font-bold text-charcoal-800 mb-2">
          Edit Post
        </h1>
        <p className="font-body text-charcoal-500">
          Update your blog post content.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="p-6 md:p-8 space-y-6 max-w-4xl">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl font-body text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <Input
            label="Title"
            name="title"
            placeholder="Enter post title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          {/* Slug */}
          <Input
            label="Slug"
            name="slug"
            placeholder="post-url-slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
          />
          <p className="font-body text-xs text-charcoal-400">
            URL: /blog/{slug}
          </p>

          {/* Excerpt */}
          <Textarea
            label="Excerpt"
            name="excerpt"
            placeholder="Brief summary of the post..."
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            required
          />

          {/* Featured Image */}
          <ImageUpload
            label="Featured Image"
            value={featuredImage}
            onChange={(url) => setFeaturedImage(url)}
          />

          {/* Author */}
          <Input
            label="Author Name"
            name="authorName"
            placeholder="Author name..."
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
          />

          {/* Content */}
          <Textarea
            label="Content (Markdown)"
            name="content"
            placeholder="Write your post content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={16}
            required
          />

          {/* Publish Toggle */}
          <div className="flex items-center gap-3 pt-4 border-t border-cream-200">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-charcoal-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-rose-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-rose-400 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              <span className="ml-3 font-body text-sm text-charcoal-600">
                {isPublished ? "Published" : "Draft"}
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-cream-200">
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Update Post"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/blog")}
            >
              Cancel
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}

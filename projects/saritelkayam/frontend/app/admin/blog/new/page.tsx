"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPost } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { WysiwygEditor } from "@/components/admin/WysiwygEditor";
import { ImageUpload } from "@/components/admin/ImageUpload";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [authorName, setAuthorName] = useState("Sarit Elkayam");
  const [isPublished, setIsPublished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slug) {
      setSlug(generateSlug(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title || !excerpt || !content) {
      setError("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createPost({
        title,
        slug,
        excerpt,
        content,
        featuredImage: featuredImage || undefined,
        status: isPublished ? "PUBLISHED" : "DRAFT",
        publishedAt: isPublished ? new Date().toISOString() : undefined,
        authorNames: authorName ? [authorName] : [],
      });
      router.push("/admin/blog");
    } catch (err) {
      setError("Failed to create post. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

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
          New Blog Post
        </h1>
        <p className="font-body text-charcoal-500">
          Create a new blog post for your beauty blog.
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
            onChange={(e) => handleTitleChange(e.target.value)}
            required
          />

          {/* Slug */}
          <Input
            label="Slug (auto-generated, editable)"
            name="slug"
            placeholder="post-url-slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
          />
          <p className="font-body text-xs text-charcoal-400">
            URL: /blog/{slug || "your-slug-here"}
          </p>

          {/* Excerpt */}
          <Textarea
            label="Excerpt"
            name="excerpt"
            placeholder="Brief summary of the post (shown in blog listings)..."
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
          <WysiwygEditor
            label="Content"
            value={content}
            onChange={(val) => setContent(val)}
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
              {isSubmitting ? "Saving..." : "Save Post"}
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

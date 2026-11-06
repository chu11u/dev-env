import fs from "fs";
import path from "path";

const CONTENT_DIR = path.join(process.cwd(), "public", "content", "posts");

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: number;
  category?: string;
  coverImage?: string;
  content: string;
}

interface ApiPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string | null;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string | null;
  createdAt: string;
}

function apiBase(): string {
  const host = process.env.BACKEND_HOST || "backend";
  const port = process.env.BACKEND_PORT || "3001";
  return `http://${host}:${port}`;
}

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

function adaptApiPost(post: ApiPost): BlogPost {
  const dateSource = post.publishedAt || post.createdAt;
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    date: dateSource.split("T")[0],
    coverImage: post.featuredImage || undefined,
    content: post.content,
    readTime: estimateReadTime(post.content),
  };
}

/** Homepage featured posts (showOnHomepage / latest 3). */
export async function getHomepageBlogPosts(): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${apiBase()}/api/blog/posts/featured`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const posts = (await res.json()) as ApiPost[];
      return posts
        .filter((p) => p.status !== "DRAFT")
        .slice(0, 3)
        .map(adaptApiPost);
    }
  } catch (err) {
    console.error("getHomepageBlogPosts API failed:", err);
  }
  // Fallback: newest published posts
  const all = await getAllBlogPosts();
  return all.slice(0, 3);
}

/** Fetch published posts from the CMS API (source of truth at runtime). */
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${apiBase()}/api/blog/posts`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const posts = (await res.json()) as ApiPost[];
      return posts
        .filter((p) => p.status === "PUBLISHED")
        .map(adaptApiPost)
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
    }
  } catch (err) {
    console.error("getAllBlogPosts API failed, falling back to markdown:", err);
  }
  return getAllBlogPostsFromMarkdown();
}

/** Fetch a single published post by slug from the CMS API. */
export async function getBlogPostBySlug(
  slug: string,
): Promise<BlogPost | null> {
  try {
    const res = await fetch(
      `${apiBase()}/api/blog/posts/${encodeURIComponent(slug)}`,
      { next: { revalidate: 60 } },
    );
    if (res.ok) {
      const post = (await res.json()) as ApiPost;
      if (post.status !== "PUBLISHED") return null;
      return adaptApiPost(post);
    }
    if (res.status === 404) {
      // Fall through to markdown for legacy build-time posts
    } else {
      console.error("getBlogPostBySlug API error:", res.status);
    }
  } catch (err) {
    console.error("getBlogPostBySlug API failed, falling back to markdown:", err);
  }
  return getBlogPostBySlugFromMarkdown(slug);
}

// ─── Markdown fallback (seed / offline) ──────────────────

export function getBlogSlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  return fs
    .readdirSync(CONTENT_DIR)
    .filter((file) => file.endsWith(".md") || file.endsWith(".mdx"))
    .map((file) => file.replace(/\.(md|mdx)$/, ""));
}

function getBlogPostBySlugFromMarkdown(slug: string): BlogPost | null {
  const mdPath = path.join(CONTENT_DIR, `${slug}.md`);
  const mdxPath = path.join(CONTENT_DIR, `${slug}.mdx`);

  const filePath = fs.existsSync(mdPath) ? mdPath : mdxPath;
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");

  const frontmatterMatch = raw.match(
    /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/,
  );

  let title = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  let excerpt = "";
  let date = new Date().toISOString().split("T")[0];
  let category = "";
  let coverImage = "";
  let content = raw;

  if (frontmatterMatch) {
    const fmBlock = frontmatterMatch[1];
    content = frontmatterMatch[2];

    const titleMatch = fmBlock.match(/^title:\s*(.+)$/m);
    const excerptMatch = fmBlock.match(/^excerpt:\s*(.+)$/m);
    const dateMatch = fmBlock.match(/^date:\s*(.+)$/m);
    const publishedAtMatch = fmBlock.match(/^publishedAt:\s*(.+)$/m);
    const categoryMatch = fmBlock.match(/^category:\s*(.+)$/m);
    const coverMatch = fmBlock.match(/^featuredImage:\s*(.+)$/m);
    const coverAltMatch = fmBlock.match(/^cover_image:\s*(.+)$/m);
    if (coverAltMatch)
      coverImage = coverAltMatch[1].trim().replace(/^["']|["']$/g, "");
    else if (coverMatch)
      coverImage = coverMatch[1].trim().replace(/^["']|["']$/g, "");

    if (titleMatch) title = titleMatch[1].trim().replace(/^["']|["']$/g, "");
    if (excerptMatch)
      excerpt = excerptMatch[1].trim().replace(/^["']|["']$/g, "");
    if (dateMatch) date = dateMatch[1].trim().replace(/^["']|["']$/g, "");
    else if (publishedAtMatch)
      date = publishedAtMatch[1]
        .trim()
        .replace(/^["']|["']$/g, "")
        .split("T")[0];
    if (categoryMatch)
      category = categoryMatch[1].trim().replace(/^["']|["']$/g, "");
  }

  return {
    slug,
    title,
    excerpt,
    date,
    category,
    coverImage,
    content,
    readTime: estimateReadTime(content),
  };
}

function getAllBlogPostsFromMarkdown(): BlogPost[] {
  const slugs = getBlogSlugs();
  return slugs
    .map((slug) => getBlogPostBySlugFromMarkdown(slug))
    .filter((post): post is BlogPost => post !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

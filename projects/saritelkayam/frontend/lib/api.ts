// API client for admin CMS
// All calls go through relative /api/ (proxied by Next.js rewrites)

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string | null;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  authors?: Array<{
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    bio: string | null;
  }>;
}

export interface CreatePostData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  status: "DRAFT" | "PUBLISHED";
  publishedAt?: string;
  authorNames?: string[];
}

export interface UpdatePostData extends Partial<CreatePostData> {}

// ─── Public API ──────────────────────────────────────────

/** Get all published blog posts */
export async function getPublishedPosts(): Promise<Post[]> {
  const res = await fetch("/api/blog/posts");
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
}

/** Get a single published post by slug */
export async function getPublishedPostBySlug(slug: string): Promise<Post> {
  const res = await fetch(`/api/blog/posts/${slug}`);
  if (!res.ok) throw new Error("Post not found");
  return res.json();
}

// ─── Admin API ───────────────────────────────────────────

/** Get all posts (including drafts) — for admin */
export async function getPosts(): Promise<Post[]> {
  const res = await fetch("/api/admin/blog/posts");
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
}

/** Get a single post by ID — for admin editing */
export async function getPost(id: string): Promise<Post> {
  const posts = await getPosts();
  const post = posts.find((p) => p.id === id);
  if (!post) throw new Error("Post not found");
  return post;
}

/** Create a new blog post */
export async function createPost(data: CreatePostData): Promise<Post> {
  const res = await fetch("/api/admin/blog/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create post");
  }
  return res.json();
}

/** Update an existing blog post */
export async function updatePost(
  id: string,
  data: UpdatePostData,
): Promise<Post> {
  const res = await fetch(`/api/admin/blog/posts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to update post");
  }
  return res.json();
}

/** Delete a blog post */
export async function deletePost(id: string): Promise<void> {
  const res = await fetch(`/api/admin/blog/posts/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to delete post");
  }
}

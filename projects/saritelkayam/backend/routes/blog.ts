import { Router, Request, Response } from "express";
import * as fs from "fs";
import * as path from "path";
import db from "../lib/db";

const router = Router();

// ─── Public Routes ───────────────────────────────────────

// GET /api/blog/posts — List published posts
router.get("/blog/posts", async (_req: Request, res: Response) => {
  try {
    const posts = await db.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      include: { authors: true },
    });
    res.json(posts);
  } catch (error) {
    console.error("GET /blog/posts error:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// GET /api/blog/posts/:slug — Single post by slug
router.get("/blog/posts/:slug", async (req: Request, res: Response) => {
  try {
    const post = await db.post.findUnique({
      where: { slug: String(req.params.slug) },
      include: { authors: true },
    });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json(post);
  } catch (error) {
    console.error("GET /blog/posts/:slug error:", error);
    res.status(500).json({ error: "Failed to fetch post" });
  }
});

// ─── Admin Routes ────────────────────────────────────────

// GET /admin/blog/posts — List all posts (including drafts)
router.get("/admin/blog/posts", async (_req: Request, res: Response) => {
  try {
    const posts = await db.post.findMany({
      orderBy: { updatedAt: "desc" },
      include: { authors: true },
    });
    res.json(posts);
  } catch (error) {
    console.error("GET /admin/blog/posts error:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// GET /admin/blog/posts/:id — Single post by ID (for editing)
router.get("/admin/blog/posts/:id", async (req: Request, res: Response) => {
  try {
    const post = await db.post.findUnique({
      where: { id: String(req.params.id) },
      include: { authors: true },
    });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.json(post);
  } catch (error) {
    console.error("GET /admin/blog/posts/:id error:", error);
    res.status(500).json({ error: "Failed to fetch post" });
  }
});

// POST /api/admin/blog/posts — Create post
router.post("/admin/blog/posts", async (req: Request, res: Response) => {
  try {
    const {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      status,
      publishedAt,
      authorNames,
    } = req.body;

    // Find or create authors
    const authors: any[] = [];
    if (authorNames && authorNames.length > 0) {
      for (const name of authorNames) {
        let author = await db.author.findFirst({ where: { name } });
        if (!author) {
          author = await db.author.create({
            data: {
              name,
              email: `${name.toLowerCase().replace(/\s+/g, ".")}@saritelkayam.com`,
            },
          });
        }
        authors.push(author);
      }
    }

    const post = await db.post.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        featuredImage,
        status,
        publishedAt: status === "PUBLISHED" ? publishedAt || new Date() : null,
        authors: { connect: authors.map((a) => ({ id: a.id })) },
      },
    });

    // Write markdown file
    await savePostAsMarkdown(post);

    res.status(201).json(post);
  } catch (error) {
    console.error("POST /admin/blog/posts error:", error);
    res.status(500).json({ error: "Failed to create post" });
  }
});

// PUT /api/admin/blog/posts/:id — Update post
router.put("/admin/blog/posts/:id", async (req: Request, res: Response) => {
  try {
    const postId = String(req.params.id);
    const {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      status,
      publishedAt,
      authorNames,
    } = req.body;

    const existing = await db.post.findUnique({ where: { id: postId } });
    if (!existing) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Find or create authors
    const authors: any[] = [];
    if (authorNames && authorNames.length > 0) {
      for (const name of authorNames) {
        let author = await db.author.findFirst({ where: { name } });
        if (!author) {
          author = await db.author.create({
            data: {
              name,
              email: `${name.toLowerCase().replace(/\s+/g, ".")}@saritelkayam.com`,
            },
          });
        }
        authors.push(author);
      }
    }

    const authorIds = authors.map((a) => a.id);
    const post = await db.post.update({
      where: { id: postId },
      data: {
        title,
        slug,
        excerpt,
        content,
        featuredImage,
        status,
        publishedAt: status === "PUBLISHED" ? publishedAt || new Date() : null,
        authors: { set: authorIds.map((id) => ({ id })) },
      },
    });

    // Write markdown file
    await savePostAsMarkdown(post);

    res.json(post);
  } catch (error) {
    console.error("PUT /admin/blog/posts/:id error:", error);
    res.status(500).json({ error: "Failed to update post" });
  }
});

// DELETE /api/admin/blog/posts/:id — Delete post
router.delete("/admin/blog/posts/:id", async (req: Request, res: Response) => {
  try {
    const postId = String(req.params.id);

    const existing = await db.post.findUnique({ where: { id: postId } });
    if (!existing) {
      return res.status(404).json({ error: "Post not found" });
    }

    await db.post.delete({ where: { id: postId } });

    // Delete markdown file
    const filePath = path.join(
      process.cwd(),
      "..",
      "frontend",
      "public",
      "content",
      "posts",
      `${existing.slug}.md`,
    );
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ success: true });
  } catch (error) {
    console.error("DELETE /admin/blog/posts/:id error:", error);
    res.status(500).json({ error: "Failed to delete post" });
  }
});

// ─── Markdown Content Pipeline ───────────────────────────

const CONTENT_DIR = path.join(
  process.cwd(),
  "..",
  "frontend",
  "public",
  "content",
  "posts",
);

async function savePostAsMarkdown(post: any) {
  const authors = post.authors?.map((a: any) => a.name).join(", ") || "";
  const frontmatter = `---
title: ${escapeYaml(post.title)}
slug: ${post.slug}
excerpt: ${escapeYaml(post.excerpt)}
featuredImage: ${post.featuredImage || ""}
status: ${post.status}
publishedAt: ${post.publishedAt?.toISOString() || ""}
authors: ${escapeYaml(authors)}
---

${post.content}`;

  // Ensure directory exists
  if (!fs.existsSync(CONTENT_DIR)) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
  }

  const filePath = path.join(CONTENT_DIR, `${post.slug}.md`);
  fs.writeFileSync(filePath, frontmatter, "utf-8");
  console.log(`Markdown written: ${filePath}`);
}

function escapeYaml(value: string): string {
  if (!value) return "";
  // If value contains special YAML characters, wrap in quotes
  if (
    /[[:\{\}\[\]]/.test(value) ||
    value.includes("#") ||
    value.includes("'") ||
    value.includes('"')
  ) {
    return `"${value.replace(/"/g, '\\"')}"`;
  }
  return value;
}

export default router;

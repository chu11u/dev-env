import { Router, Request, Response } from "express";
import * as fs from "fs";
import * as path from "path";
import db from "../lib/db";

const router = Router();

const HOMEPAGE_POST_LIMIT = 3;

/**
 * Keep homepage slots in sync with the latest published posts.
 * Marks the N most recent PUBLISHED posts as showOnHomepage=true; clears the rest.
 * Call after each new publish (Genie) or via POST /admin/blog/posts/sync-homepage.
 */
async function syncHomepageToLatest(limit = HOMEPAGE_POST_LIMIT) {
  const latest = await db.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: limit,
    select: { id: true },
  });
  const latestIds = latest.map((p) => p.id);

  await db.post.updateMany({
    where: { showOnHomepage: true, id: { notIn: latestIds } },
    data: { showOnHomepage: false },
  });

  if (latestIds.length > 0) {
    await db.post.updateMany({
      where: { id: { in: latestIds } },
      data: { showOnHomepage: true },
    });
  }
}

/** If more than `limit` posts are flagged, drop the oldest (keeps `preferId` if set). */
async function capHomepageSlots(
  preferId?: string,
  limit = HOMEPAGE_POST_LIMIT,
) {
  const featured = await db.post.findMany({
    where: { status: "PUBLISHED", showOnHomepage: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    select: { id: true },
  });
  if (featured.length <= limit) return;

  const keep = new Set<string>();
  if (preferId) keep.add(preferId);
  for (const p of featured) {
    if (keep.size >= limit) break;
    keep.add(p.id);
  }

  await db.post.updateMany({
    where: { showOnHomepage: true, id: { notIn: [...keep] } },
    data: { showOnHomepage: false },
  });
}

// ─── Public Routes ───────────────────────────────────────

// GET /api/blog/posts/featured — Homepage posts (must be before :slug)
router.get("/blog/posts/featured", async (_req: Request, res: Response) => {
  try {
    let posts = await db.post.findMany({
      where: { status: "PUBLISHED", showOnHomepage: true },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: HOMEPAGE_POST_LIMIT,
      include: { authors: true },
    });

    // Fallback if nothing flagged yet: latest published
    if (posts.length === 0) {
      posts = await db.post.findMany({
        where: { status: "PUBLISHED" },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        take: HOMEPAGE_POST_LIMIT,
        include: { authors: true },
      });
    }

    res.json(posts);
  } catch (error) {
    console.error("GET /blog/posts/featured error:", error);
    res.status(500).json({ error: "Failed to fetch featured posts" });
  }
});

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

// POST /admin/blog/posts/sync-homepage — Recompute latest-N for homepage (Genie)
router.post(
  "/admin/blog/posts/sync-homepage",
  async (_req: Request, res: Response) => {
    try {
      await syncHomepageToLatest();
      const posts = await db.post.findMany({
        where: { status: "PUBLISHED", showOnHomepage: true },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        take: HOMEPAGE_POST_LIMIT,
        include: { authors: true },
      });
      res.json({ synced: true, limit: HOMEPAGE_POST_LIMIT, posts });
    } catch (error) {
      console.error("POST /admin/blog/posts/sync-homepage error:", error);
      res.status(500).json({ error: "Failed to sync homepage posts" });
    }
  },
);

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
      showOnHomepage,
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

    const isPublished = status === "PUBLISHED";
    // New published posts default onto the homepage; drafts stay off
    const onHomepage =
      isPublished &&
      (showOnHomepage === undefined ? true : Boolean(showOnHomepage));

    const post = await db.post.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        featuredImage,
        showOnHomepage: onHomepage,
        status,
        publishedAt: isPublished ? publishedAt || new Date() : null,
        authors: { connect: authors.map((a) => ({ id: a.id })) },
      },
      include: { authors: true },
    });

    if (isPublished) {
      await syncHomepageToLatest();
    }

    const refreshed = await db.post.findUnique({
      where: { id: post.id },
      include: { authors: true },
    });

    await savePostAsMarkdown(refreshed || post);

    res.status(201).json(refreshed || post);
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
      showOnHomepage,
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

    const isPublished = status === "PUBLISHED";
    const authorIds = authors.map((a) => a.id);

    const data: Record<string, unknown> = {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      status,
      publishedAt: isPublished
        ? publishedAt || existing.publishedAt || new Date()
        : null,
    };

    if (showOnHomepage !== undefined) {
      data.showOnHomepage = isPublished ? Boolean(showOnHomepage) : false;
    } else if (!isPublished) {
      data.showOnHomepage = false;
    }

    if (authorIds.length > 0 || authorNames) {
      data.authors = { set: authorIds.map((id) => ({ id })) };
    }

    const wasPublished = existing.status === "PUBLISHED";
    const justPublished = isPublished && !wasPublished;

    await db.post.update({
      where: { id: postId },
      data: data as any,
    });

    // Newly published → recompute latest 3 (Genie-friendly default)
    if (justPublished) {
      await syncHomepageToLatest();
    } else if (isPublished && showOnHomepage === true) {
      // Manual "show on homepage" check — cap at 3 without forcing latest-by-date
      await capHomepageSlots(postId);
    }

    const post = await db.post.findUnique({
      where: { id: postId },
      include: { authors: true },
    });

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

    // Backfill homepage slots after a featured post is removed
    if (existing.showOnHomepage) {
      await syncHomepageToLatest();
    }

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
  if (!post) return;
  const authors = post.authors?.map((a: any) => a.name).join(", ") || "";
  const frontmatter = `---
title: ${escapeYaml(post.title)}
slug: ${post.slug}
excerpt: ${escapeYaml(post.excerpt)}
featuredImage: ${post.featuredImage || ""}
showOnHomepage: ${post.showOnHomepage ? "true" : "false"}
status: ${post.status}
publishedAt: ${post.publishedAt?.toISOString?.() || post.publishedAt || ""}
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

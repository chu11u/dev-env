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

export function getBlogSlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  return fs
    .readdirSync(CONTENT_DIR)
    .filter((file) => file.endsWith(".md") || file.endsWith(".mdx"))
    .map((file) => file.replace(/\.(md|mdx)$/, ""));
}

export function getBlogPostBySlug(slug: string): BlogPost | null {
  const mdPath = path.join(CONTENT_DIR, `${slug}.md`);
  const mdxPath = path.join(CONTENT_DIR, `${slug}.mdx`);

  const filePath = fs.existsSync(mdPath) ? mdPath : mdxPath;
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");

  // Parse frontmatter (simple YAML-like: key: value between --- markers)
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
    if (coverMatch)
      coverImage = coverMatch[1].trim().replace(/^["']|["']$/g, "");
  }

  const readTime = Math.max(
    1,
    Math.ceil(
      content
        .replace(/#{1,6}\s.+/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .split(/\s+/).length / 200,
    ),
  );

  return {
    slug,
    title,
    excerpt,
    date,
    category,
    coverImage,
    content,
    readTime,
  };
}

export function getAllBlogPosts(): BlogPost[] {
  const slugs = getBlogSlugs();
  return slugs
    .map((slug) => getBlogPostBySlug(slug))
    .filter((post): post is BlogPost => post !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

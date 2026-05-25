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

// ─── Public Types (bilingual API responses) ──────────────

export interface ApiTestimonial {
  id: string;
  nameEn: string;
  nameHe: string;
  textEn: string;
  textHe: string;
  serviceEn: string;
  serviceHe: string;
  rating: number;
  avatar: string | null;
  featured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiProduct {
  id: string;
  nameEn: string;
  nameHe: string;
  category: string;
  descriptionEn: string;
  descriptionHe: string;
  price: string;
  size: string;
  image: string | null;
  badge: string | null;
  rating: number;
  featured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiService {
  id: string;
  category: string;
  titleEn: string;
  titleHe: string;
  descriptionEn: string;
  descriptionHe: string;
  duration: string;
  price: string;
  image: string | null;
  featuresEn: string[];
  featuresHe: string[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Locale-aware adapt helpers ──────────────────────────

/** Transform API testimonial into locale-specific shape */
export function adaptTestimonial(t: ApiTestimonial, locale: string) {
  return {
    id: t.id,
    name: locale === "he" ? t.nameHe : t.nameEn,
    text: locale === "he" ? t.textHe : t.textEn,
    service: locale === "he" ? t.serviceHe : t.serviceEn,
    rating: t.rating,
    avatar: t.avatar,
    date: t.createdAt,
  };
}

/** Transform API product into locale-specific shape */
export function adaptProduct(p: ApiProduct, locale: string) {
  return {
    id: p.id,
    name: locale === "he" ? p.nameHe : p.nameEn,
    category: p.category,
    description: locale === "he" ? p.descriptionHe : p.descriptionEn,
    price: p.price,
    size: p.size,
    image: p.image || "/assets/products/luxury-bottle.png",
    badge: p.badge,
    rating: p.rating,
  };
}

/** Transform API service into locale-specific shape */
export function adaptService(s: ApiService, locale: string) {
  return {
    id: s.id,
    category: s.category,
    title: locale === "he" ? s.titleHe : s.titleEn,
    description: locale === "he" ? s.descriptionHe : s.descriptionEn,
    duration: s.duration,
    price: s.price,
    image: s.image,
    features: locale === "he" ? s.featuresHe : s.featuresEn,
  };
}

/** Fetch testimonials from public API */
export async function fetchTestimonials(
  featuredOnly = false,
): Promise<ApiTestimonial[]> {
  const url = featuredOnly ? "/api/testimonials/featured" : "/api/testimonials";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch testimonials");
  return res.json();
}

/** Fetch products from public API */
export async function fetchProducts(
  featuredOnly = false,
): Promise<ApiProduct[]> {
  const url = featuredOnly ? "/api/products/featured" : "/api/products";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

/** Fetch services from public API */
export async function fetchServices(): Promise<ApiService[]> {
  const res = await fetch("/api/services");
  if (!res.ok) throw new Error("Failed to fetch services");
  return res.json();
}

// ─── Category translation maps ────────────────────────────

/** Product category display names per locale */
export const PRODUCT_CATEGORY_LABELS: Record<string, string> = {
  Cleansers: "משתפים",
  Serums: "סרומים",
  Moisturizers: "קרמים",
  "Sun Protection": "הגנה מהשמש",
};

/** Display a product category in the current locale */
export function getCategoryLabel(category: string, locale: string): string {
  return locale === "he"
    ? PRODUCT_CATEGORY_LABELS[category] || category
    : category;
}

/** Service category icon + display name per locale */
export const SERVICE_CATEGORY_META: Record<
  string,
  { icon: string; labelHe: string }
> = {
  Facials: { icon: "💆‍♀️", labelHe: "פילינגים" },
  "Skin Analysis": { icon: "🔬", labelHe: "אבחון עור" },
  "Body Treatments": { icon: "✨", labelHe: "טיפולי גוף" },
  Makeup: { icon: "💄", labelHe: "איפור" },
};

/** Display a service category name in the current locale */
export function getServiceCategoryLabel(
  category: string,
  locale: string,
): string {
  const meta = SERVICE_CATEGORY_META[category];
  return locale === "he" ? meta?.labelHe || category : category;
}

/** Get the icon for a service category */
export function getServiceCategoryIcon(category: string): string {
  return SERVICE_CATEGORY_META[category]?.icon || "✨";
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

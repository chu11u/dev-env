// Admin API client for managing all site content
// All calls go through relative /api/ (proxied by Next.js rewrites)

// ─── TypeScript Interfaces ──────────────────────────────────

export interface Testimonial {
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

export interface CreateTestimonialData {
  nameEn: string;
  nameHe: string;
  textEn: string;
  textHe: string;
  serviceEn: string;
  serviceHe: string;
  rating: number;
  avatar?: string;
  featured?: boolean;
  sortOrder?: number;
}

export interface UpdateTestimonialData extends Partial<CreateTestimonialData> {}

export interface Product {
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

export interface CreateProductData {
  nameEn: string;
  nameHe: string;
  category: string;
  descriptionEn: string;
  descriptionHe: string;
  price: string;
  size: string;
  image?: string;
  badge?: string;
  rating?: number;
  featured?: boolean;
  sortOrder?: number;
}

export interface UpdateProductData extends Partial<CreateProductData> {}

export interface Service {
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

export interface CreateServiceData {
  category: string;
  titleEn: string;
  titleHe: string;
  descriptionEn: string;
  descriptionHe: string;
  duration: string;
  price: string;
  image?: string;
  featuresEn?: string[];
  featuresHe?: string[];
  sortOrder?: number;
}

export interface UpdateServiceData extends Partial<CreateServiceData> {}

export interface Setting {
  id: string;
  key: string;
  valueEn: string;
  valueHe: string;
  category: string;
  updatedAt: string;
}

export interface CreateSettingData {
  key: string;
  valueEn: string;
  valueHe: string;
  category?: string;
}

export interface UpdateSettingData {
  valueEn?: string;
  valueHe?: string;
  category?: string;
}

// ─── Helper: fetch with error handling ──────────────────────

async function apiFetch(path: string, options?: RequestInit): Promise<any> {
  const res = await fetch(path, options);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || `Request failed with status ${res.status}`);
  }
  return res.json();
}

// ─── Testimonials API ───────────────────────────────────────

export async function getTestimonials(): Promise<Testimonial[]> {
  return apiFetch("/api/admin/testimonials");
}

export async function getPublicTestimonials(): Promise<Testimonial[]> {
  return apiFetch("/api/testimonials");
}

export async function getFeaturedTestimonials(): Promise<Testimonial[]> {
  return apiFetch("/api/testimonials/featured");
}

export async function createTestimonial(
  data: CreateTestimonialData,
): Promise<Testimonial> {
  return apiFetch("/api/admin/testimonials", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function updateTestimonial(
  id: string,
  data: UpdateTestimonialData,
): Promise<Testimonial> {
  return apiFetch(`/api/admin/testimonials/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function deleteTestimonial(id: string): Promise<void> {
  await apiFetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
}

// ─── Products API ───────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  return apiFetch("/api/admin/products");
}

export async function getPublicProducts(): Promise<Product[]> {
  return apiFetch("/api/products");
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return apiFetch("/api/products/featured");
}

export async function getProductsByCategory(
  category: string,
): Promise<Product[]> {
  return apiFetch(`/api/products/category/${category}`);
}

export async function createProduct(data: CreateProductData): Promise<Product> {
  return apiFetch("/api/admin/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function updateProduct(
  id: string,
  data: UpdateProductData,
): Promise<Product> {
  return apiFetch(`/api/admin/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function deleteProduct(id: string): Promise<void> {
  await apiFetch(`/api/admin/products/${id}`, { method: "DELETE" });
}

// ─── Services API ───────────────────────────────────────────

export async function getServices(): Promise<Service[]> {
  return apiFetch("/api/admin/services");
}

export async function getPublicServices(): Promise<Service[]> {
  return apiFetch("/api/services");
}

export async function getServicesByCategory(
  category: string,
): Promise<Service[]> {
  return apiFetch(`/api/services/category/${category}`);
}

export async function createService(data: CreateServiceData): Promise<Service> {
  return apiFetch("/api/admin/services", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function updateService(
  id: string,
  data: UpdateServiceData,
): Promise<Service> {
  return apiFetch(`/api/admin/services/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function deleteService(id: string): Promise<void> {
  await apiFetch(`/api/admin/services/${id}`, { method: "DELETE" });
}

// ─── Settings API ───────────────────────────────────────────

export async function getSettings(): Promise<Setting[]> {
  return apiFetch("/api/admin/settings");
}

export async function getPublicSettings(): Promise<Setting[]> {
  return apiFetch("/api/settings");
}

export async function getSetting(key: string): Promise<Setting> {
  return apiFetch(`/api/settings/${key}`);
}

export async function createSetting(data: CreateSettingData): Promise<Setting> {
  return apiFetch("/api/admin/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function updateSetting(
  key: string,
  data: UpdateSettingData,
): Promise<Setting> {
  return apiFetch(`/api/admin/settings/${key}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function deleteSetting(key: string): Promise<void> {
  await apiFetch(`/api/admin/settings/${key}`, { method: "DELETE" });
}

// ─── Constants ──────────────────────────────────────────────

export const PRODUCT_CATEGORIES = [
  "Cleansers",
  "Serums",
  "Moisturizers",
  "Sun Protection",
];

export const SERVICE_CATEGORIES = [
  "Facials",
  "Skin Analysis",
  "Body Treatments",
  "Makeup",
];

export const SETTING_CATEGORIES = [
  "General",
  "Contact",
  "Social",
  "Hours",
  "Display",
];

/** Match category names case-insensitively (seed uses lowercase, frontend uses Title Case) */
export function matchSettingCategory(
  settingCategory: string,
  categoryName: string,
): boolean {
  return settingCategory.toLowerCase() === categoryName.toLowerCase();
}

/** All categories that have a price visibility toggle */
export const PRICE_TOGGLE_CATEGORIES = [
  { key: "pricesFacials", label: "Facials" },
  { key: "pricesSkinAnalysis", label: "Skin Analysis" },
  { key: "pricesBodyTreatments", label: "Body Treatments" },
  { key: "pricesMakeup", label: "Makeup" },
  { key: "pricesCleansers", label: "Cleansers" },
  { key: "pricesSerums", label: "Serums" },
  { key: "pricesMoisturizers", label: "Moisturizers" },
  { key: "pricesSunProtection", label: "Sun Protection" },
];

/** Check if prices should be shown for a given category */
export function shouldShowPrice(
  settings: Setting[],
  category: string,
): boolean {
  const toggleKey = `prices${category}`;
  const setting = settings.find((s) => s.key === toggleKey);
  if (!setting) return true; // Default: show prices
  return setting.valueEn === "true";
}

/** Map a service/product category to its price toggle key */
export function getCategoryPriceKey(category: string): string {
  return `prices${category}`;
}

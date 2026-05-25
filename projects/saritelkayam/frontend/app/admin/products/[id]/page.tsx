"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getProducts, updateProduct } from "@/lib/admin-api";
import type { Product } from "@/lib/admin-api";
import { PRODUCT_CATEGORIES } from "@/lib/admin-api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useTranslation } from "@/lib/i18n";
import { ImageUpload } from "@/components/admin/ImageUpload";

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const productId = String(id);
  const { t } = useTranslation();

  const [product, setProduct] = useState<Product | null>(null);
  const [nameEn, setNameEn] = useState("");
  const [nameHe, setNameHe] = useState("");
  const [category, setCategory] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionHe, setDescriptionHe] = useState("");
  const [price, setPrice] = useState("");
  const [size, setSize] = useState("");
  const [image, setImage] = useState("");
  const [badge, setBadge] = useState("");
  const [rating, setRating] = useState(5);
  const [featured, setFeatured] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const all = await getProducts();
        const found = all.find((p) => p.id === productId);
        if (!found) {
          setError("Product not found.");
          setIsLoading(false);
          return;
        }
        setProduct(found);
        setNameEn(found.nameEn);
        setNameHe(found.nameHe);
        setCategory(found.category);
        setDescriptionEn(found.descriptionEn);
        setDescriptionHe(found.descriptionHe);
        setPrice(found.price);
        setSize(found.size);
        setImage(found.image || "");
        setBadge(found.badge || "");
        setRating(found.rating);
        setFeatured(found.featured);
        setIsLoading(false);
      } catch {
        setError("Failed to load product.");
        setIsLoading(false);
      }
    };
    loadProduct();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!nameHe || !descriptionHe || !price) {
      setError("Please fill in all required Hebrew fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProduct(productId, {
        nameEn: nameEn || nameHe,
        nameHe,
        category,
        descriptionEn: descriptionEn || descriptionHe,
        descriptionHe,
        price,
        size: size || "",
        image: image || undefined,
        badge: badge || undefined,
        rating,
        featured,
      });
      setSuccess("Product updated successfully!");
      setTimeout(() => router.push("/admin/products"), 1000);
    } catch {
      setError("Failed to update product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <p className="font-body text-charcoal-500">Loading product...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <a
          href="/admin/products"
          className="font-body text-sm text-rose-400 hover:text-rose-500 transition-colors mb-4 inline-block"
        >
          ← Back to Products
        </a>
        <h1 className="font-heading text-3xl font-bold text-charcoal-800 mb-2">
          {t.productEditTitle}
        </h1>
        <p className="font-body text-charcoal-500">Update product details.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="p-6 md:p-8 space-y-6 max-w-4xl">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl font-body text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl font-body text-sm">
              {success}
            </div>
          )}

          {/* Name fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Name (English)"
              name="nameEn"
              placeholder="Hydrating Serum"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
            />
            <Input
              label="שם (עברית)"
              name="nameHe"
              placeholder="סרום מלחלח"
              value={nameHe}
              onChange={(e) => setNameHe(e.target.value)}
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-medium text-charcoal-700 block mb-1.5">
              Category <span className="text-rose-400">*</span>
            </label>
            <select
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl border border-cream-300 bg-white px-4 py-2.5 text-charcoal-600 transition duration-200 input-focus"
              required
            >
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Textarea
              label="Description (English)"
              name="descriptionEn"
              placeholder="Product description..."
              value={descriptionEn}
              onChange={(e) => setDescriptionEn(e.target.value)}
              rows={4}
            />
            <Textarea
              label="תיאור (עברית)"
              name="descriptionHe"
              placeholder="תיאור המוצר..."
              value={descriptionHe}
              onChange={(e) => setDescriptionHe(e.target.value)}
              rows={4}
              required
            />
          </div>

          {/* Price and Size */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Price"
              name="price"
              placeholder="₪180"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
            <Input
              label="Size"
              name="size"
              placeholder="50ml"
              value={size}
              onChange={(e) => setSize(e.target.value)}
            />
          </div>

          {/* Product Image */}
          <ImageUpload
            label="Product Image"
            value={image}
            onChange={(url) => setImage(url)}
          />

          {/* Badge */}
          <div>
            <label className="text-sm font-medium text-charcoal-700 block mb-1.5">
              Badge (optional)
            </label>
            <select
              name="badge"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              className="rounded-xl border border-cream-300 bg-white px-4 py-2.5 text-charcoal-600 transition duration-200 input-focus"
            >
              <option value="">None</option>
              <option value="popular">Popular</option>
              <option value="new">New</option>
              <option value="bestseller">Bestseller</option>
            </select>
          </div>

          {/* Rating */}
          <div>
            <label className="text-sm font-medium text-charcoal-700 block mb-2">
              Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-3xl transition-colors ${star <= rating ? "text-gold-500" : "text-charcoal-200"}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* Featured checkbox */}
          <div className="flex items-center gap-3 pt-4 border-t border-cream-200">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-charcoal-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-rose-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-rose-400 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              <span className="ms-3 font-body text-sm text-charcoal-600">
                Featured (show on homepage)
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-cream-200">
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : t.adminSave}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/products")}
            >
              {t.adminCancel}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}

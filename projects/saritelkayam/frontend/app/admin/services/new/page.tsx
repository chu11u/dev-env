"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createService } from "@/lib/admin-api";
import { SERVICE_CATEGORIES } from "@/lib/admin-api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { useTranslation } from "@/lib/i18n";

export default function NewServicePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [category, setCategory] = useState(SERVICE_CATEGORIES[0]);
  const [titleEn, setTitleEn] = useState("");
  const [titleHe, setTitleHe] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionHe, setDescriptionHe] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [featuresEn, setFeaturesEn] = useState("");
  const [featuresHe, setFeaturesHe] = useState("");
  const [image, setImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!titleHe || !descriptionHe || !duration || !price) {
      setError("Please fill in all required Hebrew fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createService({
        category,
        titleEn: titleEn || titleHe,
        titleHe,
        descriptionEn: descriptionEn || descriptionHe,
        descriptionHe,
        duration,
        price,
        image: image || undefined,
        featuresEn: featuresEn
          .split("\n")
          .filter((line) => line.trim())
          .map((line) => line.trim()),
        featuresHe: featuresHe
          .split("\n")
          .filter((line) => line.trim())
          .map((line) => line.trim()),
        sortOrder: 0,
      });
      setSuccess("Service created successfully!");
      setTimeout(() => router.push("/admin/services"), 1000);
    } catch {
      setError("Failed to create service. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <a
          href="/admin/services"
          className="font-body text-sm text-rose-400 hover:text-rose-500 transition-colors mb-4 inline-block"
        >
          ← Back to Services
        </a>
        <h1 className="font-heading text-3xl font-bold text-charcoal-800 mb-2">
          {t.serviceNewTitle}
        </h1>
        <p className="font-body text-charcoal-500">
          Add a new beauty treatment or service.
        </p>
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
              {SERVICE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Title fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Title (English)"
              name="titleEn"
              placeholder="Signature Facial"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
            />
            <Input
              label="כותרת (עברית)"
              name="titleHe"
              placeholder="פילינג סיגניצ'ר"
              value={titleHe}
              onChange={(e) => setTitleHe(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Textarea
              label="Description (English)"
              name="descriptionEn"
              placeholder="Service description..."
              value={descriptionEn}
              onChange={(e) => setDescriptionEn(e.target.value)}
              rows={4}
            />
            <Textarea
              label="תיאור (עברית)"
              name="descriptionHe"
              placeholder="תיאור הטיפול..."
              value={descriptionHe}
              onChange={(e) => setDescriptionHe(e.target.value)}
              rows={4}
              required
            />
          </div>

          {/* Duration and Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Duration"
              name="duration"
              placeholder="60 minutes"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
            />
            <Input
              label="Price"
              name="price"
              placeholder="₪250"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          {/* Image */}
          <ImageUpload
            label="Service Image"
            value={image}
            onChange={(url) => setImage(url)}
          />

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Textarea
              label="Features (English, one per line)"
              name="featuresEn"
              placeholder={"Gentle exfoliation\nCustom mask\nHydrating serum"}
              value={featuresEn}
              onChange={(e) => setFeaturesEn(e.target.value)}
              rows={6}
            />
            <Textarea
              label="תכונות (עברית, שורה לכל תכונה)"
              name="featuresHe"
              placeholder={"קילוף עדין\nמסכה מותאמת אישית\nסרום מלחלח"}
              value={featuresHe}
              onChange={(e) => setFeaturesHe(e.target.value)}
              rows={6}
            />
          </div>
          <p className="font-body text-xs text-charcoal-400">
            Each line becomes a feature bullet point in the service card.
          </p>

          {/* Preview */}
          {titleHe && (
            <div className="pt-4 border-t border-cream-200">
              <h3 className="font-heading text-sm font-semibold text-charcoal-600 mb-3">
                Preview
              </h3>
              <Card className="p-6 bg-cream-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-heading text-lg font-semibold text-charcoal-800">
                    {titleHe}
                  </h4>
                  <span className="font-body font-medium text-rose-400">
                    {price}
                  </span>
                </div>
                <p className="font-body text-sm text-charcoal-500 mb-3">
                  {duration}
                </p>
                <p className="font-body text-charcoal-600 mb-4">
                  {descriptionHe || "Service description will appear here..."}
                </p>
                {featuresHe && (
                  <ul className="space-y-1">
                    {featuresHe
                      .split("\n")
                      .filter((line) => line.trim())
                      .slice(0, 3)
                      .map((feature, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 font-body text-sm text-charcoal-500"
                        >
                          <span className="text-rose-400">✓</span>
                          {feature.trim()}
                        </li>
                      ))}
                  </ul>
                )}
              </Card>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-cream-200">
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : t.adminSave}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/services")}
            >
              {t.adminCancel}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}

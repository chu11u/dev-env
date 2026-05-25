"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getTestimonials, updateTestimonial } from "@/lib/admin-api";
import type { Testimonial } from "@/lib/admin-api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useTranslation } from "@/lib/i18n";
import { ImageUpload } from "@/components/admin/ImageUpload";

export default function EditTestimonialPage() {
  const router = useRouter();
  const { id } = useParams();
  const testimonialId = String(id);
  const { t } = useTranslation();

  const [testimonial, setTestimonial] = useState<Testimonial | null>(null);
  const [nameEn, setNameEn] = useState("");
  const [nameHe, setNameHe] = useState("");
  const [textEn, setTextEn] = useState("");
  const [textHe, setTextHe] = useState("");
  const [serviceEn, setServiceEn] = useState("");
  const [serviceHe, setServiceHe] = useState("");
  const [rating, setRating] = useState(5);
  const [avatar, setAvatar] = useState("");
  const [featured, setFeatured] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadTestimonial = async () => {
      try {
        const all = await getTestimonials();
        const found = all.find((t) => t.id === testimonialId);
        if (!found) {
          setError("Testimonial not found.");
          setIsLoading(false);
          return;
        }
        setTestimonial(found);
        setNameEn(found.nameEn);
        setNameHe(found.nameHe);
        setTextEn(found.textEn);
        setTextHe(found.textHe);
        setServiceEn(found.serviceEn);
        setServiceHe(found.serviceHe);
        setRating(found.rating);
        setAvatar(found.avatar || "");
        setFeatured(found.featured);
        setIsLoading(false);
      } catch {
        setError("Failed to load testimonial.");
        setIsLoading(false);
      }
    };
    loadTestimonial();
  }, [testimonialId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!nameHe || !textHe || !serviceHe) {
      setError("Please fill in all required Hebrew fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateTestimonial(testimonialId, {
        nameEn: nameEn || nameHe,
        nameHe,
        textEn: textEn || textHe,
        textHe,
        serviceEn: serviceEn || serviceHe,
        serviceHe,
        rating,
        avatar: avatar || undefined,
        featured,
      });
      setSuccess("Testimonial updated successfully!");
      setTimeout(() => router.push("/admin/testimonials"), 1000);
    } catch {
      setError("Failed to update testimonial. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <p className="font-body text-charcoal-500">Loading testimonial...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <a
          href="/admin/testimonials"
          className="font-body text-sm text-rose-400 hover:text-rose-500 transition-colors mb-4 inline-block"
        >
          ← Back to Testimonials
        </a>
        <h1 className="font-heading text-3xl font-bold text-charcoal-800 mb-2">
          {t.testimonialEditTitle}
        </h1>
        <p className="font-body text-charcoal-500">
          Update testimonial details.
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

          {/* Name fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Name (English)"
              name="nameEn"
              placeholder="Jane Doe"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
            />
            <Input
              label="שם (עברית)"
              name="nameHe"
              placeholder="שרית אלקיים"
              value={nameHe}
              onChange={(e) => setNameHe(e.target.value)}
              required
            />
          </div>

          {/* Service fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Service (English)"
              name="serviceEn"
              placeholder="Signature Facial"
              value={serviceEn}
              onChange={(e) => setServiceEn(e.target.value)}
            />
            <Input
              label="טיפול (עברית)"
              name="serviceHe"
              placeholder="פילינג סיגניצ'ר"
              value={serviceHe}
              onChange={(e) => setServiceHe(e.target.value)}
              required
            />
          </div>

          {/* Testimonial text */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Textarea
              label="Testimonial Text (English)"
              name="textEn"
              placeholder="Write the testimonial in English..."
              value={textEn}
              onChange={(e) => setTextEn(e.target.value)}
              rows={4}
            />
            <Textarea
              label="טקסט ההמלצה (עברית)"
              name="textHe"
              placeholder="כתבו את ההמלצה בעברית..."
              value={textHe}
              onChange={(e) => setTextHe(e.target.value)}
              rows={4}
              required
            />
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

          {/* Avatar */}
          <ImageUpload
            label="Avatar Image (optional)"
            value={avatar}
            onChange={(url) => setAvatar(url)}
          />

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

          {/* Preview */}
          <div className="pt-4 border-t border-cream-200">
            <h3 className="font-heading text-sm font-semibold text-charcoal-600 mb-3">
              Preview
            </h3>
            <Card className="p-6 bg-cream-50">
              <div className="flex items-center gap-3 mb-4">
                {avatar ? (
                  <img
                    src={avatar}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                    <span className="text-rose-600 font-bold">
                      {nameHe?.charAt(0) || "?"}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-body font-medium text-charcoal-800">
                    {nameHe || "Client Name"}
                  </p>
                  <p className="font-body text-xs text-charcoal-400">
                    {serviceHe || "Service"}
                  </p>
                </div>
              </div>
              <p className="font-body text-charcoal-600 italic">
                "{textHe || "Testimonial text..."}"
              </p>
              <div className="mt-3 text-gold-500 text-sm">
                {"★".repeat(rating)}
                {"☆".repeat(5 - rating)}
              </div>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-cream-200">
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : t.adminSave}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/testimonials")}
            >
              {t.adminCancel}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}

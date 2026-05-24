"use client";

import { useEffect, useState } from "react";
import { FadeInSection } from "@/components/common/FadeInSection";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/layout/Section";
import { Badge } from "@/components/ui/Badge";
import { SectionDivider } from "@/components/common/SectionDivider";
import { Button } from "@/components/ui/Button";
import { Star } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { fetchTestimonials, adaptTestimonial } from "@/lib/api";

interface TestimonialItem {
  id: string;
  name: string;
  service: string;
  rating: number;
  text: string;
  date: string;
}

const fallbackItems: TestimonialItem[] = [
  {
    id: "1",
    name: "Rachel M.",
    service: "Signature Facial",
    rating: 5,
    date: "2026-05-10",
    text: "Sarit is absolutely amazing! My skin has never looked better.",
  },
  {
    id: "2",
    name: "Dana K.",
    service: "Skin Analysis",
    rating: 5,
    date: "2026-05-05",
    text: "The skin analysis opened my eyes to what my skin really needs.",
  },
  {
    id: "3",
    name: "Maya L.",
    service: "Bridal Makeup",
    rating: 5,
    date: "2026-04-28",
    text: "Sarit did my bridal makeup and I looked flawless all day!",
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${count} out of 5 stars`}>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={16}
          className={
            i < count ? "fill-gold-500 text-gold-500" : "text-cream-300"
          }
        />
      ))}
    </div>
  );
}

export default function TestimonialsPage() {
  const { t, locale } = useTranslation();
  const [items, setItems] = useState<TestimonialItem[]>(fallbackItems);
  const dateLocale = locale === "he" ? "he-IL" : "en-US";

  useEffect(() => {
    fetchTestimonials(false)
      .then((data) =>
        setItems(data.map((api) => adaptTestimonial(api, locale))),
      )
      .catch(() => {
        /* keep fallback */
      });
  }, [locale]);

  const avgRating =
    items.length > 0
      ? (
          items.reduce((sum, item) => sum + item.rating, 0) / items.length
        ).toFixed(1)
      : "5.0";

  return (
    <>
      {/* Page header */}
      <FadeInSection>
        <section className="bg-cream-100 py-8 md:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto">
              <Badge variant="accent">{t.testimonialsBadge}</Badge>
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal-800 mt-4 mb-4">
                {t.testimonialsTitle}
              </h1>
              <SectionDivider className="mb-4" />
              <p className="font-body text-charcoal-500">
                {t.testimonialsSubtitlePage}
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className="fill-gold-500 text-gold-500"
                    />
                  ))}
                </div>
                <span className="font-body text-sm text-charcoal-500">
                  {t.testimonialsAverageRating} {items.length}{" "}
                  {t.testimonialsReviews}
                </span>
              </div>
            </div>
          </div>
        </section>
      </FadeInSection>

      {/* Testimonials grid */}
      <FadeInSection>
        <Section bg="white">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item) => (
              <Card key={item.id} className="p-6 md:p-8 flex flex-col h-full">
                {/* Avatar + name */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-200 to-rose-400 flex items-center justify-center text-white font-heading font-semibold text-xl shrink-0">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-body font-semibold text-charcoal-800">
                      {item.name}
                    </p>
                    <Badge variant="default">{item.service}</Badge>
                  </div>
                </div>

                <div className="mb-3">
                  <StarRating count={item.rating} />
                </div>

                <p className="font-body text-sm text-charcoal-600 leading-relaxed flex-1 italic">
                  "{item.text}"
                </p>

                <p className="font-body text-xs text-charcoal-400 mt-4 pt-4 border-t border-cream-200">
                  {new Date(item.date).toLocaleDateString(dateLocale, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </Card>
            ))}
          </div>
        </Section>
      </FadeInSection>

      {/* CTA */}
      <FadeInSection>
        <Section bg="cream">
          <div className="text-center">
            <p className="font-body text-base md:text-lg text-charcoal-600 mb-6">
              {t.testimonialsReady}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="primary" size="lg" href="/book">
                {t.testimonialsBookAppointment}
              </Button>
              <Button variant="outline" size="lg" href="/services">
                {t.testimonialsViewServices}
              </Button>
            </div>
          </div>
        </Section>
      </FadeInSection>
    </>
  );
}

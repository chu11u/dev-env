"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { Card } from "@/components/ui/Card";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Clock, Star } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { fetchServices, adaptService } from "@/lib/api";
import { getPublicSettings, shouldShowPrice } from "@/lib/admin-api";
import type { Setting } from "@/lib/admin-api";

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  duration: string;
  price: string;
  category: string;
  badge: string;
  image: string;
}

// Fallback data - used while loading or on error
const fallbackServicesEn: ServiceItem[] = [
  {
    id: "1",
    title: "Signature Facial",
    description:
      "A luxurious deep-cleansing facial tailored to your skin type, featuring gentle exfoliation, custom mask, and hydrating serum application.",
    duration: "60 min",
    price: "₪120",
    category: "Facials",
    badge: "Most Popular",
    image: "/assets/services/facial-treatment.png",
  },
  {
    id: "2",
    title: "Skin Analysis & Consultation",
    description:
      "Comprehensive skin assessment using advanced technology to identify your unique needs and create a personalized treatment plan.",
    duration: "45 min",
    price: "₪80",
    category: "Skin Analysis",
    badge: "Essential",
    image: "/assets/services/skin-analysis.png",
  },
  {
    id: "3",
    title: "Bridal Makeup",
    description:
      "Flawless, long-lasting makeup artistry for your special day. Includes trial session and day-of application.",
    duration: "90 min",
    price: "₪250",
    category: "Makeup",
    badge: "Premium",
    image: "/assets/services/makeup.png",
  },
];

const fallbackServicesHe: ServiceItem[] = [
  {
    id: "1",
    title: "פילינג סיגניצ'ר",
    description:
      "פילינג מפנק ומעמיק המותאם לסוג העור שלך, הכולל קילוף עדין, מסכה מותאמת אישית והזרמת סרום מלחלח.",
    duration: "60 דק'",
    price: "₪120",
    category: "Facials",
    badge: "הכי נמכר",
    image: "/assets/services/facial-treatment.png",
  },
  {
    id: "2",
    title: "אבחון עור וייעוץ",
    description:
      "הערכת עור מקיפה באמצעות טכנולוגיה מתקדמת לזיהוי הצרכים הייחודיים שלך ויצירת תוכנית טיפול מותאמת אישית.",
    duration: "45 דק'",
    price: "₪80",
    category: "Skin Analysis",
    badge: "חיוני",
    image: "/assets/services/skin-analysis.png",
  },
  {
    id: "3",
    title: "איפור חתונה",
    description:
      "איפור מושלם ועמיד ליום המיוחד שלך. כולל מפגש הכנה ויישום ביום החתונה.",
    duration: "90 דק'",
    price: "₪250",
    category: "Makeup",
    badge: "פרימיום",
    image: "/assets/services/makeup.png",
  },
];

// Default images for services (since the API doesn't store images yet)
// Map by sortOrder index (0, 1, 2) since title matching is fragile
const defaultServiceImages = [
  "/assets/services/facial-treatment.png",
  "/assets/services/skin-analysis.png",
  "/assets/services/makeup.png",
];

const defaultBadgesEn = ["Most Popular", "Essential", "Premium"];
const defaultBadgesHe = ["הכי נמכר", "חיוני", "פרימיום"];

export function ServicesPreview() {
  const { t, locale } = useTranslation();
  const [services, setServices] = useState<ServiceItem[]>(
    locale === "he" ? fallbackServicesHe : fallbackServicesEn,
  );
  const [settings, setSettings] = useState<Setting[]>([]);

  useEffect(() => {
    getPublicSettings()
      .then(setSettings)
      .catch(() => {
        /* use defaults */
      });
  }, []);

  useEffect(() => {
    fetchServices()
      .then((data) => {
        const badges = locale === "he" ? defaultBadgesHe : defaultBadgesEn;
        // Take first 3 services from API as "featured"
        const adapted = data.slice(0, 3).map((api, i) => ({
          ...adaptService(api, locale),
          category: api.category,
          badge: badges[i] || "",
          image:
            defaultServiceImages[i] || "/assets/services/facial-treatment.png",
        }));
        setServices(adapted);
      })
      .catch(() => {
        /* keep fallback */
      });
  }, [locale]);

  return (
    <Section title={t.servicesTitle} subtitle={t.servicesSubtitle} bg="white">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service) => (
          <div key={service.id}>
            <Card className="overflow-hidden flex flex-col h-full hover:-translate-y-1 transition-transform duration-200 ease-[0.4,0,0.2,1]">
              <div className="relative h-48">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover rounded-t-2xl"
                />
              </div>

              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="default">{service.badge}</Badge>
                  <div className="flex items-center gap-3 text-xs text-charcoal-500">
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {service.duration}
                    </span>
                    {shouldShowPrice(settings, service.category) && (
                      <span className="flex items-center gap-1">
                        <Star size={12} className="text-gold-500" />{" "}
                        {service.price}
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-heading text-lg md:text-xl font-semibold text-charcoal-800 mb-2">
                  {service.title}
                </h3>

                <p className="font-body text-sm text-charcoal-500 leading-relaxed mb-6 flex-1">
                  {service.description}
                </p>

                <Button variant="outline" size="sm" href="/services">
                  {t.servicesLearnMore}
                </Button>
              </div>
            </Card>
          </div>
        ))}
      </div>

      <div className="text-center mt-10">
        <Button variant="secondary" size="md" href="/services">
          {t.servicesViewAll}
        </Button>
      </div>
    </Section>
  );
}

export default ServicesPreview;

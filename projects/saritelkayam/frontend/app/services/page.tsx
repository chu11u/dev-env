"use client";

import { useEffect, useState } from "react";
import { FadeInSection } from "@/components/common/FadeInSection";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Section } from "@/components/layout/Section";
import { SectionDivider } from "@/components/common/SectionDivider";
import { Button } from "@/components/ui/Button";
import { Clock, ChevronRight } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import {
  fetchServices,
  adaptService,
  getServiceCategoryLabel,
  getServiceCategoryIcon,
} from "@/lib/api";

interface Service {
  id: string;
  title: string;
  description: string;
  duration: string;
  price: string;
  features?: string[];
}

interface ServiceCategory {
  name: string;
  icon: string;
  services: Service[];
}

const fallbackCategories: ServiceCategory[] = [
  {
    name: "Facials",
    icon: "💆‍♀️",
    services: [
      {
        id: "1",
        title: "Signature Facial",
        description:
          "A luxurious deep-cleansing facial tailored to your skin type.",
        duration: "60 min",
        price: "₪120",
        features: [
          "Deep cleansing",
          "Custom mask",
          "Hydrating serum",
          "Moisturizer",
        ],
      },
    ],
  },
  {
    name: "Skin Analysis",
    icon: "🔬",
    services: [
      {
        id: "2",
        title: "Skin Analysis & Consultation",
        description: "Comprehensive skin assessment using advanced technology.",
        duration: "45 min",
        price: "₪80",
        features: ["VISIA 3D imaging", "Skin map report", "Personalized plan"],
      },
    ],
  },
  {
    name: "Body Treatments",
    icon: "✨",
    services: [
      {
        id: "3",
        title: "Body Scrub & Wrap",
        description: "Exfoliating body scrub followed by a nourishing wrap.",
        duration: "90 min",
        price: "₪150",
        features: ["Sugar scrub", "Seaweed wrap", "Aromatherapy"],
      },
    ],
  },
  {
    name: "Makeup",
    icon: "💄",
    services: [
      {
        id: "4",
        title: "Bridal Makeup",
        description: "Flawless, long-lasting makeup for your special day.",
        duration: "90 min",
        price: "₪250",
        features: ["Trial session", "Day-of application", "Touch-up kit"],
      },
    ],
  },
];

function ServiceCard({ service, t }: { service: Service; t: any }) {
  const { isRtl } = t;
  return (
    <div className="h-full hover:-translate-y-1 transition-transform duration-200 ease-[0.4,0,0.2,1]">
      <Card className="p-6 flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <h3 className="font-heading text-lg font-semibold text-charcoal-800">
            {service.title}
          </h3>
          <div className="flex items-center gap-3 text-sm text-charcoal-500">
            <span className="flex items-center gap-1">
              <Clock size={14} /> {service.duration}
            </span>
            <span className="flex items-center gap-1 font-medium text-rose-400">
              {service.price}
            </span>
          </div>
        </div>

        <p className="font-body text-sm text-charcoal-500 leading-relaxed mb-4">
          {service.description}
        </p>

        {service.features && (
          <ul className="space-y-1.5 mb-6 flex-1">
            {service.features.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-2 text-sm text-charcoal-600"
              >
                <ChevronRight
                  size={12}
                  className={`text-rose-400 ${isRtl ? "rotate-180" : ""}`}
                />
                {feature}
              </li>
            ))}
          </ul>
        )}

        <Button variant="outline" size="sm" href="/book">
          {t.servicesBookThis}
        </Button>
      </Card>
    </div>
  );
}

const creamBgCategories = new Set([
  "Skin Analysis",
  "Makeup",
  "אבחון עור",
  "איפור",
]);

export default function ServicesPage() {
  const { t, locale } = useTranslation();
  const [categories, setCategories] =
    useState<ServiceCategory[]>(fallbackCategories);

  useEffect(() => {
    fetchServices()
      .then((data) => {
        const grouped: Record<string, Service[]> = {};

        data.forEach((api) => {
          const adapted = adaptService(api, locale);
          const catName = api.category;
          if (!grouped[catName]) grouped[catName] = [];
          grouped[catName].push(adapted);
        });

        const result: ServiceCategory[] = Object.entries(grouped).map(
          ([rawName, services]) => ({
            name: getServiceCategoryLabel(rawName, locale),
            icon: getServiceCategoryIcon(rawName),
            services,
          }),
        );

        setCategories(result);
      })
      .catch(() => {
        /* keep fallback */
      });
  }, [locale]);

  return (
    <>
      {/* Page header */}
      <FadeInSection>
        <section className="bg-cream-100 py-8 md:py-16 lg:py-20">
          <Container>
            <div className="text-center max-w-2xl mx-auto">
              <Badge variant="accent">{t.servicesPageBadge}</Badge>
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal-800 mt-4 mb-4">
                {t.servicesPageTitle}
              </h1>
              <SectionDivider className="mb-4" />
              <p className="font-body text-charcoal-500">
                {t.servicesPageSubtitle}
              </p>
            </div>
          </Container>
        </section>
      </FadeInSection>

      {/* Category sections */}
      {categories.map((category) => (
        <FadeInSection key={category.name}>
          <Section
            title={`${category.icon} ${category.name}`}
            bg={creamBgCategories.has(category.name) ? "cream" : "white"}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {category.services.map((service) => (
                <ServiceCard key={service.id} service={service} t={t} />
              ))}
            </div>
          </Section>
        </FadeInSection>
      ))}

      {/* Bottom CTA */}
      <FadeInSection>
        <Section bg="cream">
          <div className="text-center">
            <p className="font-body text-charcoal-600 mb-4">
              {t.servicesPageNotSure}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="primary" href="/contact">
                {t.servicesPageRecommendation}
              </Button>
              <Button variant="outline" href="/book">
                {t.servicesPageConsultation}
              </Button>
            </div>
          </div>
        </Section>
      </FadeInSection>
    </>
  );
}

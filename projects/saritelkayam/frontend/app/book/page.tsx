"use client";

import { Container } from "@/components/ui/Container";
import { SectionDivider } from "@/components/common/SectionDivider";
import { Button } from "@/components/ui/Button";
import { FadeInSection } from "@/components/common/FadeInSection";
import { Calendar, Clock } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function BookPage() {
  const { t } = useTranslation();

  const bookingSteps = [
    {
      icon: <Calendar size={24} className="text-rose-400" />,
      title: t.bookStep1Title,
      description: t.bookStep1Desc,
    },
    {
      icon: <Clock size={24} className="text-rose-400" />,
      title: t.bookStep2Title,
      description: t.bookStep2Desc,
    },
    {
      icon: <span className="text-rose-400 text-2xl">✓</span>,
      title: t.bookStep3Title,
      description: t.bookStep3Desc,
    },
  ];

  return (
    <FadeInSection>
      <section className="bg-cream-100 min-h-[60vh] flex items-center">
        <Container>
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-6">
              <Calendar size={32} className="text-rose-400" />
            </div>

            <h1 className="font-heading text-3xl md:text-4xl font-bold text-charcoal-800 mb-4">
              {t.bookTitle}
            </h1>

            <SectionDivider className="mb-4" />

            <p className="font-body text-lg text-charcoal-500 mb-2">
              {t.bookSubtitle}
            </p>
            <p className="font-body text-charcoal-500 mb-12">
              {t.bookSubtitleDetail}
            </p>

            {/* Steps preview */}
            <div className="grid sm:grid-cols-3 gap-6 mb-10">
              {bookingSteps.map((step, i) => (
                <div key={step.title} className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-soft flex items-center justify-center mb-3">
                    {step.icon}
                  </div>
                  <p className="font-body font-semibold text-charcoal-800 mb-1">
                    {step.title}
                  </p>
                  <p className="font-body text-xs text-charcoal-500">
                    {step.description}
                  </p>
                  {i < bookingSteps.length - 1 && (
                    <div
                      className="hidden sm:block absolute"
                      style={{ left: "45%" }}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="primary" size="lg" href="/contact">
                {t.bookContactBook}
              </Button>
              <Button variant="outline" size="lg" href="/services">
                {t.bookBrowseServices}
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </FadeInSection>
  );
}

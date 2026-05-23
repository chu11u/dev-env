"use client";

import { Container } from "@/components/ui/Container";
import { SectionDivider } from "@/components/common/SectionDivider";
import { Button } from "@/components/ui/Button";
import { FadeInSection } from "@/components/common/FadeInSection";
import { Home, ArrowLeft } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

export default function NotFoundContent() {
  const { t, isRtl } = useTranslation();

  return (
      <FadeInSection>
        <section className="bg-cream-100 min-h-[70vh] flex items-center">
          <Container>
            <div className="max-w-lg mx-auto text-center py-16">
              <div className="font-heading text-8xl md:text-9xl font-bold text-rose-200 mb-2">
                404
              </div>

              <h1 className="font-heading text-2xl md:text-3xl font-bold text-charcoal-800 mb-4">
                {t.notFoundTitle}
              </h1>

              <SectionDivider className="mb-4" />

              <p className="font-body text-charcoal-500 mb-8">
                {t.notFoundSubtitle}
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <Button
                variant="primary"
                size="md"
                href="/"
                className="inline-flex items-center gap-2"
                >
                  <Home size={16} /> {t.notFoundHome}
                </Button>
                <Button
                variant="outline"
                size="md"
                href="javascript:history.back()"
                className={`inline-flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}
                >
                  <ArrowLeft size={16} /> {t.notFoundGoBack}
                </Button>
              </div>

              <div className="mt-12 pt-8 border-t border-cream-200">
                <p className="font-body text-sm text-charcoal-400 mb-3">
                  {t.notFoundPopularPages}
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <a
                  href="/services"
                  className="font-body text-sm text-rose-400 hover:underline"
                  >
                    {t.navServices}
                  </a>
                  <a
                  href="/testimonials"
                  className="font-body text-sm text-rose-400 hover:underline"
                  >
                    {t.navTestimonials}
                  </a>
                  <a
                  href="/blog"
                  className="font-body text-sm text-rose-400 hover:underline"
                  >
                    {t.navBlog}
                  </a>
                  <a
                  href="/contact"
                  className="font-body text-sm text-rose-400 hover:underline"
                  >
                    {t.navContact}
                  </a>
                </div>
              </div>
            </div>
          </Container>
        </section>
      </FadeInSection>
    );
}

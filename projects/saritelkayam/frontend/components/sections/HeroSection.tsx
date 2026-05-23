"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionDivider } from "@/components/common/SectionDivider";
import { useTranslation } from "@/lib/i18n";

interface HeroSectionProps {
  headline?: string;
  subheadline?: string;
  ctaText?: string;
  ctaHref?: string;
}

export function HeroSection({
  headline,
  subheadline,
  ctaText,
  ctaHref = "/book",
}: HeroSectionProps) {
  const { t, isRtl } = useTranslation();

  const displayHeadline = headline ?? t.heroTitle;
  const displaySubheadline = subheadline ?? t.heroSubtitle;
  const displayCta = ctaText ?? t.heroCta;

  return (
    <section
      className="relative bg-cream-100 overflow-hidden"
      aria-label={isRtl ? "ברוכים הבאים" : "Welcome"}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-rose-50 via-cream-50 to-cream-100"
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />

      <Container>
        <div
          className={`relative grid lg:grid-cols-2 gap-8 md:gap-12 items-center py-8 md:py-24 lg:py-32 ${isRtl ? "lg:[&>*:first-child]:order-last" : ""}`}
        >
          {/* Text content */}
          <div className="max-w-xl">
            <motion.p
              className="font-body text-sm text-rose-400 uppercase tracking-widest mb-4"
              initial={{ opacity: 0, y: 20, x: isRtl ? 20 : -20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              transition={{ delay: 0.1, duration: 0.3, ease: "easeOut" }}
            >
              {t.heroBadge}
            </motion.p>

            <motion.h1
              className="font-heading text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-charcoal-800 leading-tight mb-6"
              initial={{ opacity: 0, y: 24, x: isRtl ? 24 : -24 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
            >
              {displayHeadline}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.3, ease: "easeOut" }}
            >
              <SectionDivider className="mb-6" />
            </motion.div>

            <motion.p
              className="font-body text-base md:text-lg text-charcoal-600 leading-relaxed mb-8"
              initial={{ opacity: 0, y: 20, x: isRtl ? 20 : -20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              transition={{ delay: 0.45, duration: 0.3, ease: "easeOut" }}
            >
              {displaySubheadline}
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              <Button variant="primary" size="lg" href={ctaHref}>
                {displayCta}
              </Button>
              <Button variant="outline" size="lg" href="/services">
                {t.heroViewServices}
              </Button>
            </motion.div>
          </div>

          {/* Hero image */}
          <motion.div
            className={`flex ${isRtl ? "justify-end" : "justify-center lg:justify-end"}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
          >
            <div className="relative w-60 h-80 md:w-80 md:h-[28rem]">
              <div className="absolute -inset-4 bg-rose-200/30 rounded-3xl" />
              <Image
                src="/assets/hero/hero-main.png"
                alt="Sarit Elkayam - Professional cosmetician"
                fill
                className="relative rounded-3xl shadow-soft-lg object-cover"
              />
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

export default HeroSection;

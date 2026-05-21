"use client";

import HeroSection from "@/components/sections/HeroSection";
import ServicesPreview from "@/components/sections/ServicesPreview";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import CTASection from "@/components/sections/CTASection";
import { FadeInSection } from "@/components/common/FadeInSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FadeInSection delay={0}>
        <ServicesPreview />
      </FadeInSection>
      <FadeInSection delay={0}>
        <TestimonialsSection />
      </FadeInSection>
      <FadeInSection delay={0}>
        <CTASection />
      </FadeInSection>
    </>
  );
}
